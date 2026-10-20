import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatPct, formatNum, pctChange, shapeTimeline, peakBucket, avgBucket, safeRatio,
} from '../src/components/admin/analytics/format.js';

test('formatPct converts fractions to one-decimal percent', () => {
  assert.equal(formatPct(0.1234), '12.3%');
  assert.equal(formatPct(1), '100%');
  assert.equal(formatPct(0.5), '50%');
  assert.equal(formatPct(0.12349), '12.3%');
  assert.equal(formatPct(0), '0%');
});
test('formatPct guards null/undefined/NaN/Infinity', () => {
  for (const v of [null, undefined, NaN, Infinity, 'x']) assert.equal(formatPct(v), '0%');
});
test('formatNum guards and localizes', () => {
  assert.equal(formatNum(1234), (1234).toLocaleString());
  for (const v of [null, undefined, NaN, Infinity]) assert.equal(formatNum(v), '0');
  assert.equal(formatNum(2.5, 1), (2.5).toLocaleString(undefined, { maximumFractionDigits: 1 }));
});
test('pctChange returns null when prev is 0/null/undefined', () => {
  assert.equal(pctChange(10, 0), null);
  assert.equal(pctChange(10, null), null);
  assert.equal(pctChange(10, undefined), null);
  assert.equal(pctChange(undefined, 5), -100);
});
test('pctChange computes one-decimal change', () => {
  assert.equal(pctChange(150, 100), 50);
  assert.equal(pctChange(50, 100), -50);
  assert.equal(pctChange(101, 300), -66.3);
  assert.equal(pctChange(0, 0), null);
});
test('safeRatio never divides by zero', () => {
  assert.equal(safeRatio(1, 0), 0);
  assert.equal(safeRatio(null, 3), 0);
  assert.equal(safeRatio(1, 4), 0.25);
});
test('shapeTimeline labels hourly vs daily and tolerates bad input', () => {
  const rows = [{ bucket: '2026-10-20T13:00:00Z', value: 3 }, { bucket: '2026-10-20T14:00:00Z', value: null }];
  const h = shapeTimeline(rows, true);
  assert.deepEqual(h.map((r) => r.label), ['13:00', '14:00']);
  assert.deepEqual(h.map((r) => r.value), [3, 0]);
  const d = shapeTimeline([{ bucket: '2026-10-19T00:00:00Z', value: 2 }], false);
  assert.equal(d[0].label, '10-19');
  assert.deepEqual(shapeTimeline(null, true), []);
  assert.deepEqual(shapeTimeline([{ value: 1 }], true), []);
});
test('shapeTimeline handles ~25 hourly buckets', () => {
  const rows = Array.from({ length: 25 }, (_, i) => ({
    bucket: new Date(Date.UTC(2026, 9, 19, 12 + i)).toISOString(), value: i,
  }));
  assert.equal(shapeTimeline(rows, true).length, 25);
});
test('peakBucket and avgBucket', () => {
  const s = [{ label: 'a', value: 1 }, { label: 'b', value: 5 }, { label: 'c', value: 2 }];
  assert.deepEqual(peakBucket(s), { label: 'b', value: 5 });
  assert.equal(avgBucket(s), 2.7);
  assert.equal(peakBucket([]), null);
  assert.equal(peakBucket([{ label: 'a', value: 0 }]), null);
  assert.equal(avgBucket([]), 0);
  assert.equal(peakBucket(null), null);
});
