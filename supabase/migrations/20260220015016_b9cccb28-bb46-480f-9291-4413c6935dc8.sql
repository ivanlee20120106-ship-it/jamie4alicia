
-- 1. Add auth check to cleanup_expired_cache_entries RPC
CREATE OR REPLACE FUNCTION public.cleanup_expired_cache_entries()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  DELETE FROM public.cache_entries WHERE expires_at < now();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- 2. Replace public read policy with authenticated-only
DROP POLICY IF EXISTS "Anyone can view cache entries" ON public.cache_entries;

CREATE POLICY "Authenticated users can view cache entries"
  ON public.cache_entries FOR SELECT
  TO authenticated
  USING (true);
