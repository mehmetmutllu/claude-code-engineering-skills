---
name: yt-planner
description: >-
  Cold Records yayın takvimi ve konu planı: hangi hafta hangi uzun video,
  Shorts hangi gün, sıradaki konular hangi sırayla. Konu adaylarını rakip
  izlenme araştırmasıyla puanlar, kullanıcının konu değişikliklerini plana
  işler. "takvim", "plan", "ne zaman yayınlayalım", "yayın sıklığı", "sıradaki
  konu", "konuyu değiştirmek istiyorum", "content plan", "schedule" dendiğinde kullan.
---

# yt-planner

Plan tek bir dosyada yaşar: `memory-bank/plan.md`. Bu skill o dosyayı okur, günceller ve kullanıcıya
**önümüzdeki 4 haftayı** gösterir. Yayınlamaz; yayın Chrome üzerinden ya da API betiğiyle, kullanıcı
onayıyla yapılır.

## Okunacaklar (bu sırayla, yalnızca gerekenler)
1. `memory-bank/plan.md`: mevcut takvim ve sabit ritim
2. `memory-bank/stats.md`: son denetimin bulguları (`/yt-audit` yazar). 14 günden eskiyse planı
   değiştirmeden önce kullanıcıya denetim öner.
3. `memory-bank/ideas.md`: konu havuzu
4. `memory-bank/progress.md`: hangi video üretimde, hangisi hazır

## Sabit ritim (kanal kuralı; değişirse `decisions.md` dosyasına yaz)
- **Haftada 1 uzun video.** YouTube'un "inauthentic content" politikası ve üretim kalitesi nedeniyle
  bundan fazlası yok (`projectBrief.md`).
- **Uzun video günü sabittir:** Cuma 20:00 TR (ABD doğu yakasında 13:00). Sabit gün, aboneye ve algoritmaya düzen sinyali verir.
- **Shorts günde bir çıkar (kullanıcı kararı, 2026-10-02):** Part 1 uzun videoyla aynı gün,
  **3 saat sonra** (23:00; uzun video herkese açık olunca "ilişkili video" bağlanabilsin), Part 2
  ertesi gün 20:00, Part 3 sonraki gün 20:00. İki Short aynı güne konmaz.
  Aynı gün çıkan Shorts birbirinin test trafiğini paylaşır. Ötzi serisinde üçü aynı gün çıktı ve
  Part 2–3, Part 1'in 1/5'inin altında kaldı. Pompeii'de parçalar arasında bir gün vardı, onlar da
  düştü; yani asıl sorun büyük ihtimalle "Part" etiketi (bkz. `stats.md` açık karar).
- Uzun video ile Short aynı güne konabilir: farklı akışlarda dağıtılır, birbirleriyle yarışmazlar.
- Bir uzun video hazır değilse o hafta **boş geçmez**: önceki serinin en iyi anından ek bir Short
  ya da arşivden bir Short çıkar. Kalitesiz bir uzun video yayınlanmaz.

## Konu puanlama (yeni konu seçerken ya da kullanıcı konu değiştirmek istediğinde)
Her aday için rakip araştırması:
```bash
yt-dlp "ytsearch20:<konu> documentary" --flat-playlist --print "%(view_count)s|%(channel)s|%(title)s"
```
Sonra 1–5 arası puan ver ve tabloya yaz:

| Ölçüt | Ağırlık | Ne demek |
|---|---|---|
| Talep | ×3 | İlk 20 sonuçta 1 M+ izlenen video sayısı. İnsanlar bu konuyu izliyor mu? |
| Boşluk | ×2 | Az işlenmiş açı var mı? (yeni bulgu, DNA, yeni keşif, saat saat anlatım yapılmamış) |
| Kanca | ×2 | Somut sayı, ad ya da tarihle tek cümlelik merak kurulabiliyor mu? ("129 men", "34 seconds") |
| Shorts gücü | ×2 | Tek başına ayakta duran 3 an çıkar mı? Kanalı Shorts büyütüyor (bkz. `stats.md`) |
| Üretim maliyeti | ×1 | Mevcut motorla (kolaj, dagerotip, 3D, harita) yapılabiliyor mu? Ters puan: kolay = 5 |
| Kural uyumu | geçti/kaldı | İslami hassasiyet, gerçek ceset ya da yüz yok, telif (`projectBrief.md`). Kalırsa elenir. |

Toplam puana göre sırala. **Bir önceki videoyla bağ kuran konu** (aynı dönem ya da aynı tür gizem)
eşit puanda öne geçer; uç ekran ve oynatma listesi zinciri kurar.

## Kullanıcı konu değiştirmek istediğinde
- Kullanıcının konusu her zaman kabul edilir; puan yalnızca bilgi için verilir. Düşük puanda tek
  cümlelik risk notu yaz ("talep düşük, kancayı X açısından kur").
- Üretimi başlamış bir videoyu (progress.md'de "üretimde") değiştirmeden önce kaybolacak işi söyle.
- Kaydırılan konular silinmez, havuzda en üste taşınır.

## Çıktı
1. `memory-bank/plan.md`: "Takvim" tablosunu 4 hafta ileriye güncelle (tarih · gün · saat · ne ·
   durum). Geçmiş satırları "Yayınlananlar" bölümüne taşı.
2. `memory-bank/ideas.md`: puanlanan adaylara puan sütunu ekle.
3. Kullanıcıya: 4 haftalık tablo, sıradaki 3 konu ve puanları, varsa tek bir açık karar.
4. Her yeni videonun `YUKLEME.md` takvim bölümü bu plandan alınır (`cold-records-uretim` §7).

## Kurallar
- Hiçbir rakam uydurulmaz; izlenmeler yt-dlp'den, kanal verileri `stats.md` dosyasından alınır.
- Plan değişikliği yayın değildir. Zamanlanmış bir videonun tarihini Studio'da değiştirmek için
  kullanıcı onayı gerekir.
