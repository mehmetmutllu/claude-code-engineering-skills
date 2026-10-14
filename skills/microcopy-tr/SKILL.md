---
name: microcopy-tr
description: Türkçe UX writing / microcopy — buton, etiket, yardım metni, hata, başarı bildirimi, boş durum, onay penceresi, onboarding, tooltip ve placeholder metinlerini yazar ya da revize eder. Kinneret Yifrah temelli kurallar + Türkçe ton (hitap tutarlılığı) + çok kiracılı (multi-tenant) uyum + pazarlama dili yasağı. Tetikleyiciler — "metin yenile", "microcopy revize", "buton metni öner", "hata mesajı yaz", "bildirim metni", "boş durum", "onboarding metni", "UX writing", "microcopy denetimi". Tarama modu — bir sayfa verildiğinde tüm arayüz metinlerini tek tek tarar, sorunu raporlar, alternatif önerir.
license: MIT
---

# microcopy-tr — Türkçe UX Writing Skill

> **Amaç:** Arayüz metinlerini Türkçe-doğru, ürün bağlamına uygun, samimi-resmi dengede yazmak veya revize etmek. Kinneret Yifrah "Microcopy: The Complete Guide" + Anton & Irene + Mailchimp Voice & Tone temelli.
>
> Örnekler, bu skill'in ilk yazıldığı ürün olan çok kiracılı bir **dershane yönetim sistemi** üzerinden verilir (sınıf, öğretmen, öğrenci, veli). Kendi projende §1'i doldur, kuralların geri kalanı aynen geçerli.

---

## 1. ÜRÜN BAĞLAMI (her projede doldurulur)

### 1.1 Ürün özeti
Bir paragraf: ne yapar, kim kullanır, tek mi çok kiracılı mı.

### 1.2 Paneller / kullanıcı tipleri — hitap ve ton

Her kullanıcı tipinin tonu farklı olabilir; ama **bir panel = tek hitap**.

| Panel (örnek) | Kullanıcı | Hitap | Ton |
|-------|-----------|-------|-----|
| yönetim | Kurum yöneticisi | siz | İş odaklı, eylemsel, açıklayıcı |
| öğretmen | Öğretmen | siz | Mesleki, destekleyici |
| öğrenci | Öğrenci (orta-lise) | siz | Kısa, açıklayıcı; asla çocuksu hitap yok |
| veli | Veli | siz | Saygılı, bilgilendirici, kısa |

> **Zamir + ek kuralı:** "siz" zamirini fiil sonu ekiyle birlikte kullanma. ✅ "ekleyebilirsiniz" / ❌ "siz ekleyebilirsiniz". Saygı yalnız fiil ekiyle ifade edilir; Türkçede doğal-resmi olan budur.
>
> Örnekler: eylem "ekleyin / seçin / girin / kaydedin". Yetenek "ekleyebilirsiniz". Karşılama "Hoş geldiniz". Onay "emin misiniz?". Boş durum "Henüz X eklemediniz".
>
> "sen" hitabı seçilen üründe de aynı mantık geçerli: tek panelde karışık sen/siz olmaz. Aşağıdaki örneklerin bir kısmı "sen" ile yazılmıştır; kendi hitabına çevir.

### 1.3 Sistem terimleri sözlüğü (değiştirme)

Ürünün kendi terimleri tek anlamla kullanılır. Örnek:

| Terim | Anlam | Yanlış kullanım |
|-------|-------|------------------|
| dershane | Kurum | "okul", "şirket", "firma" |
| sınıf | Öğrenci grubu (12-A) | "grup", "şube" |
| ders saati | Başlangıç-bitiş aralığı (08:30-09:15) | "slot", "period" |
| birebir | Bire bir koçluk seansı | "özel ders", "tutoring" |
| yoklama | Devamsızlık kaydı | "katılım", "attendance" |
| duyuru | Kurum içi haber | "bildirim" (bildirim = toast, ayrı şey) |

### 1.4 İngilizce kelime → Türkçe (kullanıcıya görünen metinde)

> **KESİN KURAL:** Kullanıcıya görünen metinde İngilizce kelime kullanılmaz. Kod adları (`toast`, `modal`) kalabilir.

