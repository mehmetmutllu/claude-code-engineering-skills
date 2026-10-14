---
name: sprint-orchestration
description: Büyük iş paketini "sprint" olarak yürüt — fazlı plan dosyası, dosya sahipliği ayrılmış paralel ajanlar (worktree), orkestratörde birleştirme + gerçek tarayıcı testi + mutasyon doğrulaması, faz başına commit ve sonda değişiklik defteri. Kullanıcı "sprint", "sprint at", "ajanlarla çalış" dediğinde kullan.
---

<!-- EN: Orchestrator skill for large work packages: phased plan with per-agent file ownership, parallel agents in isolated worktrees, merge via cherry-pick in the main session, real browser verification and mutation-checked guards by the orchestrator, commit per phase, change ledger at the end. Includes the agent brief template and the traps that were actually hit. -->

# sprint-orchestration — Orkestratör + paralel ajanlar

Sen **orkestratörsün**: planı, bağlamı, tarayıcı testini ve commit'leri sen tutarsın. Ajanlar yazar ve ölçer; birleştiren, doğrulayan ve kullanıcıya rapor veren sensin.

## 1. Plan dosyası (onaydan ÖNCE)

`docs/sprintler/sprint-<N>-plan.md`:
- **Neden** (kullanıcının cümlesi)
- **Faz tablosu** — her faz bir ajan
- **Ajan tablosu:** `SENİN dosyaların` / `DOKUNMA` listeleri (iki ajan aynı dosyaya dokunmaz; ortak dosyaya yalnız Edit ile, dosya sonuna etiketli blok)
- **Ortak sözleşme** (API biçimi, adlandırma, ortak sabitler)
- **Kabul ölçütü** — sayı listesi
- **Kapsam dışı**
- **Toplu sorular** — kullanıcıya tek seferde (metin değiştiren / ürün kararı olanlar)

Onay bir kez alınır. Fazlar arası "devam edeyim mi?" **sorulmaz**.

## 2. Ajan brifingi (her ajana tek, ayrıntılı)

```
GÖREV: <faz kimliği> — <tek cümle>
ZORUNLU OKUMA: CLAUDE.md · <kapı/ölçüm dersleri dosyası> · <plan satırı + ilgili kararlar>
SENİN DOSYALARIN: ...
DOKUNMA: ...
ORTAK SÖZLEŞME: ...
KURALLAR:
- isolation: worktree. Kendi worktree'nde commit at; push YOK, canlı YOK.
- Veritabanı SALT-OKUNUR. DB sunucusunu başlatma/durdurma (ajanla birlikte kapanır).
- Tarayıcı otomasyonu (MCP) YOK — profil paylaşımlı; tarayıcı testi orkestratörün.
- Kendi betiklerini scratchpad/<faz-öneki>/ altına yaz (başkasının dosyasını ezme).
- Ortak nöbetçi sayılarını düzenleme; yeni sayıyı nöbetçiyi koşup gerekçesiyle bildir. TAHMİN ETME.
- Kurduğun her nöbetçiyi BİLEREK BOZ ve kırmızı yandığını gör.
- Commit: git -c core.hooksPath=<hooks-yolu> commit
RAPOR (≤ 25 satır): ne değişti · commit hash · koşulan nöbetçiler + sonuç · kapsam dışı bulunanlar · kullanıcı/kurum kararı gerektirenler
```

## 3. Birleştirme (orkestratör)

1. **Taban görüntüleri birleştirmeden ÖNCE** al (ölçüm betikleri sunulan dosyayı okur).
2. `git cherry-pick -n <hash>` → bütün nöbetçiler + statik analiz + kiracı kapısı.
3. `git config core.hooksPath <hooks-yolu>` — worktree açmak bunu mutlak yola çevirir.
4. **Gerçek tıklama** — masaüstü + 390 px, senaryo verisiyle. Ajan "temiz" dese de tarayıcı turu atlanmaz (statik okuma regresyon kaçırır).
5. Bekçi testi **en az 2 mutasyonla** doğrulanır; kaçan mutasyon önce **kodun** zayıf yerine bakılarak incelenir.
6. Checklist maddesi `[a] — ajan doğruladı GG.AA.YYYY` → faz başına commit + push (oturum sonu beklenmez).
7. İkinci dalgadan önce birleştirmeyi **commit et** (worktree tabanı son commit'tir).
8. Biten worktree'yi ve dalını sil; biten ajanı TaskStop ile kapat.

## 4. Bağlam ekonomisi

- ~200k bağlama ya da ~1 saate yaklaşan ajana **devir notu** yazdır, taze ajanla devam et.
- Ajan transcript'ini okuma; yalnız raporunu oku.
- Her görsel panoya bir kez bak (≤ 1600 px yükseklik).
- Uzun üretim işlerini betikle ayrık (detached) çalıştır.
- Kendi bağlamın ~%50'ye yaklaşınca: elindeki adımı bitir → ajanları durdur → oturumu kaydet → kullanıcıya bildirim.

## 5. Kullanıcıya sunulacaklar

- Ajan bulgusu brifingin dışında bir değişiklik öneriyorsa **önce sun** (ekran görüntüsüyle), onaysız alma.
- UX değerlendirmesi ajanlardan **ayrı** yapılır: ajanlar düzeni ölçer, kullanılabilirliği ölçmez (emsal uygulama karşılaştırması + tasarım skill'i).

## 6. Sprint sonu — değişiklik defteri

`docs/sprintler/sprint-<N>-defter.md`:
| Eski | Yeni | Görünmeyen davranış değişimi | Kontrol tarifi (kullanıcı dili: menü yolu + beklenen sonuç) |

Kullanıcı kabulü sprint sonunda **toplu** yapılır; `edildi` yalnız onun onayından türetilir.

## Not

Kullanıcı sesle (dikte) yazıyor olabilir: tuhaf bir kelime (ör. "GSplit") fonetik yorumlanır — "sprint". Takılma.
