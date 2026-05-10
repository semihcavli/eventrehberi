/* ============================================================
   EventRehberi — Shared Favorites Library
   ------------------------------------------------------------
   Uses localStorage, scoped per logged-in user (Netlify Identity).
   Stores full firm snapshots so any page can render favorites
   without needing the master firm list.

   Public API (window.CSFavorites):
     - getAll()           → Array of firm snapshots
     - has(id)            → boolean
     - add(firm)          → adds a firm snapshot
     - remove(id)         → removes by id
     - toggle(firm)       → returns true if now favorited, false if removed
     - count()            → number of favorites
     - bindButtons(scope) → auto-binds [data-fav-toggle] buttons inside scope

   Auto-binds on DOMContentLoaded so any button with
     <button data-fav-toggle data-fav='{...firm json...}'>...</button>
   becomes interactive.
   ============================================================ */
(function () {
  'use strict';

  function getUserId() {
    try {
      if (window.netlifyIdentity && typeof window.netlifyIdentity.currentUser === 'function') {
        const u = window.netlifyIdentity.currentUser();
        if (u && u.id) return u.id;
      }
    } catch (e) {}
    // Anonymous bucket — favorites still saved locally even before login
    return 'anon';
  }

  function key() {
    return `cs_fav_${getUserId()}`;
  }

  function read() {
    try {
      const raw = localStorage.getItem(key());
      const arr = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(arr)) return [];
      // Filter out legacy entries (old code stored strings/IDs only).
      // Keep only normalized firm objects with at least an id.
      return arr.filter((x) => x && typeof x === 'object' && x.id);
    } catch (e) {
      return [];
    }
  }

  function write(arr) {
    try {
      localStorage.setItem(key(), JSON.stringify(arr));
    } catch (e) {}
    // Notify same-page listeners
    document.dispatchEvent(new CustomEvent('cs-favorites-changed', { detail: { count: arr.length } }));
  }

  function normalize(firm) {
    if (!firm || !firm.id) return null;
    return {
      id: String(firm.id),
      name: firm.name || '',
      city: firm.city || '',
      district: firm.district || '',
      rating: typeof firm.rating === 'number' ? firm.rating : parseFloat(firm.rating) || 0,
      reviews: typeof firm.reviews === 'number' ? firm.reviews : parseInt(firm.reviews, 10) || 0,
      image: firm.image || firm.img || '',
      tagline: firm.tagline || '',
      badge: firm.badge || '',
      cuisines: Array.isArray(firm.cuisines)
        ? firm.cuisines
        : Array.isArray(firm.cuisine)
        ? firm.cuisine
        : [],
      events: Array.isArray(firm.events) ? firm.events : [],
      price: typeof firm.price === 'number' ? firm.price : parseInt(firm.price, 10) || 0,
      hizmet: firm.hizmet || '',
      addedAt: Date.now()
    };
  }

  const API = {
    getAll() {
      return read();
    },
    has(id) {
      if (!id) return false;
      const sid = String(id);
      return read().some((f) => String(f.id) === sid);
    },
    add(firm) {
      const norm = normalize(firm);
      if (!norm) return false;
      const arr = read();
      if (arr.some((f) => String(f.id) === norm.id)) return false;
      arr.unshift(norm);
      write(arr);
      return true;
    },
    remove(id) {
      if (!id) return false;
      const sid = String(id);
      const arr = read();
      const next = arr.filter((f) => String(f.id) !== sid);
      if (next.length === arr.length) return false;
      write(next);
      return true;
    },
    toggle(firm) {
      const norm = normalize(firm);
      if (!norm) return false;
      const arr = read();
      const i = arr.findIndex((f) => String(f.id) === norm.id);
      if (i >= 0) {
        arr.splice(i, 1);
        write(arr);
        return false;
      }
      arr.unshift(norm);
      write(arr);
      return true;
    },
    count() {
      return read().length;
    },
    bindButtons(scope) {
      const root = scope || document;
      const buttons = root.querySelectorAll('[data-fav-toggle]');
      buttons.forEach((btn) => {
        if (btn.__csFavBound) return;
        btn.__csFavBound = true;

        const id = btn.dataset.favId || (btn.dataset.fav ? safeParse(btn.dataset.fav).id : null);
        if (id && API.has(id)) btn.classList.add('is-fav');

        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();

          let firm = null;
          if (btn.dataset.fav) {
            firm = safeParse(btn.dataset.fav);
          } else if (btn.dataset.favId) {
            firm = { id: btn.dataset.favId };
          }
          if (!firm || !firm.id) return;

          // If only id given and removing — that's fine. If adding without full data, skip.
          const isFav = API.has(firm.id);
          if (isFav) {
            API.remove(firm.id);
            btn.classList.remove('is-fav');
            btn.setAttribute('aria-pressed', 'false');
            flashTip(btn, 'Favorilerden çıkarıldı');
          } else {
            // Need full firm data to add
            if (!firm.name && btn.dataset.fav) firm = safeParse(btn.dataset.fav);
            if (!firm.name) return; // can't add without snapshot
            API.add(firm);
            btn.classList.add('is-fav');
            btn.setAttribute('aria-pressed', 'true');
            flashTip(btn, 'Favorilere eklendi ❤️');
          }
        });
      });
    }
  };

  function safeParse(s) {
    try { return JSON.parse(s); } catch (e) { return {}; }
  }

  /* Tiny ephemeral toast next to the heart button */
  function flashTip(btn, text) {
    const tip = document.createElement('span');
    tip.className = 'fav-toast';
    tip.textContent = text;
    document.body.appendChild(tip);
    const r = btn.getBoundingClientRect();
    tip.style.left = Math.min(window.innerWidth - 220, r.left + r.width / 2 - 90) + 'px';
    tip.style.top = (r.top + window.scrollY - 38) + 'px';
    requestAnimationFrame(() => tip.classList.add('fav-toast--show'));
    setTimeout(() => {
      tip.classList.remove('fav-toast--show');
      setTimeout(() => tip.remove(), 250);
    }, 1400);
  }

  window.CSFavorites = API;

  // Auto-bind buttons after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => API.bindButtons());
  } else {
    API.bindButtons();
  }

  // Re-bind whenever Netlify Identity says user changed (id-scoped storage flip)
  if (window.netlifyIdentity) {
    window.netlifyIdentity.on('login', () => API.bindButtons());
    window.netlifyIdentity.on('logout', () => API.bindButtons());
  }
})();
