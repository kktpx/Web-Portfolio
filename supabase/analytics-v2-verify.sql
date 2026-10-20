-- ============================================
-- ANALYTICS V2 — RPC VERIFICATION (seed + expected values, ROLLED BACK)
-- ============================================
-- Prerequisites: analytics-v2.sql has been run; admin_users has at least one row.
-- Run the whole file in the Supabase SQL editor (or psql). Everything happens in
-- ONE transaction that ends in ROLLBACK, so nothing is kept.
--
-- How to read the result:
--   * Each RPC call below is stored in the temp table _checks together with its
--     hand-computed expected value (also written as a comment beside the call).
--   * A summary SELECT lists every check with pass = true/false.
--   * The final DO block RAISES AN ERROR listing every failing check. So in the
--     Supabase SQL editor (which only shows the last statement) "Success" means
--     every check passed; an error message names the failures.
--
-- Seed data lives on 2000-01-09 / 2000-01-10 UTC so real traffic never overlaps.
--
-- SEED (UTC). Projects: PA = 'Verify Project A', PB = 'Verify Project B'
--  visit      visitor    country device  source info                         events
--  verify-v1  verify-s1  TH      desktop referrer https://github.com/someone  r1  10:00:00 page_view
--                                                                             r2  10:00:05 section_view home
--                                                                             r3  10:00:10 project_view PA
--                                                                             r4  10:00:15 heartbeat
--                                                                             r5  10:00:30 heartbeat
--                                                                             r6  10:00:45 github_click PA
--                                                                             r7  10:01:00 heartbeat   (heartbeats span 60s)
--  verify-v2  verify-s1  TH      desktop utm linkedin/social/profile          r8  14:00:00 page_view
--                                        (referrer linkedin.com)              r9  14:00:05 section_view about
--                                                                             r10 14:00:20 resume_download
--  verify-v3  verify-s2  US      mobile  referrer '' (Direct)                 r11 18:30:00 page_view
--                                                                             r12 18:30:10 section_view home
--                                                                             r13 18:30:20 project_view PB
--                                                                             r14 18:30:40 demo_click PB
--                                                                             r15 18:31:00 contact_click
--  verify-v4  verify-s3  XX/NULL tablet  referrer https://l.facebook.com/...  r16 23:59:00 page_view    (XX)
--                                                                             r17 23:59:20 section_view home (XX)
--                                                                             r18 23:59:40 social_click (XX)
--                                                                             r19 23:59:50 social_click (country NULL)
--  verify-v0  verify-s2  US      desktop referrer NULL (Direct)  2000-01-09   r20 12:00:00 page_view
--                                                                             r21 12:00:10 demo_click PA
--                                                                             r22 12:00:20 contact_submit
--
-- Windows used:
--  A = [2000-01-10 00:00, 2000-01-11 00:00)  exactly 1 day -> hourly timeline; rows r1..r19
--      previous window [2000-01-09, 2000-01-10) holds r20..r22
--  B = [2000-01-08 00:00, 2000-01-11 00:00)  3 days -> daily timeline; rows r1..r22
--      previous window [2000-01-05, 2000-01-08) is empty
--  C = [1999-01-01 00:00, 1999-01-02 00:00)  empty (zero / no-division checks)
--  D = [2000-01-09 00:00, 2000-01-10 12:00)  1.5 days; rows r1..r7, r20..r22
--      ("today" = 2000-01-10, so visitors_today differs from visitors)

BEGIN;

-- 0. Preconditions --------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admin_users) THEN
    RAISE EXCEPTION 'verify: admin_users is empty — add an admin first';
  END IF;
END $$;

CREATE TEMP TABLE _checks (
  ord      integer PRIMARY KEY,
  name     text    NOT NULL,
  actual   jsonb,
  expected jsonb
) ON COMMIT DROP;
GRANT SELECT, INSERT ON _checks TO authenticated, anon;

-- 1. Seed (as the SQL-editor owner role; RLS does not apply) ----------------
INSERT INTO public.portfolio_projects (id, title, is_published) VALUES
  ('00000000-0000-4000-8000-0000000000a1', 'Verify Project A', false),
  ('00000000-0000-4000-8000-0000000000a2', 'Verify Project B', false);

