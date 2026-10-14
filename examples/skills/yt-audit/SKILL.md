---
name: yt-audit
description: >-
  Cold Records kanal denetimi: Studio istatistiklerini (izlenme, gösterim,
  tıklama oranı, izlenme süresi, Shorts kaydırma oranı) toplar, önceki
  denetimle karşılaştırır, en fazla 3 bulgu ve her biri için tek bir değişiklik
  önerir, planı günceller. "istatistik", "statlar", "kanal nasıl gidiyor",
  "analiz", "denetim", "audit", "neden izlenmiyor", "ne değiştirmeliyiz" dendiğinde ve
  her 14 günde bir kullan.
---

# yt-audit

Veri `memory-bank/stats.md` dosyasında birikir. Her denetim oraya yeni bir **tarihli anlık görüntü**
ekler. Eskiler silinmez; trend ancak böyle görünür.

## Ne zaman
- **Tam denetim: 14 günde bir.** Haftalık veri bu boyuttaki bir kanalda çok gürültülü, aylık
  beklemek ise iki videoyu aynı hatayla yayınlamak demek. `stats.md` içindeki son tarih 14 günü
  geçtiyse "devam" özetinde hatırlat.
- **Hızlı kontrol: bir uzun videodan 48 saat sonra.** Yalnızca gösterim ve tıklama oranına bakılır;
  kapak ya da başlık değişikliği gerekiyorsa yapılır. Öncesinde karar verilmez.
- Bir video **7 günü doldurmadan** (Short için **72 saat**) iyi ya da kötü ilan edilmez.
- Gösterimi **1.000'in altında** olan videodan oran çıkarılmaz; yalnızca "veri yetersiz" yazılır.

## Veri toplama
**Şimdilik Chrome ile (YouTube Studio, kanalın Cold Records olduğu doğrulanarak):**
1. İçerik › Videolar ve İçerik › Shorts: her videonun izlenme sayısı, yayın tarihi.
2. Analytics › İçerik › (son 28 gün): gösterim, gösterim tıklama oranı, ortalama izleme süresi.
3. Her uzun video › Analytics › Etkileşim: ortalama izlenme yüzdesi, ilk 30 saniyede kalma oranı.
   Grafik CSV olarak indirilebilirse `/yt-retention` ile okunur.
4. Her Short › Analytics: "İzlemeyi seçti / Kaydırdı" oranı, ortalama izlenme yüzdesi.
5. Analytics › Kitle: abone sayısı değişimi, trafik kaynakları (Shorts akışı, Göz at, Önerilen, Arama).

**API kurulduğunda:** aynı alanlar YouTube Analytics API'den alınır (`scripts/` altındaki betik).
Studio'dan elle toplamaya gerek kalmaz.

## Başlangıç eşikleri
Bunlar sektörde yaygın kabul gören kaba başlangıç noktalarıdır, kanıtlanmış hedef değildir. 3
denetimden sonra **kanalın kendi medyanı** eşik olur ve bu tablo güncellenir.

| Metrik | Zayıf | İyi |
|---|---|---|
| Uzun video gösterim tıklama oranı | < %3 | > %6 |
| Uzun video ortalama izlenme yüzdesi (~8 dk) | < %30 | > %45 |
| İlk 30 sn'de kalan izleyici | < %60 | > %75 |
| Short "izlemeyi seçti" oranı | < %55 | > %75 |
| Short ortalama izlenme yüzdesi | < %70 | > %90 |

## Teşhis → tek değişiklik
Her bulgu için **bir** değişiklik önerilir; aynı anda iki şey değişirse hangisinin işe yaradığı
anlaşılmaz.

| Belirti | Muhtemel neden | Değişiklik | Araç |
|---|---|---|---|
| Gösterim var, tıklama oranı düşük | Paketleme | Yeni başlık ya da kapak, Test & Compare | `/yt-package` |
| Tıklama iyi, ilk 30 sn'de kayıp | Kanca vaadi karşılamıyor | Sonraki videonun açılışı | `/yt-script` |
| Ortada dik düşüş | Tempo, tekrar | Sahne planında o tip bölümü kısalt | `/yt-retention` |
| Gösterim çok düşük (< 500 / 7 gün) | Konu talebi ya da arama metni | Konu puanını gözden geçir, açıklamanın ilk iki satırı | `/yt-planner`, `/yt-seo` |
| Short kaydırma oranı yüksek | İlk 2 saniye | Short'un ilk karesi ve ilk cümlesi | `/yt-shorts` |
| Part 2–3, Part 1'den çok düşük | Akışta bağlam yok | Parçaları tek başına anlaşılır yaz | `/yt-shorts` |
| Shorts izleniyor, uzun video izlenmiyor | Shorts'tan uzun videoya köprü yok | İlişkili video bağlantısı, sabit yorum, Short sonunda yönlendirme | Studio |

## Çıktı
1. `memory-bank/stats.md`: yeni anlık görüntü (tarih · video başına tablo · kanal toplamları).
2. **En fazla 3 bulgu.** Her biri: rakam → anlamı → tek değişiklik → hangi videoda denenecek.
3. Plan etkileniyorsa `/yt-planner` kurallarıyla `plan.md`; kalıcı bir kural değişiyorsa
   `decisions.md` (tarih · karar · neden).
4. Bir önceki denetimin değişikliği işe yaradı mı? Her denetimin ilk satırı bu sorunun cevabıdır.

## Kurallar
- Rakam uydurulmaz. Okunamayan alan "—" olarak yazılır.
- Yayınlanmış bir videonun başlığını, kapağını ya da açıklamasını değiştirmek dışa dönük bir
  işlemdir: öneri yazılır, **kullanıcı onayıyla** uygulanır.
- Kanalı değiştirmeden önce Studio'da hesabın **Cold Records** olduğu doğrulanır (aynı tarayıcıda
  sahibin başka bir kanalı da açık olabilir).
