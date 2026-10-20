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

const VISIT_KEY = 'portfolio_visit';
const UTM_KEY = 'portfolio_utm';
const VISIT_TTL_MS = 30 * 60 * 1000;
const UTM_MAX_LEN = 100;
const defaultMemory = new Map();
const memoryByStorage = new WeakMap();

function resolveStorage(storage) {
  if (storage) return storage;
  try {
    if (typeof localStorage !== 'undefined') return localStorage;
  } catch {
    // fall through to memory
  }
  return null;
}

// In-memory fallback, scoped per storage object so instances never leak into each other.
function memoryFor(storage) {
  const s = resolveStorage(storage);
  if (!s) return defaultMemory;
  let m = memoryByStorage.get(s);
  if (!m) {
    m = new Map();
    memoryByStorage.set(s, m);
  }
  return m;
}

function readJson(storage, key) {
  let raw = null;
  try {
    const s = resolveStorage(storage);
    if (s) raw = s.getItem(key);
  } catch {
    raw = null;
  }
  if (!raw) raw = memoryFor(storage).get(key) ?? null;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeJson(storage, key, value) {
  const raw = JSON.stringify(value);
  memoryFor(storage).set(key, raw);
  try {
    const s = resolveStorage(storage);
    if (s) s.setItem(key, raw);
  } catch {
    // memory fallback already written
  }
}

function newId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }
}

/**
 * Visit id: stable while activity gaps stay under 30 minutes.
 */
export function getVisitId(now = Date.now(), storage) {
  const v = readJson(storage, VISIT_KEY);
  if (v && v.id && typeof v.last === 'number' && now - v.last <= VISIT_TTL_MS) {
    writeJson(storage, VISIT_KEY, { id: v.id, last: now });
    return v.id;
  }
  const id = newId();
  writeJson(storage, VISIT_KEY, { id, last: now });
  return id;
}

function cleanParam(value) {
  if (value == null) return null;
  const t = String(value).trim().slice(0, UTM_MAX_LEN);
  return t || null;
}

export function parseUtm(search = '') {
  const p = new URLSearchParams(search || '');
  return {
    utm_source: cleanParam(p.get('utm_source')),
    utm_medium: cleanParam(p.get('utm_medium')),
    utm_campaign: cleanParam(p.get('utm_campaign')),
  };
}

/**
 * UTM for the current visit: first-touch within a visit, reset on a new visit.
 */
export function getUtm(now = Date.now(), storage, search) {
  if (search === undefined) {
    try {
      search = window.location.search;
    } catch {
      search = '';
    }
  }
  const visitId = getVisitId(now, storage);
  const stored = readJson(storage, UTM_KEY);
  if (stored && stored.visitId === visitId && stored.utm) {
    return stored.utm;
  }
  const utm = parseUtm(search);
  writeJson(storage, UTM_KEY, { visitId, utm });
  return utm;
}

/**
 * True only if a stored visit exists and is still within the 30 min window.
 * Read-only: never refreshes last-activity and never creates a visit.
 */
export function hasActiveVisit(now = Date.now(), storage) {
  const v = readJson(storage, VISIT_KEY);
  return !!(v && v.id && typeof v.last === 'number' && now - v.last <= VISIT_TTL_MS);
}
