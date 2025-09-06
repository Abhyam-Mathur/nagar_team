-- Create admins table for direct admin login
CREATE TABLE IF NOT EXISTS public.admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  role public.user_role NOT NULL DEFAULT 'admin',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on admins table (no policies; access via SECURITY DEFINER functions only)
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Trigger to maintain updated_at
DROP TRIGGER IF EXISTS update_admins_updated_at ON public.admins;
CREATE TRIGGER update_admins_updated_at
BEFORE UPDATE ON public.admins
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed static admin account for development/demo
INSERT INTO public.admins (username, password, role, is_active)
VALUES ('AdminCP', 'admin123456', 'admin', true)
ON CONFLICT (username) DO NOTHING;

-- Function: Create citizen account securely, bypassing client-side RLS limitations
CREATE OR REPLACE FUNCTION public.create_citizen_account(p_phone text, p_password text)
RETURNS TABLE(user_id uuid, username text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
  new_username text;
BEGIN
  -- Prevent duplicates by phone
  IF EXISTS (SELECT 1 FROM public.profiles WHERE phone_number = p_phone) THEN
    RAISE EXCEPTION 'Account already exists for this phone number';
  END IF;

  -- Generate unique username using existing helper
  new_username := public.generate_unique_username();

  -- Create user row
  INSERT INTO public.users (username, phone_number, password)
  VALUES (new_username, p_phone, p_password)
  RETURNING id INTO new_id;

  -- Create corresponding profile
  INSERT INTO public.profiles (id, phone_number, username, password_hash, role, is_active)
  VALUES (new_id, p_phone, new_username, p_password, 'citizen', true);

  RETURN QUERY SELECT new_id, new_username;
END;
$$;

-- Admin login RPC: validates against admins table and returns role if valid
CREATE OR REPLACE FUNCTION public.login_admin(p_username text, p_password text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  out_role text;
BEGIN
  SELECT 'admin'::text
  INTO out_role
  FROM public.admins a
  WHERE a.username = p_username
    AND a.password = p_password
    AND a.is_active = true
  LIMIT 1;

  RETURN out_role; -- returns NULL if no match
END;
$$;