# TESLİM PAKETİ — OKUMA KILAVUZU

Bu klasör, proje teslimi için hazırlanan belgeleri içerir.

## İçerik

```
teslim/
├── PROJE_RAPORU.md          → Ana proje raporu (Word'e çevrilebilir)
├── TESLIM_OKUMA.md          → Bu dosya
└── veritabani_yedegi/
    ├── users.json
    ├── products.json
    ├── categories.json
    ├── customers.json
    ├── suppliers.json
    ├── sales.json
    ├── cash_registers.json
    ├── purchase_orders.json
    ├── _metadata.json       → Yedekleme bilgisi
    └── geri_yukle.js        → Veritabanı geri yükleme scripti
```

## Teslim Kontrol Listesi

- [x] Kaynak kod (marketotomasyonu/ klasörü — ayrı arşivde)
- [x] Proje raporu (PROJE_RAPORU.md)
- [x] Derleme / çalıştırma talimatları (rapor Bölüm 6)
- [x] Veritabanı yedeği (veritabani_yedegi/)
- [x] Veritabanı geri yükleme talimatları (rapor Bölüm 7)
- [x] Use-case diyagramları (rapor Bölüm 4)
- [x] ER diyagramı (rapor Bölüm 5)
- [ ] Tanıtım videosu (siz yapacaksınız)
- [ ] GitHub'a yükleme (siz yapacaksınız)

## Son Adım: ZIP Arşivi Oluşturma

Tüm dosyaları tek bir .zip dosyasında birleştirin:

1. `marketotomasyonu` kaynak kod klasörü (node_modules hariç tutulabilir — npm install ile yeniden indirilir)
2. `teslim` klasörü (rapor + veritabani_yedegi)
3. Tanıtım videosu (.mp4)

### node_modules hariç ZIP için (önerilen — daha küçük dosya):

PowerShell:
```powershell
# Proje kökünden
Compress-Archive -Path "marketotomasyonu\*", "teslim" -DestinationPath "MarketOtomasyonu_Teslim.zip" -Force
```

> node_modules ve bin/obj klasörlerini zip'e eklemeden önce silmek veya hariç tutmak dosya boyutunu ciddi şekilde küçültür. Alıcı `npm install` ve `dotnet restore` ile bağımlılıkları yeniden yükler.

## Varsayılan Giriş Bilgileri

| Kullanıcı | Şifre |
|-----------|-------|
| admin | Admin123! |

## Hızlı Başlatma (alıcı için)

```powershell
cd marketotomasyonu
# .env dosyalarını düzenle
cd jkbbiu\frontend && npm install
cd ..\..
npm run dev
# Tarayıcı: http://localhost:3000
```
