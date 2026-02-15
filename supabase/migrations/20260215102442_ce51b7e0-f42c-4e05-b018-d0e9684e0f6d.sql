
-- Phase 1: Full data storage optimization

-- 1.1 Create photos table
CREATE TABLE public.photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  original_filename text,
  file_size bigint NOT NULL,
  mime_type text NOT NULL DEFAULT 'image/jpeg',
  width int,
  height int,
  latitude double precision,
  longitude double precision,
  location_name text,
  address text,
  storage_path text NOT NULL,
  thumbnail_path text,
  compressed_path text,
  is_heif boolean DEFAULT false,
  converted_formats jsonb DEFAULT '[]'::jsonb,
  exif_data jsonb,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_photos_location ON public.photos (latitude, longitude);
CREATE INDEX idx_photos_created ON public.photos (created_at DESC);
CREATE INDEX idx_photos_user ON public.photos (user_id);

ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view photos" ON public.photos FOR SELECT USING (true);
CREATE POLICY "Users can insert own photos" ON public.photos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own photos" ON public.photos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own photos" ON public.photos FOR DELETE USING (auth.uid() = user_id);

-- 1.2 Create photo_walls table
CREATE TABLE public.photo_walls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  cover_photo_id uuid,
  created_by uuid NOT NULL,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.photo_walls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public walls" ON public.photo_walls FOR SELECT USING (is_public = true);
CREATE POLICY "Users can insert own walls" ON public.photo_walls FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own walls" ON public.photo_walls FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete own walls" ON public.photo_walls FOR DELETE USING (auth.uid() = created_by);

-- 1.3 Create photo_wall_items table
CREATE TABLE public.photo_wall_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wall_id uuid NOT NULL REFERENCES public.photo_walls(id) ON DELETE CASCADE,
  photo_id uuid NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
  sort_order int DEFAULT 0,
  added_at timestamptz DEFAULT now(),
  UNIQUE(wall_id, photo_id)
);

ALTER TABLE public.photo_wall_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view wall items" ON public.photo_wall_items FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert wall items" ON public.photo_wall_items FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update wall items" ON public.photo_wall_items FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete wall items" ON public.photo_wall_items FOR DELETE USING (auth.uid() IS NOT NULL);

-- 1.4 Add photo_id to travel_markers
ALTER TABLE public.travel_markers ADD COLUMN photo_id uuid REFERENCES public.photos(id) ON DELETE SET NULL;

-- 1.5 Add foreign key for cover_photo_id (deferred to avoid circular dependency)
ALTER TABLE public.photo_walls ADD CONSTRAINT fk_cover_photo FOREIGN KEY (cover_photo_id) REFERENCES public.photos(id) ON DELETE SET NULL;

-- 1.6 Auto-update trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER photos_updated_at
  BEFORE UPDATE ON public.photos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
