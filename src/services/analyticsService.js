import { getSessionId, getDeviceType, getVisitId, getUtm } from '../utils/analytics';

// Dedup: prevent rapid duplicate events (e.g., double-clicks)
const recentEvents = new Map();
const DEDUP_MS = 2000;

/**
 * Track an analytics event via /api/track. Fails silently — never breaks the UI.
 */
export function trackEvent(eventType, options = {}) {
  try {
    if (import.meta.env?.DEV && !import.meta.env?.VITE_TRACK_IN_DEV) return;
    const dedupKey = `${eventType}:${options.projectId || ''}:${options.pagePath || ''}:${options.section || ''}`;
    const now = Date.now();
    if (recentEvents.has(dedupKey) && now - recentEvents.get(dedupKey) < DEDUP_MS) return;
    recentEvents.set(dedupKey, now);

    const payload = JSON.stringify({
      event_type: eventType,
      project_id: options.projectId || null,
      page_path: options.pagePath || window.location.pathname,
      section: options.section || null,
      meta: options.meta || null,
      referrer: document.referrer || null,
      device_type: getDeviceType(),
      session_id: getSessionId(),
      visit_id: getVisitId(),
      ...getUtm(),
    });

    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([payload], { type: 'application/json' });
      if (navigator.sendBeacon('/api/track', blob)) return;
    }
    fetch('/api/track', {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    }).catch(() => {});
  } catch {
    // Silent failure — analytics must never break the portfolio UI
  }
}
