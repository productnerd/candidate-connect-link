
-- Create storage bucket for question assets (question images and spatial reasoning option images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('question-assets', 'question-assets', true);

-- Allow public read access to question assets
CREATE POLICY "Question assets are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'question-assets');

-- Only admins can upload/modify question assets
CREATE POLICY "Admins can upload question assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'question-assets' AND is_admin(auth.uid()));

CREATE POLICY "Admins can update question assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'question-assets' AND is_admin(auth.uid()));

CREATE POLICY "Admins can delete question assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'question-assets' AND is_admin(auth.uid()));