INSERT INTO public.portfolio_analytics
  (created_at, event_type, project_id, page_path, section, referrer, device_type,
   session_id, visit_id, country, utm_source, utm_medium, utm_campaign)
VALUES
  -- verify-v1 (s1, TH, desktop, from GitHub)
  ('2000-01-10 10:00:00+00', 'page_view',    NULL, '/', NULL,   'https://github.com/someone', 'desktop', 'verify-s1', 'verify-v1', 'TH', NULL, NULL, NULL),
  ('2000-01-10 10:00:05+00', 'section_view', NULL, '/', 'home', 'https://github.com/someone', 'desktop', 'verify-s1', 'verify-v1', 'TH', NULL, NULL, NULL),
  ('2000-01-10 10:00:10+00', 'project_view', '00000000-0000-4000-8000-0000000000a1', '/', NULL, 'https://github.com/someone', 'desktop', 'verify-s1', 'verify-v1', 'TH', NULL, NULL, NULL),
  ('2000-01-10 10:00:15+00', 'heartbeat',    NULL, '/', NULL,   'https://github.com/someone', 'desktop', 'verify-s1', 'verify-v1', 'TH', NULL, NULL, NULL),
  ('2000-01-10 10:00:30+00', 'heartbeat',    NULL, '/', NULL,   'https://github.com/someone', 'desktop', 'verify-s1', 'verify-v1', 'TH', NULL, NULL, NULL),
  ('2000-01-10 10:00:45+00', 'github_click', '00000000-0000-4000-8000-0000000000a1', '/', NULL, 'https://github.com/someone', 'desktop', 'verify-s1', 'verify-v1', 'TH', NULL, NULL, NULL),
  ('2000-01-10 10:01:00+00', 'heartbeat',    NULL, '/', NULL,   'https://github.com/someone', 'desktop', 'verify-s1', 'verify-v1', 'TH', NULL, NULL, NULL),
  -- verify-v2 (s1, TH, desktop, utm_source=linkedin)
  ('2000-01-10 14:00:00+00', 'page_view',       NULL, '/', NULL,    'https://www.linkedin.com/', 'desktop', 'verify-s1', 'verify-v2', 'TH', 'linkedin', 'social', 'profile'),
  ('2000-01-10 14:00:05+00', 'section_view',    NULL, '/', 'about', 'https://www.linkedin.com/', 'desktop', 'verify-s1', 'verify-v2', 'TH', 'linkedin', 'social', 'profile'),
  ('2000-01-10 14:00:20+00', 'resume_download', NULL, '/', NULL,    'https://www.linkedin.com/', 'desktop', 'verify-s1', 'verify-v2', 'TH', 'linkedin', 'social', 'profile'),
  -- verify-v3 (s2, US, mobile, Direct: empty referrer)
  ('2000-01-10 18:30:00+00', 'page_view',     NULL, '/', NULL,   '', 'mobile', 'verify-s2', 'verify-v3', 'US', NULL, NULL, NULL),
  ('2000-01-10 18:30:10+00', 'section_view',  NULL, '/', 'home', '', 'mobile', 'verify-s2', 'verify-v3', 'US', NULL, NULL, NULL),
  ('2000-01-10 18:30:20+00', 'project_view',  '00000000-0000-4000-8000-0000000000a2', '/', NULL, '', 'mobile', 'verify-s2', 'verify-v3', 'US', NULL, NULL, NULL),
  ('2000-01-10 18:30:40+00', 'demo_click',    '00000000-0000-4000-8000-0000000000a2', '/', NULL, '', 'mobile', 'verify-s2', 'verify-v3', 'US', NULL, NULL, NULL),
  ('2000-01-10 18:31:00+00', 'contact_click', NULL, '/', NULL,   '', 'mobile', 'verify-s2', 'verify-v3', 'US', NULL, NULL, NULL),
  -- verify-v4 (s3, unknown country XX / NULL, tablet, from Facebook)
  ('2000-01-10 23:59:00+00', 'page_view',    NULL, '/', NULL,   'https://l.facebook.com/l.php?u=x', 'tablet', 'verify-s3', 'verify-v4', 'XX', NULL, NULL, NULL),
  ('2000-01-10 23:59:20+00', 'section_view', NULL, '/', 'home', 'https://l.facebook.com/l.php?u=x', 'tablet', 'verify-s3', 'verify-v4', 'XX', NULL, NULL, NULL),
  ('2000-01-10 23:59:40+00', 'social_click', NULL, '/', NULL,   'https://l.facebook.com/l.php?u=x', 'tablet', 'verify-s3', 'verify-v4', 'XX', NULL, NULL, NULL),
  ('2000-01-10 23:59:50+00', 'social_click', NULL, '/', NULL,   'https://l.facebook.com/l.php?u=x', 'tablet', 'verify-s3', 'verify-v4', NULL, NULL, NULL, NULL),
  -- verify-v0 (s2, US, desktop, Direct: NULL referrer) — previous day
  ('2000-01-09 12:00:00+00', 'page_view',      NULL, '/', NULL, NULL, 'desktop', 'verify-s2', 'verify-v0', 'US', NULL, NULL, NULL),
  ('2000-01-09 12:00:10+00', 'demo_click',     '00000000-0000-4000-8000-0000000000a1', '/', NULL, NULL, 'desktop', 'verify-s2', 'verify-v0', 'US', NULL, NULL, NULL),
  ('2000-01-09 12:00:20+00', 'contact_submit', NULL, '/', NULL, NULL, 'desktop', 'verify-s2', 'verify-v0', 'US', NULL, NULL, NULL);

