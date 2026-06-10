/* ============================================================
   EventRehberi — API Guard
   Origin kontrolü + basit rate-limit (spam/abuse koruması)
   ============================================================ */

// Bellek içi rate-limit (her IP için son istekler)
const hits = new Map();
const WINDOW_MS = 60 * 1000;   // 1 dakikalık pencere
const MAX_HITS  = 5;           // dakikada en fazla 5 istek / IP

// İzin verilen origin'ler (kendi siten)
const ALLOWED = [
  'https://eventrehberi.com',
  'https://www.eventrehberi.com',
  'https://eventrehberi.vercel.app',
];

function checkOrigin(req) {
  const origin = req.headers.origin || '';
  const referer = req.headers.referer || '';
  // Origin varsa onu kontrol et; yoksa (form POST) referer'a bak
  if (origin) return ALLOWED.includes(origin);
  if (referer) return ALLOWED.some(a => referer.startsWith(a));
  return false;
}

function checkRate(req) {
  const ip = (req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim();
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter(t => now - t < WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  // Eski IP'leri temizle (bellek şişmesin)
  if (hits.size > 5000) hits.clear();
  return arr.length <= MAX_HITS;
}

// Guard: izin yoksa true döner (handler durmalı), izin varsa false
function blocked(req, res, { requireOrigin = true } = {}) {
  if (requireOrigin && !checkOrigin(req)) {
    res.status(403).json({ hata: 'İzin verilmeyen kaynak.' });
    return true;
  }
  if (!checkRate(req)) {
    res.status(429).json({ hata: 'Çok fazla istek. Lütfen biraz bekleyin.' });
    return true;
  }
  return false;
}

module.exports = { blocked };
