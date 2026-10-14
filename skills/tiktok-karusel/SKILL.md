---
name: tiktok-karusel
description: Bir dil öğrenme uygulaması için TikTok fotoğraf karuseli (slayt postu) planlama, metin yazma ve görsel üretme kuralları — kapak/hook dili, iç slayt tipleri, güvenli alan, AI kokan yazım yasakları, açıklama metni, teslim kontrol listesi. TikTok postu, karusel, slayt, hook, haftalık post planı istendiğinde kullan.
---

# TikTok karuseli

İngilizce kelime öğreten bir mobil uygulamanın TikTok hesabı için yazıldı; `<uygulama>` yerine kendi ürün adını koy. Genel sosyal medya kuralları için kurulu bir sosyal içerik skill'i varsa (karusel çerçeveleri bölümü) onunla birlikte kullan.

## Görsel dil

Gözlem: Türkçe karusellerde uygulama ekranıyla açılan postlar en düşük performanslılar arasındaydı; başarılı uygulama hesapları uygulamayı her slaytta göstermiyor. Telefon maketi "reklam gibi" duruyor.

- **Kapak:** telefonsuz büyük yazı (`kapak`).
- **İç slaytlar DÜZ YAZI, telefon/uygulama ekranı YOK:** `kelime` (kelime + Türkçe okunuş + anlam + seviye + örnek cümle kartı), `soru` (çoktan seçmeli, cevap sonraki slaytta), `yd` (❌/✅ düzeltme), `liste`.
- **Son slayt:** `cta` = üstte tek sakin cümle + büyük ikon + uygulama adı + yan yana eşit yükseklikte resmi mağaza rozetleri. "İndir" deme.
- **Zemin A/B testi:** her biçim iki zemine (ör. renkli / düz koyu + hafif gren) eşit dağıtılır; kazanan ölçümle seçilir — seçmek yerine ölç. Yazının arkasına düşen ışık efekti ve süs etiketler ("B1", "Doğru!" çipleri) kullanılmaz.
- Üretim bir plan dosyası (JSON) + render betiğiyle yapılır; okunuşlar elle yazılır (otomatik okunuşa güvenme).
- Açıklamada cümle kaynağı numarası verilecekse `#` işaretsiz yazılır (TikTok `#304386`'yı hashtag sayar).
- Marka kuralları projenin marka dokümanında; rakip adı/rengi kullanılmaz.

## Hook dili

- Kapakta kısa soru ya da düz "bilmelisin" iddiası; en fazla 7 kelime, fiil/soru eki sonda, "sen" zamiri yazılmaz, en fazla 1 emoji.
- KULLANMA: "Kaç tanesini biliyorsun? / Hepsini bildin mi?" (Türkçe karusellerde sürekli düşük), koşullu seviye iddiası ("…anlayabildiysen B1'sin"), "Part 3 / #2" seri numarası, kurgu sahne, skor slaytı.
- Seviye adı (B1) tek başına kapak olmaz; soru ya da görevle birlikte.

## Ölçü ve güvenli alan

1080×1920. TikTok arayüzü alt ~%20'yi, sağ ~140 px'i ve üst ~%10'u kaplar; başlık ve içerik bu alanların dışında kalır.
Başlık en fazla 2 satır, 3–7 kelime; 1080 px genişlikte en az ~64 px.

## Metin kuralları

- **Slayt 1 tek başına akışı durdurmalı** (küçük resim o). Somut ol: tek sayı, belirli kelime, belirli durum. Spesifik, zekiceden iyidir.
- Kapakta verilen sayı birebir tutulur ("5 kelime" diyorsan 5 kelime).
- Hook tipleri: meydan okuma/seviye ("B1 seviyesindeysen bu 5 kelimeyi bilmelisin"), soru ("Hesitate ne demek?"), boşluk doldurma, düzeltme (❌/✅).
- Ürünü anlatan hook yazma ("Uygulamamızla…" tipi kapaklar çok düşük kalıyor).
- Uygulama adı yalnız son slaytta ve açıklamada. Tek CTA. Premium vurgusu yok.
- **AI kokan yazım yasak (Türkçede de):** "X değil, Y" kalıbı; kendi sorup kendi cevaplama ("Sonuç mu? …"); iki noktayla ifşa; uzun tire (—); her cümle ayrı satır; "Ne düşünüyorsunuz?" türü etkileşim yemi; emoji madde işareti; "seviyeni bir üst lige taşı" gibi kalıp sözler.
- İngilizce içerik doğru olmalı; emin olunmayan dil bilgisi iddiası, uydurma "sınavda çıktı" iddiası yazılmaz.
- Türkçe çeviride hedef kelime tek parça görünür ve vurgulanır.

## Yapılar (5–7 slayt)

- **Seviye testi (value-stack):** kapakta sayı vaadi → her slaytta bir kelime kartı → CTA.
- **❌/✅ Düzeltme (hack list):** kapak "Bunu böyle deme" → her slaytta bir hata ve doğrusu → özet → CTA.
- **Demo:** kapak sonuç → "4 adımda ezberle" özeti → her adımda gerçek ekran → sonuç + CTA.
- **Test et:** kapak soru → `soru` slaytı (şıklar) → cevap slaytı → CTA. Yorum getirir.

## Açıklama metni

İlk cümlede arama kelimesi ("İngilizce kelime", "B1 İngilizce"), gerçek bir soru, en fazla 5 hashtag, "beğen" deme. Lisanslı bir cümle kaynağı kullanıldıysa sonda atıf satırı.

## Ses

Ticari kullanım: ses TikTok'un **"Ticari sesler"** kitaplığından seçilir. Her post için bir öneri yaz.

## Kontrol listesi (teslimden önce)

- [ ] Slayt 1 tek başına akışı durdurur mu?
- [ ] İç slaytlar düz yazı, telefon maketi yok; okunuş yazılı
- [ ] Güvenli alan ihlali yok, Türkçe karakterler doğru
- [ ] Yasak kalıplardan hiçbiri yok
- [ ] Tek CTA, sayı vaadi tutuyor
- [ ] Onaya giden önizleme panosu telefonda okunur boyda (≤1600 px yükseklik), seçenekler yan yana
