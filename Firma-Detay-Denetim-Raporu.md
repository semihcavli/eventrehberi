# Firma Detay Sayfası (firma.html) — Denetim Raporu

**Tarih:** 15 Haziran 2026
**Yöntem:** Canlıda 3 farklı hizmet türü test edildi (özel şef, DJ, yemek) + kod incelemesi.

---

## Kök sebep

Sayfa, tek bir demo firma (**Boğaz Lezzetleri**) için **statik** tasarlanmış. Tüm zengin içerik (menü kartları, galeri, 184 yorum, özellik listesi) bu firmaya hardcoded. Diğer gerçek/çeşitli firmalar bu içeriğe sahip olmadığı için sayfa onlarda **yarım/boş** görünüyor.

Kod, gerçek firmalar için Galeri ve Yorumlar sekmelerini gizliyor — ama **menü bölümünü gizlemiyor**, bu yüzden catering firmalarında boş "Henüz paket eklemedin" kutusu kalıyor.

---

## Bulgular (öncelik sırasına göre)

### 🔴 1. Catering firmalarında boş menü bölümü
**Sorun:** `yemek`, `sef`, `pasta`, `bar` hizmetleri "menülü" sayılıyor (`CATERING_HIZMET` listesi). Ama Boğaz Lezzetleri dışındaki firmaların menü verisi yok. Sonuç: Şef Ahmet gibi firmalarda "Menü" sekmesi açık ama içi boş, sağ panelde "Henüz paket eklemedin" yazıyor.
**Etki:** Ziyaretçi yarım/bozuk sayfa görüyor, güven kaybı.
**Test:** Şef Ahmet (sef) → boş menü ✗ | DJ Mert (dj) → doğru "Hizmet Detayları" düzeni ✓ | Boğaz (yemek) → dolu ama statik ✓

### 🟠 2. Özel Şef yanlış grupta
**Sorun:** `sef` `CATERING_HIZMET` listesinde — ama özel şeflerin menü/paket sistemi yok (kişiye özel çalışıyorlar). DJ gibi "Hizmet Detayları" düzenine geçmeleri daha doğru.
**Çözüm:** `sef`'i listeden çıkar → otomatik olarak temiz "Hizmet Detayları + Teklif Formu" düzenini alır (DJ'deki gibi).

### 🟡 3. Footer metni yanlış / eski
**Sorun:** Footer'da "Türkiye'nin **catering** pazaryeri" yazıyor. Ama site 13 kategorili etkinlik platformu (DJ, foto, organizatör…). Marka mesajıyla çelişiyor.
**Çözüm:** "Türkiye'nin etkinlik hizmetleri platformu" gibi güncel metin. (Not: bu yanlış metin başka sayfalarda da olabilir, kontrol edilmeli.)

### 🟡 4. Sekme adı ↔ içerik başlığı uyumsuz
**Sorun:** "Hizmet Detayları" (DJ) veya "Menü" (şef) sekmesinin içindeki başlık her zaman **"Hakkımızda"**. Sekme adıyla içerik başlığı tutarsız.
**Çözüm:** İçerik başlığını sekmeye göre ayarla, ya da "Hakkımızda" başlığını kaldır (zaten Bilgi sekmesi var).

### 🟡 5. Teklif formundaki "menü" dili
**Sorun:** Teklif formu "Seçtiğin menü firmaya iletilir" / "Menüden paket eklediğinde özet burada görünecek" diyor — ama menüsüz firmalarda (şef, DJ) menü diye bir şey yok. Kafa karıştırıcı.
**Çözüm:** Menüsüz firmalarda bu metinleri hizmete uygun hale getir veya gizle.

---

## Önerilen çözüm yolları

**A) Hızlı düzeltmeler (düşük risk, hemen yapılabilir):**
- `sef`'i CATERING_HIZMET'ten çıkar (#2) → menü boşluğu sorunu şef için biter
- Footer metnini düzelt (#3)
- Catering firmalarında menü verisi yoksa, menü bölümünü gizle / "Hizmet Detayları" düzenine düş (#1 kısmi)
- Sekme/başlık uyumunu düzelt (#4)

**B) Kapsamlı (gerçek firmalar için doğru altyapı):**
- Menü/paket sistemini Supabase'de gerçek veriden besle (firma kendi menüsünü girsin)
- Bu, kayıt formuna "menü ekle" adımı + Supabase'de menü tablosu gerektirir
- Uzun vadeli doğru çözüm ama büyük iş

---

## Tavsiyem

**Önce A (hızlı düzeltmeler).** Çünkü bunlar sayfanın "bozuk/yarım" görünmesini hemen ortadan kaldırır ve düşük risklidir. Özellikle **#1 ve #2** kritik — şu an catering firmaları kötü görünüyor. Menü sistemini gerçek veriden beslemek (B) ise site büyüyüp gerçek firmalar gelince, ayrı bir proje olarak ele alınmalı.

> Not: Tüm firmalar şu an placeholder. Gerçek firma akışı netleşince (menüyü kim, nasıl girecek) B planı şekillenir.
