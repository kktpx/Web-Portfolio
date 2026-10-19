# Analytics v2 (Part 2 of 3) — Design

Builds on the admin shell (part 1). Replaces the Analytics tab (`/admin`) and the tracking pipeline.

## Goal
A first-party analytics dashboard matching the reference screenshots (yellow theme), with country, UTM, visit duration, conversion goals, section retention and per-visitor journeys.

## Decisions
- **Data source:** all first-party. No Vercel Web Analytics integration (no public API). Country comes from Vercel's `x-vercel-ip-country` request header via a Vercel function.
- **Aggregation:** Postgres SQL functions (RPC), admin-only. The client never aggregates raw rows (Supabase caps responses at 1,000 rows).
- **Old data:** reset. `analytics-v2.sql` ends with an optional, clearly marked `TRUNCATE portfolio_analytics` that the owner runs manually. After a reset every row has a `country`.
- **Privacy:** no IP stored; random IDs and 2-letter country only. Times are UTC.

## 1. Schema — `supabase/analytics-v2.sql`
Add to `portfolio_analytics`: `visit_id text`, `country text` (2 letters, `XX` = unknown), `utm_source`, `utm_medium`, `utm_campaign` (text), `section text`, `meta jsonb`.
Replace the `valid_event_type` CHECK to also allow `heartbeat`, `section_view`, `contact_click`, `social_click`. Indexes on `visit_id` and `(created_at, event_type)`.
`session_id` remains the persistent visitor id.

## 2. Ingestion
- `api/track.js` (Vercel function): POST only; validates `event_type` against the allow-list and body size; reads country from `x-vercel-ip-country` (fallback `XX`); drops bot User-Agents; inserts via Supabase anon key from existing `VITE_SUPABASE_*` env vars; never reads or stores IP.
- `trackEvent(eventType, options)` keeps its signature; sends to `/api/track` (`sendBeacon`, fallback `fetch keepalive`); silent failure; keeps the 2s dedup.
- `src/utils/analytics.js`: `getVisitId()` (new id after 30 min inactivity, refreshed on each event), `getUtm()` (captured from URL at visit start, persisted for the visit).
- `useHeartbeat`: event every 15s while `document.visibilityState === 'visible'`.
- `useSectionTracking`: `section_view` once per visit per section id (`home, about, skills, portfolio, github-stats, contact`) via IntersectionObserver.
- `contact_click` / `social_click` fired from Contact section links (email, LinkedIn, GitHub).

## 3. SQL functions (SECURITY DEFINER, check `admin_users` for `auth.uid()`, else raise)
All take `(p_from timestamptz, p_to timestamptz)` unless noted and return JSON:
`analytics_overview` (8 cards + previous-period values), `analytics_timeline(p_metric text)` (hourly when range ≤ 1 day, else daily), `analytics_utm`, `analytics_goals`, `analytics_sections`, `analytics_projects`, `analytics_top_actions`, `analytics_countries`, `analytics_visits(p_limit int, p_day date)`, `analytics_visit_trail(p_visit_id text)`.
Definitions: visitor = distinct `session_id`; visit = distinct `visit_id`; visit duration = last − first event in the visit; conversion rate = visits with the goal ÷ all visits; goals = resume download, project deep dive (`project_view`), live demo/GitHub click, contact (`contact_click` or `contact_submit`).

## 4. Dashboard UI (`/admin`)
`AdminDashboard` rewritten; widgets under `src/components/admin/analytics/`: range selector (1/7/30 days) + Refresh, overview cards, activity timeline (metric tabs), UTM table, goals/section-retention tabs, per-project table, most popular actions, **Top Countries** (flag, name, visitors, share), visitor journeys (day filters, date picker, source badges, country flag, device, duration, events, View Trail modal). Flags are images from `flagcdn.com` (emoji flags do not render on Windows). Each widget shows its own loading and empty state. Old components (`AnalyticsCards`, `AnalyticsChart`, `TopProjects`, `EventBreakdown`) are removed once unused.

## Out of scope
Vercel Web Analytics integration, world map, country filter, city-level geo, bot-proof ingestion (anon insert policy stays), Profile/Contact/Resume tabs.

## Testing
Pure logic (visit expiry, UTM parsing, event validation in `api/track`) is extracted into functions and tested with Node's built-in `node --test` (no new dependency). SQL functions are verified against a seed script with hand-computed expected values. UI verified with `npm run lint`, `npm run build` and the dev server.
