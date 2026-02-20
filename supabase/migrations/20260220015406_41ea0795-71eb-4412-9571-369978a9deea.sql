
-- Restrict published blog posts to authenticated users only
DROP POLICY IF EXISTS "Anyone can view published posts" ON public.blog_posts;

CREATE POLICY "Authenticated users can view published posts"
  ON public.blog_posts FOR SELECT
  TO authenticated
  USING (published = true);
