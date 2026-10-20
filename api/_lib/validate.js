export const EVENT_TYPES = [
  'page_view', 'project_view', 'github_click', 'demo_click', 'resume_download',
  'contact_submit', 'heartbeat', 'section_view', 'contact_click', 'social_click',
];
export const SECTIONS = ['home', 'about', 'skills', 'portfolio', 'github-stats', 'contact'];

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BOT_RE = /bot|crawler|spider|headless|lighthouse|preview|slurp|facebookexternalhit|pingdom|uptime|monitor|curl|wget|python-requests|httpclient/i;

const LIMITS = {
  page_path: 200, referrer: 500, device_type: 20, session_id: 100, visit_id: 100,
  utm_source: 100, utm_medium: 100, utm_campaign: 100,
};

export function isBot(userAgent) {
  if (typeof userAgent !== 'string' || !userAgent.trim()) return true;
  return BOT_RE.test(userAgent);
}

function str(value, max, name, required = false) {
  if (value === undefined || value === null || value === '') {
    if (required) return { error: `${name} required` };
    return { value: null };
  }
  if (typeof value !== 'string') return { error: `${name} must be a string` };
  const t = value.trim();
  if (!t) return required ? { error: `${name} required` } : { value: null };
  if (t.length > max) return { error: `${name} too long` };
  return { value: t };
}

export function validateEvent(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'body must be an object' };
  }
  if (!EVENT_TYPES.includes(body.event_type)) return { ok: false, error: 'invalid event_type' };

  const row = { event_type: body.event_type };
  for (const [key, max] of Object.entries(LIMITS)) {
    const r = str(body[key], max, key, key === 'page_path' || key === 'session_id');
    if (r.error) return { ok: false, error: r.error };
    row[key] = r.value;
  }

  const pid = body.project_id;
  if (pid === undefined || pid === null || pid === '') row.project_id = null;
  else if (typeof pid === 'string' && UUID_RE.test(pid.trim())) row.project_id = pid.trim();
  else return { ok: false, error: 'invalid project_id' };

  const sec = str(body.section, 30, 'section');
  if (sec.error) return { ok: false, error: sec.error };
  if (sec.value !== null && !SECTIONS.includes(sec.value)) return { ok: false, error: 'invalid section' };
  row.section = sec.value;

  if (body.meta === undefined || body.meta === null) row.meta = null;
  else if (typeof body.meta === 'object' && !Array.isArray(body.meta)
    && JSON.stringify(body.meta).length <= 500) row.meta = body.meta;
  else return { ok: false, error: 'invalid meta' };

  return { ok: true, value: row };
}
