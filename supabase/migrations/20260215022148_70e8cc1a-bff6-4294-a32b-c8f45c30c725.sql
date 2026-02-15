
-- Create travel_markers table
CREATE TABLE public.travel_markers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  type TEXT NOT NULL DEFAULT 'visited' CHECK (type IN ('visited', 'planned')),
  description TEXT,
  visit_date DATE,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL
);

-- Enable RLS
ALTER TABLE public.travel_markers ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Anyone can view travel markers"
ON public.travel_markers FOR SELECT
USING (true);

-- Authenticated insert
CREATE POLICY "Authenticated users can insert markers"
ON public.travel_markers FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Authenticated update own
CREATE POLICY "Users can update own markers"
ON public.travel_markers FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Authenticated delete own
CREATE POLICY "Users can delete own markers"
ON public.travel_markers FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create marker-images storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('marker-images', 'marker-images', true);

-- Public read for marker images
CREATE POLICY "Anyone can view marker images"
ON storage.objects FOR SELECT
USING (bucket_id = 'marker-images');

-- Authenticated upload
CREATE POLICY "Authenticated users can upload marker images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'marker-images');

-- Authenticated delete own
CREATE POLICY "Authenticated users can delete marker images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'marker-images');
