# Aktif Bağlam (Active Context)

> Her oturum sonunda `/bitir` ile güncellenir, her oturum başında `/devam` ile okunur.
> **Sert limit: 200 satır · en fazla 3 oturum bloğu.** Aşarsa `/bitir` rotasyonu uygular.
> **Son güncelleme:** <YYYY-MM-DD> (Oturum <N>)

---

## 🎯 DEVAM NOKTASI

<!-- Geçmişi değil, bir sonraki oturumun yapacağını yaz. Somut: dosya, fonksiyon, bekleyen karar. -->

**Aktif iş:** <iş adı> — ayrıntı → `plans/<konu>.md` (varsa)
**← BURADAN BAŞLA:** <ilk somut adım>
**Bekleyen karar:** <kullanıcıdan beklenen; yoksa satırı sil>
**⚠️ Uyarı:** <bilinen tuzak, ikiz kod, açık dal; yoksa satırı sil>

---

<!-- En yeni blok en üstte. 4. blok gelince en eskisi archive/sessions/<YYYY-MM>.md sonuna TAŞINIR. -->

## 🔄 OTURUM <N> (<YYYY-MM-DD>) — <kısa başlık>

- <ne yapıldı — en fazla 15 satır>
- <kanıt: test sayıları, ekran görüntüleri>
- <migration varsa: "Migration: 00X_ad.sql ✅ yerelde uygulandı">

*(Eski oturum blokları `archive/sessions/` altında.)*