| ❌ İngilizce | ✅ Türkçe |
|-------------|-----------|
| dashboard | ana sayfa / kontrol paneli |
| modal / popup | açılır pencere / uyarı |
| toast | bildirim |
| dropdown | açılır liste |
| button | düğme / buton |
| login / logout | giriş yap / çıkış yap |
| password | şifre |
| email | e-posta |
| settings | ayarlar |
| search | ara / arama |
| filter | filtre |
| save / edit / delete | kaydet / düzenle / sil |
| cancel | iptal et / vazgeç |
| upload / download | yükle / indir |
| user / admin | kullanıcı / yönetici |
| feature / update / sync | özellik / güncelle / eşitle |
| feedback | geri bildirim |

### 1.5 Çok kiracılı (multi-tenant) uyarısı

- Kullanıcının kendi kurumundan söz ederken genel ifade kullan ("kurumunuz"); başka kiracının adı asla geçmez.
- "X kurumu 3 günde kuruldu" gibi pazarlama referansı YASAK.
- Metinler genel: "öğrenciler", "öğretmenler" — özel ad yok.

---

## 2. 10 TEMEL KURAL

### 1. Konuş, yazma
**❌ "Sınıf adı 1-50 karakter olmalıdır."** → **✅ "Sınıf adı 1-50 karakter arasında olabilir."**
Yasak: "olmalıdır", "gerekmektedir", "edilmelidir". Pasif kalıp yerine etken fiil.

### 2. Eylem fiili kullan (buton + bağlantı)
**❌ "Tamam"** → **✅ "Sınıfı Ekle"**, **"Programı Kaydet"**.
Buton 1-3 kelime, eylem fiili. Soyut "Tamam" yalnız bilgilendirici bildirimde.

### 3. Başlık kısa, açıklayıcı
Pencere/sayfa başlığı 2-5 kelime, isim cümlesi ("Yeni Öğrenci Ekle"). Adım başlığı 1-3 kelimelik eylem ("Sınıfları tanımla").

### 4. Açıklama — bilgi + yardım
**❌ "Çok hızlı — 50 öğretmeni 3 dakikada ekle ⚡"** → **✅ "Hazırladığınız Excel dosyasıyla birden fazla öğretmeni tek seferde ekleyebilirsiniz."**
1-2 cümle, neyi neden yaptığını anlatır. Pazarlama dili ve abartı yasak.

### 5. Hata mesajı — sebep + çözüm
**❌ "Hata oluştu."** / **❌ "İşlem başarısız."** → **✅ "Bu sınıf adı zaten var. Farklı bir ad deneyin ya da mevcut sınıfa öğrenci ekleyin."**
Kullanıcı suçlanmaz: "Yanlış girdiniz" yerine "Telefon numarası 10 haneli olabilir, başına 0 yazmayın."

### 6. Boş durum — eylem öner
**❌ "Liste boş."** → **✅ "Henüz öğrenci eklemediniz. İlk öğrenciyi ekleyerek başlayın."** + buton "+ Yeni Öğrenci".

### 7. Başarı bildirimi — eylemi doğrula
**❌ "Başarılı."** → **✅ "12-A sınıfı eklendi."** / **"3 öğretmen Excel'den eklendi."** Ne, kaç tane, hangi adla.

### 8. Tooltip / yardım metni — "neden?" sorusunu cevapla
**❌ "Bu alan zorunlu."** → **✅ "Velinin telefon numarası — acil durumda buradan aranır."**

### 9. Onboarding — adım odaklı, abartısız
**❌ "Tebrikler! Mükemmel bir başlangıç yaptın 🎉"** → **✅ "İlk sınıfı eklediniz. Sıradaki adıma geçin."**

### 10. Kullanıcıyı endişelendirme
**❌ "Bu işlem geri alınamaz!"** → **✅ "Bu sınıfı silmek üzeresiniz. İçindeki 24 öğrenci hangi sınıfa taşınsın?"**
Yıkıcı eylemden önce: ne kaybolacak + alternatif.

---

## 3. METİN TİPİ REHBERİ

### 3.1 Buton (1-3 kelime, eylem fiili)

| Bağlam | ❌ | ✅ |
|--------|---|---|
| Form gönderme | Gönder | Kaydet / Ekle |
| Onay | Tamam / OK | Anladım / Devam Et |
| Vazgeçme | Cancel | İptal / Vazgeç / Geri Dön |
| Yıkıcı | Sil | Sınıfı Sil |
| Atlama | Skip | Atla / Sonra |

Kısa buton = 44 px dokunma hedefine sığar. 5+ kelime → etikete taşı.

### 3.2 Etiket (form alanı)
İsim cümlesi: "Sınıf Adı", "Telefon", "T.C. Kimlik No", "Doğum Tarihi" (buton gibi "Tarih Seç" değil). Zorunlu yıldızı ekran okuyucuya da açıklanır.