-- 2. Become the first admin (authenticated role + JWT claims) ---------------
SELECT set_config('request.jwt.claims',
                  json_build_object('sub', u.user_id::text, 'role', 'authenticated')::text, true),
       set_config('request.jwt.claim.sub', u.user_id::text, true)
FROM (SELECT user_id FROM public.admin_users ORDER BY created_at, user_id LIMIT 1) u;

SET LOCAL ROLE authenticated;

-- 3. Checks -----------------------------------------------------------------

-- analytics_overview, window A
-- visitors 3 (s1,s2,s3); visitors_today 3 (all on 2000-01-10); interactions 8
-- (r3,r6,r10,r13,r14,r15,r18,r19); interactions_prev 2 (r21,r22); resume 1 (r10);
-- project_opens 2 (r3,r13); external 4 (r6,r14,r18,r19); visits 4; avg 8/4 = 2
INSERT INTO _checks VALUES (1, 'overview A',
  public.analytics_overview('2000-01-10 00:00+00', '2000-01-11 00:00+00'),
  '{"visitors":3,"visitors_today":3,"interactions":8,"interactions_prev":2,"resume_downloads":1,"project_opens":2,"external_clicks":4,"visits":4,"avg_actions_per_visit":2}');

-- analytics_overview, window B (3 days; prev window 2000-01-05..08 empty)
-- visitors 3; visitors_today 3 (day of 2000-01-10 23:59:59.999999); interactions 8+2 = 10;
-- prev 0; resume 1; opens 2; external 4 + r21 = 5; visits 5 (v0..v4); avg 10/5 = 2
INSERT INTO _checks VALUES (2, 'overview B',
  public.analytics_overview('2000-01-08 00:00+00', '2000-01-11 00:00+00'),
  '{"visitors":3,"visitors_today":3,"interactions":10,"interactions_prev":0,"resume_downloads":1,"project_opens":2,"external_clicks":5,"visits":5,"avg_actions_per_visit":2}');

-- analytics_overview, window C (empty) -> all zero, no division by zero
INSERT INTO _checks VALUES (3, 'overview C (empty)',
  public.analytics_overview('1999-01-01 00:00+00', '1999-01-02 00:00+00'),
  '{"visitors":0,"visitors_today":0,"interactions":0,"interactions_prev":0,"resume_downloads":0,"project_opens":0,"external_clicks":0,"visits":0,"avg_actions_per_visit":0}');

