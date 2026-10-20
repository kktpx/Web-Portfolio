// DOM-free helpers for Top Countries and Visitor Journeys. Never return NaN/undefined.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n) => String(n).padStart(2, '0');
const toDate = (v) => {
  if (v === null || v === undefined || v === '') return null;
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

export function formatDuration(seconds) {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds <= 0) return '<10s';
  const s = Math.floor(seconds);
  if (s < 60) return `${s}s`;
  if (s < 3600) {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return r ? `${m}m ${r}s` : `${m}m`;
  }
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function relativeAge(iso, now = new Date()) {
  const d = toDate(iso);
  const n = toDate(now);
  if (!d || !n) return '';
  const diff = Math.floor((n.getTime() - d.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const EVENT_LABELS = {
  page_view: 'Viewed a page',
  section_view: 'Viewed a section',
  project_view: 'Opened a project',
  github_click: 'Clicked GitHub link',
  demo_click: 'Clicked live demo',
  resume_download: 'Downloaded resume',
  contact_click: 'Clicked contact',
  contact_submit: 'Submitted contact form',
  social_click: 'Clicked social link',
  heartbeat: 'Stayed on page',
};

export function eventLabel(type) {
  if (typeof type !== 'string' || !type) return 'Unknown event';
  return EVENT_LABELS[type] || type.replace(/_/g, ' ');
}

export function utcDayString(date) {
  const d = toDate(date);
  if (!d) return '';
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

const dayLabel = (d) => `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;

// Pills: All Recent, Today, Yesterday, and the two earlier UTC days.
export function journeyDays(now = new Date()) {
  const n = toDate(now);
  const pills = [{ key: 'all', label: 'All Recent', day: null }];
  if (!n) return pills;
  const at = (back) => new Date(n.getTime() - back * 86400000);
  pills.push({ key: 'today', label: 'Today', day: utcDayString(n) });
  pills.push({ key: 'yesterday', label: 'Yesterday', day: utcDayString(at(1)) });
  for (const back of [2, 3]) {
    const d = at(back);
    pills.push({ key: utcDayString(d), label: dayLabel(d), day: utcDayString(d) });
  }
  return pills;
}

export function isKnownCode(code) {
  return typeof code === 'string' && /^[A-Za-z]{2}$/.test(code) && code.toUpperCase() !== 'XX';
}

let regionNames = null;
export function countryName(code) {
  if (!isKnownCode(code)) return 'Unknown';
  const upper = code.toUpperCase();
  try {
    if (!regionNames) regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
    return regionNames.of(upper) || upper;
  } catch {
    return upper;
  }
}

export function formatClock(iso) {
  const d = toDate(iso);
  if (!d) return '--:--:--';
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
}

export function formatStart(iso) {
  const d = toDate(iso);
  if (!d) return '';
  return `${dayLabel(d)} · ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`;
}

export function shortVisitor(id) {
  return typeof id === 'string' && id ? id.slice(0, 8) : '--------';
}
