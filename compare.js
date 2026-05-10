/* EventRehberi — Compare list (cross-page localStorage)
   Public:
     window.ER_Compare.list()    -> array of firm IDs
     window.ER_Compare.add(id)   -> bool (false if max reached)
     window.ER_Compare.remove(id)
     window.ER_Compare.toggle(id)
     window.ER_Compare.has(id)
     window.ER_Compare.clear()
     window.ER_Compare.MAX = 4
*/
(function() {
  const KEY = 'er_compare_v1';
  const MAX = 4;

  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch(e) { return []; }
  }
  function write(arr) {
    try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch(e) {}
    renderBar();
    renderButtons();
  }

  const API = {
    MAX: MAX,
    list: read,
    has: (id) => read().includes(id),
    add: (id) => {
      const arr = read();
      if (arr.includes(id)) return true;
      if (arr.length >= MAX) {
        showToast(`En fazla ${MAX} firma karşılaştırabilirsin. Listeden birini çıkar.`);
        return false;
      }
      arr.push(id);
      write(arr);
      showToast('Karşılaştırma listesine eklendi.');
      return true;
    },
    remove: (id) => {
      const arr = read().filter(x => x !== id);
      write(arr);
    },
    toggle: (id) => {
      return read().includes(id) ? (API.remove(id), false) : API.add(id);
    },
    clear: () => write([])
  };

  // ============= Sticky compare bar =============
  function ensureBar() {
    if (document.getElementById('erCompareBar')) return;
    const bar = document.createElement('div');
    bar.id = 'erCompareBar';
    bar.className = 'er-compare-bar';
    bar.hidden = true;
    bar.innerHTML = `
      <div class="er-compare-bar-inner">
        <div class="er-compare-bar-info">
          <strong id="erCompareBarCount">0 firma seçili</strong>
          <span class="muted-small">En az 2 firma seç</span>
        </div>
        <div class="er-compare-bar-chips" id="erCompareBarChips"></div>
        <div class="er-compare-bar-actions">
          <button class="btn btn-ghost btn-sm" id="erCompareBarClear" type="button">Temizle</button>
          <a href="karsilastir.html" class="btn btn-primary btn-sm" id="erCompareBarGo">Karşılaştır →</a>
        </div>
      </div>`;
    document.body.appendChild(bar);
    bar.querySelector('#erCompareBarClear').addEventListener('click', () => API.clear());
  }

  function renderBar() {
    ensureBar();
    const bar = document.getElementById('erCompareBar');
    const arr = read();
    if (!arr.length) { bar.hidden = true; return; }
    bar.hidden = false;
    bar.querySelector('#erCompareBarCount').textContent =
      `${arr.length} firma seçili`;
    bar.querySelector('#erCompareBarCount').nextElementSibling.textContent =
      arr.length < 2 ? 'En az 2 firma seç' : 'Karşılaştırmaya hazır';
    const go = bar.querySelector('#erCompareBarGo');
    go.style.opacity = arr.length < 2 ? 0.5 : 1;
    go.style.pointerEvents = arr.length < 2 ? 'none' : '';
    go.href = 'karsilastir.html?firms=' + arr.join(',');

    const chips = bar.querySelector('#erCompareBarChips');
    const FIRMS = window.CS_FIRMS || [];
    chips.innerHTML = arr.map(id => {
      const f = FIRMS.find(x => x.id === id);
      const name = f ? f.name : id;
      return `<span class="er-compare-chip">
        <span>${name.length > 22 ? name.substring(0, 22)+'...' : name}</span>
        <button data-er-chip-remove="${id}" aria-label="Çıkar">×</button>
      </span>`;
    }).join('');
    chips.querySelectorAll('[data-er-chip-remove]').forEach(btn => {
      btn.addEventListener('click', () => API.remove(btn.dataset.erChipRemove));
    });
  }

  function renderButtons() {
    const arr = read();
    document.querySelectorAll('[data-er-compare-toggle]').forEach(btn => {
      const id = btn.dataset.firmId;
      const active = arr.includes(id);
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      btn.title = active ? 'Karşılaştırmadan çıkar' : 'Karşılaştırmaya ekle';
    });
  }

  // Toast notification
  function showToast(msg) {
    let t = document.getElementById('erCompareToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'erCompareToast';
      t.className = 'er-compare-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('is-visible');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('is-visible'), 2400);
  }

  // ============= Click delegation =============
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-er-compare-toggle]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    const id = btn.dataset.firmId;
    if (id) API.toggle(id);
  }, true);

  // Cross-tab sync
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) { renderBar(); renderButtons(); }
  });

  window.ER_Compare = API;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { renderBar(); renderButtons(); });
  } else {
    renderBar();
    renderButtons();
  }
})();
