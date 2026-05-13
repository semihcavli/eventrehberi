/* ==========================================================================
   EventRehberi — Global navbar auth state (Supabase Auth)
   ========================================================================== */
(function () {
  'use strict';

  function doLogout() {
    window.ER_Supabase.auth.signOut().then(function() {
      Object.keys(localStorage).forEach(function(k) {
        if (k.indexOf('sb-') === 0) localStorage.removeItem(k);
      });
      window.location.href = '/';
    });
  }

  function updateNav(user) {
    var navCta = document.querySelector('.nav-cta');
    if (!navCta) return;

    if (!user) {
      navCta.innerHTML =
        '<a href="giris.html" class="nav-auth-link">Giriş Yap</a>' +
        '<a href="uye-ol.html" class="btn btn-ghost btn-sm">Üye Ol</a>' +
        '<a href="kayit.html" class="btn btn-primary btn-sm">Firmanı Kaydet</a>';
      return;
    }

    if (user) {
      var meta      = user.user_metadata || {};
      var name      = meta.full_name || (user.email ? user.email.split('@')[0] : 'Hesabım');
      var initial   = (name.trim()[0] || '?').toUpperCase();
      var firstName = name.split(' ')[0];
      var ADMIN_EMAILS = ['rertovi@gmail.com', 'info@eventrehberi.com'];
      var isAdmin = user.email && ADMIN_EMAILS.indexOf(user.email.toLowerCase()) !== -1;
      var adminLink = isAdmin
        ? '<a href="yonetim.html" class="nav-user-item">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3z"/></svg>' +
            ' Yönetim' +
          '</a>'
        : '';

      navCta.innerHTML = [
        '<div class="nav-user-wrapper" id="nav-user-wrapper">',
          '<button class="nav-user-btn" type="button" id="nav-user-btn" aria-label="Hesap menüsü" aria-expanded="false">',
            '<span class="nav-user-avatar">' + initial + '</span>',
            '<span class="nav-user-name">' + firstName + '</span>',
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>',
          '</button>',
          '<div class="nav-user-menu" id="nav-user-menu" hidden>',
            '<a href="hesabim.html" class="nav-user-item">',
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
              ' Hesabım',
            '</a>',
            '<a href="kayit.html" class="nav-user-item">',
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>',
              ' Firmanı kaydet',
            '</a>',
            adminLink,
            '<div class="nav-user-divider"></div>',
            '<button type="button" class="nav-user-item nav-user-item-danger" id="nav-logout-btn">',
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
              ' Çıkış yap',
            '</button>',
          '</div>',
        '</div>'
      ].join('');

      var btn  = document.getElementById('nav-user-btn');
      var menu = document.getElementById('nav-user-menu');

      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var isOpen = !menu.hidden;
        menu.hidden = isOpen;
        btn.setAttribute('aria-expanded', String(!isOpen));
      });

      document.addEventListener('click', function(e) {
        var wrapper = document.getElementById('nav-user-wrapper');
        if (wrapper && !wrapper.contains(e.target)) {
          menu.hidden = true;
          btn.setAttribute('aria-expanded', 'false');
        }
      });

      document.getElementById('nav-logout-btn').addEventListener('click', function() {
        if (window.ER_Supabase) doLogout();
        else document.addEventListener('er-supabase-ready', doLogout, { once: true });
      });
    }
  }

  /* FOUC guard: localStorage'dan sync session oku, SDK beklenmez */
  (function foucGuard() {
    try {
      var raw = localStorage.getItem('sb-mzkbvqdvyyivawqwvosu-auth-token');
      if (!raw) return;
      var data = JSON.parse(raw);
      var session = data.access_token ? data : (data.session || null);
      if (!session) return;
      var expires = session.expires_at || 0;
      if (Date.now() / 1000 < expires) updateNav(session.user);
    } catch(e) {}
  })();

  function initAuthNav() {
    var sb = window.ER_Supabase;
    if (!sb) return;

    sb.auth.onAuthStateChange(function(event, session) {
      if (session) {
        updateNav(session.user);
      } else {
        updateNav(null);
      }
    });
  }

  if (window.ER_Supabase) {
    initAuthNav();
  } else {
    document.addEventListener('er-supabase-ready', initAuthNav, { once: true });
  }
})();
