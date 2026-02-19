
-- Fix PUBLIC_DATA_EXPOSURE on photos table
DROP POLICY IF EXISTS "Anyone can view photos" ON public.photos;
CREATE POLICY "Authenticated users can view photos" 
ON public.photos FOR SELECT TO authenticated USING (true);

-- Fix PUBLIC_USER_DATA on travel_markers table
DROP POLICY IF EXISTS "Anyone can view travel markers" ON public.travel_markers;
CREATE POLICY "Authenticated users can view travel markers" 
ON public.travel_markers FOR SELECT TO authenticated USING (true);

-- Also restrict photo_wall_items to authenticated users for consistency
DROP POLICY IF EXISTS "Anyone can view wall items" ON public.photo_wall_items;
CREATE POLICY "Authenticated users can view wall items" 
ON public.photo_wall_items FOR SELECT TO authenticated USING (true);
