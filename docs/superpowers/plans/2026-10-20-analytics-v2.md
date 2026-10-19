# Analytics v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** First-party analytics with country, UTM, visits, heartbeat, section views and a dashboard matching the reference screenshots (yellow theme).

**Architecture:** Browser → `/api/track` (Vercel function adds country, filters bots, inserts into Supabase) → admin-only Postgres RPC functions return small JSON aggregates → React widgets render them. The client never aggregates raw rows.

**Tech Stack:** React 19, Vite, Supabase (Postgres RPC), Vercel serverless function, recharts, lucide-react, Node built-in `node --test` for pure-logic tests.

**Spec:** `docs/superpowers/specs/2026-10-20-analytics-v2-design.md`

## Global Constraints

- Yellow theme: `--admin-accent: #ffcc00`. All times UTC. No IP stored. Country is a 2-letter code; unknown is `XX`.
- `trackEvent(eventType, options)` keeps its current signature and 2s dedup; failures are silent and never break the UI.
- `session_id` stays the persistent visitor id; `visit_id` expires after 30 minutes of inactivity.
- Allowed event types: `page_view, project_view, github_click, demo_click, resume_download, contact_submit, heartbeat, section_view, contact_click, social_click`.
- Section ids tracked: `home, about, skills, portfolio, github-stats, contact`. Heartbeat every 15s only while tab visible.
- Every RPC is `SECURITY DEFINER` and raises unless `auth.uid()` is in `admin_users`.
- No new npm dependencies. Flags are `<img src="https://flagcdn.com/w40/{cc}.png">`, not emoji.
- Owner runs all SQL in Supabase manually (including the final `TRUNCATE`); the agent never runs it.

## Review Focus

- Tracking from `localhost`/dev (no `/api/track`, no country header) must not throw or spam the console.
- Empty database: every widget shows an empty state, no NaN/Infinity (e.g. conversion rate with 0 visits).
- `/api/track` rejects unknown event types, oversized bodies and non-POST; bot UAs get 204 without insert.
- The SPA rewrite in `vercel.json` must not swallow `/api/*`.
- Visit expiry: an event 31 min after the last starts a new `visit_id`; 29 min keeps it.
- Non-admin or logged-out calls to any RPC fail (cannot read analytics).
- Clicking a date filter with no visits that day shows an empty journeys list, not an error.

## File Structure

- `supabase/analytics-v2.sql` (schema + RPCs + optional TRUNCATE), `supabase/analytics-v2-verify.sql` (seed + expected values, rolled back)
- `api/_lib/validate.js`, `api/track.js`
- `src/utils/analytics.js` (visit/UTM), `src/hooks/useHeartbeat.js`, `src/hooks/useSectionTracking.js`
- `src/services/analyticsService.js` (tracking only), `src/services/analyticsApi.js` (RPC wrappers)
- `src/components/admin/analytics/*` (widgets), `src/pages/admin/AdminDashboard.jsx` (+ `.css`)
- `tests/*.test.js`

---

### Task 1: Schema migration

**Files:** Create `supabase/analytics-v2.sql`

**Interfaces:** Produces columns `visit_id, country, utm_source, utm_medium, utm_campaign, section, meta` on `portfolio_analytics`; helper `public.is_admin() returns boolean` (SECURITY DEFINER, checks `admin_users` for `auth.uid()`).

- [ ] **Step 1:** Write the file: `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` for the seven columns (`country text`, `meta jsonb`, rest `text`); drop and recreate `valid_event_type` with the ten allowed types; indexes on `visit_id` and `(created_at, event_type)`; `is_admin()`.
- [ ] **Step 2:** Add at the very end, commented out and headed "OPTIONAL — destroys all existing analytics. Run manually after export": `-- TRUNCATE portfolio_analytics;`
- [ ] **Step 3: Verify** — owner pastes into Supabase SQL editor; Expected: success, no errors. (Agent cannot run it; state this in the task result.)
- [ ] **Step 4: Commit** `feat(analytics): v2 schema migration`.

### Task 2: SQL aggregation functions and verification

**Files:** Modify `supabase/analytics-v2.sql`; Create `supabase/analytics-v2-verify.sql`

