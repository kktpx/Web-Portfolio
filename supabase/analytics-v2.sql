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
-- AGGREGATION RPCs (admin only)
-- ============================================
-- Shared definitions (all functions):
--   window       : created_at >= p_from AND created_at < p_to   (half-open, UTC)
--   visitor      : distinct session_id
--   visit        : distinct visit_id (rows with NULL visit_id count for visitors /
--                  event totals but never as a visit)
--   interaction  : any event except page_view, heartbeat, section_view
--   external     : github_click | demo_click | social_click
--   goals        : resume = resume_download; project = project_view;
--                  outbound = github_click | demo_click (spec: "live demo/GitHub click");
--                  contact = contact_click | contact_submit
--   rate / share : fraction 0..1 rounded to 4 decimals; 0 when the denominator is 0
--   source       : utm_source, else referrer host (GitHub / Facebook / bare host),
--                  else 'Direct' (see analytics_source)
--   country      : NULL / '' are reported as 'XX' (unknown)
--   timestamps   : returned as UTC ISO strings 'YYYY-MM-DDTHH:MI:SSZ'

-- Helper: traffic source label for a visit (pure, not exposed to API roles)
CREATE OR REPLACE FUNCTION public.analytics_source(p_utm_source text, p_referrer text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  WITH h AS (
    SELECT regexp_replace(
             substring(lower(btrim(coalesce(p_referrer, ''))) FROM '^[a-z][a-z0-9+.-]*://([^/:?#]+)'),
             '^www\.', '') AS host
  )
  SELECT CASE
    WHEN nullif(btrim(p_utm_source), '') IS NOT NULL THEN btrim(p_utm_source)
    WHEN h.host IS NULL OR h.host = '' THEN 'Direct'
    WHEN h.host ~ '(^|\.)github\.com$' THEN 'GitHub'
    WHEN h.host ~ '(^|\.)(facebook\.com|fb\.com|fb\.me)$' THEN 'Facebook'
    ELSE h.host
  END
  FROM h;
$$;

-- Helper: safe ratio (0 when denominator is 0/NULL), 4 decimals
CREATE OR REPLACE FUNCTION public.analytics_rate(p_num bigint, p_den bigint)
RETURNS double precision
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN p_den IS NULL OR p_den = 0 OR p_num IS NULL THEN 0::double precision
    ELSE round(p_num::numeric / p_den, 4)::double precision
  END;
$$;

-- analytics_overview -> {visitors, visitors_today, interactions, interactions_prev,
--   resume_downloads, project_opens, external_clicks, visits, avg_actions_per_visit}
-- visitors_today    : visitors within the window on the UTC day of the window's last
--                     instant (p_to - 1µs); with p_to = now() this is "today".
-- interactions_prev : interactions in the preceding window of equal length
--                     [p_from - (p_to - p_from), p_from).
-- avg_actions_per_visit : interactions / visits, 2 decimals, 0 when no visits.
CREATE OR REPLACE FUNCTION public.analytics_overview(p_from timestamptz, p_to timestamptz)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today     timestamptz;
  v_prev_from timestamptz;
  v_result    jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  v_prev_from := p_from - (p_to - p_from);
  v_today := greatest(
    p_from,
    date_trunc('day', (p_to - interval '1 microsecond') AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'
  );

  SELECT jsonb_build_object(
    'visitors',          count(DISTINCT a.session_id),
    'visitors_today',    count(DISTINCT a.session_id) FILTER (WHERE a.created_at >= v_today),
    'interactions',      count(*) FILTER (WHERE a.event_type NOT IN ('page_view', 'heartbeat', 'section_view')),
    'interactions_prev', (
       SELECT count(*)
       FROM portfolio_analytics p
       WHERE p.created_at >= v_prev_from
         AND p.created_at <  p_from
         AND p.event_type NOT IN ('page_view', 'heartbeat', 'section_view')
    ),
    'resume_downloads',  count(*) FILTER (WHERE a.event_type = 'resume_download'),
    'project_opens',     count(*) FILTER (WHERE a.event_type = 'project_view'),
    'external_clicks',   count(*) FILTER (WHERE a.event_type IN ('github_click', 'demo_click', 'social_click')),
    'visits',            count(DISTINCT a.visit_id),
    'avg_actions_per_visit', CASE
       WHEN count(DISTINCT a.visit_id) = 0 THEN 0::double precision
       ELSE round(
              (count(*) FILTER (WHERE a.event_type NOT IN ('page_view', 'heartbeat', 'section_view')))::numeric
              / count(DISTINCT a.visit_id), 2)::double precision
    END
  )
  INTO v_result
  FROM portfolio_analytics a
  WHERE a.created_at >= p_from
    AND a.created_at <  p_to;

  RETURN v_result;
END;
$$;

-- analytics_timeline -> [{bucket, value}] ordered by bucket, zero-filled.
-- Hourly buckets when p_to - p_from <= 1 day, else daily (UTC).
CREATE OR REPLACE FUNCTION public.analytics_timeline(p_from timestamptz, p_to timestamptz, p_metric text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_unit   text;
  v_result jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  IF p_metric IS NULL OR p_metric NOT IN ('visitors', 'interactions', 'project_opens', 'external_clicks', 'resume_downloads') THEN
    RAISE EXCEPTION 'invalid metric: %', p_metric USING ERRCODE = '22023';
  END IF;

  IF p_from IS NULL OR p_to IS NULL OR p_to <= p_from THEN
    RETURN '[]'::jsonb;
  END IF;

  v_unit := CASE WHEN p_to - p_from <= interval '1 day' THEN 'hour' ELSE 'day' END;

  WITH buckets AS (
    SELECT generate_series(
             date_trunc(v_unit, p_from AT TIME ZONE 'UTC'),
             date_trunc(v_unit, (p_to - interval '1 microsecond') AT TIME ZONE 'UTC'),
             ('1 ' || v_unit)::interval
           ) AS bucket
  ),
  ev AS (
    SELECT date_trunc(v_unit, a.created_at AT TIME ZONE 'UTC') AS bucket,
           a.session_id,
           a.event_type
    FROM portfolio_analytics a
    WHERE a.created_at >= p_from
      AND a.created_at <  p_to
  ),
  agg AS (
    SELECT b.bucket,
           CASE p_metric
             WHEN 'visitors'         THEN count(DISTINCT e.session_id)
             WHEN 'interactions'     THEN count(e.event_type) FILTER (WHERE e.event_type NOT IN ('page_view', 'heartbeat', 'section_view'))
             WHEN 'project_opens'    THEN count(e.event_type) FILTER (WHERE e.event_type = 'project_view')
             WHEN 'external_clicks'  THEN count(e.event_type) FILTER (WHERE e.event_type IN ('github_click', 'demo_click', 'social_click'))
             WHEN 'resume_downloads' THEN count(e.event_type) FILTER (WHERE e.event_type = 'resume_download')
           END AS value
    FROM buckets b
    LEFT JOIN ev e ON e.bucket = b.bucket
    GROUP BY b.bucket
  )
  SELECT coalesce(
           jsonb_agg(
             jsonb_build_object(
               'bucket', to_char(agg.bucket, 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
               'value',  agg.value
             ) ORDER BY agg.bucket),
           '[]'::jsonb)
  INTO v_result
  FROM agg;

  RETURN v_result;
END;
$$;

-- analytics_utm -> [{source, campaign, visits, interactions, conversions, rate}]
-- One row per (source, campaign). conversions = visits reaching any goal.
-- Ordered by visits desc, source, campaign (NULL campaign first).
CREATE OR REPLACE FUNCTION public.analytics_utm(p_from timestamptz, p_to timestamptz)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  WITH v AS (
    SELECT a.visit_id,
           min(nullif(btrim(a.utm_source), ''))   AS utm_source,
           min(nullif(btrim(a.utm_campaign), '')) AS utm_campaign,
           (array_agg(a.referrer ORDER BY a.created_at, a.id)
              FILTER (WHERE nullif(btrim(a.referrer), '') IS NOT NULL))[1] AS referrer,
           count(*) FILTER (WHERE a.event_type NOT IN ('page_view', 'heartbeat', 'section_view')) AS interactions,
           bool_or(a.event_type IN ('resume_download', 'project_view', 'github_click',
                                    'demo_click', 'contact_click', 'contact_submit')) AS converted
    FROM portfolio_analytics a
    WHERE a.created_at >= p_from
      AND a.created_at <  p_to
      AND a.visit_id IS NOT NULL
    GROUP BY a.visit_id
  ),
  s AS (
    SELECT public.analytics_source(v.utm_source, v.referrer) AS source,
           v.utm_campaign                                    AS campaign,
           count(*)                                          AS visits,
           sum(v.interactions)::bigint                       AS interactions,
           count(*) FILTER (WHERE v.converted)               AS conversions
    FROM v
    GROUP BY 1, 2
  )
  SELECT coalesce(
           jsonb_agg(
             jsonb_build_object(
               'source',       s.source,
               'campaign',     s.campaign,
               'visits',       s.visits,
               'interactions', s.interactions,
               'conversions',  s.conversions,
               'rate',         public.analytics_rate(s.conversions, s.visits)
             ) ORDER BY s.visits DESC, s.source COLLATE "C", s.campaign COLLATE "C" NULLS FIRST),
           '[]'::jsonb)
  INTO v_result
  FROM s;

  RETURN v_result;
END;
$$;

-- analytics_goals -> {resume, project, outbound, contact}, each {visits, rate}
CREATE OR REPLACE FUNCTION public.analytics_goals(p_from timestamptz, p_to timestamptz)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  WITH v AS (
    SELECT a.visit_id,
           bool_or(a.event_type = 'resume_download')                     AS resume,
           bool_or(a.event_type = 'project_view')                        AS project,
           bool_or(a.event_type IN ('github_click', 'demo_click'))       AS outbound,
           bool_or(a.event_type IN ('contact_click', 'contact_submit'))  AS contact
    FROM portfolio_analytics a
    WHERE a.created_at >= p_from
      AND a.created_at <  p_to
      AND a.visit_id IS NOT NULL
    GROUP BY a.visit_id
  ),
  t AS (
    SELECT count(*)                            AS total,
           count(*) FILTER (WHERE v.resume)    AS resume,
           count(*) FILTER (WHERE v.project)   AS project,
           count(*) FILTER (WHERE v.outbound)  AS outbound,
           count(*) FILTER (WHERE v.contact)   AS contact
    FROM v
  )
  SELECT jsonb_build_object(
           'resume',   jsonb_build_object('visits', t.resume,   'rate', public.analytics_rate(t.resume,   t.total)),
           'project',  jsonb_build_object('visits', t.project,  'rate', public.analytics_rate(t.project,  t.total)),
           'outbound', jsonb_build_object('visits', t.outbound, 'rate', public.analytics_rate(t.outbound, t.total)),
           'contact',  jsonb_build_object('visits', t.contact,  'rate', public.analytics_rate(t.contact,  t.total))
         )
  INTO v_result
  FROM t;

  RETURN v_result;
END;
$$;

-- analytics_sections -> [{section, visits, rate}] for the six tracked sections,
-- in page order; rate = visits that viewed the section / all visits.
CREATE OR REPLACE FUNCTION public.analytics_sections(p_from timestamptz, p_to timestamptz)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  WITH total AS (
    SELECT count(DISTINCT a.visit_id) AS n
    FROM portfolio_analytics a
    WHERE a.created_at >= p_from
      AND a.created_at <  p_to
      AND a.visit_id IS NOT NULL
  ),
  sec(section, ord) AS (
    VALUES ('home', 1), ('about', 2), ('skills', 3),
           ('portfolio', 4), ('github-stats', 5), ('contact', 6)
  ),
  hits AS (
    SELECT a.section, count(DISTINCT a.visit_id) AS visits
    FROM portfolio_analytics a
    WHERE a.created_at >= p_from
      AND a.created_at <  p_to
      AND a.event_type = 'section_view'
      AND a.visit_id IS NOT NULL
    GROUP BY a.section
  )
  SELECT jsonb_agg(
           jsonb_build_object(
             'section', sec.section,
             'visits',  coalesce(hits.visits, 0),
             'rate',    public.analytics_rate(coalesce(hits.visits, 0), total.n)
           ) ORDER BY sec.ord)
  INTO v_result
  FROM sec
  CROSS JOIN total
  LEFT JOIN hits ON hits.section = sec.section;

  RETURN coalesce(v_result, '[]'::jsonb);
END;
$$;

-- analytics_projects -> [{project_id, title, opens, unique_visitors, github, demo, click_rate}]
-- opens = project_view count; unique_visitors = distinct session_id among opens;
-- click_rate = (github + demo) / opens (0 when no opens; may exceed 1 if links
-- are clicked without opening the project). Projects with any such event.
CREATE OR REPLACE FUNCTION public.analytics_projects(p_from timestamptz, p_to timestamptz)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  WITH p AS (
    SELECT a.project_id,
           count(*) FILTER (WHERE a.event_type = 'project_view')                   AS opens,
           count(DISTINCT a.session_id) FILTER (WHERE a.event_type = 'project_view') AS unique_visitors,
           count(*) FILTER (WHERE a.event_type = 'github_click')                   AS github,
           count(*) FILTER (WHERE a.event_type = 'demo_click')                     AS demo
    FROM portfolio_analytics a
    WHERE a.created_at >= p_from
      AND a.created_at <  p_to
      AND a.project_id IS NOT NULL
      AND a.event_type IN ('project_view', 'github_click', 'demo_click')
    GROUP BY a.project_id
  )
  SELECT coalesce(
           jsonb_agg(
             jsonb_build_object(
               'project_id',      p.project_id,
               'title',           pr.title,
               'opens',           p.opens,
               'unique_visitors', p.unique_visitors,
               'github',          p.github,
               'demo',            p.demo,
               'click_rate',      public.analytics_rate(p.github + p.demo, p.opens)
             ) ORDER BY p.opens DESC, (p.github + p.demo) DESC, pr.title COLLATE "C" NULLS LAST, p.project_id),
           '[]'::jsonb)
  INTO v_result
  FROM p
  LEFT JOIN portfolio_projects pr ON pr.id = p.project_id;

  RETURN v_result;
END;
$$;

-- analytics_top_actions -> [{label, kind, count, share}] (top 10 interactions)
-- kind = event_type; share = count / all interactions in the window.
CREATE OR REPLACE FUNCTION public.analytics_top_actions(p_from timestamptz, p_to timestamptz)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  WITH i AS (
    SELECT a.event_type AS kind,
           CASE a.event_type
             WHEN 'project_view'    THEN 'Viewed '     || coalesce(pr.title, 'unknown project')
             WHEN 'github_click'    THEN 'GitHub: '    || coalesce(pr.title, 'unknown project')
             WHEN 'demo_click'      THEN 'Live demo: ' || coalesce(pr.title, 'unknown project')
             WHEN 'resume_download' THEN 'Resume download'
             WHEN 'contact_click'   THEN 'Contact link click'
             WHEN 'contact_submit'  THEN 'Contact form submitted'
             WHEN 'social_click'    THEN 'Social link click'
             ELSE a.event_type
           END AS label
    FROM portfolio_analytics a
    LEFT JOIN portfolio_projects pr ON pr.id = a.project_id
    WHERE a.created_at >= p_from
      AND a.created_at <  p_to
      AND a.event_type NOT IN ('page_view', 'heartbeat', 'section_view')
  ),
  total AS (
    SELECT count(*) AS n FROM i
  ),
  g AS (
    SELECT i.label, i.kind, count(*) AS cnt
    FROM i
    GROUP BY i.label, i.kind
    ORDER BY cnt DESC, i.label COLLATE "C", i.kind COLLATE "C"
    LIMIT 10
  )
  SELECT coalesce(
           jsonb_agg(
             jsonb_build_object(
               'label', g.label,
               'kind',  g.kind,
               'count', g.cnt,
               'share', public.analytics_rate(g.cnt, total.n)
             ) ORDER BY g.cnt DESC, g.label COLLATE "C", g.kind COLLATE "C"),
           '[]'::jsonb)
  INTO v_result
  FROM g
  CROSS JOIN total;

  RETURN v_result;
END;
$$;

-- analytics_countries -> [{country, visitors, share}]
-- share = country visitors / all distinct visitors in the window.
CREATE OR REPLACE FUNCTION public.analytics_countries(p_from timestamptz, p_to timestamptz)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  WITH w AS (
    SELECT a.session_id,
           coalesce(nullif(upper(btrim(a.country)), ''), 'XX') AS country
    FROM portfolio_analytics a
    WHERE a.created_at >= p_from
      AND a.created_at <  p_to
      AND a.session_id IS NOT NULL
  ),
  total AS (
    SELECT count(DISTINCT w.session_id) AS n FROM w
  ),
  c AS (
    SELECT w.country, count(DISTINCT w.session_id) AS visitors
    FROM w
    GROUP BY w.country
  )
  SELECT coalesce(
           jsonb_agg(
             jsonb_build_object(
               'country',  c.country,
               'visitors', c.visitors,
               'share',    public.analytics_rate(c.visitors, total.n)
             ) ORDER BY c.visitors DESC, c.country COLLATE "C"),
           '[]'::jsonb)
  INTO v_result
  FROM c
  CROSS JOIN total;

  RETURN v_result;
END;
$$;

-- analytics_visits(p_limit, p_day) -> [{visit_id, started_at, source, country, device,
--   duration_seconds, events, visitor}], newest first.
-- p_day NULL = most recent visits overall; else visits that STARTED on that UTC day.
-- p_limit defaults to 30, clamped to 1..200. events excludes heartbeats;
-- duration_seconds = last - first event (heartbeats included), whole seconds.
CREATE OR REPLACE FUNCTION public.analytics_visits(p_limit integer, p_day date)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_limit     integer;
  v_day_start timestamptz;
  v_day_end   timestamptz;
  v_result    jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  v_limit     := least(greatest(coalesce(p_limit, 30), 1), 200);
  v_day_start := p_day::timestamp AT TIME ZONE 'UTC';
  v_day_end   := (p_day + 1)::timestamp AT TIME ZONE 'UTC';

  WITH v AS (
    SELECT a.visit_id,
           min(a.created_at) AS started_at,
           max(a.created_at) AS ended_at,
           min(nullif(btrim(a.utm_source), '')) AS utm_source,
           (array_agg(a.referrer ORDER BY a.created_at, a.id)
              FILTER (WHERE nullif(btrim(a.referrer), '') IS NOT NULL))[1] AS referrer,
           (array_agg(upper(btrim(a.country)) ORDER BY a.created_at, a.id)
              FILTER (WHERE nullif(btrim(a.country), '') IS NOT NULL))[1] AS country,
           (array_agg(a.device_type ORDER BY a.created_at, a.id)
              FILTER (WHERE a.device_type IS NOT NULL))[1] AS device,
           count(*) FILTER (WHERE a.event_type <> 'heartbeat') AS events,
           (array_agg(a.session_id ORDER BY a.created_at, a.id)
              FILTER (WHERE a.session_id IS NOT NULL))[1] AS visitor
    FROM portfolio_analytics a
    WHERE a.visit_id IS NOT NULL
      AND (
        p_day IS NULL
        OR a.visit_id IN (
          SELECT b.visit_id
          FROM portfolio_analytics b
          WHERE b.visit_id IS NOT NULL
            AND b.created_at >= v_day_start
            AND b.created_at <  v_day_end
        )
      )
    GROUP BY a.visit_id
    HAVING p_day IS NULL
        OR (min(a.created_at) >= v_day_start AND min(a.created_at) < v_day_end)
    ORDER BY min(a.created_at) DESC, a.visit_id DESC
    LIMIT v_limit
  )
  SELECT coalesce(
           jsonb_agg(
             jsonb_build_object(
               'visit_id',         v.visit_id,
               'started_at',       to_char(v.started_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
               'source',           public.analytics_source(v.utm_source, v.referrer),
               'country',          coalesce(v.country, 'XX'),
               'device',           coalesce(v.device, 'unknown'),
               'duration_seconds', floor(extract(epoch FROM (v.ended_at - v.started_at)))::integer,
               'events',           v.events,
               'visitor',          v.visitor
             ) ORDER BY v.started_at DESC, v.visit_id DESC),
           '[]'::jsonb)
  INTO v_result
  FROM v;

  RETURN v_result;
END;
$$;

-- analytics_visit_trail(p_visit_id) -> [{created_at, event_type, page_path, section,
--   project_title}] in time order; heartbeats are omitted.
CREATE OR REPLACE FUNCTION public.analytics_visit_trail(p_visit_id text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  SELECT coalesce(
           jsonb_agg(
             jsonb_build_object(
               'created_at',    to_char(a.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
               'event_type',    a.event_type,
               'page_path',     a.page_path,
               'section',       a.section,
               'project_title', pr.title
             ) ORDER BY a.created_at, a.id),
           '[]'::jsonb)
  INTO v_result
  FROM portfolio_analytics a
  LEFT JOIN portfolio_projects pr ON pr.id = a.project_id
  WHERE a.visit_id = p_visit_id
    AND a.event_type <> 'heartbeat';

  RETURN v_result;
END;
$$;

-- Privileges: RPCs callable only by signed-in users (and is_admin() inside);
-- helpers are internal (called from SECURITY DEFINER functions as owner).
REVOKE EXECUTE ON FUNCTION public.analytics_source(text, text)   FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.analytics_rate(bigint, bigint) FROM public, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.analytics_overview(timestamptz, timestamptz)          FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.analytics_timeline(timestamptz, timestamptz, text)    FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.analytics_utm(timestamptz, timestamptz)               FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.analytics_goals(timestamptz, timestamptz)             FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.analytics_sections(timestamptz, timestamptz)          FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.analytics_projects(timestamptz, timestamptz)          FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.analytics_top_actions(timestamptz, timestamptz)       FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.analytics_countries(timestamptz, timestamptz)         FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.analytics_visits(integer, date)                       FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.analytics_visit_trail(text)                           FROM public, anon;

GRANT EXECUTE ON FUNCTION public.analytics_overview(timestamptz, timestamptz)          TO authenticated;
GRANT EXECUTE ON FUNCTION public.analytics_timeline(timestamptz, timestamptz, text)    TO authenticated;
GRANT EXECUTE ON FUNCTION public.analytics_utm(timestamptz, timestamptz)               TO authenticated;
GRANT EXECUTE ON FUNCTION public.analytics_goals(timestamptz, timestamptz)             TO authenticated;
GRANT EXECUTE ON FUNCTION public.analytics_sections(timestamptz, timestamptz)          TO authenticated;
GRANT EXECUTE ON FUNCTION public.analytics_projects(timestamptz, timestamptz)          TO authenticated;
GRANT EXECUTE ON FUNCTION public.analytics_top_actions(timestamptz, timestamptz)       TO authenticated;
GRANT EXECUTE ON FUNCTION public.analytics_countries(timestamptz, timestamptz)         TO authenticated;
GRANT EXECUTE ON FUNCTION public.analytics_visits(integer, date)                       TO authenticated;
GRANT EXECUTE ON FUNCTION public.analytics_visit_trail(text)                           TO authenticated;

-- ============================================
-- OPTIONAL — destroys all existing analytics. Run manually after export
-- ============================================
-- TRUNCATE portfolio_analytics;
