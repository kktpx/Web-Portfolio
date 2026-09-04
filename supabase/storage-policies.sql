-- ============================================
-- Storage bucket: portfolio-images
-- ============================================
-- Create bucket via Dashboard -> Storage -> New bucket
-- Name: portfolio-images
-- Public: true
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/webp

-- Public read access
CREATE POLICY "Public can view portfolio images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'portfolio-images');

-- Admin upload
CREATE POLICY "Admins can upload portfolio images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'portfolio-images'
    AND EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- Admin update
CREATE POLICY "Admins can update portfolio images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'portfolio-images'
    AND EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- Admin delete
CREATE POLICY "Admins can delete portfolio images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'portfolio-images'
    AND EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );
