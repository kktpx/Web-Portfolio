-- ============================================
-- ANALYTICS V2 — portfolio_analytics
-- ============================================

-- 1. Create table if it doesn't exist at all (fallback)
CREATE TABLE IF NOT EXISTS portfolio_analytics (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type    text NOT NULL,
  project_id    uuid REFERENCES portfolio_projects(id) ON DELETE SET NULL,
  page_path     text,
  referrer      text,
  device_type   text,
  session_id    text,
  created_at    timestamptz DEFAULT now()
);

-- 2. Add new V2 columns safely to existing table
ALTER TABLE portfolio_analytics
  ADD COLUMN IF NOT EXISTS visitor_id text,
  ADD COLUMN IF NOT EXISTS visit_id text,
  ADD COLUMN IF NOT EXISTS event_name text,
  ADD COLUMN IF NOT EXISTS target_url text,
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_campaign text,
  ADD COLUMN IF NOT EXISTS utm_content text,
  ADD COLUMN IF NOT EXISTS utm_term text,
  ADD COLUMN IF NOT EXISTS country_code text;

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_analytics_created_at  ON portfolio_analytics (created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_visitor_id  ON portfolio_analytics (visitor_id);
CREATE INDEX IF NOT EXISTS idx_analytics_visit_id    ON portfolio_analytics (visit_id);
CREATE INDEX IF NOT EXISTS idx_analytics_session_id  ON portfolio_analytics (session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type  ON portfolio_analytics (event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_project_id  ON portfolio_analytics (project_id);
CREATE INDEX IF NOT EXISTS idx_analytics_utm_source  ON portfolio_analytics (utm_source);
CREATE INDEX IF NOT EXISTS idx_analytics_utm_campaign ON portfolio_analytics (utm_campaign);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE portfolio_analytics ENABLE ROW LEVEL SECURITY;

-- Anonymous/public: INSERT only
DROP POLICY IF EXISTS "Public can insert analytics" ON portfolio_analytics;
CREATE POLICY "Public can insert analytics"
  ON portfolio_analytics FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admin: SELECT
DROP POLICY IF EXISTS "Admins can read analytics" ON portfolio_analytics;
CREATE POLICY "Admins can read analytics"
  ON portfolio_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- Admin: DELETE
DROP POLICY IF EXISTS "Admins can delete analytics" ON portfolio_analytics;
CREATE POLICY "Admins can delete analytics"
  ON portfolio_analytics FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- ============================================
-- RPC FUNCTIONS
-- ============================================

-- 1. Summary KPIs
CREATE OR REPLACE FUNCTION analytics_summary(start_date timestamptz, end_date timestamptz)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE result json;
BEGIN
  SELECT json_build_object(
    'total_visitors', (
      SELECT COUNT(DISTINCT COALESCE(visitor_id, session_id))
      FROM portfolio_analytics WHERE created_at BETWEEN start_date AND end_date
    ),
    'visitors_today', (
      SELECT COUNT(DISTINCT COALESCE(visitor_id, session_id))
      FROM portfolio_analytics
      WHERE created_at >= date_trunc('day', now())
        AND created_at BETWEEN start_date AND end_date
    ),
    'total_interactions', (
      SELECT COUNT(*)
      FROM portfolio_analytics
      WHERE created_at BETWEEN start_date AND end_date
        AND event_type NOT IN ('heartbeat', 'page_view', 'navigation')
    ),
    'resume_downloads', (
      SELECT COUNT(*)
      FROM portfolio_analytics
      WHERE event_type = 'resume_download'
        AND created_at BETWEEN start_date AND end_date
    ),
    'project_opens', (
      SELECT COUNT(*)
      FROM portfolio_analytics
      WHERE event_type IN ('project_open', 'project_view')
        AND created_at BETWEEN start_date AND end_date
    ),
    'outbound_clicks', (
      SELECT COUNT(*)
      FROM portfolio_analytics
      WHERE event_type = 'outbound_click'
        AND created_at BETWEEN start_date AND end_date
    ),
    'total_sessions', (
      SELECT COUNT(DISTINCT COALESCE(visit_id, session_id))
      FROM portfolio_analytics WHERE created_at BETWEEN start_date AND end_date
    ),
    'avg_actions_per_session', (
      SELECT COALESCE(ROUND(AVG(cnt)::numeric, 1), 0)
      FROM (
        SELECT COALESCE(visit_id, session_id) AS sid, COUNT(*) AS cnt
        FROM portfolio_analytics
        WHERE created_at BETWEEN start_date AND end_date
          AND event_type NOT IN ('heartbeat', 'navigation')
          AND COALESCE(visit_id, session_id) IS NOT NULL
        GROUP BY sid
      ) sub
    )
  ) INTO result;
  RETURN result;
END;
$$;

-- 2. Timeseries (activity timeline)
CREATE OR REPLACE FUNCTION analytics_timeseries(
  start_date timestamptz, end_date timestamptz, bucket text DEFAULT 'day'
)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE result json;
BEGIN
  SELECT json_agg(row_to_json(t)) INTO result
  FROM (
    SELECT
      date_trunc(bucket, created_at) AS period,
      COUNT(*) FILTER (WHERE event_type = 'page_view') AS page_views,
      COUNT(*) FILTER (WHERE event_type NOT IN ('page_view', 'heartbeat', 'navigation')) AS interactions,
      COUNT(DISTINCT COALESCE(visitor_id, session_id)) AS unique_visitors
    FROM portfolio_analytics
    WHERE created_at BETWEEN start_date AND end_date
    GROUP BY period
    ORDER BY period
  ) t;
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- 3. Project stats
CREATE OR REPLACE FUNCTION analytics_project_stats(start_date timestamptz, end_date timestamptz)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE result json;
BEGIN
  SELECT json_agg(row_to_json(t)) INTO result
  FROM (
    SELECT
      pa.project_id,
      pp.title AS project_title,
      COUNT(*) FILTER (WHERE pa.event_type = 'project_view') AS views,
      COUNT(*) FILTER (WHERE pa.event_type = 'project_open') AS opens,
      COUNT(DISTINCT COALESCE(pa.visitor_id, pa.session_id))
        FILTER (WHERE pa.event_type IN ('project_view', 'project_open')) AS unique_visitors,
      COUNT(*) FILTER (WHERE pa.event_type = 'github_click') AS github_clicks,
      COUNT(*) FILTER (WHERE pa.event_type = 'demo_click') AS demo_clicks,
      COUNT(*) FILTER (WHERE pa.event_type = 'outbound_click') AS outbound_clicks
    FROM portfolio_analytics pa
    LEFT JOIN portfolio_projects pp ON pp.id = pa.project_id
    WHERE pa.project_id IS NOT NULL
      AND pa.created_at BETWEEN start_date AND end_date
    GROUP BY pa.project_id, pp.title
    ORDER BY opens DESC, views DESC
  ) t;
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- 4. Event breakdown (popular actions)
CREATE OR REPLACE FUNCTION analytics_event_breakdown(start_date timestamptz, end_date timestamptz)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE result json;
BEGIN
  SELECT json_agg(row_to_json(t)) INTO result
  FROM (
    SELECT
      event_type,
      COUNT(*) AS count,
      COUNT(DISTINCT COALESCE(visitor_id, session_id)) AS unique_visitors
    FROM portfolio_analytics
    WHERE created_at BETWEEN start_date AND end_date
      AND event_type != 'heartbeat'
    GROUP BY event_type
    ORDER BY count DESC
  ) t;
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- 5. Visitor sessions (journey list)
CREATE OR REPLACE FUNCTION analytics_visitor_sessions(start_date timestamptz, end_date timestamptz)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE result json;
BEGIN
  SELECT json_agg(row_to_json(t)) INTO result
  FROM (
    SELECT
      COALESCE(visit_id, session_id) AS session_key,
      COALESCE(visitor_id, session_id) AS visitor_key,
      MIN(created_at) AS started_at,
      MAX(created_at) AS ended_at,
      COUNT(*) FILTER (WHERE event_type != 'heartbeat') AS action_count,
      MAX(device_type) AS device_type,
      MAX(referrer) AS referrer,
      MAX(utm_source) AS utm_source,
      ARRAY_AGG(DISTINCT event_type) AS event_types
    FROM portfolio_analytics
    WHERE created_at BETWEEN start_date AND end_date
      AND COALESCE(visit_id, session_id) IS NOT NULL
    GROUP BY session_key, visitor_key
    ORDER BY started_at DESC
    LIMIT 50
  ) t;
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- 6. UTM stats
CREATE OR REPLACE FUNCTION analytics_utm_stats(start_date timestamptz, end_date timestamptz)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE result json;
BEGIN
  SELECT json_agg(row_to_json(t)) INTO result
  FROM (
    SELECT
      utm_source AS channel_source,
      utm_campaign AS campaign_name,
      COUNT(DISTINCT COALESCE(visit_id, session_id)) AS sessions,
      COUNT(*) FILTER (WHERE event_type NOT IN ('page_view', 'heartbeat', 'navigation')) AS interactions,
      COUNT(*) FILTER (WHERE event_type IN ('resume_download', 'contact_submit', 'github_click', 'demo_click')) AS conversions
    FROM portfolio_analytics
    WHERE created_at BETWEEN start_date AND end_date
      AND utm_source IS NOT NULL
    GROUP BY utm_source, utm_campaign
    ORDER BY sessions DESC
  ) t;
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- 7. Popular actions (top metadata patterns)
CREATE OR REPLACE FUNCTION analytics_popular_actions(start_date timestamptz, end_date timestamptz)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE result json;
BEGIN
  SELECT json_agg(row_to_json(t)) INTO result
  FROM (
    SELECT
      event_type,
      COALESCE(event_name, event_type) AS action_label,
      COUNT(*) AS total_count,
      COUNT(DISTINCT COALESCE(visitor_id, session_id)) AS unique_users,
      MAX(created_at) AS last_occurred
    FROM portfolio_analytics
    WHERE created_at BETWEEN start_date AND end_date
      AND event_type NOT IN ('heartbeat', 'page_view', 'navigation')
    GROUP BY event_type, action_label
    ORDER BY total_count DESC
    LIMIT 20
  ) t;
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- ============================================
-- ENABLE REALTIME
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = 'portfolio_analytics'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE portfolio_analytics;
  END IF;
END $$;
