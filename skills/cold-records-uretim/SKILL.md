---
name: cold-records-uretim
description: >-
  Cold Records kanalı için bir videoyu konudan yayın paketine kadar revizyonsuz üretme akışı:
  araştırma, senaryo, kanca, sahne planı (SHOT tablosu), görsel öz-denetim, render, Shorts serisi,
  kapak, youtube.md. Kullanıcı yeni video, senaryo, sahne planı, Shorts, kapak ya da "videoyu çıkar"
  dediğinde ve kanal projesinde çalışırken kullan.
---

# Cold Records üretim akışı

**Amaç:** Kullanıcı bitmiş videoyu izlediğinde revizyon vermesine gerek kalmasın. Kullanıcının
bugüne kadar reddettiği her şey aşağıdaki kapılarda yazılı. Bir kapıdan geçmeyen iş bir sonraki
adıma gitmez. Kullanıcıya ara onay sorma; yalnızca **konu seçimi** ve gerçekten kullanıcıya ait bir
karar (para, hesap, ses servisi) için sor.

Önce oku: `memory-bank/projectBrief.md`, `memory-bank/voice.md`, `memory-bank/decisions.md`.
Komutlar ve motor: `memory-bank/pipeline.md`. Motor şablonu: en son video klasörü (şu an `videos/003-pompeii/`; harita, eskiz, kanıt, dosya kapağı, dikey Shorts).

## 1. Araştırma
- Birincil kaynak + 2 akademik/kurumsal kaynak. Her sayı ve tarih bir kaynağa bağlanır.
- Tartışmalı bilgi listesi çıkar (tarih, sayı, sıcaklık, teori). Senaryoda "around / many researchers".
- **İçerik taraması:** konunun haram unsurlarını (müstehcen sanat, içki, put/tapınak, genelev, kumar,
  gladyatör vb.) listele ve senaryo/görsel dışında bırak. Hikâye onlarsız anlatılamıyorsa konuyu değiştir.

## 2. Senaryo (`videos/NNN-slug/script.js`, 002 formatı)
- **Süre: 7,5–8 dk = 1.000–1.100 kelime** (anlatım ~158 kelime/dk + sahne araları; Ötzi 1.061 kelime = 7:55). Aşma.
- 35–45 sahne, sahne başına 1–3 cümle. Bölüm kartları (`chapter`) 5–7 adet, Roma rakamıyla.
- Yapı: `hook` (≤15 sn, soru ya da çarpıcı olgu) → soğuk açılış (somut an) → `title`
  ("This is Cold Records. File number N: …") → bölümler → epilog → `end`.
- Kanca: `/yt-script` ile 5 kanca yaz, `python .claude/skills/yt-script/hookscore.py` ile puanla, en
  yükseği kullan. Uzun video ve Shorts Part 1 aynı kancayı paylaşabilir.
- Son geçiş `humanizer` skilli: AI kalıplarını temizle. İstisna: voice.md'deki kasıtlı kısa vurgu
  cümleleri (en fazla 4–5).
- Dosya sonunda `// KAYNAKLAR` bloğu zorunlu.
- **Otomatik denetim:** `script.js` her kaydedildiğinde `tools/check_script.mjs` hook'u çalışır
  (kelime sayısı, yasak konu kelimeleri, kaynak bloğu). Hata verirse düzelt, geçmeden ilerleme.

