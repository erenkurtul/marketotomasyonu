# marketotomasyonu

//

## 11 hafta gçmörev

### 11 hafta görevleri
[veri tabanı çizelge](./11h.png.png) )

## Sahte Veri (Seed) Kullanimi

Sahte veri uretimi backend tarafinda hazir ve **varsayilan olarak kapali** durumdadir.  
Boylece guncel/prod verin karismaz.

- Seed sinifi: `jkbbiu/backend/Services/DatabaseSeedService.cs`
- Tetikleme noktasi: `jkbbiu/backend/Program.cs`
- Varsayilan davranis: `SEED_FAKE_DATA` ayari yoksa veya `false` ise seed calismaz.

### Seed'i Acmak (istege bagli)

PowerShell:

```powershell
$env:SEED_FAKE_DATA="true"
dotnet run --project jkbbiu/backend
```

Alternatif olarak `appsettings.json` icinde asagidaki ayar da kullanilabilir:

```json
{
  "Database": {
    "SeedFakeData": "true"
  }
}
```

### Seed'in Kapsami

Seed acik oldugunda asagidaki koleksiyonlar icin iliskili sahte veri uretir:

- users
- categories
- products
- customers
- suppliers
- purchase_orders
- sales
- cash_registers

Her koleksiyonda en az 10 kayit hedeflenir.
