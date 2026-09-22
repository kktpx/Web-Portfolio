import { supabase } from '../../lib/supabase';

export async function getAnalyticsOverview(startDate, endDate) {
  const { data, error } = await supabase.rpc('analytics_summary', {
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
  });
  if (error) throw error;
  return data;
}

export async function getActivityTimeline(startDate, endDate, bucket = 'day') {
  const { data, error } = await supabase.rpc('analytics_timeseries', {
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    bucket: bucket
  });
  if (error) throw error;
  return data;
}

export async function getProjectAnalytics(startDate, endDate) {
  const { data, error } = await supabase.rpc('analytics_project_stats', {
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
  });
  if (error) throw error;
  return data;
}

export async function getPopularActions(startDate, endDate) {
  const { data, error } = await supabase.rpc('analytics_event_breakdown', {
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
  });
  if (error) throw error;
  return data;
}

export async function getUTMAnalytics(startDate, endDate) {
  const { data, error } = await supabase.rpc('analytics_utm_stats', {
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
  });
  if (error) throw error;
  return data;
}

export async function getRecentVisitorJourneys(startDate, endDate) {
  const { data, error } = await supabase.rpc('analytics_visitor_sessions', {
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
  });
  if (error) throw error;
  return data;
}

export async function getVisitorJourney(sessionKey) {
  const { data, error } = await supabase
    .from('portfolio_analytics')
    .select('*')
    .or(`visit_id.eq.${sessionKey},session_id.eq.${sessionKey}`)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}
