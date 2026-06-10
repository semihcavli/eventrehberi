const { Resend } = require('resend');
const { blocked } = require('./_guard');
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).end(); return; }
  if (blocked(req, res)) return;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) { res.status(500).json({ hata: 'RESEND_API_KEY tanımlı değil' }); return; }

  const body = typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');
  const firmEmail = String(body.firmEmail || '').trim();
  const firmName = String(body.firmName || '').trim();
  const customerName = String(body.customerName || '').trim();
  const customerEmail = String(body.customerEmail || '').trim();
  const customerPhone = String(body.customerPhone || '').trim();
  const eventType = String(body.eventType || '').trim();
  const eventDate = String(body.eventDate || '').trim();
  const guestCount = String(body.guestCount || '').trim();
  const message = String(body.message || '').trim();
  const selectedMenu = String(body.selectedMenu || '').trim();
  const estimatedTotal = String(body.estimatedTotal || '').trim();

  if (!firmEmail || !customerName || !customerEmail) {
    res.status(400).json({ hata: 'firmEmail, customerName ve customerEmail alanları gerekli' });
    return;
  }

  const resend = new Resend(apiKey);

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #C7522A 0%, #e06a3a 100%); padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: #ffffff; font-size: 22px; margin: 0; font-weight: 700;">
          Yeni Teklif Talebi 🔔
        </h1>
        <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 8px 0 0;">
          ${firmName || 'Firmanız'} için EventRehberi üzerinden teklif isteği geldi
        </p>
      </div>

      <!-- Body -->
      <div style="padding: 32px;">

        <!-- Müşteri bilgileri -->
        <h3 style="color: #1F4D33; font-size: 15px; margin: 0 0 12px; border-bottom: 2px solid #1F4D33; padding-bottom: 6px;">
          Müşteri Bilgileri
        </h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 8px 0; color: #888; font-size: 13px; width: 120px;">Ad Soyad</td>
            <td style="padding: 8px 0; font-size: 14px; color: #333; font-weight: 500;">${customerName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888; font-size: 13px;">E-posta</td>
            <td style="padding: 8px 0; font-size: 14px;"><a href="mailto:${customerEmail}" style="color: #1F4D33;">${customerEmail}</a></td>
          </tr>
          ${customerPhone ? `<tr>
            <td style="padding: 8px 0; color: #888; font-size: 13px;">Telefon</td>
            <td style="padding: 8px 0; font-size: 14px;"><a href="tel:${customerPhone}" style="color: #1F4D33;">${customerPhone}</a></td>
          </tr>` : ''}
        </table>

        <!-- Etkinlik detayları -->
        ${eventType || eventDate || guestCount ? `
        <h3 style="color: #1F4D33; font-size: 15px; margin: 0 0 12px; border-bottom: 2px solid #1F4D33; padding-bottom: 6px;">
          Etkinlik Detayları
        </h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          ${eventType ? `<tr>
            <td style="padding: 8px 0; color: #888; font-size: 13px; width: 120px;">Etkinlik türü</td>
            <td style="padding: 8px 0; font-size: 14px; color: #333;">${eventType}</td>
          </tr>` : ''}
          ${eventDate ? `<tr>
            <td style="padding: 8px 0; color: #888; font-size: 13px;">Tarih</td>
            <td style="padding: 8px 0; font-size: 14px; color: #333;">${eventDate}</td>
          </tr>` : ''}
          ${guestCount ? `<tr>
            <td style="padding: 8px 0; color: #888; font-size: 13px;">Kişi sayısı</td>
            <td style="padding: 8px 0; font-size: 14px; color: #333;">${guestCount} kişi</td>
          </tr>` : ''}
        </table>
        ` : ''}

        <!-- Seçilen menü -->
        ${selectedMenu ? `
        <div style="background: #f0f7f2; border: 1px solid #d4eadd; border-radius: 10px; padding: 16px; margin-bottom: 20px;">
          <h4 style="color: #1F4D33; font-size: 14px; margin: 0 0 6px;">Seçilen Menü</h4>
          <p style="font-size: 14px; color: #333; margin: 0;">${selectedMenu}</p>
          ${estimatedTotal ? `<p style="font-size: 14px; color: #1F4D33; font-weight: 600; margin: 8px 0 0;">Tahmini toplam: ${estimatedTotal}</p>` : ''}
        </div>
        ` : ''}

        <!-- Müşteri notu -->
        ${message ? `
        <h3 style="color: #1F4D33; font-size: 15px; margin: 0 0 12px; border-bottom: 2px solid #1F4D33; padding-bottom: 6px;">
          Müşteri Notu
        </h3>
        <div style="background: #f9f9f9; border-left: 4px solid #C7522A; padding: 12px 16px; margin-bottom: 24px; white-space: pre-wrap; font-size: 14px; color: #333;">
${message}
        </div>
        ` : ''}

        <!-- CTA -->
        <div style="text-align: center; margin: 28px 0;">
          <a href="mailto:${customerEmail}" style="display: inline-block; background: #1F4D33; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
            Müşteriye yanıt ver →
          </a>
        </div>

        <div style="background: #fff8e6; border: 1px solid #f0e0b0; border-radius: 8px; padding: 12px 16px;">
          <p style="font-size: 12px; color: #7a6520; margin: 0;">
            <strong>Hızlı yanıt avantajı:</strong> 24 saat içinde yanıt veren firmalar, müşterilerden %60 daha fazla olumlu dönüş alıyor.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div style="border-top: 1px solid #eee; padding: 20px 32px; text-align: center;">
        <p style="color: #999; font-size: 12px; margin: 0;">
          Bu teklif talebi EventRehberi üzerinden gönderilmiştir.<br>
          <a href="https://eventrehberi.com" style="color: #1F4D33;">eventrehberi.com</a>
        </p>
      </div>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({
      from: 'EventRehberi <noreply@eventrehberi.com>',
      to: [firmEmail],
      reply_to: customerEmail,
      subject: `Yeni teklif talebi: ${eventType || 'Etkinlik'} — ${customerName}`,
      html,
    });

    if (error) throw new Error(error.message);
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Quote notify email hatası:', err.message);
    res.status(500).json({ hata: 'E-posta gönderilemedi: ' + err.message });
  }
};
