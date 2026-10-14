# <Proje adı> — CLAUDE.md

> Projenin **kısa referans** dokümanı. Detaylı kurallar `memory/` altındadır ve **gerektiğinde** okunur — hepsini baştan yükleme.

---

## 🧠 Hafıza sistemi (oturumlar arası süreklilik)

İki komut: **`/devam`** (oturum başı) ve **`/bitir`** (oturum sonu).
`/clear` atıp yeni chat açılsa bile `/devam` nerede kalındığını bilir.

### Dosya rolleri — her birinin TEK bir işi var

| Dosya | Rolü | Ne zaman yazılır | Limit |
|-------|------|------------------|-------|
| `activeContext.md` | **Canlı durum.** Devam noktası + son 3 oturum özeti | Her `/bitir`'de | **200 satır** (sert) |
| `PROGRESS.md` | Yol haritası + faz sicili | Yalnız faz/roadmap değişince | 150 satır |
| `memory/*.md` | **Kalıcı bilgi** — kararlar, protokoller, mimari notlar. Bayatlamaz. | Yeni kalıcı karar çıkınca | dosya başı 150 satır |
| `archive/sessions/<YYYY-MM>.md` | Eski oturum özetleri | Rotasyonda otomatik | sınırsız |
| `docs/` | Analiz/rapor çıktıları | İş üretince | — |

**Altın kural:** Aynı bilgi iki dosyada yaşamaz. Volatil detay yalnız `activeContext.md`'de; kalıcı karar yalnız `memory/`'de.

### Token tasarrufu

`/devam` yalnız `activeContext.md` (≤200 satır) + `PROGRESS.md` aktif faz satırını okur. `memory/` dosyaları **indeksten seçilerek** okunur (`memory/README.md`). `archive/` okuma dışıdır: `.claude/settings.json` içinde `permissions.deny: ["Read(archive/**)"]` (`.claudeignore` Claude Code'un resmî bir özelliği değildir; yalnız not olarak durur).

### Rotasyon (`/bitir` sırasında otomatik)

1. `activeContext.md` içinde **en fazla 3 oturum bloğu**. 4. blok gelince en eskisi `archive/sessions/<YYYY-MM>.md` sonuna taşınır.
2. **200 satırı** aşarsa: bloklar 15 satıra kısaltılır; yetmezse kalıcı bilgi `memory/`'ye taşınır, yerine tek satır pointer kalır.
3. Bir bilgi **üçüncü kez** aynı şekilde tekrar ediyorsa → `memory/`'ye aittir, taşı.
4. `memory/` dosyası 150 satırı aşarsa konuya göre ikiye böl, indeksi güncelle.

Kural ihlali görürsen (ör. activeContext 200+ satır) **önce rotasyonu uygula**, sonra yaz.

---

## 🗂 Proje künyesi

| | |
|---|---|
| **Kod** | `<proje-kökü>` |
| **Yerel URL** | `<yerel-url>` |
| **Veritabanı** | `<motor · port · db adı>` (kimlik bilgisi `.env`'de) |
| **Çalışma zamanı** | `<dil + sürüm>` |
| **Git** | `<uzak depo>` |
| **Sırlar** | `.env` (git'e girmez, ayrı ve özel bir yolla senkronlanır — yeri bu dosyaya yazılmaz) |

**Mimari:** <2-3 cümle: ön yüz, API, veri katmanı, ayrı paneller>.

---

## 🚨 Kesin kurallar

| Kural | Neden |
|-------|-------|
| **Sır koda yazılmaz** — DB/SMTP şifresi, JWT secret, API anahtarı yalnız `.env`'de. Commit öncesi `git status` ile sızıntı kontrolü. | Koda gömülen sır git geçmişinde kalır |
| **Şema değişikliği = migration dosyası** — `db/migrations/<NNN>_<ad>.sql`. Dump ile taşıma yasak. | Birden çok makinede kod yeni / DB eski olmasın |
| **`git add -A` yasak** — dosyalar tek tek eklenir. | `.env` / dump / yedek kazara girmesin |
| **Force push ve `--no-verify` ASLA.** | Geçmiş ve kancalar güvence |
| **Referansı doğrula** — bir dosya yolu / fonksiyon / endpoint adını state dosyasına yazmadan önce Grep/Read ile gerçekte var mı bak. Başka dokümandan kopyalama. | Bayat referans zinciri en sinsi drift kaynağı |
| **Kapsam dışına çıkma** — istenmeyen refactor, "yol üstü temizlik" yok. Fark ettiğin sorunu `activeContext.md`'ye not düş. | Gözden geçirilebilir fark |

---

## 🧭 Yol gösterici dosyalar

| Soru | Nereye bak |
|------|-----------|
| "Nerede kalmıştık?" | `activeContext.md` |
| "Genel plan ne, sırada ne var?" | `PROGRESS.md` |
| "Bu karar neden böyle alınmıştı?" | `memory/kararlar_urun.md` · `memory/kararlar_altyapi.md` |
| "Oturumu nasıl açıp kapatıyoruz?" | `.claude/commands/devam.md` · `.claude/commands/bitir.md` |
