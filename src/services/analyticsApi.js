/*
 * Analytics v2 RPC wrappers (see supabase/analytics-v2.sql).
 * CONTRACT notes the UI must respect:
 *  - Rates/shares are returned as FRACTIONS 0..1; the UI multiplies by 100.
 *  - visitors_today = the UTC day of p_to.
 *  - A 1-day timeline may return ~25 hourly buckets.
 *  - Only interactions_prev exists as a previous-period value.
 * from/to are ISO strings (Date.toISOString()); p_day is 'YYYY-MM-DD' (UTC) or null.
 */
import { supabase } from '../lib/supabase';

async function rpc(name, params) {
  const { data, error } = await supabase.rpc(name, params);
  if (error) throw error;
  return data;
}

const iso = (d) => (d instanceof Date ? d.toISOString() : d);
const range = (from, to) => ({ p_from: iso(from), p_to: iso(to) });

export const getOverview = (from, to) => rpc('analytics_overview', range(from, to));
export const getTimeline = (from, to, metric) =>
  rpc('analytics_timeline', { ...range(from, to), p_metric: metric });
export const getUtm = (from, to) => rpc('analytics_utm', range(from, to));
export const getGoals = (from, to) => rpc('analytics_goals', range(from, to));
export const getSections = (from, to) => rpc('analytics_sections', range(from, to));
export const getProjects = (from, to) => rpc('analytics_projects', range(from, to));
export const getTopActions = (from, to) => rpc('analytics_top_actions', range(from, to));
export const getCountries = (from, to) => rpc('analytics_countries', range(from, to));
export const getVisits = (limit = 50, day = null) =>
  rpc('analytics_visits', { p_limit: limit, p_day: day });
export const getVisitTrail = (visitId) =>
  rpc('analytics_visit_trail', { p_visit_id: visitId });
