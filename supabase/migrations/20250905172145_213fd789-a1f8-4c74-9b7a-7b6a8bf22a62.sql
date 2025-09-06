-- Ensure RLS is enabled and allow public inserts into users for signup
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert users" ON public.users;
CREATE POLICY "Public can insert users"
ON public.users
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
