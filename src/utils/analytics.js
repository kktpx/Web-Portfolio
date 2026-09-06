/**
 * Get or create an anonymous session ID stored in localStorage.
 * Generates a UUID once and reuses it on future visits.
 * No PII — just a random identifier.
 */
export function getSessionId() {
  const key = 'portfolio_session_id';
  let sessionId = localStorage.getItem(key);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(key, sessionId);
  }
  return sessionId;
}

/**
 * Classify device type from viewport width.
 * No invasive browser fingerprinting — only broad category.
 */
export function getDeviceType() {
  try {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  } catch {
    return 'unknown';
  }
}
