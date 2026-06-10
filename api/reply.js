const { Resend } = require('resend');
const { blocked } = require('./_guard');
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).end(); return; }
  if (blocked(req, res)) return;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) { res.status(500).json({ hata: 'RESEND_API_KEY tanımlı değil' }); return; }

  const body = typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');
  const email = String(body.email || '').trim();
  const mesaj = String(body.mesaj || '').trim();

  if (!email || !mesaj) {
    res.status(400).json({ hata: 'email ve mesaj alanları gerekli' });
    return;
  }

  const resend = new Resend(apiKey);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1F4D33; border-bottom: 2px solid #1F4D33; padding-bottom: 8px;">
        EventRehberi Destek Yanıtı
      </h2>
      <p style="font-size: 15px; color: #333;">Merhaba,</p>
      <p style="font-size: 15px; color: #333;">Destek talebinize yanıt verildi:</p>
      <div style="background: #f9f9f9; border-left: 4px solid #1F4D33; padding: 12px 16px; margin: 16px 0; white-space: pre-wrap; font-size: 15px; color: #222;">
${mesaj}
      </div>
      <p style="font-size: 14px; color: #666;">
        Bu e-postaya doğrudan yanıt vererek bizimle iletişime geçebilirsiniz.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
      <p style="color: #999; font-size: 12px;">
        EventRehberi Destek Ekibi<br>
        <a href="https://eventrehberi.com" style="color: #1F4D33;">eventrehberi.com</a>
      </p>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({
      from: 'EventRehberi Destek <noreply@eventrehberi.com>',
      to: [email],
      reply_to: 'info@eventrehberi.com',
      subject: 'Destek Talebinize Yanıt — EventRehberi',
      html,
    });

    if (error) throw new Error(error.message);

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Reply email hatası:', err.message);
    res.status(500).json({ hata: 'E-posta gönderilemedi: ' + err.message });
  }
};
