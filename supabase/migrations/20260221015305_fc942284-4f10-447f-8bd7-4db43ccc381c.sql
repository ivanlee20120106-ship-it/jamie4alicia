
-- Create routes table for travel route polylines
CREATE TABLE public.travel_routes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  path jsonb NOT NULL DEFAULT '[]'::jsonb,
  color text NOT NULL DEFAULT '#FF6B6B',
  distance numeric,
  duration integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.travel_routes ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Authenticated users can view routes"
  ON public.travel_routes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own routes"
  ON public.travel_routes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own routes"
  ON public.travel_routes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own routes"
  ON public.travel_routes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE TRIGGER update_travel_routes_updated_at
  BEFORE UPDATE ON public.travel_routes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
