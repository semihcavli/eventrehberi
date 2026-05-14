-- ==========================================================================
-- EventRehberi — Supabase Setup
-- Supabase SQL Editor'da çalıştır:
--   https://supabase.com/dashboard/project/mzkbvqdvyyivawqwvosu/sql
-- ==========================================================================

-- --------------------------------------------------------------------------
-- 1. profiles tablosu (role yönetimi)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role    TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles: own read"   ON public.profiles;
DROP POLICY IF EXISTS "profiles: own insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles: own update" ON public.profiles;

CREATE POLICY "profiles: own read"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles: own insert"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles: own update"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- --------------------------------------------------------------------------
-- 2. Admin atamaları (user_id ile)
-- --------------------------------------------------------------------------
-- semihcavli@gmail.com
INSERT INTO public.profiles (id, role)
VALUES ('b79dd123-9df3-499b-a9ea-1f99d50059ae', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- info@eventrehberi.com (email üzerinden bul)
INSERT INTO public.profiles (id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'info@eventrehberi.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- --------------------------------------------------------------------------
-- 3. firm_applications tablosu — admin RLS politikası
-- --------------------------------------------------------------------------
DROP POLICY IF EXISTS "firm_applications: admin select all" ON public.firm_applications;

-- Admin tüm başvuruları görebilir (sadece kendi başvurusu değil)
CREATE POLICY "firm_applications: admin select all"
  ON public.firm_applications FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- --------------------------------------------------------------------------
-- 4. firms tablosu — admin RLS politikaları
-- --------------------------------------------------------------------------
DROP POLICY IF EXISTS "firms: admin select all" ON public.firms;
DROP POLICY IF EXISTS "firms: admin update"     ON public.firms;

-- Admin tüm firmaları görebilir (onaylanmamışlar dahil)
CREATE POLICY "firms: admin select all"
  ON public.firms FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin approved alanını güncelleyebilir
CREATE POLICY "firms: admin update"
  ON public.firms FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- --------------------------------------------------------------------------
-- 4. contact_requests tablosu
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_requests (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad         TEXT NOT NULL,
  email      TEXT NOT NULL,
  konu       TEXT,
  mesaj      TEXT NOT NULL,
  okundu     BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contact_requests: anon insert"  ON public.contact_requests;
DROP POLICY IF EXISTS "contact_requests: admin select" ON public.contact_requests;
DROP POLICY IF EXISTS "contact_requests: admin update" ON public.contact_requests;

-- Herkes (anonim dahil) destek talebi gönderebilir
CREATE POLICY "contact_requests: anon insert"
  ON public.contact_requests FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- role = 'admin' olan herkes okuyabilir (belirli user_id'ye bağlı değil)
CREATE POLICY "contact_requests: admin select"
  ON public.contact_requests FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- role = 'admin' olan herkes okundu alanını güncelleyebilir
CREATE POLICY "contact_requests: admin update"
  ON public.contact_requests FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
