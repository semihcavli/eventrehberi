# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**EventRehberi** is a vanilla HTML/CSS/JavaScript static site — no build system, no package manager, no test framework. It's a Turkish marketplace for event services (catering, DJ, photographer, decorator, etc.) deployed to Netlify with **Supabase as the auth + data backend**.

**To preview locally:** Open `index.html` in a browser, or run `python -m http.server 8000` and visit `http://localhost:8000`.

**To deploy:** Drag-drop the entire folder to Netlify, or connect the repo for auto-deployment on push.

## Data Architecture

### Hybrid: hardcoded list + Supabase

Currently the site reads firms from **two sources**:

1. **`firms-data.js`** — `window.CS_FIRMS` array, hardcoded 38 firms used by `catererlar.html`, `firma.html`, `karsilastir.html` for fast rendering.
2. **Supabase `firms` table** — same 38 firms migrated via `supabase-schema.sql`, source of truth for any future dynamic features. RLS allows public SELECT where `approved = true`.

The hardcoded list is the active runtime source until full migration. To add a firm short-term, edit `firms-data.js` AND insert into the `firms` table.

Each firm object has:
- `id` — used in URLs, localStorage keys, and comparison params
- `hizmet` — service category: `yemek | bar | sef | pasta | susleme | cicek | davetiye | organizator | dj | foto | garson | hostes | ekipman`
- `events` — array: `dugun | kurumsal | nisan | dogum-gunu | kokteyl | ozel-davet`
- `price` — integer 1–4 (rendered as ₺–₺₺₺₺)
- `city`, `district`, `cuisine`, `rating`, `reviews`, `image`, `tagline`, `badge` (Pro)

### Supabase tables

- **`firms`** — public-facing firm directory (RLS: anon SELECT where approved = true).
- **`firm_applications`** — submissions from `kayit.html` wizard. Columns: `firm_name, hizmet, city, district, phone, email, description, deneyim, etkinlik, mutfak, yaricap, adres, vergi, paket, segment, min_kisi, max_kisi, web, photos, status, user_id`. RLS: only the owning user can SELECT or INSERT their own rows.

### Storage bucket

- **`firma-fotograflari`** — public-read bucket for firm photos uploaded during the kayit wizard. Authenticated users INSERT, public SELECT.

### Cross-page utilities (localStorage-backed)

Four JS modules expose global APIs. All state persists in localStorage.

**`supabase-client.js` → `window.ER_Supabase`**
- Loads the Supabase JS SDK from CDN if absent, then creates the client and dispatches `er-supabase-ready` on `document`.
- All other auth/data code waits for this event.

**`compare.js` → `window.ER_Compare`**
- `add(id)`, `remove(id)`, `toggle(firm)`, `list()`, `clear()`
- Max 4 firms at once (`ER_Compare.MAX = 4`), sticky bottom bar, syncs across tabs via `storage` event

**`favorites.js` → `window.CSFavorites`**
- `add(firm)`, `remove(id)`, `toggle(firm)`
- Scoped per Supabase user ID (falls back to `'anon'` when logged out)

**`auth-nav.js`** — listens for Supabase auth state changes; swaps navbar between "Giriş Yap" link and user avatar + dropdown (Hesabım, Firmanı kaydet, Çıkış yap)

**`cookie-consent.js` → `window.CSConsent`**
- `get()`, `has(category)` — KVKK-compliant, 12-month expiry, dispatches `cs-consent-changed` event

## Key Pages

| Page | Purpose |
|------|---------|
| `catererlar.html` | Filterable firm list — tabs by `hizmet`, city/price/rating dropdowns |
| `firma.html` | Single firm detail template |
| `karsilastir.html` | Side-by-side comparison; reads `?firms=id1,id2,id3` from URL |
| `giris.html` / `uye-ol.html` | Supabase auth login/signup (email + Google OAuth) |
| `hesabim.html` | User dashboard (hidden until logged in) |
| `kayit.html` | Firm registration wizard — writes to Supabase `firm_applications` |
| `istanbul-catering.html`, `dugun-catering.html`, … | Pre-filtered city/event pages for SEO |

## Styling

Single stylesheet: `styles.css` (~2500 lines). CSS variables in `:root` control global design tokens:
- `--color-accent: #1F4D33` — change this one variable to retheme the entire site
- `--color-text`, `--color-bg-alt`, `--font-family` (Inter, Google Fonts)

## Auth & Backend

**Supabase** — powers email/password login, Google OAuth, password reset, and data persistence.
- Client: `window.ER_Supabase` (auto-instantiated by `supabase-client.js`)
- Wait for `er-supabase-ready` event before calling auth methods
- Auth: `ER_Supabase.auth.signInWithPassword(...)`, `signInWithOAuth({ provider: 'google' })`, `signOut()`, `getUser()`, `onAuthStateChange(...)`
- Data: `ER_Supabase.from('firms').select(...)`, `ER_Supabase.from('firm_applications').insert(...)`
- Storage: `ER_Supabase.storage.from('firma-fotograflari').upload(...)`

Project URL and anon key live in `supabase-client.js` (anon key is safe in client code; RLS policies enforce access).

## Important Constraints

- **Adding a firm to live site**: insert into both `firms-data.js` (active runtime) and Supabase `firms` table (future-proof) until full migration.
- **Turkish law**: KVKK consent and legal pages (`kvkk.html`, `gizlilik.html`, `cerez-politikasi.html`) are legally required for Turkish users — do not remove them.
- **Google Analytics** ID `G-ZZH1F3D61N` is embedded in every page `<head>`.
