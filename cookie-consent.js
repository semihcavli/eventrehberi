/* ============================================================
   EventRehberi — Cookie Consent Banner
   ------------------------------------------------------------
   Site'nin altına KVKK uyumlu bir çerez onay bandı ekler.
   Kullanıcının seçimi 12 ay boyunca localStorage'da tutulur.

   Kullanıcı seçenekleri:
     - "Kabul Et" → tüm çerezler (zorunlu + tercih + analiz)
     - "Yalnızca Zorunlu" → sadece site işlevi için gerekenler

   Hesabım/Giriş gibi sayfalarda gizli; ana akışı kesmemek için.
   ============================================================ */
(function () {
  'use strict';

  const CONSENT_KEY = 'cs_consent';
  const TWELVE_MONTHS_MS = 365 * 24 * 60 * 60 * 1000;

  function readConsent() {
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || !data.choice || !data.time) return null;
      if (Date.now() - data.time > TWELVE_MONTHS_MS) {
        localStorage.removeItem(CONSENT_KEY);
        return null;
      }
      return data;
    } catch (e) {
      return null;
    }
  }

  function writeConsent(choice) {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify({
        choice: choice,           // 'accept-all' | 'essential-only'
        time: Date.now(),
        version: '1.0'
      }));
    } catch (e) {}
  }

  function buildBanner() {
    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Çerez tercihleri');

    banner.innerHTML = `
      <div class="cookie-banner-text">
        <strong>Çerezleri kullanıyoruz.</strong> Sitenin temel işlevleri için zorunlu çerezler ve deneyimini iyileştirmek için tercih çerezleri kullanıyoruz.
        Detaylı bilgi için <a href="cerez-politikasi.html">Çerez Politikası</a>'na bakabilirsin.
      </div>
      <div class="cookie-banner-actions">
        <a href="cerez-politikasi.html" class="btn-cookie-link">Detaylar</a>
        <button type="button" class="btn-cookie-link" data-cookie-essential>Yalnızca Zorunlu</button>
        <button type="button" class="btn-cookie-accept" data-cookie-accept>Kabul Et</button>
      </div>
    `;
    return banner;
  }

  function showBanner() {
    if (document.querySelector('.cookie-banner')) return;
    const banner = buildBanner();
    document.body.appendChild(banner);
    requestAnimationFrame(() => banner.classList.add('is-visible'));

    const accept = banner.querySelector('[data-cookie-accept]');
    const essential = banner.querySelector('[data-cookie-essential]');

    accept.addEventListener('click', () => {
      writeConsent('accept-all');
      hideBanner(banner);
      document.dispatchEvent(new CustomEvent('cs-consent-changed', { detail: { choice: 'accept-all' } }));
    });

    essential.addEventListener('click', () => {
      writeConsent('essential-only');
      hideBanner(banner);
      document.dispatchEvent(new CustomEvent('cs-consent-changed', { detail: { choice: 'essential-only' } }));
    });
  }

  function hideBanner(banner) {
    banner.classList.remove('is-visible');
    setTimeout(() => banner.remove(), 450);
  }

  function init() {
    // Halihazırda seçim yapılmışsa banner gösterme
    if (readConsent()) return;
    // Çerez politikası / KVKK gibi yasal sayfalarda da banner gözüksün — kullanıcı oradan da onaylayabilsin.
    showBanner();
  }

  // Public API: tercih durumunu sorgulama (analytics scripti aktive etmek isteyen yerler için)
  window.CSConsent = {
    get() { return readConsent(); },
    has(category) {
      const c = readConsent();
      if (!c) return false;
      if (category === 'essential') return true;
      return c.choice === 'accept-all';
    },
    reset() {
      localStorage.removeItem(CONSENT_KEY);
      const existing = document.querySelector('.cookie-banner');
      if (existing) existing.remove();
      showBanner();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
