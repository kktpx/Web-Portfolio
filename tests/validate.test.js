import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEvent, isBot } from '../api/_lib/validate.js';

const base = { event_type: 'heartbeat', page_path: '/', session_id: 'sess-1' };

test('accepts a minimal valid heartbeat', () => {
  const r = validateEvent(base);
  assert.equal(r.ok, true);
  assert.equal(r.value.event_type, 'heartbeat');
  assert.equal(r.value.project_id, null);
});

test('rejects unknown event_type', () => {
  assert.equal(validateEvent({ ...base, event_type: 'nope' }).ok, false);
});

test('rejects non-object bodies', () => {
  for (const b of [null, 'x', 5, [], undefined]) assert.equal(validateEvent(b).ok, false);
});

test('rejects page_path > 200 chars', () => {
  assert.equal(validateEvent({ ...base, page_path: '/' + 'a'.repeat(200) }).ok, false);
});

test('rejects section outside allow-list, accepts valid', () => {
  assert.equal(validateEvent({ ...base, section: 'admin' }).ok, false);
  assert.equal(validateEvent({ ...base, section: 'github-stats' }).ok, true);
});

test('rejects bad project_id, accepts uuid', () => {
  assert.equal(validateEvent({ ...base, project_id: 'abc' }).ok, false);
  const id = '123e4567-e89b-12d3-a456-426614174000';
  assert.equal(validateEvent({ ...base, project_id: id }).value.project_id, id);
});

test('trims strings', () => {
  const r = validateEvent({ ...base, page_path: '  /about  ', utm_source: ' x ' });
  assert.equal(r.value.page_path, '/about');
  assert.equal(r.value.utm_source, 'x');
});

test('isBot', () => {
  assert.equal(isBot('Googlebot/2.1'), true);
  assert.equal(isBot('Mozilla/5.0 (Windows NT 10.0) Chrome/120'), false);
});
