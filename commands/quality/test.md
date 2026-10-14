---
description: Aktif fazın test + inceleme zincirini çalıştır — faz türüne göre lint, e2e ve ilgili inceleme skill'leri
---

## 1. Aktif fazı tespit et

`PROGRESS.md`'den "Aktif faz" satırını oku. Faz türüne göre zinciri seç:

| Faz konusu | Zincir |
|---|---|
| DB / repository / migration | lint → duman e2e (ana sayfalar) → güvenlik denetimi |
| Kimlik doğrulama / hesap | lint → auth e2e → güvenlik denetimi (rate-limit + oturum) |
| Sepet / ödeme akışı | lint → ilgili e2e (sandbox kartlarla) → güvenlik denetimi (ödeme bölümü) |
| UI / sayfa değişikliği | çoklu viewport e2e → tasarım incelemesi → `browser-verified-review` |
| Türkçe arayüz metni | `microcopy-tr` |
| Yönetim paneli | lint → admin e2e → güvenlik denetimi (yetki) |
| Yayın öncesi cila | hepsi: lint → tam e2e → güvenlik → tasarım incelemesi |

Tablodaki "güvenlik denetimi" ve "tasarım incelemesi" projede kurulu olan skill'lerle yapılır.

## 2. Lint (her zaman önce, yalnız değişen dosyalar)

```bash
fail=0
for f in $(git diff --name-only --diff-filter=AM HEAD 2>/dev/null | grep '\.php$'); do
  php -l "$f" || fail=1
done
[ $fail -eq 0 ] && echo "✅ lint temiz" || { echo "❌ lint hatası"; exit 1; }
```

Git ya da HEAD yoksa tüm dosyaları lint et.

## 3. E2E (Playwright)

```bash
[ -d tests/e2e ] || echo "⏭️ e2e henüz kurulmadı"
npx playwright test --project=mobile-390 --project=desktop-1440
```

Kırmızı varsa kök nedeni bul; testi gevşeterek "yeşile boyama" yapma.

## 4. Skill çağrıları

Tablodaki uygun skill'i çağır. Çıktının **özetini** kullanıcıya ver — tam çıktıyı `activeContext.md`'ye yazma.

## 5. Rapor

```
🧪 Test raporu — Faz <N>.<x>

Lint:        ✅ / ❌
E2E:         <X>/<Y> geçti (mobil + masaüstü)
Skill <ad>:  <bulgu sayısı>: <ciddiyet>
             <ilk 3 bulgu özeti>

Genel sonuç: ✅ ship'e hazır  /  ⚠️ N sorun önce düzeltilmeli  /  ❌ ship etme
```

## 6. Sonraki adım önerisi

- Hepsi yeşil → "`/ship` ile commit edelim mi?"
- Sorun var → "Şu sırayla düzeltelim: … Onay?"
- Derleme bozuk → geri alma önerisi (hangi commit, hangi komut).
