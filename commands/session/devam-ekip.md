---
description: Çok geliştiricili depoda oturuma kaldığı yerden devam et — hostname ile geliştiriciyi bul, kendi state/<kod>/ dosyasını oku, sıradaki işi SSOT plandan türet, rapor ver ve onay bekle.
---

<!-- EN: Session-start command for a repo shared by two or more developers. Identifies the developer from `hostname`, syncs git, reads only that developer's `state/<code>/activeContext.md`, cross-checks "next" against the SSOT plan, reports and waits. Read-only except the ▶ marker. -->

`CLAUDE.md` § Oturum başlangıcı protokolünü **sırayla** yürüt:

1. **Makine senkronu (state okumadan ÖNCE):** `hostname` çalıştır, `context/makineler.md` tablosuna bak → makineyi ve **geliştiriciyi** bul. Tabloda yoksa **kullanıcıya sor**, tahmin etme (klasör ipuçları iki makinede de doğru çıkabilir — aldatıcıdır). Bulunan geliştirici kodu `<kod>` olarak kullanılır.
   Git: `git fetch`; geride + temiz ise `git pull --ff-only` ve tek satır rapor (kaç commit geldi). Kirli / ileride / ayrık ise **DUR** ve kullanıcıya göster — otomatik rebase/reset/stash yok. State dosyaları **pull'dan sonra** okunur.

2. **Oku (bu sırayla):**
   - `state/<kod>/activeContext.md` → § DEVAM NOKTASI + son oturum blokları
   - `PROGRESS.md` → aktif faz + Faz Sicili
   - `plans/notlar.md` → **AÇIK** notlar
   - `plans/istekler.md` → sana yönelik **AÇIK** istekler (diğer geliştiriciden)
   - Gerekirse `DEVAM_PROMPT.md` (portlar, erişim)
   ⛔ Karşı tarafın `state/<diğer-kod>/` dosyasını okuman gerekirse oku ama **asla yazma**.

3. **Cross-check:** "Sıradaki iş"in sahibi ilgili SSOT plandaki sıra + `## DURUM` günlüğüdür. `state/<kod>/activeContext.md` onu yalnız **tekrarlar**. Türetme betiği varsa (`tools/durum.php` / state nöbetçisi) onu koş. İkisi çelişiyorsa **DUR**, çelişkiyi kullanıcıya göster, tahminle ilerleme.

4. **Kısa durum raporu ver ve onay al.** Rapor: nerede kaldık · sıradaki iş · açık kullanıcı notları · sana gelen istekler · varsa çelişki uyarısı. Onay gelmeden koda dokunma.

5. Onay gelince: ilgili plandaki oturum satırının başına `▶` koy, **kendi dalında** (`<kod>/<plan-slug>/<kisa-ad>`) çalışmaya başla.

⛔ Bu komut **hiçbir dosyayı değiştirmez** (5. adımdaki `▶` hariç). Okuma ve raporlama komutudur.
