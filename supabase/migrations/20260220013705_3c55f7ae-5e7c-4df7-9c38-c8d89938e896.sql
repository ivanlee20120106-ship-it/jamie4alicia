
-- Blog posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  content TEXT NOT NULL DEFAULT '',
  cover_image TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read published posts
CREATE POLICY "Anyone can view published posts"
  ON public.blog_posts FOR SELECT
  USING (published = true);

-- Authors can view their own drafts
CREATE POLICY "Authors can view own drafts"
  ON public.blog_posts FOR SELECT
  USING (auth.uid() = user_id AND published = false);

-- Authors can insert
CREATE POLICY "Authors can insert posts"
  ON public.blog_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Authors can update own posts
CREATE POLICY "Authors can update own posts"
  ON public.blog_posts FOR UPDATE
  USING (auth.uid() = user_id);

-- Authors can delete own posts
CREATE POLICY "Authors can delete own posts"
  ON public.blog_posts FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Index for slug lookups and tag filtering
CREATE INDEX idx_blog_posts_slug ON public.blog_posts (slug);
CREATE INDEX idx_blog_posts_tags ON public.blog_posts USING GIN (tags);
CREATE INDEX idx_blog_posts_published ON public.blog_posts (published, created_at DESC);
