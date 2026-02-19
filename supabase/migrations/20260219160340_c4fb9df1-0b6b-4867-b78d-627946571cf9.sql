
-- Drop existing permissive policies on photo_wall_items
DROP POLICY IF EXISTS "Authenticated users can insert wall items" ON public.photo_wall_items;
DROP POLICY IF EXISTS "Authenticated users can update wall items" ON public.photo_wall_items;
DROP POLICY IF EXISTS "Authenticated users can delete wall items" ON public.photo_wall_items;

-- Only wall owners can add items
CREATE POLICY "Wall owners can insert items"
  ON public.photo_wall_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.photo_walls
      WHERE id = wall_id AND created_by = auth.uid()
    )
  );

-- Only wall owners can update items
CREATE POLICY "Wall owners can update items"
  ON public.photo_wall_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.photo_walls
      WHERE id = wall_id AND created_by = auth.uid()
    )
  );

-- Only wall owners can delete items
CREATE POLICY "Wall owners can delete items"
  ON public.photo_wall_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.photo_walls
      WHERE id = wall_id AND created_by = auth.uid()
    )
  );
