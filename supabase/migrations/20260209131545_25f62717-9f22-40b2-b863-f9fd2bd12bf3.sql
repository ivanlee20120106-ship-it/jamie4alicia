
-- Drop existing overly permissive storage policies
DROP POLICY IF EXISTS "Anyone can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload music" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete music" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view music" ON storage.objects;

-- Public read access (photos and music remain viewable)
CREATE POLICY "Public read access for photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'photos');

CREATE POLICY "Public read access for music"
ON storage.objects FOR SELECT
USING (bucket_id = 'music');

-- Only authenticated users can upload
CREATE POLICY "Authenticated users can upload photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can upload music"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'music' AND auth.uid() IS NOT NULL);

-- Only authenticated users can delete
CREATE POLICY "Authenticated users can delete photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete music"
ON storage.objects FOR DELETE
USING (bucket_id = 'music' AND auth.uid() IS NOT NULL);
