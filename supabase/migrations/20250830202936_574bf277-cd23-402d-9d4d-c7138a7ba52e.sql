-- Schema for Nagar Rakshak

-- 1) Enum for complaint status
DO $$ BEGIN
  CREATE TYPE public.complaint_status AS ENUM ('Registered','Assigned','In-Progress','Resolved');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2) Ensure defaults on existing complaints table
ALTER TABLE public.complaints
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

-- 3) Add human-readable complaint code with sequence and trigger
DO $$ BEGIN
  ALTER TABLE public.complaints ADD COLUMN complaint_code text;
EXCEPTION WHEN duplicate_column THEN null; END $$;

CREATE SEQUENCE IF NOT EXISTS public.complaint_code_seq;

CREATE OR REPLACE FUNCTION public.set_complaint_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.complaint_code IS NULL OR NEW.complaint_code = '' THEN
    NEW.complaint_code := 'NGR' || lpad(nextval('public.complaint_code_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_complaint_code ON public.complaints;
CREATE TRIGGER trg_set_complaint_code
BEFORE INSERT ON public.complaints
FOR EACH ROW
EXECUTE FUNCTION public.set_complaint_code();

-- Backfill complaint codes
UPDATE public.complaints
SET complaint_code = 'NGR' || lpad(nextval('public.complaint_code_seq')::text, 6, '0')
WHERE complaint_code IS NULL OR complaint_code = '';

DO $$ BEGIN
  ALTER TABLE public.complaints ADD CONSTRAINT complaints_complaint_code_key UNIQUE (complaint_code);
EXCEPTION WHEN duplicate_object THEN null; END $$;

ALTER TABLE public.complaints ALTER COLUMN complaint_code SET NOT NULL;

-- 4) Convert status column on complaints to enum and set default
ALTER TABLE public.complaints ALTER COLUMN status DROP DEFAULT;
UPDATE public.complaints SET status = 'Registered' WHERE status IS NULL OR status NOT IN ('Registered','Assigned','In-Progress','Resolved');
ALTER TABLE public.complaints
  ALTER COLUMN status TYPE public.complaint_status USING status::public.complaint_status,
  ALTER COLUMN status SET DEFAULT 'Registered';

-- 5) updated_at trigger for complaints
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_complaints_updated_at ON public.complaints;
CREATE TRIGGER trg_update_complaints_updated_at
BEFORE UPDATE ON public.complaints
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 6) Complaint status updates table for timeline
CREATE TABLE IF NOT EXISTS public.complaint_status_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  status public.complaint_status NOT NULL,
  note text,
  assigned_to text,
  assigned_contact text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 7) Indexes for performance
CREATE INDEX IF NOT EXISTS idx_complaints_state_city ON public.complaints (state, city);
CREATE INDEX IF NOT EXISTS idx_complaints_issue_type ON public.complaints (issue_type);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints (status);
CREATE INDEX IF NOT EXISTS idx_status_updates_complaint_id_created_at ON public.complaint_status_updates (complaint_id, created_at);

-- 8) Enable RLS and create policies
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_status_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert complaints" ON public.complaints;
DROP POLICY IF EXISTS "Public can view complaints" ON public.complaints;
DROP POLICY IF EXISTS "Anyone can insert feedback" ON public.feedback;
DROP POLICY IF EXISTS "Public can view feedback" ON public.feedback;
DROP POLICY IF EXISTS "Public can view complaint status updates" ON public.complaint_status_updates;

CREATE POLICY "Public can insert complaints"
ON public.complaints
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Public can view complaints"
ON public.complaints
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Public can view complaint status updates"
ON public.complaint_status_updates
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Public can view feedback"
ON public.feedback
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Anyone can insert feedback"
ON public.feedback
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 9) Add FK on feedback.complaint_id
DO $$ BEGIN
  ALTER TABLE public.feedback
  ADD CONSTRAINT feedback_complaint_id_fkey
  FOREIGN KEY (complaint_id) REFERENCES public.complaints(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 10) Storage bucket and policies for media uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('complaints', 'complaints', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read complaint media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload complaint media" ON storage.objects;

CREATE POLICY "Public read complaint media"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'complaints');

CREATE POLICY "Anyone can upload complaint media"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'complaints');

-- 11) Realtime setup
ALTER TABLE public.complaints REPLICA IDENTITY FULL;
ALTER TABLE public.complaint_status_updates REPLICA IDENTITY FULL;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.complaint_status_updates;
  END IF;
END $$;