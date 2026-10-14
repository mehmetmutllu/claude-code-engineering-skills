---
name: measure-decide-apply
description: Sayıya dayanan bir değişikliği (denge, performans, eşik, yerleşim) önce varyant olarak ölç, tek karar paketiyle kullanıcıya seçtir, sonra yalnız seçilen kolu uygula — iki commit sırasıyla kilitli. Denge/ekonomi/config sayısı değiştirilecekken veya "A mı B mi" çatalında kullan.
---

<!-- EN: Turn-card workflow for number-driven changes: open a turn card, measure every option as a variant (short runs while developing, full runs only for baseline and final), commit the measurement with an empty decision section, ask once with a decision package, implement only the chosen arm with a mutation-verified guard, commit again. A script checks commit order. -->

# measure-decide-apply — Ölç → sor → uygula (varyant kapısı)

**Kural:** Sayı dosyalarına (ör. `config/economy.config.ts`, `tick.ts`, `rules.ts` — projede hangileri ise) dokunan bir değişiklik, raporun **§Bulgular** tablosunda o kolun **sayı satırı** olmadan yapılmaz. Seçenekler koda değil **varyanta** yazılır.

## 0. Başla
Okuma seti ≤ 15 KB (durum kartı + ilerleme + proje özeti). Tek mesaj: *şu an · sıradaki · açık sorular* → onay.

## 1. Tur kartını aç (`activeContext.md`, üzerine yazılır, ≤ 80 satır)
```
SORU: <kullanıcının cümlesi>
ÖLÇÜLECEK KOLLAR: A … · B … · C …
SAYILAR: (boş)
KARAR: (boş)
UYGULAMA: (boş)
BEKÇİ: (boş)
```

## 2. Ölç
1. **Kısa koşu** ile aracı doğrula (`OLCUM=kisa`, < 60 sn): bot yürüdü mü? varyant etkili mi (varyantlı/varyantsız ilk karelerin parmak izi farklı mı)? korunum 0 mı? Bu damgalar geçmeden sayı **ölçüm değildir**.
2. **Tam koşu TABAN** (`OLCUM=tam`).
3. Bütün kollar **varyant** olarak tam koşu → rapor `docs/<konu>-raporu-<faz>.md` §Bulgular.
4. **Commit #1:** araç + ham çıktı + rapor — **§Karar bölümü BOŞ**.

Rapora yalnız **tam koşu damgalı** sayı girer.

## 3. Karar paketi (oturumun TEK karar turu)
| Kol | Sayı | Takas | Öneri |
|---|---|---|---|
| A | … | … | |
| B | … | … | ✓ |

Sade dil, her kol üründen somut bir örnekle. Öneri "en az iş" değil **"en kaliteli"**. Görsel bir farksa kolların bitmiş hâlini aynı karede render et (6-12 aday), tabloyu karenin altına koy. Kullanıcı "sen mantıklı olanı yap" derse = önerilen kol; tekrar sorma. Cevabı yeniden oku: "ama", "şöyle olsun" gibi ekler kolun yeni tanımıdır.

## 4. Uygula
1. Kod **yalnız seçilen kola**.
2. Bekçi testi yaz.
3. **En az 2 mutasyonla** doğrula: her mutasyon kapatılan kusurlardan birini geri getirir; bekçi kırmızı yanmazsa "KAÇTI". Kaçan mutasyonda önce **koda** bak (belirsizlikte sessizce seçim yapan kural, hiç test edilmemiş yazma yolu, ölü koşul çıkabilir).
4. **Final tam koşu** → rapor §Karar ve etki.
5. **Commit #2:** kod + test + rapor tamam + karar kaydı (`decisions.md`, ≤ 12 satır: karar cümlesi + belirleyici 1-2 sayı + gerekçe + rapor linki; sayı tablosu KOPYALANMAZ).

## 5. Kapat
- Sıra kilidi: `npm run sira` (ya da projedeki eşdeğeri) — denge dosyasına dokunan ilk commit'ten önce ölçüm commit'i yoksa çıkış 1. İhlal varsa kullanıcıya söyle ve nedenini karar defterine yaz; **sessizce geçme**. Araç sırayı denetler, sayıyı değil: işaret ettiği raporda o kolun sayı satırı var mı elle bak.
- İlerleme dosyasına **1-2 satır**: `✅ <tur> — <tek cümle> · D-0xx · docs/<rapor>.md · test <n>`.
- Tur kartını "sonraki tur" olarak üzerine yaz.

## Kesilmez
Bekçi testi · en az 2 mutasyon · finalde tam koşu. Hız bunlardan çıkarılmaz; kısa koşu, sıra kilidi ve tek-yer belgeleme hız kaynağıdır.

## Soru turu en fazla 2
Başlangıç onayı + karar paketi. Arada çıkan soru pakete bekler; sığmayan "sonraki oturumda sor" diye karta yazılır. Yalnız kod yapısını/veri şemasını etkileyen teknik çatallar **sorulmaz**: en iyisini seç, gerekçesini ve elenen kolları karar defterine yaz.