### 3.3 Placeholder
Placeholder etiket DEĞİLDİR; örnek girdi gösterir: "Örn. 12-A", "5XX XXX XX XX", "ornek@alanadi.com", "GG.AA.YYYY".

### 3.4 Yardım metni
"Ne?" değil "neden?" odaklı. ❌ "Lütfen geçerli bir e-posta girin." → ✅ "Velinin e-postası — önemli bildirimler buraya gider."

### 3.5 Hata (doğrulama)
Biçim: `<sorun> + <çözüm>`. ❌ "Geçersiz format." → ✅ "Telefon 10 haneli olabilir (5XX XXX XX XX). Başına 0 yazmayın."
Yasak: "Hata!", "Lütfen düzeltin", sebepsiz "İşlem başarısız", suçlayıcı "Yanlış".

### 3.6 Bildirim (başarı / bilgi / uyarı / hata)

| Tip | Biçim | Örnek |
|-----|-------|-------|
| başarı | `<nesne> <eylem-edildi>.` | "12-A sınıfı eklendi." |
| bilgi | `<bilgi>.` | "Excel dosyasından 23 öğretmen yüklendi." |
| uyarı | `<uyarı> + <eylem>.` | "Bu sınıfta 24 öğrenci var. Silmeden önce öğrencileri başka sınıfa taşıyın." |
| hata | `<sorun>. <çözüm>.` | "Excel okunamadı. Dosya .xlsx biçiminde olmalı." |

### 3.7 Boş durum
`<durum>. <ne yapılacak>.` + buton. İllüstrasyon varsa dekoratif (`aria-hidden="true"`).

### 3.8 Onay penceresi
- **Başlık:** eylem-isim ("Sınıfı Sil")
- **Gövde:** ne kaybolacak + alternatif
- **Yıkıcı buton:** kırmızı + spesifik metin ("Evet, Sınıfı Sil")

---

## 4. TÜRKÇEYE ÖZGÜ TUZAKLAR

1. **Bozuk karakter (mojibake):** ç ğ ı ö ş ü — doğrudan Türkçe yaz, kodlamayı UTF-8 kur, "İngilizce yedek" hazırlama.
2. **Uzunluk:** Türkçe metin İngilizceden genelde daha uzundur. "Save Changes" → "Değişiklikleri Kaydet" uzun → "Kaydet".
3. **Gelecek zaman:** "eklenecek", "olacak" güveni azaltır; şimdiki durumu anlat.
4. **Sayı:** "1.234,56" — "1,234.56" yasak.
5. **Tarih:** "02.05.2026" ya da "2 Mayıs 2026" — "MM/DD" yasak.
6. **Saat:** "08:30" (24 saat) — "8:30 AM" yasak.
7. **Hitap tutarlılığı:** bir sayfada karışık sen/siz yok.
8. **Argo/jargon:** "tıkla", "bas" yerine "seçin", "gidin", "düzenleyin".

---

## 5. PAZARLAMA DİLİ KARA LİSTESİ

| Yasak | Sebep | Alternatif |
|-------|-------|------------|
| "süper hızlı" / "anında" | Abartı | sıfatı kaldır; "tek seferde" |
| "muhteşem" / "harika" / "mükemmel" | Aşırı pozitif | kaldır |
| "sadece X dakikada" / "saniyeler içinde" | Tutmayan zaman vaadi | kaldır |
| "tek tıkla" | Abartı | "tek seferde", "birlikte" |
| "tonlarca" / "yüzlerce" | Sayı abartısı | gerçek sayı |
| "binlerce kullanıcı" | Uydurma sosyal kanıt | kaldır |
| "kolayca" / "rahatça" | Ön yargı | kaldır |
| "ekstra" / "bonus" | Pazarlama | kaldır |
| 🚀 ⚡ 🎉 ✨ | Aşırı emoji | kaldır |
| tek başına "!" / "!!!" | Bağırma | nokta |
| "yakında eklenecek" / "çok yakında" | Belirsiz vaat, yarım iş izlenimi | özellik açık değilse adımı gizle ya da somut ve eylemsel yaz |
| "beta" / "MVP" / "alpha" | İç durumu yansıtma | kullanıcıya gösterme |

---

## 6. EMOJI POLİTİKASI

