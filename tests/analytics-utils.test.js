import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getVisitId, parseUtm, getUtm } from '../src/utils/analytics.js';

function memStorage() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => void m.set(k, String(v)),
    removeItem: (k) => void m.delete(k),
  };
}
const MIN = 60 * 1000;
const T0 = 1_700_000_000_000;

test('getVisitId keeps id within 29 minutes', () => {
  const s = memStorage();
  const a = getVisitId(T0, s);
  assert.equal(getVisitId(T0 + 29 * MIN, s), a);
});

test('getVisitId changes after 31 minutes of inactivity', () => {
  const s = memStorage();
  const a = getVisitId(T0, s);
  assert.notEqual(getVisitId(T0 + 31 * MIN, s), a);
});

test('getVisitId slides the window on activity', () => {
  const s = memStorage();
  const a = getVisitId(T0, s);
  getVisitId(T0 + 20 * MIN, s);
  assert.equal(getVisitId(T0 + 45 * MIN, s), a);
});

test('getVisitId works when storage throws', () => {
  const bad = {
    getItem() { throw new Error('no'); },
    setItem() { throw new Error('no'); },
  };
  assert.equal(typeof getVisitId(T0, bad), 'string');
});

test('parseUtm extracts present params and nulls the rest', () => {
  assert.deepEqual(parseUtm('?utm_source=linkedin&utm_campaign=profile'), {
    utm_source: 'linkedin',
    utm_medium: null,
    utm_campaign: 'profile',
  });
});

test('parseUtm trims and truncates to 100 chars', () => {
  const r = parseUtm('?utm_source=%20%20abc%20&utm_medium=' + 'x'.repeat(150));
  assert.equal(r.utm_source, 'abc');
  assert.equal(r.utm_medium.length, 100);
});

test('parseUtm of empty string is all null', () => {
  assert.deepEqual(parseUtm(''), {
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
  });
});

test('getUtm keeps first UTM within a visit and replaces on a new visit', () => {
  const s = memStorage();
  const first = getUtm(T0, s, '?utm_source=linkedin');
  assert.equal(first.utm_source, 'linkedin');
  const later = getUtm(T0 + 5 * MIN, s, '');
  assert.equal(later.utm_source, 'linkedin');
  const next = getUtm(T0 + 60 * MIN, s, '?utm_source=github');
  assert.equal(next.utm_source, 'github');
  const empty = getUtm(T0 + 120 * MIN, s, '');
  assert.equal(empty.utm_source, null);
});
