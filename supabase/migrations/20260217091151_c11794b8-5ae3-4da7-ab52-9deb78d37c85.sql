
-- Create cache_entries table
CREATE TABLE public.cache_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  category text NOT NULL DEFAULT 'general',
  ttl_seconds integer NOT NULL DEFAULT 3600,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '1 hour'),
  access_count integer NOT NULL DEFAULT 0,
  last_accessed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cache_entries ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Anyone can view cache entries"
ON public.cache_entries FOR SELECT
USING (true);

-- Authenticated users can insert
CREATE POLICY "Authenticated users can insert cache entries"
ON public.cache_entries FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can update
CREATE POLICY "Authenticated users can update cache entries"
ON public.cache_entries FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- Authenticated users can delete
CREATE POLICY "Authenticated users can delete cache entries"
ON public.cache_entries FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Trigger for updated_at
CREATE TRIGGER update_cache_entries_updated_at
BEFORE UPDATE ON public.cache_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Cleanup function for expired entries
CREATE OR REPLACE FUNCTION public.cleanup_expired_cache_entries()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.cache_entries WHERE expires_at < now();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.cache_entries;