-- analytics_overview, window D [2000-01-09 00:00, 2000-01-10 12:00): rows r20-r22, r1-r7
-- visitors 2 (s2,s1); visitors_today 1 (only s1 on 2000-01-10); interactions 4 (r21,r22,r3,r6);
-- prev window [2000-01-07 12:00, 2000-01-09 00:00) -> 0; resume 0; opens 1 (r3);
-- external 2 (r21,r6); visits 2 (v0,v1); avg 4/2 = 2
INSERT INTO _checks VALUES (4, 'overview D (visitors_today)',
  public.analytics_overview('2000-01-09 00:00+00', '2000-01-10 12:00+00'),
  '{"visitors":2,"visitors_today":1,"interactions":4,"interactions_prev":0,"resume_downloads":0,"project_opens":1,"external_clicks":2,"visits":2,"avg_actions_per_visit":2}');

-- analytics_timeline, window A (exactly 1 day -> 24 hourly buckets), interactions
-- 10h: r3,r6 = 2; 14h: r10 = 1; 18h: r13,r14,r15 = 3; 23h: r18,r19 = 2; others 0
INSERT INTO _checks VALUES (10, 'timeline A interactions (hourly)',
  public.analytics_timeline('2000-01-10 00:00+00', '2000-01-11 00:00+00', 'interactions'),
  '[{"bucket":"2000-01-10T00:00:00Z","value":0},{"bucket":"2000-01-10T01:00:00Z","value":0},
    {"bucket":"2000-01-10T02:00:00Z","value":0},{"bucket":"2000-01-10T03:00:00Z","value":0},
    {"bucket":"2000-01-10T04:00:00Z","value":0},{"bucket":"2000-01-10T05:00:00Z","value":0},
    {"bucket":"2000-01-10T06:00:00Z","value":0},{"bucket":"2000-01-10T07:00:00Z","value":0},
    {"bucket":"2000-01-10T08:00:00Z","value":0},{"bucket":"2000-01-10T09:00:00Z","value":0},
    {"bucket":"2000-01-10T10:00:00Z","value":2},{"bucket":"2000-01-10T11:00:00Z","value":0},
    {"bucket":"2000-01-10T12:00:00Z","value":0},{"bucket":"2000-01-10T13:00:00Z","value":0},
    {"bucket":"2000-01-10T14:00:00Z","value":1},{"bucket":"2000-01-10T15:00:00Z","value":0},
    {"bucket":"2000-01-10T16:00:00Z","value":0},{"bucket":"2000-01-10T17:00:00Z","value":0},
    {"bucket":"2000-01-10T18:00:00Z","value":3},{"bucket":"2000-01-10T19:00:00Z","value":0},
    {"bucket":"2000-01-10T20:00:00Z","value":0},{"bucket":"2000-01-10T21:00:00Z","value":0},
    {"bucket":"2000-01-10T22:00:00Z","value":0},{"bucket":"2000-01-10T23:00:00Z","value":2}]');

-- analytics_timeline, window B (3 days -> daily buckets 01-08, 01-09, 01-10)
-- visitors: 0 / 1 (s2) / 3
INSERT INTO _checks VALUES (11, 'timeline B visitors (daily)',
  public.analytics_timeline('2000-01-08 00:00+00', '2000-01-11 00:00+00', 'visitors'),
  '[{"bucket":"2000-01-08T00:00:00Z","value":0},{"bucket":"2000-01-09T00:00:00Z","value":1},{"bucket":"2000-01-10T00:00:00Z","value":3}]');
-- interactions: 0 / 2 (r21,r22) / 8
INSERT INTO _checks VALUES (12, 'timeline B interactions (daily)',
  public.analytics_timeline('2000-01-08 00:00+00', '2000-01-11 00:00+00', 'interactions'),
  '[{"bucket":"2000-01-08T00:00:00Z","value":0},{"bucket":"2000-01-09T00:00:00Z","value":2},{"bucket":"2000-01-10T00:00:00Z","value":8}]');
-- project_opens: 0 / 0 / 2
INSERT INTO _checks VALUES (13, 'timeline B project_opens (daily)',
  public.analytics_timeline('2000-01-08 00:00+00', '2000-01-11 00:00+00', 'project_opens'),
  '[{"bucket":"2000-01-08T00:00:00Z","value":0},{"bucket":"2000-01-09T00:00:00Z","value":0},{"bucket":"2000-01-10T00:00:00Z","value":2}]');
