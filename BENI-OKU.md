# EventRehberi — Başlangıç Rehberi

Selam Semih! Buraya senin için hazırladığım sitenin tüm dosyaları var. Bu rehber sana:

1. **Siteyi bilgisayarında nasıl göreceğini**
2. **Dosyaların ne işe yaradığını**
3. **Siteyi eventrehberi.com adresinde nasıl yayına alacağını**
4. **Sonraki adımların neler olabileceğini**

anlatacak. Hiç teknik bilgi gerektirmeden ilerleyebilirsin — sadece adımları takip et.

---

## 1. Siteyi bilgisayarında önizle

Tek yapman gereken **`index.html`** dosyasına çift tıklamak. Varsayılan tarayıcın (Chrome, Safari, Edge vb.) açılacak ve sitenin ana sayfasını göreceksin. Oradan firmalar listesine, bir firma profiline, kayıt sayfasına tıklayarak dolaşabilirsin.

Çalışmıyorsa: dosyaya sağ tık → "Birlikte aç" → Chrome'u seç.

---

## 2. Klasörde ne var?

```
eventrehberi/
├── index.html          → Ana sayfa
├── catererlar.html     → Tüm firmalar listesi (arama + filtre)
├── firma.html          → Bir firma profili (örnek şablon)
├── kayit.html          → Catering firmalarının başvuru formu
├── fiyatlar.html       → Firma paketleri (FREE / PRO / ELITE)
├── hakkimizda.html     → Hakkımızda + İletişim sayfası
├── giris.html          → Kullanıcı girişi (gerçek auth)
├── uye-ol.html         → Yeni üyelik (gerçek auth)
├── hesabim.html        → Üye hesap paneli
├── tesekkurler.html    → Form sonrası teşekkür sayfası
├── styles.css          → Tüm sitenin görsel stili (renkler, yazı tipi, vs.)
├── auth-nav.js         → Navbar'ın üye giriş durumuna göre değişmesi
└── BENI-OKU.md         → Bu dosya
```

Her `.html` dosyası bir sayfa. Tümü aynı `styles.css` dosyasını kullanıyor — yani renkleri bir yerden değiştirince tüm sitede değişiyor.

---

## 3. Siteyi eventrehberi.com'da yayına al

Sen domain'i GoDaddy'den aldın ama **sadece domain bir site yayına almaya yetmez**. Sana iki şey lazım:

- **Domain:** `eventrehberi.com` — ✅ bu sende var
- **Hosting:** Yani dosyaların barındırılacağı bir sunucu — henüz yok

İki seçeneğin var. **İkincisini öneriyorum** (daha kolay ve ücretsiz).

### Seçenek A — GoDaddy'den hosting satın al

1. GoDaddy hesabına giriş yap
2. "Web Hosting" bölümünden en ucuz paketi al (aylık ~₺100 civarı)
3. Satın alma sonrası sana bir **cPanel** hesabı verilir
4. cPanel → "File Manager" → `public_html` klasörüne gir
5. Bu klasördeki dosyalarımı (`index.html`, `catererlar.html`, `firma.html`, `kayit.html`, `hakkimizda.html`, `styles.css`) hepsini sürükle-bırak yükle
6. Tarayıcıda `eventrehberi.com` yaz → sitem gelir

### Seçenek B — Netlify ile ücretsiz yayına al (önerilen)

Netlify, siteleri ücretsiz barındıran profesyonel bir servis. Sürükle-bırak ile yükleyebilirsin:

