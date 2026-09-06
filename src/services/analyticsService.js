import { supabase } from '../lib/supabase';
import { getSessionId, getDeviceType } from '../utils/analytics';

// Dedup: prevent rapid duplicate events (e.g., double-clicks)
const recentEvents = new Map();
const DEDUP_MS = 2000;

/**
 * Track an analytics event. Fails silently — never breaks the UI.
 */
export async function trackEvent(eventType, options = {}) {
  try {
    const dedupKey = `${eventType}:${options.projectId || ''}:${options.pagePath || ''}`;
    const now = Date.now();
    if (recentEvents.has(dedupKey) && now - recentEvents.get(dedupKey) < DEDUP_MS) return;
    recentEvents.set(dedupKey, now);

    await supabase.from('portfolio_analytics').insert({
      event_type: eventType,
      project_id: options.projectId || null,
      page_path: options.pagePath || window.location.pathname,
      referrer: document.referrer || null,
      device_type: getDeviceType(),
      session_id: getSessionId(),
    });
  } catch (err) {
    // Silent failure — analytics must never break the portfolio UI
    console.error('Analytics error:', err);
  }
}

// ─── Admin Query Functions ──────────────────────────────────────────

// Helper for date filtering
function getDateFilter(days) {
  if (!days) return null;
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

/**
 * Get summary metrics for the dashboard.
 */
export async function getAnalyticsSummary(days = null) {
  let query = supabase.from('portfolio_analytics').select('*');
  if (days) {
    query = query.gte('created_at', getDateFilter(days));
  }
  const { data, error } = await query;
  if (error) throw error;

  const summary = {
    visitors: new Set(data.map(d => d.session_id)).size,
    pageViews: 0,
    projectViews: 0,
    githubClicks: 0,
    demoClicks: 0,
    resumeDownloads: 0,
    contactSubmissions: 0
  };

  data.forEach(event => {
    if (event.event_type === 'page_view') summary.pageViews++;
    if (event.event_type === 'project_view') summary.projectViews++;
    if (event.event_type === 'github_click') summary.githubClicks++;
    if (event.event_type === 'demo_click') summary.demoClicks++;
    if (event.event_type === 'resume_download') summary.resumeDownloads++;
    if (event.event_type === 'contact_submit') summary.contactSubmissions++;
  });

  return summary;
}

/**
 * Get daily time-series data for chart
 */
export async function getAnalyticsByDate(days = 7) {
  const queryDays = days || 7;
  let query = supabase.from('portfolio_analytics')
    .select('created_at, event_type, session_id')
    .gte('created_at', getDateFilter(queryDays));
  
  const { data, error } = await query;
  if (error) throw error;

  const dailyData = {};
  
  // Initialize last N days to ensure no gaps in the chart
  for (let i = queryDays - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    dailyData[dateStr] = { date: dateStr, pageViews: 0, visitors: new Set() };
  }

  data.forEach(event => {
    const dateStr = event.created_at.split('T')[0];
    if (!dailyData[dateStr]) {
        dailyData[dateStr] = { date: dateStr, pageViews: 0, visitors: new Set() };
    }
    if (event.event_type === 'page_view') {
      dailyData[dateStr].pageViews++;
    }
    dailyData[dateStr].visitors.add(event.session_id);
  });

  return Object.values(dailyData).map(day => ({
    ...day,
    visitors: day.visitors.size // convert Set to count
  })).sort((a, b) => a.date.localeCompare(b.date)); // Sort chronologically
}

/**
 * Get top projects ranked by project_view count
 */
export async function getTopProjects(days = null) {
  let query = supabase.from('portfolio_analytics')
    .select('event_type, project_id, portfolio_projects(title)')
    .not('project_id', 'is', null);
    
  if (days) {
    query = query.gte('created_at', getDateFilter(days));
  }
  
  const { data, error } = await query;
  if (error) throw error;

  const projectStats = {};
  
  data.forEach(event => {
    const pId = event.project_id;
    if (!projectStats[pId]) {
      projectStats[pId] = {
        id: pId,
        // Supabase returns related table data as an object or array depending on the relationship
        title: event.portfolio_projects?.title || 'Unknown Project',
        views: 0,
        githubClicks: 0,
        demoClicks: 0
      };
    }
    
    if (event.event_type === 'project_view') projectStats[pId].views++;
    if (event.event_type === 'github_click') projectStats[pId].githubClicks++;
    if (event.event_type === 'demo_click') projectStats[pId].demoClicks++;
  });

  return Object.values(projectStats)
    .sort((a, b) => b.views - a.views) // rank by views
    .slice(0, 5); // top 5
}

/**
 * Get event type breakdown with counts
 */
export async function getEventBreakdown(days = null) {
  let query = supabase.from('portfolio_analytics').select('event_type');
  if (days) {
    query = query.gte('created_at', getDateFilter(days));
  }
  
  const { data, error } = await query;
  if (error) throw error;

  const breakdown = {};
  data.forEach(event => {
    breakdown[event.event_type] = (breakdown[event.event_type] || 0) + 1;
  });

  // Format for display
  const labels = {
    page_view: 'Page Views',
    project_view: 'Project Views',
    github_click: 'GitHub Clicks',
    demo_click: 'Demo Clicks',
    resume_download: 'Resume Downloads',
    contact_submit: 'Contact Submits'
  };

  return Object.entries(breakdown)
    .map(([type, count]) => ({
      type,
      label: labels[type] || type,
      count
    }))
    .sort((a, b) => b.count - a.count);
}
