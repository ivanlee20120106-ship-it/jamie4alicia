UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['image/jpeg','image/png','image/gif','image/webp','image/bmp','image/heic','image/heif']
WHERE name = 'photos';