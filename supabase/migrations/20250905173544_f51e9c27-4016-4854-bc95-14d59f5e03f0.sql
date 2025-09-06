-- Fix security issue: Add RLS policy for admins table
-- Since admins table should only be accessed via SECURITY DEFINER functions,
-- we'll add a restrictive policy that blocks direct client access
CREATE POLICY "Admins table access restricted"
ON public.admins
FOR ALL
USING (false)
WITH CHECK (false);