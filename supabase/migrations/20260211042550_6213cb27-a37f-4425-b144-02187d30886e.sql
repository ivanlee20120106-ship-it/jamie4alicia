
-- Fix 1: Add server-side MIME type restrictions to storage buckets
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp']
WHERE id = 'photos';

UPDATE storage.buckets
SET allowed_mime_types = ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/flac', 'audio/aac', 'audio/mp4', 'audio/x-m4a']
WHERE id = 'music';

-- Fix 2: Replace permissive delete policies with owner-based policies
DROP POLICY IF EXISTS "Authenticated users can delete photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete music" ON storage.objects;

CREATE POLICY "Owners can delete their photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'photos' AND auth.uid() = owner);

CREATE POLICY "Owners can delete their music"
ON storage.objects FOR DELETE
USING (bucket_id = 'music' AND auth.uid() = owner);