-- external_clicks: 0 / 1 (r21) / 4 (r6,r14,r18,r19)
INSERT INTO _checks VALUES (14, 'timeline B external_clicks (daily)',
  public.analytics_timeline('2000-01-08 00:00+00', '2000-01-11 00:00+00', 'external_clicks'),
  '[{"bucket":"2000-01-08T00:00:00Z","value":0},{"bucket":"2000-01-09T00:00:00Z","value":1},{"bucket":"2000-01-10T00:00:00Z","value":4}]');
-- resume_downloads: 0 / 0 / 1
INSERT INTO _checks VALUES (15, 'timeline B resume_downloads (daily)',
  public.analytics_timeline('2000-01-08 00:00+00', '2000-01-11 00:00+00', 'resume_downloads'),
  '[{"bucket":"2000-01-08T00:00:00Z","value":0},{"bucket":"2000-01-09T00:00:00Z","value":0},{"bucket":"2000-01-10T00:00:00Z","value":1}]');

-- analytics_timeline with an unknown metric -> error 'invalid metric: bogus'
DO $$
BEGIN
  PERFORM public.analytics_timeline('2000-01-10 00:00+00', '2000-01-11 00:00+00', 'bogus');
  INSERT INTO _checks VALUES (16, 'timeline invalid metric', '"no error"', '"invalid metric: bogus"');
EXCEPTION WHEN invalid_parameter_value THEN
  INSERT INTO _checks VALUES (16, 'timeline invalid metric', to_jsonb(SQLERRM), '"invalid metric: bogus"');
END $$;

-- analytics_utm, window A (one row per visit; order visits desc, source "C"-collated)
-- v3 Direct: interactions 3, converted (project/demo/contact)        -> rate 1
-- v4 Facebook: interactions 2 (social only, not a goal), 0 conversions -> rate 0
-- v1 GitHub: interactions 2, converted (project/github)              -> rate 1
-- v2 linkedin/profile: interactions 1, converted (resume)            -> rate 1
INSERT INTO _checks VALUES (20, 'utm A',
  public.analytics_utm('2000-01-10 00:00+00', '2000-01-11 00:00+00'),
  '[{"source":"Direct","campaign":null,"visits":1,"interactions":3,"conversions":1,"rate":1},
    {"source":"Facebook","campaign":null,"visits":1,"interactions":2,"conversions":0,"rate":0},
    {"source":"GitHub","campaign":null,"visits":1,"interactions":2,"conversions":1,"rate":1},
    {"source":"linkedin","campaign":"profile","visits":1,"interactions":1,"conversions":1,"rate":1}]');

-- analytics_utm, window B: Direct now has v3 + v0 -> visits 2, interactions 3+2 = 5,
-- conversions 2 (v0: demo_click + contact_submit), rate 1; sorted first (visits 2)
INSERT INTO _checks VALUES (21, 'utm B',
  public.analytics_utm('2000-01-08 00:00+00', '2000-01-11 00:00+00'),
  '[{"source":"Direct","campaign":null,"visits":2,"interactions":5,"conversions":2,"rate":1},
    {"source":"Facebook","campaign":null,"visits":1,"interactions":2,"conversions":0,"rate":0},
    {"source":"GitHub","campaign":null,"visits":1,"interactions":2,"conversions":1,"rate":1},
    {"source":"linkedin","campaign":"profile","visits":1,"interactions":1,"conversions":1,"rate":1}]');

-- analytics_utm, window C -> []
INSERT INTO _checks VALUES (22, 'utm C (empty)',
  public.analytics_utm('1999-01-01 00:00+00', '1999-01-02 00:00+00'), '[]');

-- analytics_goals, window A (4 visits)
-- resume: v2 -> 1 (0.25); project: v1,v3 -> 2 (0.5); outbound (github/demo): v1,v3 -> 2 (0.5);
-- contact: v3 -> 1 (0.25)
INSERT INTO _checks VALUES (30, 'goals A',
  public.analytics_goals('2000-01-10 00:00+00', '2000-01-11 00:00+00'),
  '{"resume":{"visits":1,"rate":0.25},"project":{"visits":2,"rate":0.5},"outbound":{"visits":2,"rate":0.5},"contact":{"visits":1,"rate":0.25}}');