## 3. Sahne planı (SHOT tablosu, `js/cinema.js`)
Harita durumu (katmanlar, parçacık, cephe vb.) sahne değil zaman fonksiyonu olsun; süreklilik kendiliğinden korunur. Her sahne için: ne görünür, kamera yolu, `cue()` ile hangi kelimede ne olur, etiket/yazı konumu.
**Kural: anlatımda adı geçen her görsel öğe, geçtiği kelimede ekranda olur; ekrandaki her öğe
anlatımda açıklanır.** Açıklanmayan çizgi, halka, ok, şekil koyma (Ötzi v2'de reddedildi).

### Görsel kurallar (kullanıcının reddettikleri, tekrarlanmaz)
- **İnsan:** 3D/gerçekçi insan figürü YOK ("iğrenç"). Siyah siluet, gölge insan, hedef figür YOK.
  İnsan gerekiyorsa yalnızca sade 2B eskiz çizgisi, ölçek şeması ya da alçı kalıp silueti; uzak planda.
- **Kamera:** tür başına tek sürekli yol, monoton kübik Hermite (`track()`); sallantı, dur-kalk,
  aşağı-yukarı zıplama YOK. Harita üstünde kamera yüksekliği yumuşatılmış arazi (`demSmooth`).
  Takip edilen nokta/rota **asla kadrajdan çıkmaz**.
- **Işık:** bloom düşük; açılış gündüz, sert ışık-gölge (düz "yastık" ışık ve karanlık açılış reddedildi).
- **Eskiz/çizim:** tanınmayan çizim koyma. Çizim nesneyi bir bakışta tanıtamıyorsa (kaynak fotoğrafa
  bakarak yeniden çiz) ya da kaldır. Yön ve anatomi doğru (ok tüyü arkada, boy çizgisi dikey, yara
  anlatılan yerde, dövme/işaret vücut içinde).
- **Yazılar:** hiçbir etiket başka etiketle, çizimle ya da önemli nesneyle çakışmaz; kenar boşluğu
  ≥ 40 px; aynı anda en fazla 3 etiket. Kırmızı bağlantı çizgisi yalnızca anlatılan iki öğe arasında.
- **Pano:** ucuz mantar pano YOK; "vaka eskiz defteri" ya da konuya özgü temiz stil.
- **Ses:** tiz/metalik efekt yok, efektler filtreli ve derin, müzik+efekt yankılı, anlatımda müzik
  kısılır, -14 LUFS.
- **Haram görseller:** fresk, heykel, put, tapınak içi, içki kabı, arena sahnesi çizilmez.

## 4. Görsel öz-denetim (render öncesi zorunlu kapı)
0. Sahneleri yazmadan önce her yeni görsel öğeyi `node probe.mjs <modül> '<json>'` ile tek kare dene; ucuz görünen 3D'yi (düz hortum, masa üstü karo harita, tanınmayan çizim) bu aşamada düzelt ya da eskize çevir.
1. `node render.mjs --stills` ile her sahnenin başı, ortası ve sonu için kare al; 9'lu tabakalara dizip (`sheet.py`) tabaka tabaka bak.
2. Her kareyi **Read ile kendin aç ve bak**. Aşağıdaki listeyi kare kare uygula; tek bir "hayır"
   varsa düzelt ve o sahnenin karelerini yeniden al:
   - [ ] Anlatılan öğe bu anda ekranda ve tanınır mı?
   - [ ] Açıklanmayan şekil/çizgi/halka var mı? (olmamalı)
   - [ ] Yazılar çakışıyor, taşıyor ya da nesneyi örtüyor mu? (olmamalı)
   - [ ] İnsan figürü kurala uyuyor mu?
   - [ ] Takip edilen nokta kadrajda mı? Ufuk ve kamera yüksekliği önceki kareyle tutarlı mı?
   - [ ] Işık/bloom göz yormuyor mu, sahne çok karanlık ya da düz mü?
   - [ ] Haram görsel var mı? (olmamalı)
3. Kamera sallantısı için ardışık kareler: `node render.mjs --stills --at=t,t+0.2,t+0.4` ile harita ve
   takip sahnelerinde 3 ardışık kare; yükseklik zıplıyorsa düzelt.
4. Sonuçları `videos/NNN/QA.md` dosyasına sahne sahne yaz (geçti / düzeltildi).

## 5. Ses ve render
`pipeline.md` akışı: narrate → words → captions → audio + loudnorm → stills QA → final render.
Render sonrası: süreyi `ffprobe` ile doğrula (7:00–8:30), -14 LUFS'u doğrula, 5 rastgele kareyi aç.

## 6. Shorts serisi
- Bağımsız Short YOK. Seri: `<KONU SORUSU>? PART 1/2/3`, hikâye sırasıyla, uzun zaman çizelgesinden
  dikey kesit (yeni seslendirme gerekmez), üstte sabit başlık + PART etiketi, sonda sonraki parça kartı.
- `/yt-shorts` kurallarıyla parça sınırları: her parça tam bir düşünceyle açılır, bir dönüş içerir,
  bir cümleyle biter; ~55–120 sn (Ötzi parçaları 50–56 sn onaylandı).
- Dikey karelerde de §4 denetimi (yazılar büyük, ortalı, kenarda kesilme yok).
- İlişkili video = uzun video.

## 7. Paket (`out/`)
- `/yt-package`: 10 başlık → `python .claude/skills/yt-package/title.py` → en iyi 3; kapak yazısı
  başlığı tekrar etmez, ≤3 kelime. Kapaklar A/B/C (3 kapak YouTube Test & Compare için).
- Kapak görseli: kullanıcı YouTube'un YZ aracıyla üretir → Claude prompt + tarihsel doğruluk maddeleri
  + eklenecek yazı verir; ayrıca kodla üretilmiş temiz kareden yedek kapak (`thumb.mjs`).
- `/yt-seo`: ilk iki satır arama sorgusunu içerir; bölümler; kaynaklar; ≤15 etiket.
- `youtube.md` + `YUKLEME.md` (adım adım yayın tarifi, zamanlama önerisi, Studio ayarları:
  Education, çocuklara özel değil, sentetik içerik = Evet).
- `captions.srt` kelime zamanlı.
- Final mp4'ler: `gh release create <slug>-v1 out/*.mp4`.

## 8. Teslim
Kullanıcıya tek mesaj: ne üretildi, süreler, QA özeti, yükleme tarifi. "Beğendin mi?" diye sorma;
yayın tarifini ver. Oturum kaydı protokolü CLAUDE.md'de.

## Yayından sonra
Takvim `memory-bank/plan.md` dosyasından (`/yt-planner`); `YUKLEME.md` tarihleri oradan alınır.
48 sa sonra hızlı kontrol (gösterim + tıklama oranı), 14 günde bir tam denetim: `/yt-audit` →
`stats.md` → en fazla 3 bulgu, her biri için tek değişiklik → `decisions.md`.
