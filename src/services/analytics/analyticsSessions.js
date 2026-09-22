const VISITOR_KEY = 'portfolio_visitor_id';
const VISIT_KEY = 'portfolio_visit_id';
const VISIT_ACTIVITY_KEY = 'portfolio_visit_last_active';
const VISIT_TIMEOUT = 30 * 60 * 1000; // 30 minutes

function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function getVisitorId() {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = generateUUID();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

export function getVisitId() {
  const lastActive = localStorage.getItem(VISIT_ACTIVITY_KEY);
  const now = Date.now();
  
  if (!lastActive || (now - parseInt(lastActive)) > VISIT_TIMEOUT) {
    const newVisitId = generateUUID();
    localStorage.setItem(VISIT_KEY, newVisitId);
    localStorage.setItem(VISIT_ACTIVITY_KEY, now.toString());
    return newVisitId;
  }
  
  let id = localStorage.getItem(VISIT_KEY);
  if (!id) {
    id = generateUUID();
    localStorage.setItem(VISIT_KEY, id);
  }
  return id;
}

export function touchVisit() {
  localStorage.setItem(VISIT_ACTIVITY_KEY, Date.now().toString());
}

export function getDeviceType() {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

let cachedUTM = null;

export function getUTMParams() {
  if (cachedUTM) return cachedUTM;
  
  const params = new URLSearchParams(window.location.search);
  cachedUTM = {
    utm_source: params.get('utm_source') || null,
    utm_medium: params.get('utm_medium') || null,
    utm_campaign: params.get('utm_campaign') || null,
    utm_content: params.get('utm_content') || null,
    utm_term: params.get('utm_term') || null,
  };
  return cachedUTM;
}

export function classifyTrafficSource(referrer, utmSource) {
  if (utmSource) {
    return utmSource;
  }
  
  if (!referrer) {
    return 'Direct';
  }
  
  try {
    const url = new URL(referrer);
    const hostname = url.hostname.toLowerCase();
    
    if (hostname.includes('github.com')) return 'GitHub';
    if (hostname.includes('linkedin.com')) return 'LinkedIn';
    if (hostname.includes('facebook.com')) return 'Facebook';
    if (hostname.includes('google.')) return 'Google';
    if (hostname.includes('twitter.com') || hostname.includes('t.co')) return 'Twitter';
    
    return hostname;
  } catch (e) {
    return 'Other';
  }
}
