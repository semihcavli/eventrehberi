const https = require('https');
const { Resend } = require('resend');

const SUPABASE_HOST = 'mzkbvqdvyyivawqwvosu.supabase.co';
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16a2J2cWR2eXlpdmF3cXd2b3N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMjU5NjcsImV4cCI6MjA5MzgwMTk2N30.2PDD6vwhsnUEhzKKq6fNbOHexnNZ3cXyMgUpN2RWKCc';

function postJson(hostname, path, headers, body) {
  return new Promise((resolve) => {
    const raw = JSON.stringify(body);
    const req = https.request(
      {
        hostname,
        path,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(raw), ...headers },
      },
      (res) => { res.resume(); resolve(res.statusCode); }
    );
    req.on('error', () => resolve(null));
    req.write(raw);
    req.end();
  });
}

function insertContactRequest(payload) {
  return postJson(SUPABASE_HOST, '/rest/v1/contact_requests', {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    Prefer: 'return=minimal',
  }, payload);
}

async function sendResendEmail({ ad, email, konu, mesaj }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY tanımlı değil');

  const resend = new Resend(apiKey);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1F4D33; border-bottom: 2px solid #1F4D33; padding-bottom: 8px;">
        Yeni Destek Talebi
      </h2>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr style="background: #f5f5f5;">
          <td style="padding: 10px 14px; font-weight: bold; width: 120px;">Ad Soyad</td>
          <td style="padding: 10px 14px;">${ad}</td>
        </tr>
        <tr>
          <td style="padding: 10px 14px; font-weight: bold;">E-posta</td>
          <td style="padding: 10px 14px;"><a href="mailto:${email}">${email}</a></td>
        </tr>
        <tr style="background: #f5f5f5;">
          <td style="padding: 10px 14px; font-weight: bold;">Konu</td>
          <td style="padding: 10px 14px;">${konu || '—'}</td>
        </tr>
      </table>
      <h3 style="color: #1F4D33;">Mesaj</h3>
      <div style="background: #f9f9f9; border-left: 4px solid #1F4D33; padding: 12px 16px; white-space: pre-wrap;">
${mesaj}
      </div>
      <p style="color: #888; font-size: 12px; margin-top: 24px;">
        Bu e-posta EventRehberi iletişim formu aracılığıyla gönderilmiştir.
      </p>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: 'EventRehberi <noreply@eventrehberi.com>',
    to: ['info@eventrehberi.com'],
    reply_to: email,
    subject: `Yeni Destek Talebi - ${konu || 'Genel'}`,
    html,
  });

  if (error) throw new Error(`E-posta gönderilemedi: ${error.message}`);
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
  const ad    = String(body.ad || body['ad-soyad'] || body.name   || body.isim    || '').slice(0, 200).trim();
  const email = String(body.email || body.eposta || '').slice(0, 300).trim();
  const konu  = String(body.konu  || body.subject || body.tip     || tip || '').slice(0, 300).trim();
  const mesaj = String(body.mesaj || body.message || body.icerik  || '').slice(0, 5000).trim();

  if (ad && email && mesaj) {
    try {
      await Promise.all([
        insertContactRequest({ ad, email, konu: konu || null, mesaj }).catch(() => {}),
        sendResendEmail({ ad, email, konu, mesaj }),
      ]);
    } catch (err) {
      console.error('Form işleme hatası:', err.message);
      res.status(500).json({ hata: 'Mesajınız gönderilemedi. Lütfen daha sonra tekrar deneyin.' });
      return;
    }
  }

  res.redirect(302, dest);
};
