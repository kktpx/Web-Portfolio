/* global Buffer, process */
import { validateEvent, isBot } from './_lib/validate.js';

const MAX_BODY = 2048;

function readBody(req) {
  if (req.body !== undefined && req.body !== null && req.body !== '') {
    if (typeof req.body === 'string') return { raw: req.body };
    if (Buffer.isBuffer(req.body)) return { raw: req.body.toString('utf8') };
    return { parsed: req.body, size: JSON.stringify(req.body).length };
  }
  return { raw: '' };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

  let read;
  try { read = readBody(req); } catch { return res.status(400).end(); }
  const { raw, parsed, size } = read;
  if ((raw !== undefined ? raw.length : size) > MAX_BODY) return res.status(413).end();

  let body = parsed;
  if (raw !== undefined) {
    try { body = JSON.parse(raw); } catch { return res.status(400).end(); }
  }

  const result = validateEvent(body);
  if (!result.ok) return res.status(400).json({ error: result.error });

  if (isBot(req.headers['user-agent'])) return res.status(204).end();

  const c = String(req.headers['x-vercel-ip-country'] || '').toUpperCase();
  const country = /^[A-Z]{2}$/.test(c) ? c : 'XX';

  try {
    const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const r = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/portfolio_analytics`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ ...result.value, country }),
    });
    if (!r.ok) return res.status(502).end();
    return res.status(204).end();
  } catch {
    return res.status(502).end();
  }
}
