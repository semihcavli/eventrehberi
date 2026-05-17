const { Resend } = require('resend');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).end(); return; }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) { res.status(500).json({ hata: 'RESEND_API_KEY tanımlı değil' }); return; }

  const body = typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');
  const email = String(body.email || '').trim();
  const firmName = String(body.firmName || '').trim();
  const contactName = String(body.contactName || '').trim();

  if (!email || !firmName) {
    res.status(400).json({ hata: 'email ve firmName alanları gerekli' });
    return;
  }

  const firstName = contactName ? contactName.split(' ')[0] : 'Merhaba';
  const resend = new Resend(apiKey);

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #1F4D33 0%, #2d6b47 100%); padding: 40px 32px; text-align: center; border-radius: 12px 12px 0 0;">
        <div style="display: inline-block; background: rgba(255,255,255,0.15); border-radius: 50%; width: 64px; height: 64px; line-height: 64px; font-size: 28px; margin-bottom: 16px;">
          ✅
        </div>
        <h1 style="color: #ffffff; font-size: 24px; margin: 0; font-weight: 700;">
          Firman onaylandı!
        </h1>
        <p style="color: rgba(255,255,255,0.8); font-size: 15px; margin: 8px 0 0;">
          ${firmName} artık EventRehberi'de listeleniyor
        </p>
      </div>

      <!-- Body -->
      <div style="padding: 32px;">
        <p style="font-size: 15px; color: #333; line-height: 1.6; margin: 0 0 20px;">
          Merhaba ${firstName},<br><br>
          <strong>${firmName}</strong> başvurusu incelendi ve onaylandı. Firman artık EventRehberi'de görünür durumda ve potansiyel müşteriler seni bulabilir.
        </p>

        <div style="background: #f0f7f2; border: 1px solid #d4eadd; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <h3 style="color: #1F4D33; font-size: 15px; margin: 0 0 12px;">Firma sayfanı özelleştir:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #444; font-size: 14px; line-height: 1.8;">
            <li>Profil fotoğrafını ve galeri görsellerini güncelle</li>
            <li>Menü ve paket bilgilerini ekle</li>
            <li>İletişim bilgilerini kontrol et</li>
            <li>İlk müşteri yorumlarını topla</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="https://eventrehberi.com/hesabim.html" style="display: inline-block; background: #1F4D33; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
            Firma panelime git →
          </a>
        </div>

        <div style="background: #fff8e6; border: 1px solid #f0e0b0; border-radius: 8px; padding: 14px 16px; margin: 20px 0;">
          <p style="font-size: 13px; color: #7a6520; margin: 0;">
            <strong>İpucu:</strong> Profilini ne kadar detaylı doldurursan, müşterilerin seni o kadar kolay bulur. Görseller ve menü detayları özellikle önemli!
          </p>
        </div>

        <p style="font-size: 13px; color: #888; line-height: 1.5;">
          Sorularınız için bu e-postaya yanıt verebilir veya <a href="https://eventrehberi.com/hakkimizda.html#iletisim" style="color: #1F4D33;">iletişim sayfamızdan</a> bize ulaşabilirsiniz.
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
      subject: `✅ ${firmName} onaylandı — EventRehberi`,
      html,
    });

    if (error) throw new Error(error.message);
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Firm approved email hatası:', err.message);
    res.status(500).json({ hata: 'E-posta gönderilemedi: ' + err.message });
  }
};
