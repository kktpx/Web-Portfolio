import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isSectionViewed } from '../src/utils/sectionViewed.js';

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
