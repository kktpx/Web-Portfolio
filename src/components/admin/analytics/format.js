// DOM-free helpers for the analytics widgets. Never return NaN/Infinity/undefined.
const isNum = (n) => typeof n === 'number' && Number.isFinite(n);
const num = (n) => (isNum(n) ? n : 0);

export function safeRatio(a, b) {
  const d = num(b);
  return d === 0 ? 0 : num(a) / d;
}

// fraction (0..1) -> '12.3%'
export function formatPct(fraction) {
  if (!isNum(fraction)) return '0%';
  return `${Math.round(fraction * 1000) / 10}%`;
}

export function formatNum(n, maxFractionDigits = 0) {
  return num(n).toLocaleString(undefined, { maximumFractionDigits: maxFractionDigits });
}

// Percent change vs previous; null when prev is 0/missing (hide in UI).
export function pctChange(cur, prev) {
  if (!isNum(prev) || prev === 0) return null;
  return Math.round(((num(cur) - prev) / prev) * 1000) / 10;
}

const pad = (n) => String(n).padStart(2, '0');

// rows: [{bucket: ISO, value}] -> [{bucket, label, value}]; label HH:mm (hourly) or MM-DD.
export function shapeTimeline(rows, hourly) {
  if (!Array.isArray(rows)) return [];
  const out = [];
  for (const r of rows) {
    const d = r && r.bucket ? new Date(r.bucket) : null;
    if (!d || Number.isNaN(d.getTime())) continue;
    const label = hourly
      ? `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
      : `${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
    out.push({ bucket: r.bucket, label, value: num(r.value) });
  }
  return out;
}

export function peakBucket(series) {
  if (!Array.isArray(series) || series.length === 0) return null;
  let best = null;
  for (const p of series) if (p.value > 0 && (!best || p.value > best.value)) best = p;
  return best ? { label: best.label, value: best.value } : null;
}

export function avgBucket(series) {
  if (!Array.isArray(series) || series.length === 0) return 0;
  const sum = series.reduce((s, p) => s + num(p.value), 0);
  return Math.round((sum / series.length) * 10) / 10;
}
