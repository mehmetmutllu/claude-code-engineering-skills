# memory/ — Kalıcı bilgi indeksi

Buradaki bilgiler **bayatlamaz** nitelikte: kararlar, protokoller, sabit ortam bilgisi.
Hızla değişen "şu an ne yapıyoruz" bilgisi buraya **girmez** — o `activeContext.md`'nin işi.

`/devam` bu dosyaların **hepsini okumaz**; aşağıdaki indeksten gerekeni seçer. Dosya başı limit 150 satır.

| Dosya | İçerik | Ne zaman oku |
|-------|--------|--------------|
| `kararlar_urun.md` | Ürün kararları (K1, K2 …) | Ürün/akış kararı alırken |
| `kararlar_altyapi.md` | Teknik kararlar | Mimariye dokunurken |

Karar biçimi: `## K<NN> — <başlık> (<YYYY-MM-DD>)` · karar · neden · (değiştiyse) `[YERİNE: K<NN>]`. Eski karar silinmez.
