const { Resend } = require('resend');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).end(); return; }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) { res.status(500).json({ hata: 'RESEND_API_KEY tanımlı değil' }); return; }

  const body = typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');
  const email = String(body.email || '').trim();
  const name = String(body.name || '').trim();

  if (!email) {
    res.status(400).json({ hata: 'email alanı gerekli' });
    return;
  }

  const firstName = name ? name.split(' ')[0] : 'Merhaba';
  const resend = new Resend(apiKey);

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #1F4D33 0%, #2d6b47 100%); padding: 40px 32px; text-align: center; border-radius: 12px 12px 0 0;">
        <div style="display: inline-block; background: rgba(255,255,255,0.15); border-radius: 50%; width: 64px; height: 64px; line-height: 64px; font-size: 28px; margin-bottom: 16px;">
          🎉
        </div>
        <h1 style="color: #ffffff; font-size: 24px; margin: 0; font-weight: 700;">
          Hoş geldin, ${firstName}!
        </h1>
        <p style="color: rgba(255,255,255,0.8); font-size: 15px; margin: 8px 0 0;">
          EventRehberi ailesine katıldın
        </p>
      </div>

      <!-- Body -->
      <div style="padding: 32px;">
        <p style="font-size: 15px; color: #333; line-height: 1.6; margin: 0 0 20px;">
          Hesabın başarıyla oluşturuldu. Artık Türkiye'nin en kapsamlı etkinlik hizmetleri platformunda seni bekleyen fırsatları keşfedebilirsin.
        </p>

        <h3 style="color: #1F4D33; font-size: 16px; margin: 24px 0 12px;">İlk adımların:</h3>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px 16px; background: #f0f7f2; border-radius: 8px; margin-bottom: 8px;">
              <strong style="color: #1F4D33;">1. Profilini tamamla</strong><br>
              <span style="font-size: 13px; color: #666;">Telefon, şehir ve tercihlerini ekle — sana özel öneriler alsın.</span>
            </td>
          </tr>
          <tr><td style="height: 8px;"></td></tr>
          <tr>
            <td style="padding: 12px 16px; background: #f0f7f2; border-radius: 8px;">
              <strong style="color: #1F4D33;">2. Firmaları keşfet</strong><br>
              <span style="font-size: 13px; color: #666;">Catering, dekorasyon, müzik ve daha fazlası — 120+ onaylı firma.</span>
            </td>
          </tr>
          <tr><td style="height: 8px;"></td></tr>
          <tr>
            <td style="padding: 12px 16px; background: #f0f7f2; border-radius: 8px;">
              <strong style="color: #1F4D33;">3. Teklif al</strong><br>
              <span style="font-size: 13px; color: #666;">Beğendiğin firmalardan ücretsiz teklif iste, karşılaştır.</span>
            </td>
          </tr>
        </table>

        <div style="text-align: center; margin: 32px 0;">
          <a href="https://eventrehberi.com/hesabim.html" style="display: inline-block; background: #1F4D33; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
            Hesabıma git →
          </a>
        </div>

        <p style="font-size: 13px; color: #888; line-height: 1.5;">
          Bir sorun yaşarsan veya sorularınız varsa, bu e-postaya yanıt vererek bize ulaşabilirsin.
        </p>
      </div>

      <!-- Footer -->
      <div style="border-top: 1px solid #eee; padding: 20px 32px; text-align: center;">
        <p style="color: #999; font-size: 12px; margin: 0;">
          EventRehberi · Türkiye'nin Etkinlik Hizmetleri Platformu<br>
          <a href="https://eventrehberi.com" style="color: #1F4D33;">eventrehberi.com</a>
        </p>
      </div>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({
      from: 'EventRehberi <noreply@eventrehberi.com>',
      to: [email],
      reply_to: 'info@eventrehberi.com',
      subject: `Hoş geldin, ${firstName}! 🎉 — EventRehberi`,
      html,
    });

    if (error) throw new Error(error.message);
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Welcome email hatası:', err.message);
    res.status(500).json({ hata: 'E-posta gönderilemedi: ' + err.message });
  }
};