-- analytics_goals, window B (5 visits): resume 1 (0.2); project 2 (0.4);
-- outbound v1,v3,v0 -> 3 (0.6); contact v3,v0 -> 2 (0.4)
INSERT INTO _checks VALUES (31, 'goals B',
  public.analytics_goals('2000-01-08 00:00+00', '2000-01-11 00:00+00'),
  '{"resume":{"visits":1,"rate":0.2},"project":{"visits":2,"rate":0.4},"outbound":{"visits":3,"rate":0.6},"contact":{"visits":2,"rate":0.4}}');

-- analytics_goals, window C -> zeros, rate 0 (no division by zero)
INSERT INTO _checks VALUES (32, 'goals C (empty)',
  public.analytics_goals('1999-01-01 00:00+00', '1999-01-02 00:00+00'),
  '{"resume":{"visits":0,"rate":0},"project":{"visits":0,"rate":0},"outbound":{"visits":0,"rate":0},"contact":{"visits":0,"rate":0}}');

-- analytics_sections, window A (4 visits): home v1,v3,v4 -> 3 (0.75); about v2 -> 1 (0.25); others 0
INSERT INTO _checks VALUES (40, 'sections A',
  public.analytics_sections('2000-01-10 00:00+00', '2000-01-11 00:00+00'),
  '[{"section":"home","visits":3,"rate":0.75},{"section":"about","visits":1,"rate":0.25},
    {"section":"skills","visits":0,"rate":0},{"section":"portfolio","visits":0,"rate":0},
    {"section":"github-stats","visits":0,"rate":0},{"section":"contact","visits":0,"rate":0}]');

-- analytics_sections, window C -> six rows, all zero
INSERT INTO _checks VALUES (41, 'sections C (empty)',
  public.analytics_sections('1999-01-01 00:00+00', '1999-01-02 00:00+00'),
  '[{"section":"home","visits":0,"rate":0},{"section":"about","visits":0,"rate":0},
    {"section":"skills","visits":0,"rate":0},{"section":"portfolio","visits":0,"rate":0},
    {"section":"github-stats","visits":0,"rate":0},{"section":"contact","visits":0,"rate":0}]');

-- analytics_projects, window A
-- PA: opens 1 (r3), unique 1 (s1), github 1 (r6), demo 0, click_rate 1/1 = 1
-- PB: opens 1 (r13), unique 1 (s2), github 0, demo 1 (r14), click_rate 1
-- tie on opens and clicks -> title order A, B
INSERT INTO _checks VALUES (50, 'projects A',
  public.analytics_projects('2000-01-10 00:00+00', '2000-01-11 00:00+00'),
  '[{"project_id":"00000000-0000-4000-8000-0000000000a1","title":"Verify Project A","opens":1,"unique_visitors":1,"github":1,"demo":0,"click_rate":1},
    {"project_id":"00000000-0000-4000-8000-0000000000a2","title":"Verify Project B","opens":1,"unique_visitors":1,"github":0,"demo":1,"click_rate":1}]');

-- analytics_projects, window B: PA gains demo_click r21 -> demo 1, click_rate 2/1 = 2 (first: more clicks)
INSERT INTO _checks VALUES (51, 'projects B',
  public.analytics_projects('2000-01-08 00:00+00', '2000-01-11 00:00+00'),
  '[{"project_id":"00000000-0000-4000-8000-0000000000a1","title":"Verify Project A","opens":1,"unique_visitors":1,"github":1,"demo":1,"click_rate":2},
    {"project_id":"00000000-0000-4000-8000-0000000000a2","title":"Verify Project B","opens":1,"unique_visitors":1,"github":0,"demo":1,"click_rate":1}]');

