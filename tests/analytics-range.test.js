import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeRange } from '../src/components/admin/analytics/range.js';

const NOW = new Date('2026-10-20T12:00:00.000Z');

test('computeRange returns now as to and now minus N days as from', () => {
  for (const d of [1, 7, 30]) {
    const r = computeRange(d, NOW);
    assert.equal(r.to, NOW.toISOString());
    assert.equal(new Date(r.to) - new Date(r.from), d * 86400000);
  }
});

test('computeRange does not mutate now', () => {
  const n = new Date(NOW);
  computeRange(7, n);
  assert.equal(n.getTime(), NOW.getTime());
});
