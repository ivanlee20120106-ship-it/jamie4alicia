DROP POLICY IF EXISTS "Authenticated users can delete marker images" ON storage.objects;

CREATE POLICY "Owners can delete their marker images"
ON storage.objects FOR DELETE
USING (bucket_id = 'marker-images' AND auth.uid() = owner);