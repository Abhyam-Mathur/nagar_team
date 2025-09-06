-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('citizen', 'admin', 'worker');

-- Create enum for worker status
CREATE TYPE public.worker_status AS ENUM ('available', 'busy', 'offline');

-- Update profiles table to support the new authentication system
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;
ALTER TABLE public.profiles ADD COLUMN role user_role DEFAULT 'citizen';
ALTER TABLE public.profiles ADD COLUMN phone_number TEXT;
ALTER TABLE public.profiles ADD COLUMN username TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN password_hash TEXT;
ALTER TABLE public.profiles ADD COLUMN is_active BOOLEAN DEFAULT true;

-- Create workers table for department and status management
CREATE TABLE IF NOT EXISTS public.workers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    department TEXT NOT NULL,
    status worker_status DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create OTP verification table
CREATE TABLE IF NOT EXISTS public.otp_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workers
CREATE POLICY "Workers can view their own records" 
ON public.workers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all workers" 
ON public.workers 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Admins can update workers" 
ON public.workers 
FOR UPDATE 
USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
));

-- RLS Policies for OTP verifications
CREATE POLICY "Public can insert OTP" 
ON public.otp_verifications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public can view own OTP" 
ON public.otp_verifications 
FOR SELECT 
USING (true);

CREATE POLICY "Public can update own OTP" 
ON public.otp_verifications 
FOR UPDATE 
USING (true);

-- Add updated_at trigger for workers
CREATE TRIGGER update_workers_updated_at
BEFORE UPDATE ON public.workers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate unique username
CREATE OR REPLACE FUNCTION public.generate_unique_username()
RETURNS TEXT AS $$
DECLARE
    new_username TEXT;
    counter INTEGER := 1;
    base_username TEXT := 'NGR';
BEGIN
    LOOP
        new_username := base_username || LPAD(counter::TEXT, 6, '0');
        
        -- Check if username already exists
        IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE username = new_username) THEN
            RETURN new_username;
        END IF;
        
        counter := counter + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to assign worker automatically
CREATE OR REPLACE FUNCTION public.auto_assign_worker(issue_type_param TEXT)
RETURNS UUID AS $$
DECLARE
    department_name TEXT;
    assigned_worker_id UUID;
BEGIN
    -- Map issue types to departments
    CASE issue_type_param
        WHEN 'Electricity' THEN department_name := 'Electricity Department';
        WHEN 'Water Supply' THEN department_name := 'Water Department';
        WHEN 'Garbage Collection' THEN department_name := 'Sanitation Department';
        WHEN 'Road Repair' THEN department_name := 'Public Works Department';
        WHEN 'Street Light' THEN department_name := 'Electricity Department';
        WHEN 'Public Transport' THEN department_name := 'Transport Department';
        WHEN 'Noise Pollution' THEN department_name := 'Environmental Department';
        WHEN 'Others' THEN department_name := 'General Administration';
        ELSE department_name := 'General Administration';
    END CASE;
    
    -- Find first available worker in the department
    SELECT w.user_id INTO assigned_worker_id
    FROM public.workers w
    INNER JOIN public.profiles p ON w.user_id = p.id
    WHERE w.department = department_name 
    AND w.status = 'available'
    AND p.is_active = true
    ORDER BY w.created_at ASC
    LIMIT 1;
    
    -- If worker found, mark as busy
    IF assigned_worker_id IS NOT NULL THEN
        UPDATE public.workers 
        SET status = 'busy', updated_at = now()
        WHERE user_id = assigned_worker_id;
    END IF;
    
    RETURN assigned_worker_id;
END;
$$ LANGUAGE plpgsql;