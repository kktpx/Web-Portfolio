import { test } from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/track.js';

test('track handler: throwing req.body getter returns 400', async () => {
  const req = { method: 'POST', headers: {} };
  Object.defineProperty(req, 'body', { get() { throw new SyntaxError('bad json'); } });
  let status;
  const res = {
    setHeader() {},
    status(c) { status = c; return res; },
    end() { return res; },
    json() { return res; },
  };
  await handler(req, res);
  assert.equal(status, 400);
});
