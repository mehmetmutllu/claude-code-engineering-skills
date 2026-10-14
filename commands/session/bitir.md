---
description: Oturumu kaydet — activeContext güncelle, rotasyonu uygula, referansları doğrula, güvenlik taraması, commit + push
---

# /bitir — Oturum bitiş protokolü

Bu oturumda yapılanı kalıcılaştır ve uzak depoya gönder. Sıra **önemli** — commit en son.

## 1. `activeContext.md` güncelle (ANA YAZIM)

**a)** `## 🎯 DEVAM NOKTASI` bölümünü **sıradaki oturuma göre** yeniden yaz. Geçmişi anlatma; *"bir sonraki oturum ne yapacak"*ı yaz. Somut ol: dosya adı, fonksiyon, hangi karar bekliyor.
Bu oturumda plan revize edildiyse devam noktası planın **nihai hâlinden sonra** yazılır.

**b)** En üste yeni oturum bloğu ekle:

```markdown
## 🔄 OTURUM <N> (<YYYY-MM-DD>) — <kısa başlık>

- <ne yapıldı, madde madde — en fazla 15 satır>
- <kanıt: test sayıları, ekran görüntüsü adları — "yapıldı" bir sayıyla desteklenir>
- <migration eklendiyse: "Migration: 00X_ad.sql ✅ yerelde uygulandı">
- <kod değişmediyse açıkça yaz: "Kod değişikliği YOK">
```

Numara, dosyadaki en son bloktan devam eder.

**c) ROTASYONU UYGULA** (şişmeyi önleyen kısım — atlanırsa dosya kontrolden çıkar):

1. Blok sayısı **3'ü** aşıyorsa → en eski bloğu `archive/sessions/<YYYY-MM>.md` sonuna **taşı** (kopyalama, taşı).
2. Dosya **200 satırı** aşıyorsa → blokları 15 satıra kısalt. Hâlâ aşıyorsa kalıcı bilgiyi `memory/` altına taşı, yerine tek satır pointer bırak: `→ detay: memory/<dosya>.md`.
3. Bir bilgi **3. kez** aynı şekilde tekrarlanıyorsa → kalıcıdır, `memory/`'ye taşı.
4. "Son güncelleme" satırı tek satırdır; "Önceki: … Önceki: …" zinciri yasak.
5. Kontrol: `wc -l activeContext.md` — 200'ün altında olmalı.

## 2. `PROGRESS.md` — yalnız değiştiyse

Faz bitti / roadmap değişti / yeni faz açıldıysa güncelle. **Değişmediyse dokunma.**
Aktif faz satırına **volatil detay yazma** (sayaç, sıradaki alt-iş kimliği). Yalnız *faz adı + nereye bakılacağı*. Volatil olan `activeContext.md`'nin işi — iki yerde yaşarsa biri bayatlar.

Plan dosyalarının durum günlüğüne yalnız **ekleme** yap: `✅ <faz> TAMAM (Oturum N)`. "SIRADAKİ: X" gibi elle çevrilmesi gereken bir işaretçi yazma.

## 3. `memory/` — yeni kalıcı karar çıktıysa

Bir **kural / mimari karar / "bir daha şöyle yapmayalım"** çıktıysa ilgili karar dosyasına ekle (ör. `memory/kararlar_urun.md`, `memory/kararlar_altyapi.md`). Biçim: tarih · karar · neden (≤12 satır). Eski karar silinmez, `[YERİNE: K-NN]` diye işaretlenir.
Dosya 150 satırı aşarsa konuya göre böl ve `memory/README.md` indeksini güncelle.

## 4. Referans doğrulama

Bu oturumda state dosyalarına **yeni yazdığın** dosya yolu / fonksiyon adı / endpoint adlarını Grep veya Read ile doğrula. Tüm dosyayı yeniden tarama, yalnız yeni yazdıklarını. Başka bir dokümandan kopyalanmış referans doğrulanmadan yazılmaz.
Mantık iki yerde yaşıyorsa (sunucu + istemci doğrulaması gibi) ve yeni bir ikiz çıktıysa ikiz siciline işle.

## 5. Doğrulama (yalnız değişen alan için)

Değişen alanın testlerini koş, sayıyı oturum bloğuna yaz (ör. `e2e 34/0`). Koşulamadıysa açıkça yaz ("UI testi koşulmadı — sebep"). Kırmızı test varken oturumu "bitti" diye kapatma; ya düzelt ya bilinen hata olarak kaydet.

## 6. Git commit + push

**a) Güvenlik taraması — commit'ten ÖNCE, zorunlu:**

```bash
git status --short
git diff --cached | grep -nIE "(sk-[A-Za-z0-9]{20,}|AIza[0-9A-Za-z_-]{30,}|gh[opsu]_[A-Za-z0-9]{30,}|BEGIN [A-Z ]*PRIVATE KEY)" | head
```

Şunlardan biri görünüyorsa **DUR**, kullanıcıya sor:
`.env` · `config.local.*` · `*secret*` · `*.key` / `*.keystore` / `*.jks` · `backups/` · `*.sql` dump'ları · 1 MB üstü ikili dosya · ikinci komutun herhangi bir çıktısı.
Gizli dosyaların senkronlandığı yerin adı/yolu proje dosyalarına yazılmaz.

**b) Dosyaları TEK TEK ekle.** `git add -A` **yasak**.

**c) Commit (HEREDOC ile):**

```
Oturum <N>: <başlık>

- <madde>
- <madde>

<attribution satırları>
```

**d) Push** (kendi dalına; korunan dala doğrudan push gerekiyorsa önce sor).
- Pre-commit hook patlarsa → **DUR**, sebebini çöz. `--no-verify` **ASLA**.
- Push reddedilirse → `git pull --rebase` öner, kullanıcı onaylasın. Force push **ASLA**.
- Remote yoksa push'u atla ve söyle; remote'u onaysız kurma.

## 7. Gizli dosya senkronu (koşullu)

Bu oturumda git dışındaki gizli bir dosya (`.env` vb.) değiştiyse kullanıcıya senkron prosedürünü **hatırlat**. Kendin çalıştırma.

## 8. Bitiş mesajı

Önce değişiklik defteri: kullanıcının göreceği her değişiklik (ekran, metin, davranış, varsayılan ayar) madde madde. Sonra 2 satır:

```
✅ Oturum <N> kaydedildi + pushlandı (commit <hash>)
Yeni chat'te: /clear → /devam
```
