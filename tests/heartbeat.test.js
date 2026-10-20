import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hasActiveVisit } from '../src/utils/analytics.js';
import { shouldBeat, MAX_BEATS_PER_VISIT, IDLE_LIMIT_MS } from '../src/utils/heartbeatPolicy.js';

function memStorage(initial = {}) {
  const m = new Map(Object.entries(initial));
  const s = {
    writes: 0,
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { s.writes++; m.set(k, String(v)); },
    removeItem: (k) => void m.delete(k),
    snapshot: () => JSON.stringify([...m]),
  };
  return s;
}
const MIN = 60 * 1000;
const T0 = 1_700_000_000_000;
const visit = (last) => memStorage({ portfolio_visit: JSON.stringify({ id: 'v1', last }) });

test('hasActiveVisit: active at 29 min', () => {
  assert.equal(hasActiveVisit(T0 + 29 * MIN, visit(T0)), true);
});
test('hasActiveVisit: inactive at 31 min', () => {
  assert.equal(hasActiveVisit(T0 + 31 * MIN, visit(T0)), false);
});
test('hasActiveVisit: inactive when nothing stored', () => {
  assert.equal(hasActiveVisit(T0, memStorage()), false);
});
test('hasActiveVisit: storage throws -> false', () => {
  const bad = { getItem() { throw new Error('x'); }, setItem() { throw new Error('x'); } };
  assert.equal(hasActiveVisit(T0, bad), false);
});
test('hasActiveVisit: does not mutate storage', () => {
  const s = visit(T0);
  const before = s.snapshot();
  hasActiveVisit(T0 + 10 * MIN, s);
  hasActiveVisit(T0 + 60 * MIN, s);
  assert.equal(s.snapshot(), before);
  assert.equal(s.writes, 0);
});

const base = { now: T0, lastActivity: T0, beatsSent: 0, visible: true, hasVisit: true };
test('shouldBeat: visible and active', () => assert.equal(shouldBeat(base), true));
test('shouldBeat: hidden', () => assert.equal(shouldBeat({ ...base, visible: false }), false));
test('shouldBeat: idle > 30 min', () =>
  assert.equal(shouldBeat({ ...base, now: T0 + IDLE_LIMIT_MS + 1 }), false));
test('shouldBeat: exactly 30 min still beats', () =>
  assert.equal(shouldBeat({ ...base, now: T0 + 30 * MIN }), true));
test('shouldBeat: cap reached', () =>
  assert.equal(shouldBeat({ ...base, beatsSent: MAX_BEATS_PER_VISIT }), false));
test('shouldBeat: just under cap', () =>
  assert.equal(shouldBeat({ ...base, beatsSent: MAX_BEATS_PER_VISIT - 1 }), true));
test('shouldBeat: no visit', () => assert.equal(shouldBeat({ ...base, hasVisit: false }), false));
