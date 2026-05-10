/* ============================================================
   EventRehberi — Supabase Client
   Supabase SDK'sı (CDN) yoksa dinamik olarak yükler,
   ardından window.ER_Supabase client'ı oluşturur ve
   'er-supabase-ready' custom event'i tetikler.
   ============================================================ */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://mzkbvqdvyyivawqwvosu.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16a2J2cWR2eXlpdmF3cXd2b3N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMjU5NjcsImV4cCI6MjA5MzgwMTk2N30.2PDD6vwhsnUEhzKKq6fNbOHexnNZ3cXyMgUpN2RWKCc';
  var SDK_CDN     = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';

  function init() {
    window.ER_Supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    document.dispatchEvent(new CustomEvent('er-supabase-ready'));
  }

  if (typeof supabase !== 'undefined') {
    init();
  } else {
    var s = document.createElement('script');
    s.src = SDK_CDN;
    s.onload  = init;
    s.onerror = function () { console.error('EventRehberi: Supabase SDK yüklenemedi.'); };
    document.head.appendChild(s);
  }
})();
