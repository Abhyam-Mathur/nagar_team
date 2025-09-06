-- Add new columns to complaints table for enhanced media upload and AI features
ALTER TABLE public.complaints 
ADD COLUMN IF NOT EXISTS severity_description text,
ADD COLUMN IF NOT EXISTS gps_latitude double precision,
ADD COLUMN IF NOT EXISTS gps_longitude double precision, 
ADD COLUMN IF NOT EXISTS address_line1 text,
ADD COLUMN IF NOT EXISTS address_line2 text;

-- Update existing geo_lat and geo_lng columns to be more descriptive (keeping for backward compatibility)
COMMENT ON COLUMN public.complaints.geo_lat IS 'Legacy GPS latitude - use gps_latitude for new features';
COMMENT ON COLUMN public.complaints.geo_lng IS 'Legacy GPS longitude - use gps_longitude for new features';