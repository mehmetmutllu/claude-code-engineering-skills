---
description: Otonom mod — kullanıcı yokken state dosyalarını oku, sıradaki güvenli adımı kendin seç, küçük adımlarla test ederek ilerle; push yok
---

Otonom (hands-off) mod: kullanıcı uyuyor ya da başka işle meşgul. **Onay isteme**, sıradaki en mantıklı adımı kendin seç ve uygula. Aşağıdaki kurallar pazarlık konusu değil.

## 1. Soğuk başlangıç — dosyaları paralel oku (tek mesaj)

- `PROGRESS.md` → aktif faz + bitenler + sıradaki iş listesi
- `activeContext.md` → DEVAM NOKTASI + son oturum blokları
- Karar kaydı (`memory/kararlar_*.md` veya `decisions.md`) → özellikle son kararlar
- `CLAUDE.md` → proje sözleşmesi (tutarsızlık kontrolü için)

Aktif faz güvenlik açısından hassassa (auth, ödeme, yönetim, kişisel veri) `docs/SECURITY.md`; UI ise test dokümanı.

## 2. Plan — kendin seç

1. **Önce blocker'ları kapat.** `activeContext.md`'de "açık konu / blocker" olarak not düşülmüş, çözülebilir olanları çöz.
2. **Sonra sıradaki iş listesinin ilk maddesi.** Birden çok seçenek varsa: (a) riski düşük, (b) 30-90 dk'lık, (c) test edilebilir olanı seç.
3. **Dış servis ya da gerçek kimlik bilgisi gerektiren işleri ATLA:** canlı ödeme çağrısı, gerçek e-posta gönderimi, DNS, prod deploy. Bunlar elle onay ister.
4. **Projenin bağımlılık politikası izin vermiyorsa yeni paket kurma.**
5. **Veri silme YOK:** `--reset`, `DROP TABLE`, kullanıcı verisi silme. Yedek yoksa geri dönüş de yok.
6. **`.claude/settings.json` ve izin ayarlarını kendin düzenleme.**
7. **Aktif faz biterse** `PROGRESS.md`'deki sırayla sonraki faza geç.

## 3. Uygula — küçük adımlar, her özellikte test

Her özellikten sonra:
1. Değişen dosyalarda lint.
2. **Yalnız ilgili e2e spec'i** koş (tam regresyon commit serisinin sonunda).
3. **Test yeşilse commit** (dosyalar tek tek). Kırmızıysa **commit etme**, kök nedeni bul.
4. **Push YAPMA.** Push kullanıcıya bırakılır.

## 4. Bekleme stratejisi

Uzun test arka planda koşuyorsa: arka plan görevi olarak başlat, bildirimi bekle (sleep / polling yok), bu arada bağımsız iş yap (sonraki adımın hazırlığı, doküman). Bittiğinde sonucu `activeContext.md`'ye işle.

## 5. Çevrim sonu — roll-up

3-5 adım bitince:
- `PROGRESS.md`'de tamamlananları işaretle; aktif faz değiştiyse satırı güncelle.
- `activeContext.md`'ye oturum bloğu ekle, `/bitir` rotasyon kurallarını uygula.
- Yeni mimari karar varsa karar kaydına ekle.
- Doküman roll-up commit'i.

## 6. Bağlam dolmaya başlarsa

State dosyaları zaten güncel olduğu için soğuk başlangıç riski düşük. Yine de uzun log/JSON çıktılarından kaçın (`tail -3` ile sınırla).

## 7. Hata yakalama

- Test kırmızı → kök nedeni bul, **gizleme**. Düzeltemezsen commit'i atla, `activeContext.md`'ye blocker notu düş.
- Harness bir aracı reddederse → not düş, başka yol bul; reddedileni zorlama.
- Kimlik bilgisi / sandbox gerektiren iş → atla, "açık konu" olarak kaydet.

## 8. Kısa başlangıç raporu

Kod yazmadan önce yalnız şunu söyle (≤80 kelime), sonra hemen başla:
- **Son durum:** son commit + son test sonucu (tek cümle)
- **Sıradaki adım:** seçtiğin alt faz + neden (tek cümle)
- **Risk notu:** varsa açık konu
