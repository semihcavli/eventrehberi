-- ============================================================
-- EventRehberi — Supabase Schema & Veri Migrasyonu
-- Supabase Dashboard → SQL Editor'da çalıştır.
-- ============================================================

-- 1. FİRMALAR TABLOSU
CREATE TABLE IF NOT EXISTS public.firms (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  hizmet     TEXT NOT NULL,
  city       TEXT NOT NULL,
  district   TEXT,
  cuisine    TEXT[]  DEFAULT '{}',
  events     TEXT[]  DEFAULT '{}',
  price      INTEGER CHECK (price BETWEEN 1 AND 4),
  min_people INTEGER,
  rating     NUMERIC(3,1),
  reviews    INTEGER DEFAULT 0,
  tagline    TEXT,
  image      TEXT,
  phone      TEXT,
  badge      TEXT,
  featured   BOOLEAN DEFAULT false,
  approved   BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. FİRMA BAŞVURULARI TABLOSU
CREATE TABLE IF NOT EXISTS public.firm_applications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users ON DELETE SET NULL,
  firm_name   TEXT NOT NULL,
  hizmet      TEXT[],
  city        TEXT,
  district    TEXT,
  phone       TEXT,
  email       TEXT,
  description TEXT,
  deneyim     TEXT,
  etkinlik    TEXT[],
  mutfak      TEXT[],
  yaricap     TEXT,
  adres       TEXT,
  vergi       TEXT,
  paket       TEXT DEFAULT 'Free',
  segment     TEXT,
  min_kisi    INTEGER,
  max_kisi    INTEGER,
  web         TEXT,
  status      TEXT DEFAULT 'pending',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 3. ROW LEVEL SECURITY
ALTER TABLE public.firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.firm_applications ENABLE ROW LEVEL SECURITY;

-- Herkes onaylı firmaları okuyabilir
CREATE POLICY "firms_public_read" ON public.firms
  FOR SELECT USING (approved = true);

-- Kullanıcı kendi başvurularını görebilir
CREATE POLICY "applications_owner_select" ON public.firm_applications
  FOR SELECT USING (auth.uid() = user_id);

-- Giriş yapmış kullanıcı başvuru oluşturabilir
CREATE POLICY "applications_owner_insert" ON public.firm_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. VERİ MİGRASYONU — Mevcut 38 firma
INSERT INTO public.firms
  (id, name, hizmet, city, district, cuisine, events, price, min_people, rating, reviews, tagline, image, phone, featured, badge)
VALUES
-- YEMEK CATERİNG
('bogaz-lezzetleri','Boğaz Lezzetleri Catering','yemek','İstanbul','Beşiktaş',ARRAY['turk','osmanli'],ARRAY['dugun','kurumsal','kokteyl'],3,20,4.9,184,'Geleneksel Türk mutfağı · Kurumsal & özel etkinlik','https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80','905321234567',true,'Pro'),
('atolye-mezze','Atölye Mezze','yemek','İstanbul','Kadıköy',ARRAY['akdeniz','turk','ege'],ARRAY['kokteyl','nisan','ozel-davet'],2,15,4.8,126,'Akdeniz & Ege mutfağı · Kokteyl uzmanı','https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80','905335557890',false,NULL),
('la-tavola','La Tavola','yemek','İstanbul','Beyoğlu',ARRAY['italyan'],ARRAY['kokteyl','kurumsal','dugun'],3,20,4.8,92,'İtalyan mutfağı · Kokteyl & davet','https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80','905423334455',true,'Elite'),
('ofis-mutfagi','Ofis Mutfağı','yemek','İstanbul','Şişli',ARRAY['turk','fusion'],ARRAY['ofis-yemegi','kurumsal'],2,30,4.7,342,'Günlük ofis yemeği · Abonelik sistemi','https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80','905326781234',false,NULL),
('yesil-sofra','Yeşil Sofra','yemek','İstanbul','Şişli',ARRAY['vegan','vejetaryen','akdeniz'],ARRAY['kurumsal','dugun','nisan'],3,25,4.8,78,'Vegan & sağlıklı · Özel diyet menüleri','https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80','905445558901',false,'Pro'),
('anadolu-sofrasi','Anadolu Sofrası','yemek','İstanbul','Üsküdar',ARRAY['turk','osmanli','ege'],ARRAY['dugun','nisan','kurumsal'],2,40,4.6,215,'Bölgesel Türk mutfağı · Büyük organizasyonlar','https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&q=80','905534442233',false,NULL),
('sahil-catering','Sahil Catering','yemek','İstanbul','Sarıyer',ARRAY['deniz','akdeniz'],ARRAY['dugun','kokteyl','ozel-davet'],3,20,4.7,88,'Deniz ürünleri uzmanı · Özel gün menüleri','https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=600&q=80','905319876543',false,NULL),
('fusion-tokyo','Tokyo Fusion','yemek','İstanbul','Nişantaşı',ARRAY['japon','fusion'],ARRAY['kurumsal','kokteyl','ozel-davet'],4,15,4.9,56,'Sushi + izgara füzyonu · Premium davet','https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&q=80','905557891234',true,'Elite'),
('ege-sofrasi','Ege Sofrası','yemek','İzmir','Konak',ARRAY['ege','turk','deniz'],ARRAY['dugun','kurumsal','nisan'],3,30,4.8,145,'Ege mutfağı uzmanı · Zeytinyağlı yemekler','https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&q=80','905412223344',false,'Pro'),
('baskent-catering','Başkent Catering','yemek','Ankara','Çankaya',ARRAY['turk','osmanli'],ARRAY['kurumsal','dugun','ofis-yemegi'],3,25,4.7,112,'Kurumsal etkinlik uzmanı · Saat hassasiyeti','https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80','905366542198',false,NULL),
('antalya-gourmet','Antalya Gourmet','yemek','Antalya','Muratpaşa',ARRAY['akdeniz','turk','deniz'],ARRAY['dugun','kokteyl','ozel-davet'],4,50,4.9,87,'Sahil şeridi özel menüler · Açık hava davetleri','https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&q=80','905449871234',true,NULL),
('gazi-mutfak','Gazi Mutfak','yemek','Gaziantep','Şahinbey',ARRAY['turk','lubnan'],ARRAY['dugun','ozel-davet','kurumsal'],2,50,4.9,203,'Gaziantep mutfağı · Kebap & baklava uzmanı','https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80','905337654321',false,'Pro'),
('bursa-kebap','Kestel İskender','yemek','Bursa','Osmangazi',ARRAY['turk'],ARRAY['kurumsal','ofis-yemegi'],2,40,4.7,176,'Klasik Bursa lezzetleri','https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600&q=80','905523456789',false,NULL),
-- BAR & KOKTEYL
('sip-co','Sip & Co. Mobile Bar','bar','İstanbul','Şişli',ARRAY['kokteyl-cuisine'],ARRAY['dugun','kokteyl','kurumsal'],3,30,4.9,64,'Mobil bar · Kokteyl & bartender servisi','https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80','905321119876',true,'Pro'),
('craft-bar','Craft Bar Catering','bar','İstanbul','Kadıköy',ARRAY['kokteyl-cuisine'],ARRAY['kokteyl','nisan','ozel-davet'],3,25,4.7,42,'El yapımı kokteyller · Özel karışımlar','https://images.unsplash.com/photo-1514361892635-6b07e31e75f9?w=600&q=80','905428887766',false,NULL),
('baskent-bar','Başkent Bar Service','bar','Ankara','Çankaya',ARRAY['kokteyl-cuisine'],ARRAY['kurumsal','kokteyl'],2,20,4.6,31,'Profesyonel bartender ekibi','https://images.unsplash.com/photo-1568644396922-5c3bfae12521?w=600&q=80','905534561234',false,NULL),
('bodrum-bar','Bodrum Beach Bar','bar','Muğla','Bodrum',ARRAY['kokteyl-cuisine'],ARRAY['dugun','kokteyl','ozel-davet'],4,50,4.9,58,'Sahil düğünü & tropikal bar','https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&q=80','905447778899',true,'Elite'),
-- ÖZEL ŞEF
('sef-ahmet','Şef Ahmet Karaca','sef','İstanbul','Beşiktaş',ARRAY['fransiz','akdeniz','fusion'],ARRAY['ozel-davet','dugun','kurumsal'],4,8,5.0,23,'Michelin deneyimli private chef','https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&q=80','905551234567',true,'Elite'),
('sef-elif','Şef Elif Demir','sef','İstanbul','Kadıköy',ARRAY['italyan','akdeniz'],ARRAY['ozel-davet','dogum-gunu','nisan'],3,6,4.9,34,'İtalyan ev yemekleri · Evde şef hizmeti','https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=600&q=80','905336665544',false,'Pro'),
('sef-mehmet','Şef Mehmet Can','sef','Ankara','Çankaya',ARRAY['turk','osmanli'],ARRAY['ozel-davet','kurumsal'],3,10,4.8,19,'Osmanlı saray mutfağı uzmanı','https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=600&q=80','905422334455',false,NULL),
('sef-sushi','Şef Kenji Tanaka','sef','İstanbul','Nişantaşı',ARRAY['japon'],ARRAY['ozel-davet','kokteyl'],4,4,5.0,14,'Omakase sushi · Özel seans','https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&q=80','905329988776',false,'Elite'),
-- EKİPMAN KİRALAMA
('event-decor','Event Décor Kiralama','ekipman','İstanbul','Beylikdüzü',ARRAY[]::TEXT[],ARRAY['dugun','nisan','kurumsal'],2,20,4.7,156,'Masa, sandalye, örtü, dekor kiralama','https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80','905448889900',false,NULL),
('gumus-servis','Gümüş Servis','ekipman','İstanbul','Şişli',ARRAY[]::TEXT[],ARRAY['dugun','kurumsal','ozel-davet'],3,30,4.8,89,'Porselen, gümüş, kristal servis takımları','https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=600&q=80','905537777655',false,'Pro'),
('ankara-rental','Ankara Event Rental','ekipman','Ankara','Çankaya',ARRAY[]::TEXT[],ARRAY['dugun','kurumsal'],2,25,4.6,67,'Komple etkinlik ekipmanı · Kurulum dahil','https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80','905324445566',false,NULL),
('izmir-mekan','İzmir Mekân Donanım','ekipman','İzmir','Karşıyaka',ARRAY[]::TEXT[],ARRAY['dugun','nisan','ozel-davet'],3,30,4.7,54,'Açık hava etkinlik ekipmanı · Çadır, ışık, ses','https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80','905559994321',false,NULL),
-- SÜSLEME
('atolye-dekor','Atölye Dekor','susleme','İstanbul','Şişli',ARRAY[]::TEXT[],ARRAY['dugun','nisan','kokteyl'],3,50,4.8,67,'Düğün dekoru, masa süsleme, ışık tasarımı','https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80','905415556677',false,NULL),
('cicek-sepeti','Çiçek Sepeti','susleme','İstanbul','Beşiktaş',ARRAY[]::TEXT[],ARRAY['dugun','nisan','ozel-davet'],2,1,4.9,142,'Mevsim çiçekleri, gelin buketi, nikah çiçeği','https://images.unsplash.com/photo-1561181286-d5c92b400a3e?w=600&q=80','905331112233',false,NULL),
-- DAVETİYE
('mavi-davetiye','Mavi Davetiye','davetiye','İstanbul','Kadıköy',ARRAY[]::TEXT[],ARRAY['dugun','nisan'],2,50,4.7,89,'Klasik baskı + dijital davetiye tasarımı','https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600&q=80','905443334445',false,NULL),
-- ORGANİZATÖR
('hayal-organizasyon','Hayal Organizasyon','organizator','İstanbul','Beşiktaş',ARRAY[]::TEXT[],ARRAY['dugun','nisan','kurumsal'],4,30,4.9,54,'Komple düğün planlama · A''dan Z''ye yönetim','https://images.unsplash.com/photo-1556125574-d7f27ec36a06?w=600&q=80','905556667788',false,'Elite'),
-- DJ
('dj-mert-ocak','DJ Mert Ocak','dj','İstanbul','Beyoğlu',ARRAY[]::TEXT[],ARRAY['dugun','kokteyl','kurumsal','dogum-gunu'],3,50,4.8,76,'DJ + ses sistemi · Düğün ve kokteyl uzmanı','https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&q=80','905327778899',false,'Pro'),
-- FOTO
('studio-frame','Studio Frame','foto','İstanbul','Şişli',ARRAY[]::TEXT[],ARRAY['dugun','nisan','ozel-davet'],3,1,4.9,118,'Düğün fotoğrafçısı + video çekimi','https://images.unsplash.com/photo-1554080353-a576cf803bda?w=600&q=80','905449990011',true,NULL),
-- GARSON
('profesyonel-servis','Profesyonel Servis','garson','İstanbul','Şişli',ARRAY[]::TEXT[],ARRAY['dugun','kurumsal','kokteyl'],2,10,4.7,48,'Tecrübeli garson + barmen kiralama','https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80','905532221100',false,NULL),
('hostes-plus','Hostes Plus','garson','İstanbul','Sarıyer',ARRAY[]::TEXT[],ARRAY['dugun','kurumsal','kokteyl'],3,2,4.8,36,'Davet karşılama, kapı hostesi, protokol','https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80','905419998877',false,NULL),
-- PASTA & TATLI
('butik-pasta','Butik Pasta Evi','pasta','İstanbul','Beşiktaş',ARRAY['pastacilik'],ARRAY['dogum-gunu','dugun','nisan'],3,10,4.9,234,'Özel tasarım pastalar · Cupcake, cake pop','https://images.unsplash.com/photo-1558326567-98ae2405596b?w=600&q=80','905341234567',true,'Pro'),
('madeleine','Pâtisserie Madeleine','pasta','İstanbul','Şişli',ARRAY['fransiz','pastacilik'],ARRAY['dogum-gunu','dugun','ozel-davet'],4,15,4.9,178,'Fransız patisserie · Makaron & mille-feuille','https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80','905458765432',true,'Elite'),
('yesil-pastane','Yeşil Pastane','pasta','İstanbul','Kadıköy',ARRAY['vegan','glutensiz','pastacilik'],ARRAY['dogum-gunu','ozel-davet'],2,8,4.8,97,'Vegan & glutensiz tatlılar','https://images.unsplash.com/photo-1464195244916-405fa0a82545?w=600&q=80','905539876543',false,NULL),
('izmir-pasta','İzmir Pasta Atölyesi','pasta','İzmir','Karşıyaka',ARRAY['pastacilik'],ARRAY['dogum-gunu','dugun'],2,10,4.7,83,'Özel gün pastaları · Butik sunumlar','https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80','905323334444',false,NULL),
('kestane-sekeri','Kestane Şekeri Artizan','pasta','Bursa','Osmangazi',ARRAY['turk','pastacilik'],ARRAY['ozel-davet','kurumsal','dogum-gunu'],2,20,4.8,45,'Geleneksel Bursa tatlıları','https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=600&q=80','905546677889',false,NULL)
ON CONFLICT (id) DO NOTHING;
