-- Fix security warnings

-- 1) Fix function search path issues
CREATE OR REPLACE FUNCTION public.set_complaint_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.complaint_code IS NULL OR NEW.complaint_code = '' THEN
    NEW.complaint_code := 'NGR' || lpad(nextval('public.complaint_code_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;