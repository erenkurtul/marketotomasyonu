# Veritabanı Yedeği — Geri Yükleme Talimatları

**Veritabanı:** `market_automation`  
**Format:** JSON (koleksiyon başına bir dosya)  
**Yedekleme tarihi:** _metadata.json dosyasında belirtilmiştir

## Dosyalar

| Dosya | Koleksiyon |
|-------|------------|
| users.json | Kullanıcılar |
| products.json | Ürünler |
| categories.json | Kategoriler |
| customers.json | Müşteriler |
| suppliers.json | Tedarikçiler |
| sales.json | Satışlar |
| cash_registers.json | Kasa kayıtları |
| purchase_orders.json | Satın alma siparişleri |

## Hızlı Geri Yükleme

```powershell
# 1. MongoDB bağlantı adresini ayarla
$env:MONGO_URL = "mongodb+srv://KULLANICI:SIFRE@cluster0.xxxxx.mongodb.net/market_automation?retryWrites=true&w=majority"

# 2. Frontend bağımlılıkları yüklü olmalı (mongodb paketi için)
cd jkbbiu\frontend
npm install

# 3. Geri yükleme scriptini çalıştır
cd ..\..\teslim\veritabani_yedegi
node geri_yukle.js
```

## Alternatif: MongoDB Compass

1. Compass ile Atlas'a bağlan
2. `market_automation` veritabanını seç
3. Her koleksiyon için: Add Data → Import JSON → ilgili .json dosyasını seç

Detaylı açıklama için `PROJE_RAPORU.md` Bölüm 7'ye bakın.
