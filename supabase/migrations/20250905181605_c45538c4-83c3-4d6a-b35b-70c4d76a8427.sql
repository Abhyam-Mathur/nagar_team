-- Drop and recreate functions to fix return type conflict
DROP FUNCTION IF EXISTS public.create_citizen_account(text, text);

-- 1) Generate unique username 
CREATE OR REPLACE FUNCTION public.generate_unique_username(prefix text default 'citizen', tries int default 50)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uname text;
  i int := 0;
BEGIN
  LOOP
    i := i + 1;
    uname := prefix || lpad(floor(random()*100000)::int::text, 5, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE username = uname)
           AND NOT EXISTS (SELECT 1 FROM public.users WHERE username = uname);
    IF i >= tries THEN
      uname := prefix || '-' || gen_random_uuid();
      EXIT;
    END IF;
  END LOOP;
  RETURN uname;
END;
$$;

-- 2) Create citizen account securely (id in users + profiles)
CREATE OR REPLACE FUNCTION public.create_citizen_account(p_phone text, p_password text)
RETURNS TABLE(id uuid, username text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_profile record;
  new_user_id uuid;
  uname text;
BEGIN
  -- If already exists by phone, return existing
  SELECT p.id, p.username INTO existing_profile
  FROM public.profiles p
  WHERE p.phone_number = p_phone
  LIMIT 1;

  IF FOUND THEN
    id := existing_profile.id;
    username := existing_profile.username;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Generate username and create records
  uname := public.generate_unique_username();

  INSERT INTO public.users (username, phone_number, password)
  VALUES (uname, p_phone, p_password)
  RETURNING users.id INTO new_user_id;

  INSERT INTO public.profiles (id, phone_number, username, password_hash, role, is_active)
  VALUES (new_user_id, p_phone, uname, p_password, 'citizen', true);

  id := new_user_id;
  username := uname;
  RETURN NEXT;
END;
$$;

-- 3) Admin login via security definer
CREATE OR REPLACE FUNCTION public.login_admin(p_username text, p_password text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text
  FROM public.admins
  WHERE lower(username) = lower(p_username)
    AND password = p_password
    AND is_active
  LIMIT 1;
$$;

-- 4) Citizen login via security definer (bypass RLS safely)
CREATE OR REPLACE FUNCTION public.login_citizen(p_username text, p_password text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(role::text, 'citizen')
  FROM public.profiles
  WHERE lower(username) = lower(p_username)
    AND password_hash = p_password
    AND coalesce(is_active, true)
  LIMIT 1;
$$;

-- 5) Seed static admin if missing
INSERT INTO public.admins (username, password, role, is_active)
SELECT 'AdminCP', 'admin123456', 'admin'::user_role, true
WHERE NOT EXISTS (
  SELECT 1 FROM public.admins WHERE lower(username) = 'admincp'
);