**Interfaces:** Produces RPCs, all `(p_from timestamptz, p_to timestamptz)` returning `jsonb` unless noted:
`analytics_overview` → `{visitors, visitors_today, interactions, interactions_prev, resume_downloads, project_opens, external_clicks, visits, avg_actions_per_visit}`;
`analytics_timeline(p_metric text)` → `[{bucket, value}]` (hourly if `p_to - p_from <= 1 day`, else daily; metrics `visitors|interactions|project_opens|external_clicks|resume_downloads`);
`analytics_utm` → `[{source, campaign, visits, interactions, conversions, rate}]`;
`analytics_goals` → `{resume, project, outbound, contact}` each `{visits, rate}`;
`analytics_sections` → `[{section, visits, rate}]`;
`analytics_projects` → `[{project_id, title, opens, unique_visitors, github, demo, click_rate}]`;
`analytics_top_actions` → `[{label, kind, count, share}]`;
`analytics_countries` → `[{country, visitors, share}]`;
`analytics_visits(p_limit int, p_day date)` → `[{visit_id, started_at, source, country, device, duration_seconds, events, visitor}]`;
`analytics_visit_trail(p_visit_id text)` → `[{created_at, event_type, page_path, section, project_title}]`.
Definitions: interaction = any event except `page_view`, `heartbeat`, `section_view`; external click = `github_click|demo_click|social_click`; duration = max−min `created_at` per visit; rates = visits with goal ÷ all visits, 0 when no visits; source from `utm_source`, else referrer host (github.com→"GitHub", facebook→"Facebook"), else "Direct".

- [ ] **Step 1:** Write `analytics-v2-verify.sql`: one transaction; point `request.jwt.claims` at the first `admin_users` row; insert a fixed seed (3 visitors, 4 visits incl. one with `utm_source=linkedin`, countries TH/US/XX, one resume download, two project_views, heartbeats spanning 60s); `SELECT` each RPC with the hand-computed expected values written as comments beside each; `ROLLBACK`.
- [ ] **Step 2:** Implement the RPCs in `analytics-v2.sql` (`LANGUAGE sql`/`plpgsql`, each starting with `IF NOT is_admin() THEN RAISE EXCEPTION 'forbidden'`); `GRANT EXECUTE ... TO authenticated`, `REVOKE ... FROM anon, public`.
- [ ] **Step 3: Verify** — owner runs the verify script in Supabase; Expected: every result equals its commented expectation; also run one RPC while logged out via the REST API → `forbidden`/401.
- [ ] **Step 4: Commit** `feat(analytics): admin-only aggregation functions`.

### Task 3: Visit/UTM logic with tests

**Files:** Modify `src/utils/analytics.js`; Create `tests/analytics-utils.test.js`

**Interfaces:** Produces
`getVisitId(now?: number, storage?: Storage): string`; `parseUtm(search: string): {utm_source: string|null, utm_medium: string|null, utm_campaign: string|null}`; `getUtm(now?: number, storage?: Storage, search?: string): same shape`. Keep existing `getSessionId`, `getDeviceType`.

- [ ] **Step 1: Write failing tests** with an in-memory `storage` stub: `getVisitId` returns the same id for events 29 min apart and a different id for 31 min apart; `parseUtm('?utm_source=linkedin&utm_campaign=profile')` → source `linkedin`, medium `null`, campaign `profile`; values are trimmed and cut to 100 chars; `parseUtm('')` → all `null`; `getUtm` keeps the first visit's UTM when a later call in the same visit has no params, and replaces it on a new visit.
- [ ] **Step 2:** Run `node --test tests/` — Expected: FAIL (functions missing).
- [ ] **Step 3:** Implement. Store `{id, last}` under `portfolio_visit` and `{visitId, utm}` under `portfolio_utm`; all storage access in try/catch with in-memory fallback.
- [ ] **Step 4:** Run `node --test tests/` — Expected: all pass.
- [ ] **Step 5: Commit** `feat(analytics): visit id and UTM capture`.

### Task 4: `/api/track` function and client switch

**Files:** Create `api/_lib/validate.js`, `api/track.js`, `tests/validate.test.js`; Modify `src/services/analyticsService.js`, `vercel.json`

**Interfaces:** Produces `validateEvent(body: unknown): {ok: true, value: Row} | {ok: false, error: string}` and `isBot(userAgent: string): boolean` in `api/_lib/validate.js`; `export default async function handler(req, res)` in `api/track.js`. Consumes `getVisitId`, `getUtm` from Task 3.

