-- Create storage bucket for company logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('company-logos', 'company-logos', true);

-- Allow public read access to company logos
CREATE POLICY "Company logos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'company-logos');

-- Allow anyone to upload company logos (for anonymous employers)
CREATE POLICY "Anyone can upload company logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'company-logos');