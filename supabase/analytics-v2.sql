-- ============================================
-- ANALYTICS V2 MIGRATION
-- Idempotent: safe to run more than once.
-- ============================================

-- New columns
ALTER TABLE portfolio_analytics ADD COLUMN IF NOT EXISTS visit_id TEXT;
ALTER TABLE portfolio_analytics ADD COLUMN IF NOT EXISTS country TEXT;      -- 2-letter code, XX = unknown
ALTER TABLE portfolio_analytics ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE portfolio_analytics ADD COLUMN IF NOT EXISTS utm_medium TEXT;
ALTER TABLE portfolio_analytics ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
ALTER TABLE portfolio_analytics ADD COLUMN IF NOT EXISTS section TEXT;
ALTER TABLE portfolio_analytics ADD COLUMN IF NOT EXISTS meta JSONB;

-- Allowed event types (ten)
ALTER TABLE portfolio_analytics DROP CONSTRAINT IF EXISTS valid_event_type;
ALTER TABLE portfolio_analytics ADD CONSTRAINT valid_event_type CHECK (
  event_type IN (
    'page_view', 'project_view', 'github_click',
    'demo_click', 'resume_download', 'contact_submit',
    'heartbeat', 'section_view', 'contact_click', 'social_click'
  )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_visit_id ON portfolio_analytics(visit_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_event ON portfolio_analytics(created_at, event_type);

-- Admin check helper (used by analytics RPCs)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid());
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- ============================================
-- OPTIONAL — destroys all existing analytics. Run manually after export
-- ============================================
-- TRUNCATE portfolio_analytics;