- [ ] **Step 1: Write failing tests:** `validateEvent` rejects unknown `event_type`, non-object body, `page_path` > 200 chars, `section` outside the six ids; accepts a minimal valid heartbeat; trims strings; `isBot('Googlebot/2.1')` true, `isBot('Mozilla/5.0 (Windows NT 10.0) Chrome/120')` false.
- [ ] **Step 2:** Run `node --test tests/` — Expected: FAIL.
- [ ] **Step 3:** Implement `validate.js`; `handler`: non-POST → 405, invalid → 400, bot → 204 without insert, else `fetch` POST to `${VITE_SUPABASE_URL}/rest/v1/portfolio_analytics` with `apikey`/`Authorization` = `VITE_SUPABASE_PUBLISHABLE_KEY`, adding `country` from `x-vercel-ip-country` (uppercased, 2 letters, else `XX`); return 204.
- [ ] **Step 4:** Rewrite `trackEvent` in `analyticsService.js` to POST JSON `{event_type, project_id, page_path, section, referrer, device_type, session_id, visit_id, utm_*}` to `/api/track` via `navigator.sendBeacon` (Blob `application/json`), falling back to `fetch(..., {keepalive: true})`; keep dedup; keep the old admin query functions deleted only in Task 9. Accept `options.section` and `options.meta`.
- [ ] **Step 5:** In `vercel.json` change the SPA rewrite source to `/((?!api/).*)`.
- [ ] **Step 6: Verify** — `node --test tests/` passes; `npm run build` passes; `npm run dev` shows no console errors when tracking fails (no `/api` locally).
- [ ] **Step 7: Commit** `feat(analytics): /api/track with country and bot filtering`.

### Task 5: Heartbeat, section and click tracking

**Files:** Create `src/hooks/useHeartbeat.js`, `src/hooks/useSectionTracking.js`; Modify `src/pages/HomePage.jsx`, `src/components/ContactSection/ContactSection.jsx`

**Interfaces:** Consumes `trackEvent` (Task 4). Produces `useHeartbeat(): void`, `useSectionTracking(ids: string[]): void`.

- [ ] **Step 1:** `useHeartbeat`: `setInterval` 15s calling `trackEvent('heartbeat')` only when `document.visibilityState === 'visible'`; cleared on unmount. Bypass the 2s dedup is not needed (15s > 2s).
- [ ] **Step 2:** `useSectionTracking`: IntersectionObserver (threshold 0.4) over `document.getElementById(id)`; fire `trackEvent('section_view', {section: id})` once per id per visit (remember in `sessionStorage` keyed by current `getVisitId()`).
- [ ] **Step 3:** Call both hooks in `HomePage` with the six section ids. In `ContactSection`, `trackEvent('contact_click')` on the email link and `trackEvent('social_click')` on LinkedIn/GitHub links.
- [ ] **Step 4: Verify** — `npm run lint` (no new errors) and `npm run build`; in the dev server confirm via the Network tab that a heartbeat request is attempted every ~15s and stops when the tab is hidden.
- [ ] **Step 5: Commit** `feat(analytics): heartbeat, section and contact tracking`.

### Task 6: Data layer and dashboard shell

**Files:** Create `src/services/analyticsApi.js`, `src/components/admin/analytics/useAnalytics.js`, `src/components/admin/analytics/RangeBar.jsx`; Rewrite `src/pages/admin/AdminDashboard.jsx` (+ `.css`)

**Interfaces:** Produces `analyticsApi`: one function per RPC, `(from: Date, to: Date, ...args) => Promise<json>` using `supabase.rpc`, throwing on error. `useAnalytics(rpcName, args): {data, loading, error}` re-fetching when range/args change. `RangeBar({range, onChange, onRefresh})` with `range ∈ 1|7|30`. Dashboard holds `range` and a `refreshKey`, passes `{from, to}` to widgets.

- [ ] **Step 1:** Implement the three modules; `from = now − range days`, `to = now`.
- [ ] **Step 2:** `AdminDashboard` renders header ("Portfolio Analytics", "Live Sync" pill), `RangeBar`, and mounts widget slots (filled in Tasks 7–8) in screenshot order.
- [ ] **Step 3: Verify** — `npm run build`; after the owner runs Task 1–2 SQL, the dashboard loads without console errors and changing the range re-queries.
- [ ] **Step 4: Commit** `feat(admin): analytics data layer and dashboard shell`.

