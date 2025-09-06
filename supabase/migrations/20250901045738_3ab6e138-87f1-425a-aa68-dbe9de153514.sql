-- Allow public to insert complaint status updates (for admin portal)
CREATE POLICY "Public can insert complaint status updates" 
ON public.complaint_status_updates 
FOR INSERT 
WITH CHECK (true);

-- Allow public to update complaints (for admin portal to assign workers)
CREATE POLICY "Public can update complaints" 
ON public.complaints 
FOR UPDATE 
USING (true);