1. **Dosyaları hazırla:** `eventrehberi` klasörünü açık tut
2. [netlify.com](https://www.netlify.com) adresine git → ücretsiz hesap aç (e-posta ile)
3. Giriş yaptıktan sonra "Sites" sayfasında aşağı kaydır → **"Drag and drop your site output folder here"** yazan kutuyu göreceksin
4. `eventrehberi` klasörünü olduğu gibi bu kutuya sürükle bırak
5. 30 saniye içinde `xxxx-yyyy.netlify.app` şeklinde ücretsiz bir adres verecek — sitem yayında!
6. Kendi domain'ini bağlamak için:
   - Netlify'da site ayarları → "Domain management" → "Add custom domain" → `eventrehberi.com` yaz
   - Netlify sana DNS kayıtları verecek (A kaydı ve CNAME kaydı)
   - GoDaddy hesabına gir → Domains → eventrehberi.com → DNS → bu kayıtları ekle
   - 1-24 saat içinde `eventrehberi.com` yazınca Netlify'daki siten açılır
7. Netlify otomatik olarak ücretsiz HTTPS sertifikası da ekler (yani adres `https://` ile güvenli olur)

**Neden Netlify?** GoDaddy hosting aylık ₺100+ iken Netlify ücretsiz, üstelik daha hızlı. GoDaddy'yi sadece domain için kullanıyorsun, bu normal bir durum.

### Form e-postalarını alabilmek için

Şu an formlar (teklif al, başvuru, iletişim) sadece "Gönderildi!" uyarısı gösteriyor — henüz sana mesaj gelmiyor. Yayına aldıktan sonra:

- Netlify kullanıyorsan: Her form'un `<form>` etiketine `netlify` özelliği ekleyince Netlify formları otomatik yakalayıp e-postanıza iletir. (Bunu birlikte 1 dakikada ekleriz.)
- Alternatif: [Formspree.io](https://formspree.io) (ücretsiz, 50 mesaj/ay)

---

## 3½. Üyelik sistemini aktif et (Netlify Identity)

Sitedeki **Giriş Yap**, **Üye Ol** ve **Hesabım** sayfaları artık **gerçek** bir üyelik sistemine bağlı. Çalışması için Netlify panelinden **Identity** özelliğini açman gerekiyor. **Ücretsiz** — 1000 kullanıcıya kadar hiç para ödemiyorsun.

### Adım adım Identity aktivasyonu

1. [app.netlify.com](https://app.netlify.com) → sitene gir
2. Üst menüden **"Site configuration"** (eskiden "Site settings")
3. Sol menüden **"Identity"** bul → **"Enable Identity"** tuşuna bas
4. Açıldıktan sonra "Identity" sayfasında aşağı kaydır:
   - **Registration preferences** → **"Open"** (herkes üye olabilsin) ya da **"Invite only"** (sadece senin davet ettiklerin)
     - Sen şimdilik **"Open"** seç — müşteriler kendi üye olsun
   - **External providers** (opsiyonel) → **"Add provider"** → **"Google"** ekle
     - Google ile tek tıkta giriş/üyelik için. İstemiyorsan bu adımı atla; sitedeki Google butonu yine görünüyor ama sadece Google ekliysen çalışacak
   - **Emails** → isteğe göre **"Edit template"** ile hoşgeldin/doğrulama e-postalarını Türkçeleştirebilirsin (ben sana yardımcı olurum)
5. **"Save"** bas — bitti!

### Test et

1. Sitende **"Üye Ol"** butonuna bas
2. E-posta + şifre gir → **"Üye Ol"**
3. E-postana doğrulama linki gelmeli (spam'e de bak)
4. Linke tıkla → doğrulandı
5. **"Giriş Yap"** sayfasından aynı bilgilerle giriş yap
6. Navbar'da ismin + "Hesabım" menüsü görünmeli

### Kullanıcıları yönet

Netlify panelinde **"Identity"** → **"Users"** sekmesinden:
- Kimler üye olmuş görebilirsin (e-posta, kayıt tarihi, son giriş)
- Birini silebilir/banlayabilirsin
- CSV olarak tüm listeyi indirebilirsin

### Şifre sıfırlama

Giriş sayfasındaki "Şifreni mi unuttun?" linki otomatik çalışıyor — Netlify kullanıcıya sıfırlama e-postası gönderir.

---

## 4. Sonraki adımlar — yol haritası

Şu anda elinde güzel bir **vitrin sitesi + prototip** var. Bu yeterli mi, yoksa daha mı ileri gidelim?

### Faz 1 — Hemen yapabilecekleri (şu an yaptıklarımız)
- ✅ Profesyonel, modern bir site
- ✅ Catering firmalarının başvuru formu (e-postaya gelir)
- ✅ Müşterilerin teklif isteme formu
- ✅ İletişim formu

Bu halde siteyi yayına alıp:
- Instagram'dan / LinkedIn'den duyur
- Tanıdığın catering firmalarına başvuru linkini gönder
- Başvurular geldikçe firmaları `firma.html` şablonundaki gibi tek tek ekleyelim (ben sana yardım ederim)

### Faz 2 — Büyüdüğünde yapılacaklar (daha sonra)
- Firmaların **kendi kendine kayıt olup profilini düzenleyebildiği** bir panel
- Gerçek **arama ve filtreleme** (veritabanı bağlı)
- **Online sipariş ve ödeme** sistemi
- Mobil uygulama

Bu adım geldiğinde bir yazılımcıyla çalışman ya da WordPress'e geçmen gerekecek. Ama önce **gerçek müşteri ve firma var mı, ilgi görüyor mu?** onu ölçmek için Faz 1 yeterli.

---

## 5. Değiştirmek istediklerin

Şu an sitede:
- Logo sadece `cs` yazılı yeşil bir kare — istersen bunu değiştirebiliriz
- Ana renk **koyu yeşil** (#1F4D33) — beğenmediysen değiştirebiliriz
- Örnek firma isimleri (Boğaz Lezzetleri, Atölye Mezze, vb.) — istediğin gibi değiştiririz
- Metinler, sayfa sayıları, kategoriler — hepsi değiştirilebilir

**Nasıl değiştireceğiz:** Sen bana "şu sayfada şu metin şöyle olsun" dersen, ben ilgili dosyada değişikliği yaparım, sen sadece dosyayı yeniden yüklersin.

---

## 6. Aklındaki soruyu yaz

Herhangi bir adımda takılırsan, "anlamadım"/"şu kısım nasıl"/"şunu yapabilir miyiz" diye sormaktan çekinme. Beraber kuruyoruz :)

**Bir sonraki adımda ne yapmak istersin?**

1. Siteyi önce yayına alalım (Netlify ile)
2. Önce bazı metinleri/renkleri değiştirelim
3. Logo tasarlayalım
4. Firmaların gerçek fotoğraflarını eklemeye başlayalım
5. Başka bir şey

Sen söyle.
