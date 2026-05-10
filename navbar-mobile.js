/**
 * navbar-mobile.js
 * Mobil hamburger menü ve slide-in drawer bileşeni.
 *
 * Çalışma mantığı:
 *  1. Mevcut .navbar içinden nav linklerini okur.
 *  2. Hamburger butonu ve drawer DOM'unu sayfaya dinamik olarak ekler.
 *  3. netlifyIdentity mevcutsa drawer auth bölümünü oturum durumuna göre günceller.
 *
 * Bağımlılıklar: yok (auth opsiyonel, netlifyIdentity varsa çalışır)
 * Güvenli fallback: .navbar yoksa hiçbir şey yapmaz.
 */

(function () {
  'use strict';

  /* ─── Başlatıcı: DOM hazır olunca çalıştır ─────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    var nav = document.querySelector('.navbar');
    if (!nav) return; // Navbar yoksa erken çık

    var navInner = nav.querySelector('.navbar-inner');
    var navLinks  = nav.querySelector('.nav-links');

    /* ─── 1. Hamburger butonu ────────────────────────────────────────
       Üç yatay çizgi; CSS'te aria-expanded="true" ile × animasyonu
       tetiklenir. Touch target 44×44px olacak şekilde boyutlandırıldı. */
    var hamburger = document.createElement('button');
    hamburger.className = 'nav-hamburger';
    hamburger.setAttribute('aria-label', 'Menüyü aç');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.innerHTML = '<span></span><span></span><span></span>';
    navInner.appendChild(hamburger);

    /* ─── 2. Karartma overlay'i ──────────────────────────────────────
       Drawer arkasındaki yarı saydam arka plan.
       Tıklanınca drawer kapanır. */
    var overlay = document.createElement('div');
    overlay.className = 'nav-drawer-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);

    /* ─── 3. Drawer paneli ───────────────────────────────────────────
       Sağdan kayarak açılan panel; nav linkleri + auth butonları içerir. */
    var drawer = document.createElement('div');
    drawer.className = 'nav-drawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-label', 'Gezinme menüsü');
    drawer.setAttribute('aria-hidden', 'true');

    drawer.innerHTML = [
      '<div class="nav-drawer-inner">',

      /* Başlık: marka adı + kapat (×) butonu */
      '  <div class="nav-drawer-header">',
      '    <span class="nav-drawer-logo">EventRehberi</span>',
      '    <button class="nav-drawer-close" aria-label="Menüyü kapat">',
      '      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"',
      '           fill="none" stroke="currentColor" stroke-width="2"',
      '           stroke-linecap="round" stroke-linejoin="round">',
      '        <line x1="18" y1="6" x2="6" y2="18"/>',
      '        <line x1="6" y1="6" x2="18" y2="18"/>',
      '      </svg>',
      '    </button>',
      '  </div>',

      /* Nav linkleri — içerik .nav-links'ten kopyalanır (aşağıda) */
      '  <ul class="nav-drawer-links"></ul>',

      /* Auth bölümü — netlifyIdentity durumuna göre toggle edilir */
      '  <div class="nav-drawer-cta">',

      '    <div class="nav-drawer-auth" data-auth="logged-out">',
      '      <a href="giris.html" class="btn btn-ghost nav-drawer-btn">Giriş Yap</a>',
      '      <a href="uye-ol.html" class="btn btn-ghost nav-drawer-btn">Üye Ol</a>',
      '      <a href="kayit.html" class="btn btn-primary nav-drawer-btn">Firmanı Kaydet</a>',
      '    </div>',

      '    <div class="nav-drawer-auth" data-auth="logged-in">',
      '      <span class="nav-drawer-user-name"></span>',
      '      <a href="hesabim.html" class="btn btn-ghost nav-drawer-btn">Hesabım</a>',
      '      <a href="kayit.html" class="btn btn-ghost nav-drawer-btn">Firmanı Kaydet</a>',
      '      <button class="btn btn-ghost nav-drawer-btn nav-drawer-logout">Çıkış Yap</button>',
      '    </div>',

      '  </div>',
      '</div>'
    ].join('\n');

    document.body.appendChild(drawer);

    /* ─── 4. Nav linklerini drawer'a kopyala ─────────────────────────
       Mevcut sayfanın .nav-links öğelerini klonlar; active class korunur.
       Böylece her sayfada ayrı liste tanımlamak gerekmez. */
    var drawerLinkList = drawer.querySelector('.nav-drawer-links');
    if (navLinks) {
      navLinks.querySelectorAll('li').forEach(function (li) {
        drawerLinkList.appendChild(li.cloneNode(true));
      });
    }

    /* ─── 5. Açma / kapama yardımcıları ──────────────────────────────*/

    function openDrawer() {
      drawer.classList.add('is-open');
      overlay.classList.add('is-open');
      hamburger.setAttribute('aria-expanded', 'true');
      hamburger.setAttribute('aria-label', 'Menüyü kapat');
      drawer.setAttribute('aria-hidden', 'false');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('drawer-open'); /* scroll kilidi */

      /* İlk odaklanılabilir öğeye odaklan (erişilebilirlik) */
      var firstFocusable = drawer.querySelector('button, a');
      if (firstFocusable) firstFocusable.focus();
    }

    function closeDrawer() {
      drawer.classList.remove('is-open');
      overlay.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Menüyü aç');
      drawer.setAttribute('aria-hidden', 'true');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('drawer-open');
      hamburger.focus(); /* Odağı tetikleyiciye geri döndür */
    }

    /* ─── 6. Olay dinleyicileri ──────────────────────────────────────*/

    hamburger.addEventListener('click', openDrawer);
    overlay.addEventListener('click', closeDrawer);
    drawer.querySelector('.nav-drawer-close').addEventListener('click', closeDrawer);

    /* Escape tuşuyla kapat */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
        closeDrawer();
      }
    });

    /* Drawer içindeki bir linke tıklanınca drawer'ı kapat */
    drawerLinkList.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') closeDrawer();
    });

    /* Çıkış yap butonu — netlifyIdentity üzerinden oturumu kapat */
    var logoutBtn = drawer.querySelector('.nav-drawer-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function () {
        if (window.netlifyIdentity) window.netlifyIdentity.logout();
        closeDrawer();
      });
    }

    /* ─── 7. Auth durumu yönetimi ────────────────────────────────────
       netlifyIdentity mevcutsa oturum değişikliklerini dinler ve
       drawer'daki logged-out / logged-in bölümlerini günceller. */

    var sectionOut  = drawer.querySelector('[data-auth="logged-out"]');
    var sectionIn   = drawer.querySelector('[data-auth="logged-in"]');
    var userNameEl  = drawer.querySelector('.nav-drawer-user-name');

    /* Varsayılan başlangıç durumu: çıkış yapmış (netlifyIdentity'den önce) */
    sectionOut.style.display = 'flex';
    sectionIn.style.display  = 'none';

    function updateAuthUI(user) {
      if (!sectionOut || !sectionIn) return;

      if (user) {
        /* Görünen adı belirle: önce full_name, yoksa e-posta @ öncesi */
        var displayName = (user.user_metadata && user.user_metadata.full_name)
          ? user.user_metadata.full_name
          : (user.email ? user.email.split('@')[0] : 'Hesabım');

        if (userNameEl) userNameEl.textContent = displayName;
        sectionOut.style.display = 'none';
        sectionIn.style.display  = 'flex';
      } else {
        sectionOut.style.display = 'flex';
        sectionIn.style.display  = 'none';
      }
    }

    if (window.netlifyIdentity) {
      /* Sayfa ilk açıldığında mevcut oturumu kontrol et */
      window.netlifyIdentity.on('init',   function (user) { updateAuthUI(user); });
      window.netlifyIdentity.on('login',  function (user) { updateAuthUI(user); });
      window.netlifyIdentity.on('logout', function ()     { updateAuthUI(null); });
    }
  }

})();
