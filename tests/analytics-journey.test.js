import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatDuration, relativeAge, eventLabel, utcDayString, journeyDays, countryName,
  formatClock, formatStart, shortVisitor,
} from '../src/components/admin/analytics/journey.js';

test('formatDuration', () => {
  assert.equal(formatDuration(0), '<10s');
  assert.equal(formatDuration(null), '<10s');
  assert.equal(formatDuration(undefined), '<10s');
  assert.equal(formatDuration(-5), '<10s');
  assert.equal(formatDuration(NaN), '<10s');
  assert.equal(formatDuration('abc'), '<10s');
  assert.equal(formatDuration(14), '14s');
  assert.equal(formatDuration(59), '59s');
  assert.equal(formatDuration(60), '1m');
  assert.equal(formatDuration(89), '1m 29s');
  assert.equal(formatDuration(1070), '17m 50s');
  assert.equal(formatDuration(3599), '59m 59s');
  assert.equal(formatDuration(3600), '1h');
  assert.equal(formatDuration(3660), '1h 1m');
});

test('relativeAge', () => {
  const now = new Date('2026-09-22T12:00:00Z');
  assert.equal(relativeAge('2026-09-22T11:59:30Z', now), 'just now');
  assert.equal(relativeAge('2026-09-22T12:00:30Z', now), 'just now');
  assert.equal(relativeAge('2026-09-22T11:55:00Z', now), '5m ago');
  assert.equal(relativeAge('2026-09-22T10:00:00Z', now), '2h ago');
  assert.equal(relativeAge('2026-09-21T10:00:00Z', now), '1d ago');
  assert.equal(relativeAge(null, now), '');
  assert.equal(relativeAge('garbage', now), '');
  assert.equal(relativeAge(undefined, now), '');
});

test('eventLabel covers all 10 types and unknowns', () => {
  for (const t of ['page_view','project_view','github_click','demo_click','resume_download',
    'contact_submit','heartbeat','section_view','contact_click','social_click']) {
    const l = eventLabel(t);
    assert.ok(l && l !== t && !/undefined|NaN/.test(l), t);
  }
  assert.equal(eventLabel('weird_thing'), 'weird thing');
  assert.equal(eventLabel(null), 'Unknown event');
  assert.equal(eventLabel(undefined), 'Unknown event');
});

test('utcDayString', () => {
  assert.equal(utcDayString(new Date('2026-09-22T23:59:59Z')), '2026-09-22');
  assert.equal(utcDayString(new Date('2026-09-23T00:00:00Z')), '2026-09-23');
  assert.equal(utcDayString(new Date('x')), '');
  assert.equal(utcDayString(null), '');
});

test('journeyDays across UTC midnight and month boundary', () => {
  const d = journeyDays(new Date('2026-10-01T00:00:01Z'));
  assert.deepEqual(d.map((p) => p.label), ['All Recent', 'Today', 'Yesterday', 'Sep 29', 'Sep 28']);
  assert.deepEqual(d.map((p) => p.day), [null, '2026-10-01', '2026-09-30', '2026-09-29', '2026-09-28']);
  const e = journeyDays(new Date('2026-09-30T23:59:59Z'));
  assert.equal(e[1].day, '2026-09-30');
  assert.equal(e[3].label, 'Sep 28');
  assert.equal(journeyDays(new Date('x')).length, 1);
});

test('countryName', () => {
  assert.equal(countryName('XX'), 'Unknown');
  assert.equal(countryName('xx'), 'Unknown');
  assert.equal(countryName(null), 'Unknown');
  assert.equal(countryName(undefined), 'Unknown');
  assert.equal(countryName('TH'), 'Thailand');
  assert.equal(countryName('us'), 'United States');
  assert.equal(countryName('USA'), 'Unknown');
});

test('formatClock / formatStart / shortVisitor', () => {
  assert.equal(formatClock('2026-09-22T04:03:09Z'), '04:03:09');
  assert.equal(formatClock('bad'), '--:--:--');
  assert.equal(formatClock(null), '--:--:--');
  assert.equal(formatStart('2026-09-22T16:33:00Z'), 'Sep 22 · 16:33 UTC');
  assert.equal(formatStart(null), '');
  assert.equal(shortVisitor('3e136ca6abcdef'), '3e136ca6');
  assert.equal(shortVisitor(null), '--------');
});
