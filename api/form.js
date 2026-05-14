const https = require('https');

const SUPABASE_HOST = 'mzkbvqdvyyivawqwvosu.supabase.co';
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16a2J2cWR2eXlpdmF3cXd2b3N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMjU5NjcsImV4cCI6MjA5MzgwMTk2N30.2PDD6vwhsnUEhzKKq6fNbOHexnNZ3cXyMgUpN2RWKCc';

function insertContactRequest(payload) {
  return new Promise((resolve) => {
    const body = JSON.stringify(payload);
    const req = https.request(
      {
        hostname: SUPABASE_HOST,
        path: '/rest/v1/contact_requests',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          Prefer: 'return=minimal',
        },
      },
      (res) => { res.resume(); resolve(res.statusCode); }
    );
    req.on('error', () => resolve(null));
    req.write(body);
    req.end();
  });
}

function parseBody(req) {
  const raw = req.body;
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try {
    if (typeof raw === 'string' && raw.trimStart().startsWith('{')) return JSON.parse(raw);
    return Object.fromEntries(new URLSearchParams(raw));
  } catch (_) { return {}; }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).end(); return; }

  const tip  = String(req.query.tip || '').replace(/[^a-z-]/g, '');
  const dest = tip ? `/tesekkurler.html?tip=${tip}` : '/tesekkurler.html';

  const body  = parseBody(req);
  const ad    = String(body.ad    || body.name    || body.isim    || '').slice(0, 200).trim();
  const email = String(body.email ||                               '').slice(0, 300).trim();
  const konu  = String(body.konu  || body.subject || body.tip     || tip || '').slice(0, 300).trim();
  const mesaj = String(body.mesaj || body.message || body.icerik  || '').slice(0, 5000).trim();

  if (ad && email && mesaj) {
    try {
      await insertContactRequest({ ad, email, konu: konu || null, mesaj });
    } catch (err) {
      console.error('[form.js] contact_requests insert failed:', err);
    }
  }

  res.redirect(302, dest);
};
