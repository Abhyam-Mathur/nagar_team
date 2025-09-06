-- Fix security issues

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for profiles
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Public can insert profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

-- Fix function search paths
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;