/* ============================================================
   EventRehberi — Kayıt Wizard
   Supabase: firm_applications insert + firma-fotograflari upload
   ============================================================ */
(function () {
  'use strict';

  const DRAFT_KEY   = 'er-firma-kayit-draft';
  const TOTAL_STEPS = 9;
  const FOOD_CATS   = ['yemek', 'bar', 'sef', 'pasta'];

  // Mutfak tarzı gösterilecek hizmetler
  const CUISINE_CATS = ['yemek', 'sef', 'pasta'];
  const CUISINE_OPTIONS = ['Akdeniz','Osmanlı/Türk','Ege','İtalyan','Uzak Doğu','Dünya mutfağı','Vegan/Vejetaryen','Deniz ürünleri','Sokak lezzetleri'];

  /* ----------------------------------------------------------
     Hizmete özel alan tanımları (Adım 7 dinamik blok)
     type: number | select | chips(çoklu) | radio(tekli)
  ---------------------------------------------------------- */
  const SERVICE_FIELDS = {
    // Grup A — kişi kapasiteli
    _capacity: [
      { key:'min_kisi', label:'Min. kişi kapasitesi', type:'number', required:true, placeholder:'20' },
      { key:'max_kisi', label:'Max. kişi kapasitesi', type:'number', required:false, placeholder:'500' },
    ],
    yemek: '_capacity', bar: '_capacity', garson: '_capacity', sef: '_capacity', organizator: '_capacity',
    // Grup B — DJ
    dj: [
      { key:'sure', label:'Etkinlik süresi', type:'select', required:true, options:['2-4 saat','4-6 saat','Tüm gece'] },
      { key:'ekipman_dahil', label:'Ses & ışık ekipmanı dahil mi?', type:'select', required:true, options:['Evet, tam sistem','Kısmi','Hayır, mekan sağlar'] },
    ],
    // Grup B — Foto/Video
    foto: [
      { key:'sure', label:'Çekim paketi süresi', type:'select', required:true, options:['Yarım gün','Tam gün','Çoklu gün'] },
      { key:'teslim_suresi', label:'Teslim süresi', type:'select', required:true, options:['1 hafta','2-4 hafta','1+ ay'] },
      { key:'ek_hizmetler', label:'Ek hizmetler', type:'chips', required:false, options:['Drone','Video','Albüm','Dış çekim'] },
    ],
    // Grup C — Pasta
    pasta: [
      { key:'min_adet', label:'Min. porsiyon / kg', type:'number', required:true, placeholder:'10' },
      { key:'ozel_diyet', label:'Özel diyet seçenekleri', type:'chips', required:false, options:['Vegan','Glutensiz','Şekersiz'] },
    ],
    // Grup C — Davetiye
    davetiye: [
      { key:'min_adet', label:'Min. adet', type:'number', required:true, placeholder:'50' },
      { key:'proje_tipi', label:'Tür', type:'chips', required:true, options:['Baskılı','Dijital'] },
    ],
    // Grup D — proje bazlı
    susleme: [
      { key:'proje_tipi', label:'Proje tipleri', type:'chips', required:true, options:['Düğün dekoru','Masa süsleme','Mekan tasarımı','Işıklandırma'] },
    ],
    cicek: [
      { key:'proje_tipi', label:'Ürün tipleri', type:'chips', required:true, options:['Gelin buketi','Masa çiçeği','Nikah/Kına','Mekan süsleme'] },
    ],
    ekipman: [
      { key:'proje_tipi', label:'Ekipman türleri', type:'chips', required:true, options:['Masa-sandalye','Çadır','Ses-ışık','Servis takımı'] },
      { key:'ekipman_dahil', label:'Kurulum dahil mi?', type:'select', required:true, options:['Evet, kurulum dahil','Hayır, sadece kiralama'] },
    ],
    // Grup E — çocuk / workshop
    cocuk: [
      { key:'yas_grubu', label:'Yaş grubu', type:'select', required:true, options:['0-3 yaş','4-6 yaş','7-12 yaş','Karma'] },
      { key:'proje_tipi', label:'Aktiviteler', type:'chips', required:true, options:['Animasyon','Yüz boyama','Balon','Sihirbaz'] },
    ],
    workshop: [
      { key:'min_kisi', label:'Min. katılımcı', type:'number', required:true, placeholder:'5' },
      { key:'max_kisi', label:'Max. katılımcı', type:'number', required:false, placeholder:'30' },
    ],
  };

  function getServiceFields(cat) {
    let def = SERVICE_FIELDS[cat];
    if (typeof def === 'string') def = SERVICE_FIELDS[def];   // alias çöz (_capacity)
    return def || SERVICE_FIELDS._capacity;                   // varsayılan: kapasite
  }

  function getSelectedCategory() {
    return document.querySelector('[name="kategori"]:checked')?.value || null;
  }

  /* ----------------------------------------------------------
     Adım 7 dinamik alanları render et
  ---------------------------------------------------------- */
  function renderServiceFields() {
    const cont = document.getElementById('wz-dynamic-fields');
    if (!cont) return;
    const cat = getSelectedCategory();
    const fields = getServiceFields(cat);
    cont.innerHTML = '';
    cont.classList.remove('wz-field');  // grid bozulmasın

    fields.forEach(f => {
      const wrap = document.createElement('div');
      wrap.className = 'form-group wz-field';
      const reqStar = f.required ? ' <span class="req">*</span>' : '';
      let inner = `<label>${f.label}${reqStar}</label>`;

      if (f.type === 'number') {
        inner += `<input type="number" data-field="${f.key}" name="${f.key}" min="1" placeholder="${f.placeholder||''}">`;
      } else if (f.type === 'select') {
        inner += `<select data-field="${f.key}" name="${f.key}"><option value="">Seçiniz...</option>` +
          f.options.map(o => `<option>${o}</option>`).join('') + `</select>`;
      } else if (f.type === 'chips') {
        inner += `<div class="wz-chip-group" data-field="${f.key}">` +
          f.options.map(o => `<label class="chip-check"><input type="checkbox" value="${o}"><span>${o}</span></label>`).join('') +
          `</div>`;
      }
      wrap.innerHTML = inner;
      cont.appendChild(wrap);
    });
  }

  /* ----------------------------------------------------------
     Mutfak bloğunu (Adım 3) hizmete göre göster/gizle + doldur
  ---------------------------------------------------------- */
  function renderMutfakBlock() {
    const block = document.getElementById('wz-mutfak-block');
    const grid  = document.getElementById('wz-mutfak-grid');
    if (!block || !grid) return;
    const cat = getSelectedCategory();
    if (CUISINE_CATS.includes(cat)) {
      block.hidden = false;
      if (!grid.children.length) {
        grid.innerHTML = CUISINE_OPTIONS.map(o =>
          `<label class="wz-event-card"><input type="checkbox" name="mutfak" value="${o}"><span class="wz-event-name">${o}</span></label>`
        ).join('');
      }
    } else {
      block.hidden = true;
    }
  }



  let currentStep = 1;
  let currentUser = null;

  /* ----------------------------------------------------------
     1. Init — wait for Supabase ready then check auth
  ---------------------------------------------------------- */
  document.addEventListener('er-supabase-ready', async () => {
    const { data: { user } } = await ER_Supabase.auth.getUser();
    if (!user) {
      window.location.href = 'giris.html?next=/kayit.html';
      return;
    }
    currentUser = user;
    initWizard();
  });

  function bindFirmaTuru() {
    const wrap = document.getElementById('vergi-no-wrap');
    function syncVergi() {
      if (!wrap) return;
      const sel = document.querySelector('[name="firma-turu"]:checked');
      wrap.hidden = !(sel && sel.value === 'sirket');
    }
    document.querySelectorAll('[name="firma-turu"]').forEach(function(r){
      r.addEventListener('change', function(){ syncVergi(); updateVergiReq(); });
    });
    syncVergi();
  }

  // Yüklenen belgeler: { tur: { path, ad } }
  const uploadedBelgeler = {};

  function updateVergiReq() {
    const sel = document.querySelector('[name="firma-turu"]:checked');
    const req = document.getElementById('vergi-req');
    if (req) req.hidden = !(sel && sel.value === 'sirket');
  }

  async function uploadBelge(file, tur, item) {
    const status = document.getElementById('wz-belge-status');
    if (status) status.hidden = false;
    const ext = (file.name.split('.').pop() || 'pdf').toLowerCase();
    const path = currentUser.id + '/belge_' + tur + '_' + crypto.randomUUID() + '.' + ext;
    const { error } = await ER_Supabase.storage
      .from('firma-belgeler')
      .upload(path, file, { cacheControl: '3600', upsert: true });
    if (status) status.hidden = true;
    if (error) {
      const btn = item.querySelector('.wz-belge-btn');
      if (btn) { btn.textContent = 'Hata, tekrar dene'; btn.classList.add('wz-belge-btn--err'); }
      return;
    }
    uploadedBelgeler[tur] = { path: path, ad: file.name };
    const btn = item.querySelector('.wz-belge-btn');
    if (btn) { btn.textContent = '✓ Yüklendi'; btn.classList.add('wz-belge-btn--done'); }
    item.classList.add('wz-belge-item--done');
  }

  function bindBelgeUpload() {
    document.querySelectorAll('[data-belge]').forEach(function(input){
      input.addEventListener('change', function(){
        if (!input.files || !input.files[0]) return;
        if (!currentUser) { alert('Önce giriş yapmalısın.'); return; }
        const item = input.closest('.wz-belge-item');
        uploadBelge(input.files[0], input.dataset.belge, item);
      });
    });
    updateVergiReq();
  }

  function initWizard() {
    const draft = loadDraft();
    if (draft) showDraftBanner(draft);
    bindInputAutoSave();
    bindFirmaTuru();
    bindBelgeUpload();
    bindNavButtons();
    bindCharCounter();
    bindDistrictLogic();
    showStep(1, false);
  }

  /* ----------------------------------------------------------
     2. Draft — localStorage
  ---------------------------------------------------------- */
  function saveDraft() {
    const data = { _step: currentStep };
    document.querySelectorAll('#wz-form [name]').forEach(el => {
      if (el.type === 'file') return;
      const k = el.name;
      if (el.type === 'checkbox') {
        if (el.checked) data[k] = [...(Array.isArray(data[k]) ? data[k] : []), el.value];
      } else if (el.type === 'radio') {
        if (el.checked) data[k] = el.value;
      } else {
        if (el.value) data[k] = el.value;
      }
    });
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  }

  function loadDraft() {
    try { return JSON.parse(localStorage.getItem(DRAFT_KEY)); } catch { return null; }
  }

  function restoreDraft(draft) {
    if (!draft) return;
    Object.entries(draft).forEach(([name, val]) => {
      if (name === '_step') return;
      document.querySelectorAll(`#wz-form [name="${CSS.escape(name)}"]`).forEach(el => {
        if (el.type === 'file') return;
        if (el.type === 'checkbox') el.checked = Array.isArray(val) && val.includes(el.value);
        else if (el.type === 'radio') el.checked = el.value === val;
        else el.value = val;
      });
    });
  }

  // Dinamik alanlar (Adım 3 mutfak, Adım 7 hizmet alanları) sonradan oluştuğu için
  // draft varsa değerlerini onlara da uygula
  function reapplyDraftToDynamic() {
    const draft = loadDraft();
    if (!draft) return;
    Object.entries(draft).forEach(([name, val]) => {
      if (name === '_step') return;
      // mutfak checkbox'ları
      document.querySelectorAll(`[name="${CSS.escape(name)}"]`).forEach(el => {
        if (el.type === 'checkbox') el.checked = Array.isArray(val) && val.includes(el.value);
        else if (el.type === 'radio') el.checked = el.value === val;
        else if (el.value === '') el.value = val;
      });
      // dinamik data-field alanları
      const dynEl = document.querySelector(`#wz-dynamic-fields [data-field="${name}"]`);
      if (dynEl) {
        if (dynEl.classList.contains('wz-chip-group')) {
          (Array.isArray(val) ? val : [val]).forEach(v => {
            const cb = [...dynEl.querySelectorAll('input')].find(i => i.value === v);
            if (cb) cb.checked = true;
          });
        } else if (!dynEl.value) {
          dynEl.value = val;
        }
      }
    });
  }

  function showDraftBanner(draft) {
    const banner = document.getElementById('wz-draft-banner');
    if (!banner) return;
    banner.hidden = false;
    banner.querySelector('.wz-draft-continue').addEventListener('click', () => {
      restoreDraft(draft);
      banner.hidden = true;
      const step = Math.max(1, Math.min(TOTAL_STEPS, draft._step || 1));
      showStep(step, false);
    });
    banner.querySelector('.wz-draft-reset').addEventListener('click', () => {
      localStorage.removeItem(DRAFT_KEY);
      banner.hidden = true;
    });
  }

  function bindInputAutoSave() {
    document.getElementById('wz-form').addEventListener('input', saveDraft);
    document.getElementById('wz-form').addEventListener('change', saveDraft);
  }

  /* ----------------------------------------------------------
     3. Step navigation
  ---------------------------------------------------------- */
  function showStep(n, pushHistory) {
    currentStep = Math.max(1, Math.min(TOTAL_STEPS, n));

    // Steps
    document.querySelectorAll('.wz-step').forEach(el => {
      el.classList.toggle('is-active', parseInt(el.dataset.step) === currentStep);
    });
    // Left panels
    document.querySelectorAll('.wz-left-panel').forEach(el => {
      el.classList.toggle('is-active', parseInt(el.dataset.step) === currentStep);
    });

    updateProgress();
    updateFooter();
    clearErrors();

    if (currentStep === 3) { renderMutfakBlock(); reapplyDraftToDynamic(); }
    if (currentStep === 7) { renderServiceFields(); reapplyDraftToDynamic(); }
    if (currentStep === 9) { renderPreview(); renderProfilGucu(); }

    // URL state
    if (pushHistory !== false) {
      const url = new URL(location);
      url.searchParams.set('adim', currentStep);
      history.pushState({ step: currentStep }, '', url);
    }

    // Scroll right panel to top
    const right = document.querySelector('.wz-right');
    if (right) right.scrollTop = 0;
  }

  function updateProgress() {
    // Stage mapping
    const stageMap = { A: [1,2,3], B: [4,5,6,7], C: [8,9] };
    Object.entries(stageMap).forEach(([stage, steps]) => {
      const el = document.querySelector(`.wz-stage[data-stage="${stage}"]`);
      if (!el) return;
      const maxStep = Math.max(...steps);
      const minStep = Math.min(...steps);
      el.classList.toggle('wz-stage--active',
        currentStep >= minStep && currentStep <= maxStep);
      steps.forEach(s => {
        const dot = el.querySelector(`.wz-dot[data-step="${s}"]`);
        if (!dot) return;
        dot.classList.remove('wz-dot--done', 'wz-dot--active');
        if (s < currentStep) dot.classList.add('wz-dot--done');
        else if (s === currentStep) dot.classList.add('wz-dot--active');
      });
    });
  }

  function updateFooter() {
    const backBtn = document.getElementById('wz-back');
    const nextBtn = document.getElementById('wz-next');
    backBtn.hidden = currentStep === 1;
    nextBtn.textContent = currentStep === TOTAL_STEPS ? 'Yayınla →' : 'Devam →';
    nextBtn.disabled = false;
  }

  function bindNavButtons() {
    document.getElementById('wz-next').addEventListener('click', async () => {
      if (currentStep === TOTAL_STEPS) {
        await submitWizard();
      } else {
        if (!validateStep(currentStep)) return;
        saveDraft();
        showStep(currentStep + 1);
      }
    });

    document.getElementById('wz-back').addEventListener('click', () => {
      saveDraft();
      showStep(currentStep - 1);
    });

    window.addEventListener('popstate', e => {
      if (e.state && e.state.step) showStep(e.state.step, false);
    });

    const exitBtn = document.getElementById('wz-exit');
    if (exitBtn) {
      exitBtn.addEventListener('click', () => {
        saveDraft();
        window.location.href = 'index.html';
      });
    }
  }

  /* ----------------------------------------------------------
     4. Validation (per step, inline errors)
  ---------------------------------------------------------- */
  function validateStep(n) {
    clearErrors();
    if (n === 1) {
      if (!document.querySelector('[name="kategori"]:checked')) {
        showError('err-1', 'Lütfen bir hizmet kategorisi seç.');
        return false;
      }
    }
    if (n === 2) {
      if (!document.getElementById('il').value) {
        showError('err-2', 'Şehir seçimi zorunlu.');
        return false;
      }
    }
    if (n === 3) {
      if (!document.querySelector('[name="etkinlik"]:checked')) {
        showError('err-3', 'En az bir etkinlik türü seç.');
        return false;
      }
    }
    if (n === 4) {
      const firmaTuru = document.querySelector('[name="firma-turu"]:checked');
      if (!firmaTuru) { showError('err-4', 'Lütfen firma türünü seç (Şirket veya Bireysel).'); return false; }
      if (firmaTuru.value === 'sirket') {
        const vno = (document.getElementById('vergi-no').value || '').replace(/\D/g,'');
        if (vno.length < 10) { showError('err-4', 'Şirket için geçerli bir vergi numarası gir (en az 10 hane).'); return false; }
      }
      const ad = document.getElementById('firma-adi').value.trim();
      const tg = document.getElementById('tagline').value.trim();
      if (ad.length < 2) { showError('err-4', 'Firma adı en az 2 karakter olmalı.'); return false; }
      if (tg.length < 5) { showError('err-4', 'Kısa tanıtım cümlesi en az 5 karakter olmalı.'); return false; }
    }
    if (n === 5) {
      const len = document.getElementById('tanitim').value.trim().length;
      if (len < 100) {
        showError('err-5', `En az 100 karakter gerekli (şu an: ${len}).`);
        return false;
      }
    }
    if (n === 6) {
      const sel = document.querySelector('[name="firma-turu"]:checked');
      if (sel && sel.value === 'sirket' && !uploadedBelgeler['vergi_levhasi']) {
        showError('err-6', 'Şirket olarak vergi levhası yüklemen gerekiyor.');
        return false;
      }
    }
    if (n === 7) {
      if (!document.querySelector('[name="segment"]:checked')) {
        showError('err-7', 'Fiyat segmenti seçimi zorunlu.');
        return false;
      }
      if (!document.getElementById('deneyim').value) {
        showError('err-7', 'Deneyim süresi seçimi zorunlu.');
        return false;
      }
      // Hizmete özel zorunlu alanları kontrol et
      const cat = getSelectedCategory();
      const fields = getServiceFields(cat);
      for (const f of fields) {
        if (!f.required) continue;
        if (f.type === 'chips') {
          const grp = document.querySelector(`[data-field="${f.key}"]`);
          if (grp && !grp.querySelector('input:checked')) {
            showError('err-7', `Lütfen "${f.label}" alanından en az bir seçim yap.`);
            return false;
          }
        } else {
          const el = document.querySelector(`[data-field="${f.key}"]`);
          if (el && !el.value) {
            showError('err-7', `Lütfen "${f.label}" alanını doldur.`);
            return false;
          }
        }
      }
    }
    if (n === 8) {
      const tel = document.getElementById('telefon').value.trim();
      const mail = document.getElementById('eposta').value.trim();
      if (!tel) { showError('err-8', 'Telefon numarası zorunlu.'); return false; }
      if (!mail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
        showError('err-8', 'Geçerli bir e-posta adresi gir.');
        return false;
      }
    }
    if (n === 9) {
      if (!document.querySelector('[name="kvkk"]:checked')) {
        showError('err-9', 'Devam etmek için KVKK metnini onaylamalısın.');
        return false;
      }
    }
    return true;
  }

  function showError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = '';
    el.hidden = false;
    // Rebuild with icon
    el.innerHTML = msg;
    el.hidden = false;
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function clearErrors() {
    document.querySelectorAll('.wz-error').forEach(el => { el.hidden = true; });
    const submitErr = document.getElementById('wz-submit-error');
    if (submitErr) submitErr.hidden = true;
  }

  /* ----------------------------------------------------------
     5. Char counter (Step 5)
  ---------------------------------------------------------- */
  function bindCharCounter() {
    const ta = document.getElementById('tanitim');
    const counter = document.getElementById('tanitim-count');
    if (!ta || !counter) return;
    ta.addEventListener('input', () => {
      const len = ta.value.trim().length;
      counter.textContent = len;
      const wrap = counter.closest('.wz-charcount');
      if (wrap) wrap.classList.toggle('is-ok', len >= 100);
    });
  }

  /* ----------------------------------------------------------
     6. District logic (Step 2)
  ---------------------------------------------------------- */
  const ILCELER = {
    'İstanbul': ['Adalar','Arnavutköy','Ataşehir','Avcılar','Bağcılar','Bahçelievler','Bakırköy','Başakşehir','Bayrampaşa','Beşiktaş','Beykoz','Beylikdüzü','Beyoğlu','Büyükçekmece','Çatalca','Çekmeköy','Esenler','Esenyurt','Eyüpsultan','Fatih','Gaziosmanpaşa','Güngören','Kadıköy','Kağıthane','Kartal','Küçükçekmece','Maltepe','Pendik','Sancaktepe','Sarıyer','Şile','Şişli','Sultanbeyli','Sultangazi','Tuzla','Ümraniye','Üsküdar','Zeytinburnu'],
    'Ankara': ['Altındağ','Akyurt','Ayaş','Balâ','Beypazarı','Çamlıdere','Çankaya','Çubuk','Elmadağ','Etimesgut','Evren','Gölbaşı','Güdül','Haymana','Kahramankazan','Kalecik','Keçiören','Kızılcahamam','Mamak','Nallıhan','Polatlı','Pursaklar','Sincan','Şereflikoçhisar','Yenimahalle'],
    'İzmir': ['Aliağa','Balçova','Bayındır','Bayraklı','Bergama','Beydağ','Bornova','Buca','Çeşme','Çiğli','Dikili','Foça','Gaziemir','Güzelbahçe','Karabağlar','Karaburun','Karşıyaka','Kemalpaşa','Kınık','Kiraz','Konak','Menderes','Menemen','Narlıdere','Ödemiş','Seferihisar','Selçuk','Tire','Torbalı','Urla'],
    'Antalya': ['Aksu','Alanya','Demre','Döşemealtı','Elmalı','Finike','Gazipaşa','Gündoğmuş','İbradı','Kaş','Kemer','Kepez','Konyaaltı','Korkuteli','Kumluca','Manavgat','Muratpaşa','Serik'],
    'Bursa': ['Büyükorhan','Gemlik','Gürsu','Harmancık','İnegöl','İznik','Karacabey','Keles','Kestel','Mudanya','Mustafakemalpaşa','Nilüfer','Orhaneli','Orhangazi','Osmangazi','Yenişehir','Yıldırım'],
    'Muğla': ['Bodrum','Dalaman','Datça','Fethiye','Kavaklıdere','Köyceğiz','Marmaris','Menteşe','Milas','Ortaca','Seydikemer','Ula','Yatağan']
  };
  const ILCELI_SEHIRLER = Object.keys(ILCELER);

  const ISTANBUL_ANADOLU = new Set(['Adalar','Ataşehir','Beykoz','Çekmeköy','Kadıköy','Kartal','Maltepe','Pendik','Sancaktepe','Şile','Sultanbeyli','Tuzla','Ümraniye','Üsküdar']);
  const ISTANBUL_AVRUPA  = new Set(['Arnavutköy','Avcılar','Bağcılar','Bahçelievler','Bakırköy','Başakşehir','Bayrampaşa','Beşiktaş','Beylikdüzü','Beyoğlu','Büyükçekmece','Çatalca','Esenler','Esenyurt','Eyüpsultan','Fatih','Gaziosmanpaşa','Güngören','Kağıthane','Küçükçekmece','Sarıyer','Şişli','Sultangazi','Zeytinburnu']);

  /* Selected set persists while city is active */
  const selectedIlceler = new Set();

  function renderDistricts(city) {
    const ilceList = document.getElementById('ilce-list');
    const q = (document.getElementById('ilce-search')?.value || '').toLowerCase().trim();
    const all = ILCELER[city] || [];
    const filtered = q ? all.filter(d => d.toLowerCase().includes(q)) : all;

    if (!filtered.length) {
      ilceList.innerHTML = `<div class="ilce-empty-msg">Sonuç bulunamadı.</div>`;
      return;
    }
    ilceList.innerHTML = filtered.map(d => {
      const sel = selectedIlceler.has(d);
      return `<div class="ilce-list-item" role="option" aria-selected="${sel}" tabindex="-1" data-value="${d}">${d}</div>`;
    }).join('');

    ilceList.querySelectorAll('.ilce-list-item').forEach(item => {
      item.addEventListener('click', () => toggleIlce(item.dataset.value, city));
      item.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleIlce(item.dataset.value, city); }
        if (e.key === 'ArrowDown') { e.preventDefault(); (item.nextElementSibling || item.parentElement.firstElementChild)?.focus(); }
        if (e.key === 'ArrowUp')   { e.preventDefault(); (item.previousElementSibling || item.parentElement.lastElementChild)?.focus(); }
        if (e.key === 'Escape') { document.getElementById('ilce-search').value = ''; renderDistricts(city); document.getElementById('ilce-search').focus(); }
      });
    });
  }

  function toggleIlce(val, city) {
    if (selectedIlceler.has(val)) selectedIlceler.delete(val);
    else selectedIlceler.add(val);
    renderDistricts(city);
    updateSelectedChips(city);
    syncIlceHiddenInputs();
  }

  function updateSelectedChips(city) {
    const container = document.getElementById('ilce-selected-chips');
    if (!container) return;
    container.innerHTML = [...selectedIlceler].map(d =>
      `<span class="ilce-selected-chip">${d}<button type="button" aria-label="${d} kaldır" data-val="${d}">×</button></span>`
    ).join('');
    container.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => { selectedIlceler.delete(btn.dataset.val); renderDistricts(city); updateSelectedChips(city); syncIlceHiddenInputs(); });
    });
  }

  function syncIlceHiddenInputs() {
    document.querySelectorAll('input[type="hidden"][name="ilce"]').forEach(el => el.remove());
    const form = document.querySelector('form');
    selectedIlceler.forEach(val => {
      const inp = document.createElement('input');
      inp.type = 'hidden'; inp.name = 'ilce'; inp.value = val;
      form?.appendChild(inp);
    });
  }

  function renderPresets(city) {
    const container = document.getElementById('ilce-presets');
    if (!container) return;
    const presets = [{ label: 'Tümünü temizle', key: 'clear' }];
    if (city === 'İstanbul') {
      presets.push({ label: 'Avrupa Yakası', key: 'avrupa' });
      presets.push({ label: 'Anadolu Yakası', key: 'anadolu' });
    }
    container.innerHTML = presets.map(p =>
      `<button type="button" class="ilce-preset-btn" data-preset="${p.key}">${p.label}</button>`
    ).join('');
    container.querySelectorAll('.ilce-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset;
        if (preset === 'clear') { selectedIlceler.clear(); }
        else if (preset === 'avrupa') { ISTANBUL_AVRUPA.forEach(d => selectedIlceler.add(d)); }
        else if (preset === 'anadolu') { ISTANBUL_ANADOLU.forEach(d => selectedIlceler.add(d)); }
        renderDistricts(city);
        updateSelectedChips(city);
        syncIlceHiddenInputs();
      });
    });
  }

  function bindDistrictLogic() {
    const ilSelect = document.getElementById('il');
    const ilceGroup = document.getElementById('ilce-group');
    const searchInput = document.getElementById('ilce-search');
    const ilceList = document.getElementById('ilce-list');
    if (!ilSelect) return;

    ilSelect.addEventListener('change', () => {
      const city = ilSelect.value;
      selectedIlceler.clear();
      if (ILCELI_SEHIRLER.includes(city)) {
        if (searchInput) searchInput.value = '';
        renderPresets(city);
        renderDistricts(city);
        updateSelectedChips(city);
        syncIlceHiddenInputs();
        ilceGroup.hidden = false;
      } else {
        ilceGroup.hidden = true;
      }
    });

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const city = ilSelect.value;
        if (city) renderDistricts(city);
      });
      searchInput.addEventListener('keydown', e => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          ilceList?.querySelector('.ilce-list-item')?.focus();
        }
      });
    }

    if (ilceList) {
      ilceList.addEventListener('keydown', e => {
        if (e.key === 'ArrowDown') { e.preventDefault(); ilceList.querySelector('.ilce-list-item')?.focus(); }
      });
    }
  }

  /* ----------------------------------------------------------
     7. Preview (Step 9)
  ---------------------------------------------------------- */
  function renderProfilGucu() {
    // Her madde bir puan; toplam üzerinden yüzde
    const checks = [
      { ok: !!document.getElementById('firma-adi')?.value.trim(), label: 'Firma adı', w: 12 },
      { ok: !!document.getElementById('tagline')?.value.trim(), label: 'Kısa tanıtım', w: 10 },
      { ok: (document.getElementById('tanitim')?.value.trim().length || 0) >= 100, label: 'Detaylı açıklama', w: 15 },
      { ok: !!document.getElementById('il')?.value, label: 'Konum', w: 10 },
      { ok: !!document.querySelector('[name="etkinlik"]:checked'), label: 'Etkinlik türleri', w: 8 },
      { ok: !!document.querySelector('[name="segment"]:checked'), label: 'Fiyat segmenti', w: 8 },
      { ok: (document.getElementById('galeri')?.files?.length || 0) > 0, label: 'Fotoğraf', w: 17, bonus: '+%17 görünürlük' },
      { ok: Object.keys(typeof uploadedBelgeler !== 'undefined' ? uploadedBelgeler : {}).length > 0, label: 'Belge / doğrulama', w: 12, bonus: 'Doğrulanmış rozeti' },
      { ok: !!document.getElementById('web')?.value.trim(), label: 'Web / sosyal medya', w: 8 },
    ];
    const total = checks.reduce((s,c)=>s+c.w, 0);
    const earned = checks.filter(c=>c.ok).reduce((s,c)=>s+c.w, 0);
    const pct = Math.round((earned/total)*100);

    const fill = document.getElementById('wz-profilguc-fill');
    const pctEl = document.getElementById('wz-profilguc-pct');
    if (fill) fill.style.width = pct + '%';
    if (pctEl) pctEl.textContent = '%' + pct + (pct >= 80 ? ' · Güçlü' : pct >= 50 ? ' · İyi' : ' · Geliştir');

    const itemsEl = document.getElementById('wz-profilguc-items');
    if (itemsEl) {
      // Tamamlananlar + en önemli 2 eksik
      const done = checks.filter(c=>c.ok);
      const missing = checks.filter(c=>!c.ok).sort((a,b)=>b.w-a.w);
      let html = '';
      done.slice(-2).forEach(c => {
        html += `<div class="wz-pg-item wz-pg-item--done"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#1D9E75" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> ${c.label}</div>`;
      });
      missing.slice(0,2).forEach(c => {
        html += `<div class="wz-pg-item wz-pg-item--todo"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#C7522A" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> ${c.label}${c.bonus ? ` <span class="wz-pg-bonus">${c.bonus}</span>` : ''}</div>`;
      });
      itemsEl.innerHTML = html;
    }
  }

  function renderPreview() {
    const ad = document.getElementById('firma-adi')?.value.trim() || 'Firma Adı';
    const tagline = document.getElementById('tagline')?.value.trim() || '';
    const il = document.getElementById('il')?.value || '—';
    const ilceler = [...document.querySelectorAll('input[type="hidden"][name="ilce"]')].map(el => el.value);
    const lokasyon = ilceler.length > 0 ? `${ilceler[0]}, ${il}` : il;
    const segment = document.querySelector('[name="segment"]:checked')?.value || '';
    const segSym = { Ekonomik: '₺', Orta: '₺₺', 'Orta-üst': '₺₺₺', Premium: '₺₺₺₺' }[segment] || '₺₺';

    const card = document.getElementById('wz-preview-card');
    if (!card) return;
    card.innerHTML = `
      <div class="firm-card" style="max-width:320px;margin:0 auto;">
        <div class="firm-card-img wz-preview-placeholder">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        </div>
        <div class="firm-card-body">
          <div class="firm-card-head">
            <h4>${escHtml(ad)}</h4>
            <span class="firm-badge firm-badge--pro">Pro</span>
          </div>
          <p class="firm-card-tagline">${escHtml(tagline)}</p>
          <div class="firm-card-meta">
            <span class="firm-card-loc">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              ${escHtml(lokasyon)}
            </span>
            <span class="firm-card-price">${segSym}</span>
          </div>
        </div>
      </div>`;
  }

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ----------------------------------------------------------
     8. Photo upload
  ---------------------------------------------------------- */
  async function uploadPhotos(files) {
    const urls = [];
    for (const file of files) {
      const ext = file.name.split('.').pop().toLowerCase() || 'jpg';
      const uuid = crypto.randomUUID();
      const path = `${currentUser.id}/${uuid}.${ext}`;
      const { error } = await ER_Supabase.storage
        .from('firma-fotograflari')
        .upload(path, file, { cacheControl: '3600', upsert: false });
      if (!error) {
        const { data } = ER_Supabase.storage
          .from('firma-fotograflari')
          .getPublicUrl(path);
        urls.push(data.publicUrl);
      }
    }
    return urls;
  }

  /* ----------------------------------------------------------
     9. Submit
  ---------------------------------------------------------- */
  async function submitWizard() {
    if (!validateStep(9)) return;

    const nextBtn = document.getElementById('wz-next');
    nextBtn.disabled = true;
    nextBtn.textContent = 'Gönderiliyor...';

    // Photo upload
    const fileInput = document.getElementById('galeri');
    let photoUrls = [];
    if (fileInput && fileInput.files.length > 0) {
      const uploadStatus = document.getElementById('wz-upload-status');
      if (uploadStatus) uploadStatus.hidden = false;
      photoUrls = await uploadPhotos([...fileInput.files]);
      if (uploadStatus) uploadStatus.hidden = true;
    }

    // Collect all data
    const ilceler = [...document.querySelectorAll('input[type="hidden"][name="ilce"]')].map(el => el.value);
    const etkinlikler = [...document.querySelectorAll('[name="etkinlik"]:checked')].map(el => el.value);

    // Hizmete özel dinamik alanları topla
    const dyn = {};
    document.querySelectorAll('#wz-dynamic-fields [data-field]').forEach(el => {
      const key = el.dataset.field;
      if (el.classList.contains('wz-chip-group')) {
        const vals = [...el.querySelectorAll('input:checked')].map(i => i.value);
        if (vals.length) dyn[key] = vals;
      } else if (el.value) {
        // number alanları integer, diğerleri text
        dyn[key] = (el.type === 'number') ? (parseInt(el.value) || null) : el.value;
      }
    });
    // Mutfak (Adım 3, sadece yemek/şef/pasta)
    const mutfaklar = [...document.querySelectorAll('[name="mutfak"]:checked')].map(el => el.value);

    const payload = {
      user_id:     currentUser.id,
      firm_name:   document.getElementById('firma-adi').value.trim(),
      tagline:     document.getElementById('tagline').value.trim(),
      firma_turu:  document.querySelector('[name="firma-turu"]:checked')?.value || null,
      vergi_no:    (document.getElementById('vergi-no')?.value || '').replace(/\D/g,'') || null,
      belgeler:    Object.entries(uploadedBelgeler).map(([tur, b]) => ({ tur, path: b.path, ad: b.ad })),
      belge_durumu: Object.keys(uploadedBelgeler).length ? 'beklemede' : 'yok',
      hizmet:      [document.querySelector('[name="kategori"]:checked')?.value].filter(Boolean),
      city:        document.getElementById('il').value,
      district:    ilceler.join(', '),
      yaricap:     document.querySelector('[name="yaricap"]:checked')?.value || null,
      etkinlik:    etkinlikler,
      description: document.getElementById('tanitim').value.trim(),
      phone:       document.getElementById('telefon').value.trim(),
      email:       document.getElementById('eposta').value.trim(),
      web:         (document.getElementById('web')?.value || '').trim() || null,
      segment:     document.querySelector('[name="segment"]:checked')?.value || null,
      deneyim:     document.getElementById('deneyim').value || null,
      min_kisi:    dyn.min_kisi ?? null,
      max_kisi:    dyn.max_kisi ?? null,
      min_adet:    dyn.min_adet ?? null,
      sure:          dyn.sure || null,
      ekipman_dahil: dyn.ekipman_dahil || null,
      teslim_suresi: dyn.teslim_suresi || null,
      yas_grubu:     dyn.yas_grubu || null,
      ek_hizmetler:  dyn.ek_hizmetler || null,
      proje_tipi:    dyn.proje_tipi || null,
      ozel_diyet:    dyn.ozel_diyet || null,
      mutfak:        mutfaklar.length ? mutfaklar : null,
      paket:       document.querySelector('[name="paket"]:checked')?.value || 'Free',
      photos:      photoUrls,
      status:      'pending',
    };

    const { error } = await ER_Supabase.from('firm_applications').insert(payload);

    if (error) {
      nextBtn.disabled = false;
      nextBtn.textContent = 'Yayınla →';
      const errEl = document.getElementById('wz-submit-error');
      if (errEl) {
        errEl.textContent = 'Gönderim sırasında bir hata oluştu: ' + error.message;
        errEl.hidden = false;
      }
      return;
    }

    localStorage.removeItem(DRAFT_KEY);
    window.location.href = 'tesekkurler.html';
  }

})();
