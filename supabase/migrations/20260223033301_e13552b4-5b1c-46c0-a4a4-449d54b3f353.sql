
-- =====================
-- blog_posts: fix policies
-- =====================
DROP POLICY IF EXISTS "Authors can view own drafts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authenticated users can view published posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authors can insert posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authors can update own posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authors can delete own posts" ON public.blog_posts;

CREATE POLICY "Public can read published posts" ON public.blog_posts FOR SELECT USING (published = true);
CREATE POLICY "Authors can read own drafts" ON public.blog_posts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authors can insert own posts" ON public.blog_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authors can update own posts" ON public.blog_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authors can delete own posts" ON public.blog_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =====================
-- photos: fix policies
-- =====================
DROP POLICY IF EXISTS "Authenticated users can view photos" ON public.photos;
DROP POLICY IF EXISTS "Users can insert own photos" ON public.photos;
DROP POLICY IF EXISTS "Users can update own photos" ON public.photos;
DROP POLICY IF EXISTS "Users can delete own photos" ON public.photos;

CREATE POLICY "Public can view photos" ON public.photos FOR SELECT USING (true);
CREATE POLICY "Users can insert own photos" ON public.photos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own photos" ON public.photos FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own photos" ON public.photos FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =====================
-- travel_markers: fix policies
-- =====================
DROP POLICY IF EXISTS "Authenticated users can view travel markers" ON public.travel_markers;
DROP POLICY IF EXISTS "Authenticated users can insert markers" ON public.travel_markers;
DROP POLICY IF EXISTS "Users can update own markers" ON public.travel_markers;
DROP POLICY IF EXISTS "Users can delete own markers" ON public.travel_markers;

CREATE POLICY "Public can view markers" ON public.travel_markers FOR SELECT USING (true);
CREATE POLICY "Users can insert own markers" ON public.travel_markers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own markers" ON public.travel_markers FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own markers" ON public.travel_markers FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =====================
-- travel_routes: fix policies
-- =====================
DROP POLICY IF EXISTS "Authenticated users can view routes" ON public.travel_routes;
DROP POLICY IF EXISTS "Users can insert own routes" ON public.travel_routes;
DROP POLICY IF EXISTS "Users can update own routes" ON public.travel_routes;
DROP POLICY IF EXISTS "Users can delete own routes" ON public.travel_routes;

CREATE POLICY "Public can view routes" ON public.travel_routes FOR SELECT USING (true);
CREATE POLICY "Users can insert own routes" ON public.travel_routes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own routes" ON public.travel_routes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own routes" ON public.travel_routes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =====================
-- photo_walls: fix policies
-- =====================
DROP POLICY IF EXISTS "Authenticated users can view public walls" ON public.photo_walls;
DROP POLICY IF EXISTS "Users can insert own walls" ON public.photo_walls;
DROP POLICY IF EXISTS "Users can update own walls" ON public.photo_walls;
DROP POLICY IF EXISTS "Users can delete own walls" ON public.photo_walls;

CREATE POLICY "Public can view walls" ON public.photo_walls FOR SELECT USING (is_public = true);
CREATE POLICY "Owners can view own walls" ON public.photo_walls FOR SELECT TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Users can insert own walls" ON public.photo_walls FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own walls" ON public.photo_walls FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Users can delete own walls" ON public.photo_walls FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- =====================
-- photo_wall_items: fix policies
-- =====================
DROP POLICY IF EXISTS "Authenticated users can view wall items" ON public.photo_wall_items;
DROP POLICY IF EXISTS "Wall owners can insert items" ON public.photo_wall_items;
DROP POLICY IF EXISTS "Wall owners can update items" ON public.photo_wall_items;
DROP POLICY IF EXISTS "Wall owners can delete items" ON public.photo_wall_items;

CREATE POLICY "Public can view wall items" ON public.photo_wall_items FOR SELECT USING (true);
CREATE POLICY "Wall owners can insert items" ON public.photo_wall_items FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.photo_walls WHERE id = photo_wall_items.wall_id AND created_by = auth.uid()));
CREATE POLICY "Wall owners can update items" ON public.photo_wall_items FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.photo_walls WHERE id = photo_wall_items.wall_id AND created_by = auth.uid()));
CREATE POLICY "Wall owners can delete items" ON public.photo_wall_items FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.photo_walls WHERE id = photo_wall_items.wall_id AND created_by = auth.uid()));
