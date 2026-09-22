import { supabase } from '../../lib/supabase';
import { getVisitorId, getVisitId, touchVisit, getDeviceType, getUTMParams, classifyTrafficSource } from './analyticsSessions';

let lastNavTarget = null;
let heartbeatInterval = null;
let lastUserActivity = Date.now();

export async function trackEvent(eventType, data = {}) {
  try {
    touchVisit();
    const utm = getUTMParams();
    
    await supabase.from('portfolio_analytics').insert({
      event_type: eventType,
      visitor_id: getVisitorId(),
      visit_id: getVisitId(),
      session_id: getVisitorId(), // backward compat
      page_path: window.location.pathname + window.location.hash,
      referrer: document.referrer ? classifyTrafficSource(document.referrer, utm.utm_source) : null,
      device_type: getDeviceType(),
      event_name: data.event_name || null,
      project_id: data.project_id || null,
      target_url: data.target_url || null,
      metadata: data.metadata || {},
      country_code: localStorage.getItem('portfolio_country') || null,
      utm_source: utm.utm_source,
      utm_medium: utm.utm_medium,
      utm_campaign: utm.utm_campaign,
      utm_content: utm.utm_content,
      utm_term: utm.utm_term,
    });
  } catch (e) {
    // Silent failure
    console.debug('Analytics tracking failed', e);
  }
}

export function initAnalytics() {
  trackEvent('page_view');
  
  if (!localStorage.getItem('portfolio_country')) {
    fetch('https://get.geojs.io/v1/ip/country.json')
      .then(res => res.json())
      .then(data => {
        if (data && data.country) {
          localStorage.setItem('portfolio_country', data.country);
        }
      })
      .catch(() => {});
  }

  // Setup heartbeat
  const setupActivityListeners = () => {
    const markActive = () => { lastUserActivity = Date.now(); };
    window.addEventListener('scroll', markActive, { passive: true });
    window.addEventListener('click', markActive, { passive: true });
    window.addEventListener('mousemove', markActive, { passive: true });
    window.addEventListener('keydown', markActive, { passive: true });
  };
  
  setupActivityListeners();
  
  const startHeartbeat = () => {
    if (heartbeatInterval) return;
    heartbeatInterval = setInterval(() => {
      if (document.visibilityState === 'visible' && (Date.now() - lastUserActivity < 60000)) {
        trackEvent('heartbeat');
      }
    }, 45000);
  };
  
  const stopHeartbeat = () => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  };
  
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      startHeartbeat();
    } else {
      stopHeartbeat();
    }
  });
  
  startHeartbeat();
  
  // Track Hash Navigation
  window.addEventListener('hashchange', () => {
    trackNavigation(lastNavTarget, window.location.hash);
    lastNavTarget = window.location.hash;
  });
}

export function trackNavigation(from, to) {
  if (from === to) return;
  trackEvent('navigation', { metadata: { from, to } });
}

export function trackOutboundClick(url, meta = {}) {
  trackEvent('outbound_click', { target_url: url, event_name: meta.label, metadata: meta });
}

export function trackResumeDownload(language, file) {
  trackEvent('resume_download', { metadata: { language, file } });
}

export function trackProjectEvent(type, projectId, meta = {}) {
  trackEvent(type, { project_id: projectId, event_name: meta.title, metadata: meta });
}

export function trackContactEvent(type) {
  trackEvent(type);
}
