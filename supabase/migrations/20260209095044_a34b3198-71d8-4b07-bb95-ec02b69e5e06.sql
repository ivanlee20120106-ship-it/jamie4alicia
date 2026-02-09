
-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('photos', 'photos', true, 10485760);

-- Create storage bucket for music
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('music', 'music', true, 20971520);

-- Allow anyone to read photos
CREATE POLICY "Photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'photos');

-- Allow anyone to upload photos (no auth required for this simple couple site)
CREATE POLICY "Anyone can upload photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'photos');

-- Allow anyone to delete photos
CREATE POLICY "Anyone can delete photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'photos');

-- Allow anyone to read music
CREATE POLICY "Music is publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'music');

-- Allow anyone to upload music
CREATE POLICY "Anyone can upload music"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'music');

-- Allow anyone to delete music
CREATE POLICY "Anyone can delete music"
ON storage.objects FOR DELETE
USING (bucket_id = 'music');