### Task 7: Overview, timeline and engagement widgets

**Files:** Create in `src/components/admin/analytics/`: `OverviewCards.jsx`, `ActivityTimeline.jsx`, `UtmTable.jsx`, `GoalsPanel.jsx`, `ProjectTable.jsx`, `TopActions.jsx` (+ shared `analytics.css`)

**Interfaces:** Each takes `{from, to, refreshKey}` and uses `useAnalytics`. Consumes RPCs from Task 2.

- [ ] **Step 1:** `OverviewCards`: 4 large + 4 small cards; interactions card shows % change vs `interactions_prev` (hide when prev is 0).
- [ ] **Step 2:** `ActivityTimeline`: recharts area chart, tab per metric, peak-activity and average strip; x-axis hourly vs daily by range.
- [ ] **Step 3:** `UtmTable` (empty hint shows `?utm_source=linkedin&utm_campaign=profile`), `GoalsPanel` (tabs Conversion Goals / Section Retention using `analytics_goals` and `analytics_sections`), `ProjectTable`, `TopActions` with ranked bars.
- [ ] **Step 4: Verify** — `npm run lint` and `npm run build` pass; with an empty table every widget shows its empty state and no `NaN`/`Infinity` text (search page text for both).
- [ ] **Step 5: Commit** `feat(admin): analytics overview and engagement widgets`.

### Task 8: Countries and visitor journeys

**Files:** Create in `src/components/admin/analytics/`: `TopCountries.jsx`, `Flag.jsx`, `VisitorJourneys.jsx`, `VisitTrailModal.jsx`

**Interfaces:** `Flag({code: string})` renders flag image, or a globe icon for `XX`. `VisitorJourneys` takes `{refreshKey}` and owns its day filter (All Recent, Today, Yesterday, last two earlier days, date input) and calls `analytics_visits(p_limit=30, p_day)`. `VisitTrailModal({visitId, onClose})` calls `analytics_visit_trail`.

- [ ] **Step 1:** `Flag` + `TopCountries` (flag, country name via `Intl.DisplayNames(['en'], {type:'region'})`, visitors, share bar).
- [ ] **Step 2:** `VisitorJourneys` cards: source badge (GitHub/Facebook/Direct, highlighted border for non-direct), time + relative age, duration formatted `<10s / 14s / 1m 29s`, events count, visitor id short hash, device, flag; "View Trail →" opens the modal.
- [ ] **Step 3:** `VisitTrailModal`: ordered event list with times, section and project names, country shown at the top.
- [ ] **Step 4: Verify** — `npm run lint`, `npm run build`; a day filter with no visits shows an empty list; Escape/backdrop closes the modal; at 375px width cards stack in one column without horizontal scroll.
- [ ] **Step 5: Commit** `feat(admin): top countries and visitor journeys`.

### Task 9: Cleanup and end-to-end check

**Files:** Delete `AnalyticsCards.*`, `AnalyticsChart.*`, `TopProjects.*`, `EventBreakdown.*` in `src/components/admin/`; Modify `src/services/analyticsService.js`

- [ ] **Step 1:** Delete the old components; remove `getAnalyticsSummary`, `getAnalyticsByDate`, `getTopProjects`, `getEventBreakdown` from the service; `grep -rn "AnalyticsCards\|AnalyticsChart\|TopProjects\|EventBreakdown\|getAnalyticsSummary" src` — Expected: no matches.
- [ ] **Step 2:** Run `node --test tests/`, `npm run lint`, `npm run build` — Expected: tests pass, no new lint errors, build succeeds.
- [ ] **Step 3: Verify end to end** — after deploying to Vercel preview and the owner running the SQL (and optional TRUNCATE): visit the preview with `?utm_source=test&utm_campaign=check`, scroll all sections, click a demo link, wait ~30s; Expected: dashboard shows the visit with country, UTM row `test/check`, duration ≥ 30s, section retention for all six sections, one external click.
- [ ] **Step 4: Commit** `chore(analytics): remove v1 dashboard code`.
