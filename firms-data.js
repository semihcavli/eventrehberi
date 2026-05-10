/* ============================================================
   EventRehberi — Shared Firms Data
   ------------------------------------------------------------
   Single source of truth for firm listings used by:
     - catererlar.html (filtreli liste)
     - istanbul-catering.html, ankara-catering.html, ...
     - dugun-catering.html, kurumsal-catering.html, ...

   Public:
     window.CS_FIRMS              — Array of firm objects
     window.CS_FIRMS_HELPERS      — { byCity, byEvent, topRated, renderCard, ... }
   ============================================================ */
(function () {
  'use strict';

  const FIRMS = [
    /* ===== YEMEK CATERING ===== */
    { id:'bogaz-lezzetleri', name:'Boğaz Lezzetleri Catering', hizmet:'yemek', city:'İstanbul', district:'Beşiktaş', cuisine:['turk','osmanli'], events:['dugun','kurumsal','kokteyl'], price:3, minPeople:20, rating:4.9, reviews:184, tagline:'Geleneksel Türk mutfağı · Kurumsal & özel etkinlik', image:'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80', featured:true, badge:'Pro', phone:'905321234567' },
    { id:'atolye-mezze', name:'Atölye Mezze', hizmet:'yemek', city:'İstanbul', district:'Kadıköy', cuisine:['akdeniz','turk','ege'], events:['kokteyl','nisan','ozel-davet'], price:2, minPeople:15, rating:4.8, reviews:126, tagline:'Akdeniz & Ege mutfağı · Kokteyl uzmanı', image:'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80', phone:'905335557890' },
    { id:'la-tavola', name:'La Tavola', hizmet:'yemek', city:'İstanbul', district:'Beyoğlu', cuisine:['italyan'], events:['kokteyl','kurumsal','dugun'], price:3, minPeople:20, rating:4.8, reviews:92, tagline:'İtalyan mutfağı · Kokteyl & davet', image:'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80', featured:true, badge:'Pro', phone:'905423334455' },
    { id:'ofis-mutfagi', name:'Ofis Mutfağı', hizmet:'yemek', city:'İstanbul', district:'Şişli', cuisine:['turk','fusion'], events:['kurumsal'], price:2, minPeople:30, rating:4.7, reviews:342, tagline:'Günlük ofis yemeği · Abonelik sistemi', image:'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80', phone:'905326781234' },
    { id:'yesil-sofra', name:'Yeşil Sofra', hizmet:'yemek', city:'İstanbul', district:'Şişli', cuisine:['vegan','vejetaryen','akdeniz'], events:['kurumsal','dugun','nisan'], price:3, minPeople:25, rating:4.8, reviews:78, tagline:'Vegan & sağlıklı · Özel diyet menüleri', image:'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80', badge:'Pro', phone:'905445558901' },
    { id:'anadolu-sofrasi', name:'Anadolu Sofrası', hizmet:'yemek', city:'İstanbul', district:'Üsküdar', cuisine:['turk','osmanli','ege'], events:['dugun','nisan','kurumsal'], price:2, minPeople:40, rating:4.6, reviews:215, tagline:'Bölgesel Türk mutfağı · Büyük organizasyonlar', image:'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&q=80', phone:'905534442233' },
    { id:'sahil-catering', name:'Sahil Catering', hizmet:'yemek', city:'İstanbul', district:'Sarıyer', cuisine:['deniz','akdeniz'], events:['dugun','kokteyl','ozel-davet'], price:3, minPeople:20, rating:4.7, reviews:88, tagline:'Deniz ürünleri uzmanı · Özel gün menüleri', image:'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=600&q=80', phone:'905319876543' },
    { id:'fusion-tokyo', name:'Tokyo Fusion', hizmet:'yemek', city:'İstanbul', district:'Nişantaşı', cuisine:['japon','fusion'], events:['kurumsal','kokteyl','ozel-davet'], price:4, minPeople:15, rating:4.9, reviews:56, tagline:'Sushi + izgara füzyonu · Premium davet', image:'https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&q=80', badge:'Pro', featured:true, phone:'905557891234' },
    { id:'ege-sofrasi', name:'Ege Sofrası', hizmet:'yemek', city:'İzmir', district:'Konak', cuisine:['ege','turk','deniz'], events:['dugun','kurumsal','nisan'], price:3, minPeople:30, rating:4.8, reviews:145, tagline:'Ege mutfağı uzmanı · Zeytinyağlı yemekler', image:'https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&q=80', badge:'Pro', phone:'905412223344' },
    { id:'baskent-catering', name:'Başkent Catering', hizmet:'yemek', city:'Ankara', district:'Çankaya', cuisine:['turk','osmanli'], events:['kurumsal','dugun'], price:3, minPeople:25, rating:4.7, reviews:112, tagline:'Kurumsal etkinlik uzmanı · Saat hassasiyeti', image:'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', phone:'905366542198' },
    { id:'antalya-gourmet', name:'Antalya Gourmet', hizmet:'yemek', city:'Antalya', district:'Muratpaşa', cuisine:['akdeniz','turk','deniz'], events:['dugun','kokteyl','ozel-davet'], price:4, minPeople:50, rating:4.9, reviews:87, tagline:'Sahil şeridi özel menüler · Açık hava davetleri', image:'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&q=80', featured:true, phone:'905449871234' },
    { id:'gazi-mutfak', name:'Gazi Mutfak', hizmet:'yemek', city:'Gaziantep', district:'Şahinbey', cuisine:['turk','lubnan'], events:['dugun','ozel-davet','kurumsal'], price:2, minPeople:50, rating:4.9, reviews:203, tagline:'Gaziantep mutfağı · Kebap & baklava uzmanı', image:'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80', badge:'Pro', phone:'905337654321' },
    { id:'bursa-kebap', name:'Kestel İskender', hizmet:'yemek', city:'Bursa', district:'Osmangazi', cuisine:['turk'], events:['kurumsal'], price:2, minPeople:40, rating:4.7, reviews:176, tagline:'Klasik Bursa lezzetleri', image:'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600&q=80', phone:'905523456789' },

    /* ===== BAR & KOKTEYL ===== */
    { id:'sip-co', name:'Sip & Co. Mobile Bar', hizmet:'bar', city:'İstanbul', district:'Şişli', cuisine:['kokteyl-cuisine'], events:['dugun','kokteyl','kurumsal'], price:3, minPeople:30, rating:4.9, reviews:64, tagline:'Mobil bar · Kokteyl & bartender servisi', image:'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80', featured:true, badge:'Pro', phone:'905321119876' },
    { id:'craft-bar', name:'Craft Bar Catering', hizmet:'bar', city:'İstanbul', district:'Kadıköy', cuisine:['kokteyl-cuisine'], events:['kokteyl','nisan','ozel-davet'], price:3, minPeople:25, rating:4.7, reviews:42, tagline:'El yapımı kokteyller · Özel karışımlar', image:'https://images.unsplash.com/photo-1514361892635-6b07e31e75f9?w=600&q=80', phone:'905428887766' },
    { id:'baskent-bar', name:'Başkent Bar Service', hizmet:'bar', city:'Ankara', district:'Çankaya', cuisine:['kokteyl-cuisine'], events:['kurumsal','kokteyl'], price:2, minPeople:20, rating:4.6, reviews:31, tagline:'Profesyonel bartender ekibi', image:'https://images.unsplash.com/photo-1568644396922-5c3bfae12521?w=600&q=80', phone:'905534561234' },
    { id:'bodrum-bar', name:'Bodrum Beach Bar', hizmet:'bar', city:'Muğla', district:'Bodrum', cuisine:['kokteyl-cuisine'], events:['dugun','kokteyl','ozel-davet'], price:4, minPeople:50, rating:4.9, reviews:58, tagline:'Sahil düğünü & tropikal bar', image:'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&q=80', featured:true, badge:'Pro', phone:'905447778899' },

    /* ===== ÖZEL ŞEF ===== */
    { id:'sef-ahmet', name:'Şef Ahmet Karaca', hizmet:'sef', city:'İstanbul', district:'Beşiktaş', cuisine:['fransiz','akdeniz','fusion'], events:['ozel-davet','dugun','kurumsal'], price:4, minPeople:8, rating:5.0, reviews:23, tagline:'Michelin deneyimli private chef', image:'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&q=80', featured:true, badge:'Pro', phone:'905551234567' },
    { id:'sef-elif', name:'Şef Elif Demir', hizmet:'sef', city:'İstanbul', district:'Kadıköy', cuisine:['italyan','akdeniz'], events:['ozel-davet','dogum-gunu','nisan'], price:3, minPeople:6, rating:4.9, reviews:34, tagline:'İtalyan ev yemekleri · Evde şef hizmeti', image:'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=600&q=80', badge:'Pro', phone:'905336665544' },
    { id:'sef-mehmet', name:'Şef Mehmet Can', hizmet:'sef', city:'Ankara', district:'Çankaya', cuisine:['turk','osmanli'], events:['ozel-davet','kurumsal'], price:3, minPeople:10, rating:4.8, reviews:19, tagline:'Osmanlı saray mutfağı uzmanı', image:'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=600&q=80', phone:'905422334455' },
    { id:'sef-sushi', name:'Şef Kenji Tanaka', hizmet:'sef', city:'İstanbul', district:'Nişantaşı', cuisine:['japon'], events:['ozel-davet','kokteyl'], price:4, minPeople:4, rating:5.0, reviews:14, tagline:'Omakase sushi · Özel seans', image:'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&q=80', badge:'Pro', phone:'905329988776' },

    /* ===== EKİPMAN KİRALAMA ===== */
    { id:'event-decor', name:'Event Décor Kiralama', hizmet:'ekipman', city:'İstanbul', district:'Beylikdüzü', cuisine:[], events:['dugun','nisan','kurumsal'], price:2, minPeople:20, rating:4.7, reviews:156, tagline:'Masa, sandalye, örtü, dekor kiralama', image:'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80', phone:'905448889900' },
    { id:'gumus-servis', name:'Gümüş Servis', hizmet:'ekipman', city:'İstanbul', district:'Şişli', cuisine:[], events:['dugun','kurumsal','ozel-davet'], price:3, minPeople:30, rating:4.8, reviews:89, tagline:'Porselen, gümüş, kristal servis takımları', image:'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=600&q=80', badge:'Pro', phone:'905537777655' },
    { id:'ankara-rental', name:'Ankara Event Rental', hizmet:'ekipman', city:'Ankara', district:'Çankaya', cuisine:[], events:['dugun','kurumsal'], price:2, minPeople:25, rating:4.6, reviews:67, tagline:'Komple etkinlik ekipmanı · Kurulum dahil', image:'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80', phone:'905324445566' },
    { id:'izmir-mekan', name:'İzmir Mekân Donanım', hizmet:'ekipman', city:'İzmir', district:'Karşıyaka', cuisine:[], events:['dugun','nisan','ozel-davet'], price:3, minPeople:30, rating:4.7, reviews:54, tagline:'Açık hava etkinlik ekipmanı · Çadır, ışık, ses', image:'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80', phone:'905559994321' },



    /* ===== YENI HIZMET KATEGORILERI (susleme, cicek, davetiye, organizator, dj, foto, garson, hostes) ===== */
    { id:"atolye-dekor", name:"Atölye Dekor", hizmet:"susleme", city:"İstanbul", district:"Şişli", cuisine:[], events:["dugun", "nisan", "kokteyl"], price:3, minPeople:50, rating:4.8, reviews:67, tagline:"Düğün dekoru, masa süsleme, ışık tasarımı", image:"https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80", phone:"905415556677" },
    { id:"cicek-sepeti", name:"Çiçek Sepeti", hizmet:"susleme", city:"İstanbul", district:"Beşiktaş", cuisine:[], events:["dugun", "nisan", "ozel-davet"], price:2, minPeople:1, rating:4.9, reviews:142, tagline:"Mevsim çiçekleri, gelin buketi, nikah çiçeği", image:"https://images.unsplash.com/photo-1561181286-d5c92b400a3e?w=600&q=80", phone:"905331112233" },
    { id:"mavi-davetiye", name:"Mavi Davetiye", hizmet:"davetiye", city:"İstanbul", district:"Kadıköy", cuisine:[], events:["dugun", "nisan"], price:2, minPeople:50, rating:4.7, reviews:89, tagline:"Klasik baskı + dijital davetiye tasarımı", image:"https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600&q=80", phone:"905443334445" },
    { id:"hayal-organizasyon", name:"Hayal Organizasyon", hizmet:"organizator", city:"İstanbul", district:"Beşiktaş", cuisine:[], events:["dugun", "nisan", "kurumsal"], price:4, minPeople:30, rating:4.9, reviews:54, tagline:"Komple düğün planlama · A'dan Z'ye yönetim", image:"https://images.unsplash.com/photo-1556125574-d7f27ec36a06?w=600&q=80", badge:"Pro", phone:"905556667788" },
    { id:"dj-mert-ocak", name:"DJ Mert Ocak", hizmet:"dj", city:"İstanbul", district:"Beyoğlu", cuisine:[], events:["dugun", "kokteyl", "kurumsal", "dogum-gunu"], price:3, minPeople:50, rating:4.8, reviews:76, tagline:"DJ + ses sistemi · Düğün ve kokteyl uzmanı", image:"https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&q=80", badge:"Pro", phone:"905327778899" },
    { id:"studio-frame", name:"Studio Frame", hizmet:"foto", city:"İstanbul", district:"Şişli", cuisine:[], events:["dugun", "nisan", "ozel-davet"], price:3, minPeople:1, rating:4.9, reviews:118, tagline:"Düğün fotoğrafçısı + video çekimi", image:"https://images.unsplash.com/photo-1554080353-a576cf803bda?w=600&q=80", featured:true, phone:"905449990011" },
    { id:"profesyonel-servis", name:"Profesyonel Servis", hizmet:"garson", city:"İstanbul", district:"Şişli", cuisine:[], events:["dugun", "kurumsal", "kokteyl"], price:2, minPeople:10, rating:4.7, reviews:48, tagline:"Tecrübeli garson + barmen kiralama", image:"https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80", phone:"905532221100" },
    { id:"hostes-plus", name:"Hostes Plus", hizmet:"garson", city:"İstanbul", district:"Sarıyer", cuisine:[], events:["dugun", "kurumsal", "kokteyl"], price:3, minPeople:2, rating:4.8, reviews:36, tagline:"Davet karşılama, kapı hostesi, protokol", image:"https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80", phone:"905419998877" },

    /* ===== PASTA & TATLI ===== */
    { id:'butik-pasta', name:'Butik Pasta Evi', hizmet:'pasta', city:'İstanbul', district:'Beşiktaş', cuisine:['pastacilik'], events:['dogum-gunu','dugun','nisan'], price:3, minPeople:10, rating:4.9, reviews:234, tagline:'Özel tasarım pastalar · Cupcake, cake pop', image:'https://images.unsplash.com/photo-1558326567-98ae2405596b?w=600&q=80', featured:true, badge:'Pro', phone:'905341234567' },
    { id:'madeleine', name:'Pâtisserie Madeleine', hizmet:'pasta', city:'İstanbul', district:'Şişli', cuisine:['fransiz','pastacilik'], events:['dogum-gunu','dugun','ozel-davet'], price:4, minPeople:15, rating:4.9, reviews:178, tagline:'Fransız patisserie · Makaron & mille-feuille', image:'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80', featured:true, badge:'Pro', phone:'905458765432' },
    { id:'yesil-pastane', name:'Yeşil Pastane', hizmet:'pasta', city:'İstanbul', district:'Kadıköy', cuisine:['vegan','glutensiz','pastacilik'], events:['dogum-gunu','ozel-davet'], price:2, minPeople:8, rating:4.8, reviews:97, tagline:'Vegan & glutensiz tatlılar', image:'https://images.unsplash.com/photo-1464195244916-405fa0a82545?w=600&q=80', phone:'905539876543' },
    { id:'izmir-pasta', name:'İzmir Pasta Atölyesi', hizmet:'pasta', city:'İzmir', district:'Karşıyaka', cuisine:['pastacilik'], events:['dogum-gunu','dugun'], price:2, minPeople:10, rating:4.7, reviews:83, tagline:'Özel gün pastaları · Butik sunumlar', image:'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80', phone:'905323334444' },
    { id:'kestane-sekeri', name:'Kestane Şekeri Artizan', hizmet:'pasta', city:'Bursa', district:'Osmangazi', cuisine:['turk','pastacilik'], events:['ozel-davet','kurumsal','dogum-gunu'], price:2, minPeople:20, rating:4.8, reviews:45, tagline:'Geleneksel Bursa tatlıları', image:'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=600&q=80', phone:'905546677889' },

    /* ===== DJ, MÜZİK & SANATÇI (ekleme) ===== */
    { id:'akustik-ikili-istanbul', name:'Akustik İkili İstanbul', hizmet:'dj', city:'İstanbul', district:'Beşiktaş', cuisine:[], events:['dugun','nisan','kokteyl','ozel-davet'], price:2, minPeople:1, rating:4.8, reviews:62, tagline:'Canlı akustik müzik · Düğün, nişan & kokteyl performansı', image:'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80', badge:'Pro', phone:'905319001122' },
    { id:'saksafonist-emre', name:'Saksafonist Emre', hizmet:'dj', city:'İstanbul', district:'Şişli', cuisine:[], events:['kokteyl','dugun','kurumsal','ozel-davet'], price:2, minPeople:1, rating:4.7, reviews:38, tagline:'Solo saksafon · Kokteyl saatleri & törenler', image:'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80', phone:'905333004455' },

    /* ===== WORKSHOP & ATÖLYE ===== */
    { id:'atelier-renk', name:'Atelier Renk', hizmet:'workshop', city:'İstanbul', district:'Kadıköy', cuisine:[], events:['kurumsal','dogum-gunu','ozel-davet'], price:2, minPeople:5, rating:4.8, reviews:54, tagline:'Resim & seramik atölyesi · Team-building & özel etkinlikler', image:'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80', badge:'Pro', phone:'905446670011' },
    { id:'kokteyl-okulu-istanbul', name:'Kokteyl Okulu İstanbul', hizmet:'workshop', city:'İstanbul', district:'Beyoğlu', cuisine:[], events:['kurumsal','kokteyl','ozel-davet','dogum-gunu'], price:2, minPeople:8, rating:4.9, reviews:87, tagline:'İnteraktif kokteyl yapım workshop\'u · Gruplar için eğlenceli deneyim', image:'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&q=80', featured:true, phone:'905312223344' },
    { id:'mutfak-atelier', name:'Mutfak Atelier', hizmet:'workshop', city:'İstanbul', district:'Nişantaşı', cuisine:[], events:['kurumsal','ozel-davet','dogum-gunu'], price:3, minPeople:6, rating:4.8, reviews:41, tagline:'Butik mutfak deneyimi · Şef eşliğinde pişirme atölyesi', image:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80', phone:'905558889900' },
    { id:'takim-ruhu-workshop', name:'Takım Ruhu', hizmet:'workshop', city:'İstanbul', district:'Şişli', cuisine:[], events:['kurumsal'], price:2, minPeople:10, rating:4.7, reviews:33, tagline:'Kurumsal team-building atölyeleri · Şirket etkinlikleri uzmanı', image:'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80', phone:'905335556677' },
    { id:'taki-tasarim-studio', name:'Takı Tasarım Studio', hizmet:'workshop', city:'İstanbul', district:'Beşiktaş', cuisine:[], events:['dogum-gunu','ozel-davet','kurumsal'], price:2, minPeople:4, rating:4.8, reviews:28, tagline:'Takı & aksesuar tasarım atölyesi · Hen party & doğum günü', image:'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80', phone:'905449991122' },

    /* ===== ÇOCUK ETKİNLİĞİ ===== */
    { id:'animator-can', name:'Animatör Can', hizmet:'cocuk', city:'İstanbul', district:'Kadıköy', cuisine:[], events:['dogum-gunu','ozel-davet'], price:2, minPeople:1, rating:4.9, reviews:143, tagline:'Palyaço & sihirbaz · Unutulmaz doğum günü performansı', image:'https://images.unsplash.com/photo-1536275468855-e3ce5207ff3a?w=600&q=80', featured:true, badge:'Pro', phone:'905321110022' },
    { id:'sisirme-park-kiralama', name:'Şişme Park Kiralama', hizmet:'cocuk', city:'İstanbul', district:'Ümraniye', cuisine:[], events:['dogum-gunu','ozel-davet','kurumsal'], price:2, minPeople:1, rating:4.7, reviews:76, tagline:'Şişme kale & oyun alanı kurulumu · Açık & kapalı mekan', image:'https://images.unsplash.com/photo-1575783970733-1aaedde1db74?w=600&q=80', phone:'905444003344' },
    { id:'yuz-boyama-selin', name:'Yüz Boyama by Selin', hizmet:'cocuk', city:'İstanbul', district:'Şişli', cuisine:[], events:['dogum-gunu','ozel-davet'], price:1, minPeople:1, rating:4.8, reviews:98, tagline:'Profesyonel yüz boyama servisi · Çocuk doğum günü & etkinlikler', image:'https://images.unsplash.com/photo-1551966775-a4ddc8df052b?w=600&q=80', phone:'905536665544' },
    { id:'balon-dunyasi', name:'Balon Dünyası', hizmet:'cocuk', city:'İstanbul', district:'Bakırköy', cuisine:[], events:['dogum-gunu','ozel-davet','kurumsal'], price:2, minPeople:1, rating:4.8, reviews:112, tagline:'Balon dekor & süsleme · Çocuk doğum günü özel tasarımlar', image:'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80', badge:'Pro', phone:'905457778899' },
    { id:'mini-organizasyon', name:'Mini Organizasyon', hizmet:'cocuk', city:'İstanbul', district:'Beşiktaş', cuisine:[], events:['dogum-gunu','ozel-davet'], price:3, minPeople:1, rating:4.9, reviews:65, tagline:'Çocuk doğum günü paket organizatörü · Konseptten kuruluma', image:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', phone:'905312345678' }
  ];

  const PRICE_STR = ['', '₺', '₺₺', '₺₺₺', '₺₺₺₺'];

  function byCity(city) {
    return FIRMS.filter(f => f.city === city);
  }
  function byEvent(eventCode) {
    return FIRMS.filter(f => f.events && f.events.includes(eventCode));
  }
  function byService(hizmet) {
    return FIRMS.filter(f => f.hizmet === hizmet);
  }
  function topRated(arr, n) {
    return [...arr].sort((a, b) => {
      const featuredDelta = (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      if (featuredDelta) return featuredDelta;
      return b.rating - a.rating;
    }).slice(0, n || arr.length);
  }
  function renderCard(f) {
    const badgeHtml = f.badge === 'Pro' ? '<span class="firm-badge firm-badge--pro">Pro</span>' : '';
    const featuredStripe = f.featured ? '<span class="firm-sponsored">Öne çıkan</span>' : '';
    const favPayload = JSON.stringify({
      id: f.id, name: f.name, city: f.city, district: f.district,
      rating: f.rating, reviews: f.reviews, image: f.image,
      tagline: f.tagline, badge: f.badge || '',
      cuisines: f.cuisine || [], events: f.events || [],
      price: f.price, hizmet: f.hizmet
    }).replace(/"/g, '&quot;');
    return `
      <a href="firma.html?id=${f.id}" class="firm-card ${f.featured ? 'firm-card--featured' : ''}">
        <div class="firm-card-img" style="background-image:url('${f.image}')">
          ${featuredStripe}
          <button type="button" class="firm-card-fav" data-fav-toggle data-fav-id="${f.id}" data-fav="${favPayload}" aria-label="Favorilere ekle" aria-pressed="false" title="Favorilere ekle">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
          </button>
          <span class="firm-card-rating">★ ${f.rating.toFixed(1)}</span>
        </div>
        <div class="firm-card-body">
          <div class="firm-card-head">
            <h4>${f.name}</h4>
            ${badgeHtml}
          </div>
          <p class="firm-card-tagline">${f.tagline}</p>
          <div class="firm-card-meta">
            <span class="firm-card-loc">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              ${f.district}, ${f.city}
            </span>
            <span class="firm-card-price">${PRICE_STR[f.price]}</span>
          </div>
          <div class="firm-card-foot">
            <span class="firm-card-reviews">${f.reviews} yorum</span>
            <span class="firm-card-min">Min ${f.minPeople} kişi</span>
          </div>
        </div>
      </a>
    `;
  }

  /* Auto-render: page declares config object, this script fills the grid */
  function renderLandingFirms() {
    const config = window.LANDING_FILTER || {};
    let filtered = FIRMS.slice();
    if (config.city) filtered = filtered.filter(f => f.city === config.city);
    if (config.event) filtered = filtered.filter(f => f.events && f.events.includes(config.event));
    if (config.service) filtered = filtered.filter(f => f.hizmet === config.service);

    // Total count (before limit) — for stats placeholder
    const totalCount = filtered.length;
    const countEl = document.getElementById('landing-firm-count');
    if (countEl) countEl.textContent = totalCount;

    const grid = document.getElementById('landing-firms-grid');
    if (!grid) return;

    const top = topRated(filtered, config.limit || 6);
    if (top.length === 0) {
      grid.innerHTML = `
        <div class="landing-empty">
          <p>Bu kategori için henüz onaylı firma bulunmuyor.</p>
          <a href="catererlar.html" class="btn btn-primary btn-sm">Tüm firmaları gör</a>
        </div>
      `;
    } else {
      grid.innerHTML = top.map(renderCard).join('');
      if (window.CSFavorites) window.CSFavorites.bindButtons(grid);
    }
  }

  // Public exports
  window.CS_FIRMS = FIRMS;
  window.CS_FIRMS_LOADED = Promise.resolve(FIRMS);
  document.dispatchEvent(new CustomEvent('cs-firms-ready'));
  window.CS_FIRMS_HELPERS = {
    byCity, byEvent, byService, topRated, renderCard, PRICE_STR
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderLandingFirms);
  } else {
    renderLandingFirms();
  }
})();
