-- ============================================
-- Resume files managed from /admin/resume
-- Run once in Supabase Dashboard -> SQL Editor (after setup.sql).
-- Safe to re-run: every statement is idempotent.
-- ============================================

-- 1. Storage bucket: public read, PDF only, 5 MB max
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('resumes', 'resumes', true, 5242880, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. One row per language pointing at the current file in the bucket.
--    No row = the site falls back to /public/resume/resume-<lang>.pdf
CREATE TABLE IF NOT EXISTS site_resumes (
  lang       text PRIMARY KEY CHECK (lang IN ('th', 'en')),
  file_path  text NOT NULL,
  file_name  text NOT NULL,
  file_size  integer NOT NULL CHECK (file_size > 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Reuses update_updated_at_column() from setup.sql
DROP TRIGGER IF EXISTS set_site_resumes_updated_at ON site_resumes;
CREATE TRIGGER set_site_resumes_updated_at
  BEFORE UPDATE ON site_resumes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 3. Row level security — site_resumes
ALTER TABLE site_resumes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view resumes" ON site_resumes;
CREATE POLICY "Public can view resumes"
  ON site_resumes FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can insert resumes" ON site_resumes;
CREATE POLICY "Admins can insert resumes"
  ON site_resumes FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can update resumes" ON site_resumes;
CREATE POLICY "Admins can update resumes"
  ON site_resumes FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can delete resumes" ON site_resumes;
CREATE POLICY "Admins can delete resumes"
  ON site_resumes FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- 4. Storage policies — bucket 'resumes'
DROP POLICY IF EXISTS "Public can view resumes files" ON storage.objects;
CREATE POLICY "Public can view resumes files"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'resumes');

DROP POLICY IF EXISTS "Admins can upload resumes files" ON storage.objects;
CREATE POLICY "Admins can upload resumes files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'resumes'
    AND EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can update resumes files" ON storage.objects;
CREATE POLICY "Admins can update resumes files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'resumes'
    AND EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can delete resumes files" ON storage.objects;
CREATE POLICY "Admins can delete resumes files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'resumes'
    AND EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );
