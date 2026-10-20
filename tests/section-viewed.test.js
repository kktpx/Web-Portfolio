import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isSectionViewed, SECTION_THRESHOLDS } from '../src/utils/sectionViewed.js';

const e = (isIntersecting, intersectionRatio, height) => ({
  isIntersecting,
  intersectionRatio,
  intersectionRect: { height },
});

test('full ratio counts as viewed', () => {
  assert.equal(isSectionViewed(e(true, 1, 500), 800), true);
});
test('tall section with small ratio but >=40% viewport height counts', () => {
  assert.equal(isSectionViewed(e(true, 0.1, 400), 800), true);
});
test('not intersecting is never viewed', () => {
  assert.equal(isSectionViewed(e(false, 0.9, 800), 800), false);
});
test('small sliver is not viewed', () => {
  assert.equal(isSectionViewed(e(true, 0.05, 100), 800), false);
});
test('exact boundary ratio 0.4 counts', () => {
  assert.equal(isSectionViewed(e(true, 0.4, 10), 800), true);
});
test('ratio 0.39 with height exactly 40% of viewport counts', () => {
  assert.equal(isSectionViewed(e(true, 0.39, 320), 800), true);
});
test('ratio 0.39 with height just under 40% of viewport does not count', () => {
  assert.equal(isSectionViewed(e(true, 0.39, 319.9), 800), false);
});
test('SECTION_THRESHOLDS is dense, sorted, spans 0..1', () => {
  const t = SECTION_THRESHOLDS;
  assert.equal(t[0], 0);
  assert.equal(t[t.length - 1], 1);
  for (let i = 1; i < t.length; i++) {
    assert.ok(t[i] > t[i - 1]);
    assert.ok(t[i] - t[i - 1] <= 0.05 + 1e-9);
  }
});
