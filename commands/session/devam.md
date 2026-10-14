---
description: Oturuma kaldığı yerden devam et — makine senkronunu kontrol et, durumu oku, kısa rapor ver, onay al
---

# /devam — Oturum başlangıç protokolü

Kullanıcı yeni bir chat açtı (`/clear` sonrası). Nerede kaldığımızı bul, **kısa** bir rapor ver, onay al.
Bu komut okuma ve raporlama komutudur; onay gelmeden hiçbir dosyayı değiştirmez.

> Kullanıcı aynı mesajda "sprint at / devam et" dediyse rapordan sonra onay beklemeden, onaylı planla başla.

## 0. Makine senkronu (İLK adım, sorun yoksa sessiz geç)

Proje birden fazla makinede çalışılıyorsa durumu okumadan ÖNCE uzak depoyla karşılaştır. Tek bash çağrısı:

```bash
hostname; cd <proje-kökü> && git fetch --quiet 2>/dev/null; git status --short --branch | head -5
```

Yorumla:
- **Güncel + temiz** → hiçbir şey yazma, 1. adıma geç.
- **Geride + çalışma alanı temiz** → `git pull --ff-only`, tek satır bildir (kaç commit geldi). **State dosyalarını pull'dan SONRA oku.**
- **Kirli / ileride / ayrık (diverged)** → **DUR**, durumu göster, sor. Otomatik rebase / reset / stash **YOK**.
- Git dışında tutulan gizli dosyalar (`.env` vb.) bu makinede eksik veya eski olabilir → yalnız "gizli dosya senkronu gerekebilir" diye bildir. Senkron/kurulum betiğini **kendiliğinden çalıştırma** (yerel veritabanını ezebilir).

> Hangi makinedeyim = `hostname`. Klasör yollarına güvenme; iki makinede aynı çıkabilir.

## 1. Durumu oku (bu sırayla, fazlasını okuma)

1. `activeContext.md` — 🎯 DEVAM NOKTASI + son oturum bloğu
2. `PROGRESS.md` — yalnız aktif faz satırı
3. Yalnız **gerekiyorsa**: devam noktasının işaret ettiği `memory/<dosya>.md` ya da `plans/<konu>.md` (indeks: `memory/README.md`)

**Token disiplini:** `archive/` altını okuma. `memory/` dosyalarını toptan yükleme — yalnız devam noktasının işaret ettiğini aç.
Aktif faz özel bir alana dokunuyorsa (güvenlik, ödeme, yayın) o alanın dokümanını da oku (ör. `docs/SECURITY.md`).

## 2. Ortam kontrolü (yalnız kod çalıştırılacaksa)

Veritabanı / yerel sunucu ayakta mı? Tek komutla kontrol et (ör. `mysql -h 127.0.0.1 -P <port> -e "SELECT 1"`).
Kapalıysa kullanıcıya söyle; başlatmak için onay al.
Git'e girmeyen bağımlılıklar (`node_modules`, vendor paketleri, SDK'lar) eksikse belirtisini ve kurulum komutunu tek satırda yaz.

## 3. Tutarlılık kontrolü

`activeContext.md` DEVAM NOKTASI ile `PROGRESS.md` aktif faz satırı (ve varsa aktif planın durum günlüğü) **çelişiyorsa** → DUR, ikisini de kullanıcıya göster, hangisinin doğru olduğunu sor. Kendi kafana göre birini seçme.

State dosyası eksik ya da bozuksa → söyle, yeniden oluşturmayı teklif et; sessizce düzeltme.

## 4. Rapor ver (KISA — en fazla 10 satır)

```
📍 Nerede kaldık: <tek cümle>
✅ Son oturumda: <2-3 madde>
▶️ Sırada: <tek cümle — DEVAM NOKTASI'ndan>
⚠️ Açık uyarı: <varsa; yoksa bu satırı yazma>
```

Sonra sor: **"Buradan devam edelim mi, yoksa başka bir şey mi?"**
Kullanıcı onaylamadan büyük değişiklik yapma.
