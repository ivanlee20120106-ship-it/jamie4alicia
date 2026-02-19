
-- Fix photo_walls public SELECT to require authentication
DROP POLICY IF EXISTS "Anyone can view public walls" ON public.photo_walls;
CREATE POLICY "Authenticated users can view public walls" 
ON public.photo_walls FOR SELECT TO authenticated USING (is_public = true);
