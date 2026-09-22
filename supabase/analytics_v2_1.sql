-- 1. Update analytics_summary to include average duration
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
    ),
    'avg_duration_seconds', (
      SELECT COALESCE(ROUND(AVG(EXTRACT(EPOCH FROM (ended_at - started_at)))::numeric, 1), 0)
      FROM (
        SELECT COALESCE(visit_id, session_id) AS sid, MIN(created_at) AS started_at, MAX(created_at) AS ended_at
        FROM portfolio_analytics
        WHERE created_at BETWEEN start_date AND end_date
          AND COALESCE(visit_id, session_id) IS NOT NULL
        GROUP BY sid
      ) sub
    )
  ) INTO result;
  RETURN result;
END;
$$;

-- 2. Update analytics_visitor_sessions to include country_code
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
      MAX(country_code) AS country_code,
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