-- analytics_top_actions, window A (8 interactions)
-- Social link click 2 (r18,r19) -> 0.25; every other action 1 -> 0.125; ties by label ("C" order)
INSERT INTO _checks VALUES (60, 'top actions A',
  public.analytics_top_actions('2000-01-10 00:00+00', '2000-01-11 00:00+00'),
  '[{"label":"Social link click","kind":"social_click","count":2,"share":0.25},
    {"label":"Contact link click","kind":"contact_click","count":1,"share":0.125},
    {"label":"GitHub: Verify Project A","kind":"github_click","count":1,"share":0.125},
    {"label":"Live demo: Verify Project B","kind":"demo_click","count":1,"share":0.125},
    {"label":"Resume download","kind":"resume_download","count":1,"share":0.125},
    {"label":"Viewed Verify Project A","kind":"project_view","count":1,"share":0.125},
    {"label":"Viewed Verify Project B","kind":"project_view","count":1,"share":0.125}]');

-- analytics_top_actions, window C -> []
INSERT INTO _checks VALUES (61, 'top actions C (empty)',
  public.analytics_top_actions('1999-01-01 00:00+00', '1999-01-02 00:00+00'), '[]');

-- analytics_countries, window A (3 visitors): TH s1, US s2, XX s3 (NULL country on r19
-- must merge into XX, not create a separate row) -> each 1/3 = 0.3333
INSERT INTO _checks VALUES (70, 'countries A',
  public.analytics_countries('2000-01-10 00:00+00', '2000-01-11 00:00+00'),
  '[{"country":"TH","visitors":1,"share":0.3333},{"country":"US","visitors":1,"share":0.3333},{"country":"XX","visitors":1,"share":0.3333}]');

-- analytics_countries, window C -> []
INSERT INTO _checks VALUES (71, 'countries C (empty)',
  public.analytics_countries('1999-01-01 00:00+00', '1999-01-02 00:00+00'), '[]');

-- analytics_visits(30, 2000-01-10): newest first; events exclude heartbeats;
-- duration = last - first (heartbeats included)
-- v4: 23:59:00, Facebook, XX (first non-null), tablet, 50s, 4 events, s3
-- v3: 18:30:00, Direct, US, mobile, 60s, 5 events, s2
-- v2: 14:00:00, linkedin, TH, desktop, 20s, 3 events, s1
-- v1: 10:00:00, GitHub, TH, desktop, 60s (r1..r7), 4 events (r1,r2,r3,r6), s1
INSERT INTO _checks VALUES (80, 'visits 2000-01-10',
  public.analytics_visits(30, '2000-01-10'),
  '[{"visit_id":"verify-v4","started_at":"2000-01-10T23:59:00Z","source":"Facebook","country":"XX","device":"tablet","duration_seconds":50,"events":4,"visitor":"verify-s3"},
    {"visit_id":"verify-v3","started_at":"2000-01-10T18:30:00Z","source":"Direct","country":"US","device":"mobile","duration_seconds":60,"events":5,"visitor":"verify-s2"},
    {"visit_id":"verify-v2","started_at":"2000-01-10T14:00:00Z","source":"linkedin","country":"TH","device":"desktop","duration_seconds":20,"events":3,"visitor":"verify-s1"},
    {"visit_id":"verify-v1","started_at":"2000-01-10T10:00:00Z","source":"GitHub","country":"TH","device":"desktop","duration_seconds":60,"events":4,"visitor":"verify-s1"}]');

-- analytics_visits(2, 2000-01-10): limit -> v4, v3 only
INSERT INTO _checks VALUES (81, 'visits 2000-01-10 limit 2',
  public.analytics_visits(2, '2000-01-10'),
  '[{"visit_id":"verify-v4","started_at":"2000-01-10T23:59:00Z","source":"Facebook","country":"XX","device":"tablet","duration_seconds":50,"events":4,"visitor":"verify-s3"},
    {"visit_id":"verify-v3","started_at":"2000-01-10T18:30:00Z","source":"Direct","country":"US","device":"mobile","duration_seconds":60,"events":5,"visitor":"verify-s2"}]');

-- analytics_visits(30, 2000-01-09): v0 only; Direct (NULL referrer), 20s, 3 events
INSERT INTO _checks VALUES (82, 'visits 2000-01-09',
  public.analytics_visits(30, '2000-01-09'),
  '[{"visit_id":"verify-v0","started_at":"2000-01-09T12:00:00Z","source":"Direct","country":"US","device":"desktop","duration_seconds":20,"events":3,"visitor":"verify-s2"}]');

