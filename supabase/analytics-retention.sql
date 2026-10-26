-- ============================================
-- ANALYTICS RETENTION (12 months)
-- Idempotent: safe to run more than once.
-- Run in the Supabase SQL editor.
-- ============================================

CREATE OR REPLACE FUNCTION public.analytics_purge_old(p_days integer DEFAULT 365)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted bigint;
BEGIN
  IF p_days IS NULL OR p_days < 30 THEN
    RAISE EXCEPTION 'p_days must be >= 30' USING ERRCODE = '22023';
  END IF;

  DELETE FROM public.portfolio_analytics
  WHERE created_at < now() - make_interval(days => p_days);
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

-- Not callable from the API; only the database owner / pg_cron may run it.
REVOKE ALL ON FUNCTION public.analytics_purge_old(integer) FROM PUBLIC, anon, authenticated;

-- Daily schedule at 03:00 UTC.
-- Requires the pg_cron extension: Supabase Dashboard > Database > Extensions > pg_cron.
-- Enable it first, then uncomment:
--
-- SELECT cron.unschedule('analytics-retention')
--   WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'analytics-retention');
-- SELECT cron.schedule('analytics-retention', '0 3 * * *', $$SELECT public.analytics_purge_old(365)$$);