| Emoji | Kullanım |
|-------|----------|
| ✓ ✗ | Durum (tamam/hata) |
| ⚠️ | Uyarı |
| ℹ️ | Bilgi bandı |
| ✨ 🚀 ⚡ 🎉 🔥 | Her yerde yasak |
| 🎯 📊 🏆 (eylem emojisi) | Buton/bağlantıda yasak |
| Bayraklar | Yasak |

Arayüzde ikon için ikon fontu / SVG kullan (`aria-hidden="true"`), emoji değil.

---

## 7. TARAMA MODU (denetim/revize)

### Adım 1 — Envanter
Sayfadaki tüm metni grupla: sayfa başlığı + breadcrumb · başlıklar · etiket + placeholder + yardım · butonlar · tooltip + aria-label · doğrulama hataları · bildirimler · onay pencereleri · boş durumlar · bantlar · onboarding adımları.

### Adım 2 — Kurala karşı kontrol
Her metni 10 kural + metin tipi rehberi + kara liste + Türkçe tuzaklar listesinden geçir.

### Adım 3 — Sorun raporu
```
📍 [konum: dosya:satır veya arayüz öğesi]
❌ Mevcut: "<aynen>"
🚫 Sorun: <hangi kural: kural-1, kural-7 …>
✅ Öneri: "<yeni metin>"
💡 Sebep: <neden bu öneri>
```

### Adım 4 — Bağlam kontrolü
Panel hitabı doğru mu? Sistem terimleri doğru mu? Kiracıdan bağımsız mı?

### Adım 5 — Türkçe kontrolü
Bozuk karakter yok mu? Butona sığıyor mu? Hitap tutarlı mı? Sayı/tarih/saat biçimi doğru mu?

### Adım 6 — Grupla
Öncelik listesi (Kritik / Önemli / Küçük) + grup raporu.

---

## 8. YAZMA MODU (yeni metin)

1. **Bağlamı oku:** hangi panel, sayfa, öğe, kullanıcı tipi?
2. **Niyet:** bilgi mi, eylem mi, onay mı, hata mı?
3. **Tip seç:** buton / etiket / yardım / hata / bildirim / boş durum / pencere / onboarding.
4. **Kuralları uygula.**
5. **3 alternatif üret:** A (kısa) / B (orta) / C (açıklayıcı); önerini belirt.
6. **Sesli oku:** doğal mı, birine söylüyor gibi mi?

---

## 9. ÖRNEK

**İstek:** "Kurulum sihirbazı 4. adım açıklaması: '⚡ Çok hızlı — 50 öğretmeni 3 dakikada ekle'. Düzelt."

```
📍 <kurulum-sihirbazı>:Adım 4 yönlendirme kartı
❌ Mevcut: "⚡ Çok hızlı — 50 öğretmeni 3 dakikada ekle"
🚫 Sorun: kural 4 (pazarlama dili) · kara liste: "çok hızlı", "3 dakikada", ⚡
✅ Öneri:
   A (kısa): "Hazırladığınız Excel dosyasıyla birden fazla öğretmeni birlikte ekleyebilirsiniz."
   B (orta): "Excel dosyanızdaki öğretmenleri bir kerede yükleyin. Şablon dosya bu sayfada."
   C (açıklayıcı): "Öğretmenleri tek tek eklemek yerine hazır Excel şablonunu doldurup tek seferde yükleyebilirsiniz."
💡 Sebep: B önerilir — "şablon" ayrıntısı "nasıl?" sorusunu cevaplar; "birlikte" abartısız. ⚡ yerine yanda dosya ikonu.
```

---

## 10. SKILL NE YAPMAZ

- Pazarlama metni yazmaz (landing hero, slogan, reklam).
- Uzun blog/makale yazmaz.
- Çok dilli çeviri yapmaz (yalnız Türkçe; İngilizce kaynak verilirse Türkçe karşılığını yazar).
- Kullanıcının duygusunu manipüle etmez ("Pişman olmazsınız!").
- Buyurgan ton kullanmaz ("Hemen kaydet!", "Tıkla!").

---

## 11. BİLİNEN SINIRLAR

1. **İngilizce sızıntısı:** sözlükte olmayan kelimeler kaçabilir — sözlüğü projeye göre genişlet.
2. **Görsel bağlam:** skill yalnız metni görür; görsel hiyerarşi ve mikro etkileşim için bir tasarım incelemesi skill'iyle birlikte çağır.
3. **Ton sezgiseldir:** kurallar İngilizce kaynaklı; Türkçe samimi-resmi denge için son kelime insan editöründedir. Skill taslak üretir.