-- analytics_visits(30, 2000-01-11): no visits that day -> []
INSERT INTO _checks VALUES (83, 'visits 2000-01-11 (empty day)',
  public.analytics_visits(30, '2000-01-11'), '[]');

-- analytics_visits(30, NULL) ("All Recent") returns real recent data; not asserted.

-- analytics_visit_trail('verify-v1'): heartbeats omitted, time order
INSERT INTO _checks VALUES (90, 'trail verify-v1',
  public.analytics_visit_trail('verify-v1'),
  '[{"created_at":"2000-01-10T10:00:00Z","event_type":"page_view","page_path":"/","section":null,"project_title":null},
    {"created_at":"2000-01-10T10:00:05Z","event_type":"section_view","page_path":"/","section":"home","project_title":null},
    {"created_at":"2000-01-10T10:00:10Z","event_type":"project_view","page_path":"/","section":null,"project_title":"Verify Project A"},
    {"created_at":"2000-01-10T10:00:45Z","event_type":"github_click","page_path":"/","section":null,"project_title":"Verify Project A"}]');

-- analytics_visit_trail of an unknown visit -> []
INSERT INTO _checks VALUES (91, 'trail unknown visit',
  public.analytics_visit_trail('verify-does-not-exist'), '[]');

-- 4. Access control -----------------------------------------------------------

-- Signed in but NOT an admin -> 'forbidden'
SELECT set_config('request.jwt.claims',
                  '{"sub":"00000000-0000-0000-0000-000000000000","role":"authenticated"}', true),
       set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000000', true);

DO $$
BEGIN
  PERFORM public.analytics_overview('2000-01-10 00:00+00', '2000-01-11 00:00+00');
  INSERT INTO _checks VALUES (100, 'non-admin overview', '"allowed"', '"forbidden"');
EXCEPTION WHEN insufficient_privilege THEN
  INSERT INTO _checks VALUES (100, 'non-admin overview', to_jsonb(SQLERRM), '"forbidden"');
END $$;

DO $$
BEGIN
  PERFORM public.analytics_visit_trail('verify-v1');
  INSERT INTO _checks VALUES (101, 'non-admin visit_trail', '"allowed"', '"forbidden"');
EXCEPTION WHEN insufficient_privilege THEN
  INSERT INTO _checks VALUES (101, 'non-admin visit_trail', to_jsonb(SQLERRM), '"forbidden"');
END $$;

-- Logged out (anon role, no claims) -> no EXECUTE privilege at all
RESET ROLE;
SELECT set_config('request.jwt.claims', '', true),
       set_config('request.jwt.claim.sub', '', true);
SET LOCAL ROLE anon;

DO $$
BEGIN
  PERFORM public.analytics_overview('2000-01-10 00:00+00', '2000-01-11 00:00+00');
  INSERT INTO _checks VALUES (102, 'anon overview', '"allowed"', '"permission denied"');
EXCEPTION WHEN insufficient_privilege THEN
  INSERT INTO _checks VALUES (102, 'anon overview',
    to_jsonb(CASE WHEN SQLERRM LIKE 'permission denied%' THEN 'permission denied' ELSE SQLERRM END),
    '"permission denied"');
END $$;

RESET ROLE;

-- 5. Report -------------------------------------------------------------------
SELECT ord, name, (actual = expected) AS pass, actual, expected
FROM _checks
ORDER BY ord;

DO $$
DECLARE
  v_failed text;
  v_count  integer;
BEGIN
  SELECT count(*) INTO v_count FROM _checks;
  SELECT string_agg(format('#%s %s: got %s', ord, name, coalesce(actual::text, 'NULL')), E'\n' ORDER BY ord)
    INTO v_failed
  FROM _checks
  WHERE actual IS DISTINCT FROM expected;

  IF v_count <> 34 THEN
    RAISE EXCEPTION 'verify: expected 34 checks, found %', v_count;
  END IF;
  IF v_failed IS NOT NULL THEN
    RAISE EXCEPTION E'verify: FAILED checks\n%', v_failed;
  END IF;
  RAISE NOTICE 'verify: all % checks passed', v_count;
END $$;

ROLLBACK;
