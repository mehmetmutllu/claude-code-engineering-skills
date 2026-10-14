---
description: Commit + push (kullanıcı onaylı). Asla kendiliğinden deploy tetiklemez.
---

## Ön koşul

`/test` yeşil bitmiş olmalı. Değilse "Önce /test çalıştır" de ve dur.

## 1. Durum tespiti

```bash
git status --porcelain
git diff --stat
git log --oneline -5
git branch --show-current
```

Kısaca özetle: "X dosya değişmiş, Y eklenmiş; dal `<ad>`."

## 2. Commit mesajı önerisi

```
<emir-kipi-fiil>: <kısa özet> (≤70 karakter)

<isteğe bağlı — neden, hangi alt faz, hangi bayrak>

Phase: <N>.<x>
```

Örnekler:
- `add: payment 3DS init endpoint + sandbox config (Phase 4.2)`
- `fix: cart drawer total recompute on qty change (Phase 0 regression)`
- `refactor: move product array → ProductRepo (Phase 1.6)`

Öneriyi göster, **onay iste**, gerekirse düzelt.

## 3. Stage + commit

- `git add -A` ile her şeyi stage etme; **dosya dosya** ekle: `git add <dosya1> <dosya2> ...`
- Yerel yapılandırma (`config.local.*`, `.env`), `logs/`, `uploads/`, yedekler **asla** stage edilmez — `.gitignore`'da olsalar bile kontrol et.
- Commit HEREDOC ile; sonuna projenin attribution satırları.

## 4. Push (onaydan sonra)

- Özellik dalındaysan (`feat/*`) → `git push -u origin <dal>` → PR öner.
- `develop` / `main` üzerindeysen → "Doğrudan push güvenli mi? PR açmayı öneririm" diye uyar.
- Push kullanıcının izniyle. Asla `--force`. Asla `--no-verify`.

## 5. Push sonrası

- Özellik dalı → `gh pr create --base <hedef-dal> --fill` öner.
- CI'ın deploy tetiklediği dallar için kullanıcıya ne olacağını söyle (ör. "staging 1-2 dk içinde güncellenir; prod onay kapısı Actions'ta"). Onay kapısını kendin geçme.

## 6. Sonraki adım

Sor: "Aynı oturumda devam mı, yoksa `/bitir`?"
