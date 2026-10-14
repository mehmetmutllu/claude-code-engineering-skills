---
description: Çok geliştiricili depoda oturumu kaydet — yalnız kendi state dosyanı yaz, sert bütçeleri uygula, test tarifini kullanıcı diliyle ekle, "edildi" yazmadan mühürle, kendi dalına push edip PR aç.
---

<!-- EN: Session-end command for a shared repo. Writes only `state/<code>/`, enforces hard line budgets with monthly archive index lines, appends a user-language test recipe, seals plan lines without ever self-marking "tested", then rebase → per-file add → commit "Session <seal>" → push own branch → PR. Never force-push, never --no-verify, never push to main. -->

`CLAUDE.md` § Oturum bitişi protokolünü **sırayla** yürüt. Adım atlama.

0. **Ön koşul — iş bitişi yapıldı mı?** Kendi ölçümün bitti, test verisi başlangıç hâline döndü, test tarifi kullanıcıya verildi ve kullanıcı notları ya çözüldü ya plana yazıldı. Yapılmadıysa önce onu yap; oturum kaydı test devrini **beklemez**, test devri oturum kaydını bekler.

1. `state/<kod>/activeContext.md`: DEVAM NOKTASI'nı **sıradaki oturuma göre** yaz + yeni `## 🔄 OTURUM <mühür>` bloğu ekle (mühür: `M12`, `H5`, ortak iş `M12+H5`).
   - **Rolling-3:** 4. blok `archive/sessions/<YYYY-MM>/`'ye taşınır.
   - **Arşiv izi ayda TEK satır:** `> 📦 Arşiv — 2026-09: M10-M24 → archive/sessions/2026-09/` — yeni satır ekleme, o ayın aralığını genişlet.
   - "Son güncelleme" satırı max 500 karakter; zincirleme "Önceki:..." yasak.
   - ⚠️ SSOT plan bu oturumda revize edildiyse DEVAM NOKTASI planın **nihai hâlinden sonra** yazılır.
   - ⚠️ Bir faz kapandıysa o fazın DEVAM NOKTASI alt-blokları da `archive/eski-fazlar/`'a iner.
   - ⚠️ **Sert bütçe:** dosya ≤ 400 satır · DEVAM NOKTASI ≤ 60 · tek oturum bloğu ≤ 40. Aşan kısım **silinmez, arşive taşınır**. Budamadan kapatma.

2. `plans/kontrol/<kod>.md`'ye kullanıcı-dili blok ekle (`## <mühür> — GG.AA.YYYY · başlık` → `### Yapıldı` → `### Kontrol edin`: adım + menü yolu + beklenen sonuç). **Teknik jargon yasak** — dosya/tablo/fonksiyon/SQL adı geçemez. Tarifi **elle yürütmeden yazma**.

3. Plan kırılımında `▶` kaldır; bitti ise `✅` + mühür `(M12)` + `· test: hazır` (ya da kendi tarayıcı testinle `· test: ajan doğruladı`).
   ⛔ `edildi` **yazma** — yalnız kullanıcı onayından türetilir.

4. `PROGRESS.md` / `DEVAM_PROMPT.md` **yalnız içerikleri değiştiyse**. `PROGRESS.md` ortak dosyadır: aynı anda iki taraf yazmaz.

5. Plan `## DURUM`'una yalnız `✅ <ÖNEK>-F<n> TAMAM (<mühür>)` **ekle**. `SIRADAKI: X` yazma. Faz kimliği plan öneki taşır (çıplak `F3` yasak).

6. Bu oturumda state'e **yeni yazılan** dosya/fonksiyon referanslarını Grep/Read ile doğrula. Yeni ikiz varsa `context/ikiz-sicil.md`'ye işle. Yeni plan açtıysan `plans/SICIL.md`'ye satırını **aynı commit'te** ekle.

7. Git: `git pull --rebase` → `git status --short` → sır taraması (`.env`, `config*`, `*.key`, `*secret*` görürsen DUR) → dosyaları **tek tek** `add` (`add -A` yok) → `commit "Oturum <mühür>: <başlık>"` → **kendi dalına** push → PR aç (CI yeşil olmadan merge yok).
   ⛔ `--no-verify` asla · force push asla · `main`'e doğrudan push asla (pre-push kapısı zaten reddeder). Diğer geliştirici aynı anda kaydediyorsa kısa bir "kaydediyorum" mesajı yeter.

8. Değişen yüzeyler raporu (görsel değişen ekranlar + hangi genişlikte; yalnız arka uç/doküman olanlar; geri alma komutu `git revert <hash>`) + 2 satırlık bitiş mesajı:
   `✅ Oturum <mühür> kaydedildi + dalına pushlandı (PR #<n>)` / `Yeni sohbette /clear → /devam-ekip`.
