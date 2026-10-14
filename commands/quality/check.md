---
description: Sağlık kontrolü — lint, duman testi, git durumu, doküman tutarlılığı. Kod değiştirmez, yalnız rapor verir.
---

Tek seferlik denetim. **Hiçbir dosyayı değiştirme.** Yalnız rapor ver.

## Çalıştırılacaklar (paralel)

```bash
# Lint — projenin diline göre (PHP örneği)
for f in $(find . -name '*.php' -not -path './vendor/*' -not -path './node_modules/*'); do
  php -l "$f" 2>&1 | grep -v 'No syntax errors'
done

# Git durumu
git status --porcelain 2>/dev/null || echo "(git yok)"
git log --oneline -5 2>/dev/null || echo "(commit yok)"

# Duman testi (yerel sunucu açıksa) — projenin ana sayfaları
curl -sS -o /dev/null -w 'home %{http_code}\n' <yerel-url>/ 2>/dev/null || echo "home: sunucuya ulaşılamıyor"
curl -sS -o /dev/null -w 'list %{http_code}\n' <yerel-url>/<liste-sayfası> 2>/dev/null
curl -sS -o /dev/null -w 'detail %{http_code}\n' "<yerel-url>/<detay-sayfası>" 2>/dev/null
```

## Doküman tutarlılığı

- `PROGRESS.md` → "Aktif faz" satırı var mı, geçerli mi?
- `activeContext.md` → DEVAM NOKTASI ve en az 1 oturum bloğu var mı? 200 satırın altında mı?
- Karar kaydı (`memory/` veya `decisions.md`) var mı?
- Yerel gizli yapılandırma dosyası (ör. `config.local.*`, `.env`) var mı? Yoksa kullanıcıyı uyar.
- Sunucu yapılandırması (ör. `.htaccess`) yerinde mi?

## Rapor formatı

```
🩺 Sağlık raporu — YYYY-MM-DD HH:MM

Lint:        ✅ tüm dosyalar temiz  /  ❌ X dosyada hata
Duman:       home <kod> · list <kod> · detail <kod>
Git:         N commit'lenmemiş değişiklik · dal <ad> · son commit "<mesaj>" <ne zaman>
Doküman:     progress=ok · activeContext=ok (<satır>) · kararlar=ok
Yapılandırma: <yerel config>=var/yok

Sorun: <listele veya "yok">
Öneri: <varsa, kısa>
```
