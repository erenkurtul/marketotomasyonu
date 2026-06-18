# MARKET OTOMASYONU
## Proje Teslim Raporu ve Kullanım Kılavuzu

**Proje Adı:** Market Otomasyonu  
**Proje Türü:** Web Tabanlı Market / Bakkal Yönetim Sistemi  
**Mimari:** Full-Stack (React + ASP.NET Core API + MongoDB)  
**Tarih:** Haziran 2026

---

## İçindekiler

1. [Projenin Genel Tanımı ve Amacı](#1-projenin-genel-tanımı-ve-amacı)
2. [Kullanılan Teknolojiler](#2-kullanılan-teknolojiler)
3. [Sistem Özellikleri](#3-sistem-özellikleri)
4. [Use-Case Diyagramları](#4-use-case-diyagramları)
5. [Veritabanı ER Diyagramı](#5-veritabanı-er-diyagramı)
6. [Kaynak Kodun Derlenmesi ve Çalıştırılması](#6-kaynak-kodun-derlenmesi-ve-çalıştırılması)
7. [Veritabanı Yedeğinin Geri Yüklenmesi](#7-veritabanı-yedeğinin-geri-yüklenmesi)
8. [Kullanım Kılavuzu](#8-kullanım-kılavuzu)
9. [Teslim Paketi İçeriği](#9-teslim-paketi-içeriği)

---

## 1. Projenin Genel Tanımı ve Amacı

**Market Otomasyonu**, küçük ve orta ölçekli market, bakkal ve perakende işletmelerinin günlük operasyonlarını dijital ortamda yönetmelerini sağlayan web tabanlı bir yönetim sistemidir.

### Projenin Amacı

- Ürün stoklarının takip edilmesi
- Satış işlemlerinin (POS) hızlı ve güvenli şekilde gerçekleştirilmesi
- Müşteri bilgilerinin ve borç/alışveriş geçmişinin yönetilmesi
- Günlük satış ve işletme performansının raporlanması
- Farklı kullanıcı rollerine (Admin, Müdür, Kasiyer) göre yetkilendirilmiş erişim sağlanması

### Hedef Kullanıcılar

| Rol | Açıklama |
|-----|----------|
| **Admin** | Tüm modüllere erişim, kullanıcı ve sistem yönetimi |
| **Müdür (Manager)** | Ürün, müşteri, rapor ve satış yönetimi |
| **Kasiyer (Cashier)** | Satış (POS) ekranı ve temel işlemler |

### Sistem Mimarisi

Uygulama üç katmanlı mimari ile geliştirilmiştir:

```
[Tarayıcı - React Frontend :3000]
            ↓ HTTP/REST API (JSON)
[ASP.NET Core Backend API :8001]
            ↓ MongoDB Driver
[MongoDB Atlas - market_automation veritabanı]
```

---

## 2. Kullanılan Teknolojiler

### Frontend (İstemci Tarafı)

| Teknoloji | Sürüm | Kullanım Amacı |
|-----------|-------|----------------|
| React | 18.x | Kullanıcı arayüzü |
| React Router | 7.x | Sayfa yönlendirme |
| Axios | 1.x | API istekleri |
| Tailwind CSS | 3.x | Arayüz tasarımı |
| CRACO | 7.x | React yapılandırması |
| Radix UI / shadcn | - | Hazır UI bileşenleri |
| Recharts | 3.x | Grafik ve raporlar |

### Backend (Sunucu Tarafı)

| Teknoloji | Sürüm | Kullanım Amacı |
|-----------|-------|----------------|
| ASP.NET Core | 8.0 | REST API sunucusu |
| C# | 12 | Backend programlama dili |
| MongoDB.Driver | 3.7 | Veritabanı bağlantısı |
| JWT Bearer | 8.0 | Kimlik doğrulama (token) |
| BCrypt.Net | 4.0 | Şifre hashleme |
| Swagger | 6.6 | API dokümantasyonu |

### Veritabanı

| Teknoloji | Açıklama |
|-----------|----------|
| MongoDB Atlas | Bulut tabanlı NoSQL veritabanı |
| Veritabanı adı | `market_automation` |

### Geliştirme ve Çalıştırma Ortamı

| Araç | Açıklama |
|------|----------|
| Node.js | 18+ (frontend bağımlılıkları) |
| .NET SDK | 8.0 (backend derlemesi) |
| npm / PowerShell | Paket yönetimi ve başlatma scriptleri |
| Git | Versiyon kontrolü |

---

## 3. Sistem Özellikleri

### 3.1 Kimlik Doğrulama (Auth)
- Kullanıcı girişi (JWT token tabanlı)
- Rol bazlı yetkilendirme
- Oturum yönetimi (localStorage)

### 3.2 Dashboard (Ana Panel)
- Günlük satış özeti
- Toplam ürün ve müşteri sayısı
- Düşük stoklu ürün uyarıları

### 3.3 Satış Noktası (POS)
- Barkod ile ürün arama
- Sepet yönetimi
- Müşteri seçimi (aktif müşteriler)
- Nakit / kredi kartı / karma ödeme
- Otomatik stok düşümü

### 3.4 Ürün Yönetimi
- Ürün ekleme, düzenleme, silme
- Barkod, fiyat, KDV, stok bilgileri
- Kategori ataması
- Aktif/pasif durum yönetimi

### 3.5 Müşteri Yönetimi
- Müşteri kaydı (ad, telefon, e-posta, adres)
- Borç ve toplam alışveriş takibi
- Aktif/pasif müşteri filtreleme

### 3.6 Raporlar
- Tarih aralığına göre satış raporu
- En çok satan ürünler listesi
- Ödeme yöntemine göre dağılım

### 3.7 Kasa Yönetimi (Backend API)
- Kasa açma/kapama
- Nakit hareketleri

---

## 4. Use-Case Diyagramları

### 4.1 Genel Use-Case Diyagramı

```mermaid
flowchart TB
    subgraph Aktörler
        Admin[Admin]
        Manager[Müdür]
        Cashier[Kasiyer]
    end

    subgraph Sistem["Market Otomasyonu Sistemi"]
        UC1[Giriş Yap]
        UC2[Dashboard Görüntüle]
        UC3[Ürün Yönet]
        UC4[Müşteri Yönet]
        UC5[Satış Yap - POS]
        UC6[Rapor Görüntüle]
        UC7[Kullanıcı Yönet]
        UC8[Çıkış Yap]
    end

    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC4
    Admin --> UC5
    Admin --> UC6
    Admin --> UC7
    Admin --> UC8

    Manager --> UC1
    Manager --> UC2
    Manager --> UC3
    Manager --> UC4
    Manager --> UC5
    Manager --> UC6
    Manager --> UC8

    Cashier --> UC1
    Cashier --> UC2
    Cashier --> UC5
    Cashier --> UC8
```

### 4.2 Satış (POS) Use-Case Diyagramı

```mermaid
flowchart LR
    Kasiyer((Kasiyer))

    subgraph POS["Satış Modülü"]
        A1[Ürün Ara / Barkod Oku]
        A2[Sepete Ekle]
        A3[Müşteri Seç]
        A4[İndirim Uygula]
        A5[Ödeme Yap]
        A6[Fiş Oluştur]
        A7[Stok Güncelle]
    end

    Kasiyer --> A1
    Kasiyer --> A2
    Kasiyer --> A3
    Kasiyer --> A4
    Kasiyer --> A5
    A5 --> A6
    A5 --> A7
```

### 4.3 Ürün Yönetimi Use-Case Diyagramı

```mermaid
flowchart LR
    Yonetici((Admin / Müdür))

    subgraph Urun["Ürün Modülü"]
        B1[Ürün Listele]
        B2[Yeni Ürün Ekle]
        B3[Ürün Düzenle]
        B4[Ürün Sil]
        B5[Düşük Stok Uyarısı Gör]
    end

    Yonetici --> B1
    Yonetici --> B2
    Yonetici --> B3
    Yonetici --> B4
    Yonetici --> B5
```

---

## 5. Veritabanı ER Diyagramı

Proje **MongoDB** (NoSQL) kullanmaktadır. İlişkiler, koleksiyonlar arasında `ObjectId` referans alanları ile kurulmuştur. Aşağıdaki diyagram, koleksiyonları ve mantıksal ilişkileri göstermektedir.

### 5.1 Koleksiyonlar ve Alanlar

| Koleksiyon | Birincil Anahtar (PK) | Önemli Alanlar |
|------------|----------------------|----------------|
| `users` | `_id` (ObjectId) | Username, Email, PasswordHash, Role |
| `categories` | `_id` (ObjectId) | Name, ParentCategoryId (self-ref) |
| `products` | `_id` (ObjectId) | Name, Barcode, CategoryId (FK), StockQuantity |
| `customers` | `_id` (ObjectId) | FullName, Phone, TotalDebt, LoyaltyPoints |
| `suppliers` | `_id` (ObjectId) | CompanyName, TaxNumber, TotalDebt |
| `sales` | `_id` (ObjectId) | InvoiceNumber, CustomerId (FK), CashierId (FK), Items[] |
| `cash_registers` | `_id` (ObjectId) | CashierId (FK), OpeningBalance, Status |
| `purchase_orders` | `_id` (ObjectId) | SupplierId (FK), Items[] (ProductId FK) |

### 5.2 ER Diyagramı

```mermaid
erDiagram
    USERS {
        ObjectId _id PK
        string Username
        string Email
        string PasswordHash
        int Role
        string FullName
        bool IsActive
        datetime CreatedAt
    }

    CATEGORIES {
        ObjectId _id PK
        string Name
        string Description
        ObjectId ParentCategoryId FK
        bool IsActive
    }

    PRODUCTS {
        ObjectId _id PK
        string Name
        string Barcode
        ObjectId CategoryId FK
        decimal PurchasePrice
        decimal SalePrice
        decimal TaxRate
        int StockQuantity
        int MinimumStockLevel
        bool IsActive
    }

    CUSTOMERS {
        ObjectId _id PK
        string FullName
        string Phone
        string Email
        decimal TotalDebt
        decimal LoyaltyPoints
        int TotalPurchases
        bool IsActive
    }

    SUPPLIERS {
        ObjectId _id PK
        string CompanyName
        string ContactPerson
        string TaxNumber
        decimal TotalDebt
        bool IsActive
    }

    SALES {
        ObjectId _id PK
        string InvoiceNumber
        ObjectId CustomerId FK
        ObjectId CashierId FK
        decimal Subtotal
        decimal TaxAmount
        decimal Total
        int PaymentMethod
        datetime CreatedAt
    }

    SALE_ITEMS {
        ObjectId ProductId FK
        string ProductName
        int Quantity
        decimal UnitPrice
        decimal Total
    }

    CASH_REGISTERS {
        ObjectId _id PK
        ObjectId CashierId FK
        decimal OpeningBalance
        decimal ClosingBalance
        int Status
        datetime OpenedAt
    }

    PURCHASE_ORDERS {
        ObjectId _id PK
        string OrderNumber
        ObjectId SupplierId FK
        decimal Total
        int Status
        datetime OrderDate
    }

    CATEGORIES ||--o{ CATEGORIES : "ParentCategoryId"
    CATEGORIES ||--o{ PRODUCTS : "CategoryId"
    USERS ||--o{ SALES : "CashierId"
    CUSTOMERS ||--o{ SALES : "CustomerId"
    USERS ||--o{ CASH_REGISTERS : "CashierId"
    SUPPLIERS ||--o{ PURCHASE_ORDERS : "SupplierId"
    PRODUCTS ||--o{ SALE_ITEMS : "ProductId (embedded)"
    PRODUCTS ||--o{ PURCHASE_ORDER_ITEMS : "ProductId (embedded)"
    SALES ||--|{ SALE_ITEMS : "contains"
```

### 5.3 İlişki Açıklamaları

| İlişki | Tür | Açıklama |
|--------|-----|----------|
| Category → Product | 1:N | Bir kategoride birden fazla ürün olabilir |
| Category → Category | 1:N | Alt kategori (ParentCategoryId ile self-reference) |
| User → Sale | 1:N | Bir kasiyer birden fazla satış yapabilir |
| Customer → Sale | 1:N | Bir müşterinin birden fazla satışı olabilir |
| User → CashRegister | 1:N | Bir kasiyer birden fazla kasa oturumu açabilir |
| Supplier → PurchaseOrder | 1:N | Bir tedarikçiye birden fazla sipariş verilebilir |
| Sale → SaleItem | 1:N | Satış kaydı içinde gömülü (embedded) ürün kalemleri |

> **Not:** MongoDB'de `sales` ve `purchase_orders` koleksiyonlarındaki `Items` alanları, ilişkili ürün bilgilerini belge içinde (embedded document) tutar. Bu, NoSQL veritabanlarında yaygın bir desendir.

---

## 6. Kaynak Kodun Derlenmesi ve Çalıştırılması

### 6.1 Gereksinimler

Başka bir bilgisayarda projeyi çalıştırmak için aşağıdakiler kurulu olmalıdır:

| Yazılım | Minimum Sürüm | İndirme |
|---------|---------------|---------|
| Node.js | 18.x | https://nodejs.org |
| .NET SDK | 8.0 | https://dotnet.microsoft.com/download |
| Git (opsiyonel) | - | https://git-scm.com |
| MongoDB Atlas hesabı | - | https://cloud.mongodb.com |

### 6.2 Proje Klasör Yapısı

```
marketotomasyonu/
├── package.json          → Ana başlatma scriptleri
├── start.ps1             → Backend + Frontend başlatıcı
├── teslim/               → Teslim dosyaları (rapor, DB yedeği)
└── jkbbiu/
    ├── backend/          → ASP.NET Core API (C#)
    │   ├── .env          → Gizli ayarlar (MongoDB, JWT)
    │   ├── Program.cs
    │   ├── Controllers/
    │   ├── Models/
    │   └── Services/
    └── frontend/         → React uygulaması
        ├── .env
        ├── package.json
        └── src/
```

### 6.3 Kurulum Adımları (Sıfırdan)

#### Adım 1: Projeyi bilgisayara kopyalayın

Kaynak kod klasörünü (`marketotomasyonu`) hedef bilgisayara kopyalayın veya GitHub'dan klonlayın.

#### Adım 2: Backend ortam değişkenlerini ayarlayın

`jkbbiu/backend/.env` dosyasını oluşturun veya düzenleyin:

```env
MONGO_URL=mongodb+srv://KULLANICI:SIFRE@cluster0.xxxxx.mongodb.net/market_automation?retryWrites=true&w=majority
DB_NAME=market_automation
JWT_SECRET_KEY=SuperSecretKeyForMarketAutomation2024!MinimumLength32Chars
JWT_ISSUER=MarketAutomation
JWT_AUDIENCE=MarketAutomationUsers
JWT_EXPIRATION_MINUTES=480
CORS_ORIGINS=*
```

> MongoDB Atlas'ta **Network Access** bölümünden bilgisayarın IP adresini eklemeyi unutmayın.

#### Adım 3: Frontend ortam değişkenlerini ayarlayın

`jkbbiu/frontend/.env` dosyasını oluşturun:

```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

#### Adım 4: Frontend bağımlılıklarını yükleyin

PowerShell veya Terminal'de:

```powershell
cd jkbbiu\frontend
npm install
```

#### Adım 5: Backend'i derleyin (ilk seferde otomatik)

```powershell
cd jkbbiu\backend
dotnet restore
dotnet build
```

Derleme başarılı olursa `Build succeeded` mesajı görünür.

#### Adım 6: Projeyi çalıştırın

**Yöntem A — Tek komutla (önerilen):**

Proje kök klasöründen:

```powershell
npm run dev
```

Bu komut iki ayrı terminal penceresi açar:
- Backend → http://localhost:8001
- Frontend → http://localhost:3000

**Yöntem B — Manuel:**

Terminal 1 (Backend):
```powershell
cd jkbbiu\backend
dotnet run
```

Terminal 2 (Frontend):
```powershell
cd jkbbiu\frontend
npm run dev
```

#### Adım 7: Uygulamayı açın

Tarayıcıda şu adresi açın: **http://localhost:3000**

| Kullanıcı | Şifre |
|-----------|-------|
| admin | Admin123! |

### 6.4 Production Build (Opsiyonel)

Frontend production derlemesi:

```powershell
cd jkbbiu\frontend
npm run build
```

Backend production derlemesi:

```powershell
cd jkbbiu\backend
dotnet publish -c Release -o ./publish
```

### 6.5 API Dokümantasyonu

Backend çalışırken Swagger arayüzü: **http://localhost:8001/swagger**

### 6.6 Sağlık Kontrolü

Backend ve veritabanı bağlantısını test etmek için:

```
GET http://localhost:8001/api/health
```

Başarılı yanıt örneği:
```json
{
  "status": "ok",
  "productCount": 7,
  "appUrl": "http://localhost:3000"
}
```

---

## 7. Veritabanı Yedeğinin Geri Yüklenmesi

### 7.1 Yedek İçeriği

`teslim/veritabani_yedegi/` klasöründe aşağıdaki JSON dosyaları bulunur:

| Dosya | Koleksiyon | Açıklama |
|-------|------------|----------|
| `users.json` | users | Kullanıcılar |
| `products.json` | products | Ürünler |
| `categories.json` | categories | Kategoriler |
| `customers.json` | customers | Müşteriler |
| `suppliers.json` | suppliers | Tedarikçiler |
| `sales.json` | sales | Satış kayıtları |
| `cash_registers.json` | cash_registers | Kasa kayıtları |
| `purchase_orders.json` | purchase_orders | Satın alma siparişleri |
| `_metadata.json` | - | Yedekleme tarihi ve kayıt sayıları |

### 7.2 Yöntem A — Script ile Geri Yükleme (Önerilen)

#### Ön koşullar
- Node.js kurulu
- `jkbbiu/frontend` klasöründe `npm install` yapılmış
- MongoDB Atlas bağlantı bilgileri hazır

#### Adımlar

1. `teslim/veritabani_yedegi/geri_yukle.js` dosyasındaki `MONGO_URL` değerini kendi Atlas bağlantı adresinizle güncelleyin **veya** ortam değişkeni olarak ayarlayın:

```powershell
$env:MONGO_URL = "mongodb+srv://KULLANICI:SIFRE@cluster0.xxxxx.mongodb.net/market_automation?retryWrites=true&w=majority"
$env:DB_NAME = "market_automation"
```

2. Scripti çalıştırın:

```powershell
cd teslim\veritabani_yedegi
node geri_yukle.js
```

3. Her koleksiyon için yüklenen kayıt sayısını kontrol edin.

### 7.3 Yöntem B — MongoDB Compass ile Manuel İçe Aktarma

1. [MongoDB Compass](https://www.mongodb.com/products/compass) uygulamasını indirin ve kurun.
2. Atlas bağlantı dizesi ile bağlanın.
3. `market_automation` veritabanını seçin veya oluşturun.
4. Her koleksiyon için:
   - Koleksiyonu seçin (ör. `products`)
   - **Add Data → Import JSON or CSV file**
   - İlgili `.json` dosyasını seçin
   - Import'u tamamlayın

### 7.4 Yöntem C — mongorestore (mongodump formatı için)

Bu teslim paketinde JSON formatı kullanılmıştır. `mongorestore` BSON yedekleri için kullanılır. JSON yedekler için Yöntem A veya B tercih edilmelidir.

### 7.5 Geri Yükleme Sonrası Kontrol

1. Backend'i başlatın: `dotnet run` (jkbbiu/backend)
2. Sağlık kontrolü yapın: `http://localhost:8001/api/health`
3. `productCount` değerinin 0'dan büyük olduğunu doğrulayın
4. Uygulamaya giriş yapıp Ürünler ve Müşteriler sayfalarını kontrol edin

---

## 8. Kullanım Kılavuzu

### 8.1 Giriş

1. Tarayıcıda `http://localhost:3000` adresini açın
2. Kullanıcı adı: `admin`, Şifre: `Admin123!`
3. **Giriş Yap** butonuna tıklayın

### 8.2 Dashboard

Giriş sonrası ana panelde günlük satış, toplam ürün/müşteri sayısı ve düşük stok uyarıları görüntülenir.

### 8.3 Satış (POS)

1. Sol menüden **Satış (POS)** seçin
2. Barkod okutun veya ürün adı ile arayın
3. Ürünleri sepete ekleyin
4. İsteğe bağlı müşteri seçin
5. Ödeme yöntemini belirleyin ve satışı tamamlayın

### 8.4 Ürün Yönetimi

1. **Ürünler** menüsüne gidin
2. **+ Yeni Ürün** ile ürün ekleyin
3. Mevcut ürünleri **Düzenle** veya **Sil** ile yönetin

### 8.5 Müşteri Yönetimi

1. **Müşteriler** menüsüne gidin
2. Yeni müşteri ekleyin veya mevcut kayıtları düzenleyin
3. Pasif müşterileri göstermek için ilgili kutucuğu işaretleyin

### 8.6 Raporlar

1. **Raporlar** menüsüne gidin
2. Tarih aralığı seçin
3. Satış raporu ve en çok satan ürünleri inceleyin

### 8.7 Çıkış

Sol alt köşedeki **Çıkış Yap** butonuna tıklayın.

---

## 9. Teslim Paketi İçeriği

Proje tesliminde aşağıdaki dosyalar tek bir arşivde (.zip) sunulmalıdır:

| Dosya / Klasör | Açıklama | Durum |
|----------------|----------|-------|
| `marketotomasyonu/` (kaynak kod) | Derlenebilir proje dosyaları | ✅ |
| `teslim/PROJE_RAPORU.md` | Bu rapor (Word'e dönüştürülebilir) | ✅ |
| `teslim/veritabani_yedegi/` | JSON formatında DB yedeği | ✅ |
| `teslim/veritabani_yedegi/geri_yukle.js` | Geri yükleme scripti | ✅ |
| Tanıtım videosu | Tüm özelliklerin ekran kaydı | ⏳ (Öğrenci tarafından) |
| GitHub deposu | Kaynak kod paylaşımı | ⏳ (Öğrenci tarafından) |

### Word Belgesine Dönüştürme

Bu rapor Markdown formatındadır. Word'e aktarmak için:
- Microsoft Word → **Dosya → Aç** → `PROJE_RAPORU.md` seçin
- Veya [Pandoc](https://pandoc.org/) ile: `pandoc PROJE_RAPORU.md -o PROJE_RAPORU.docx`
- Mermaid diyagramları Word'de görünmezse, diyagramları [mermaid.live](https://mermaid.live) üzerinden PNG olarak export edip rapora ekleyin

---

**Hazırlayan:** Eren Kurtul  
**Proje:** Market Otomasyonu  
**Teslim Tarihi:** Haziran 2026
