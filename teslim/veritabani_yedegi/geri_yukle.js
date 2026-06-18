/**
 * Market Otomasyonu - MongoDB Veritabanı Geri Yükleme Scripti
 *
 * Kullanım:
 *   1. Node.js kurulu olmalıdır (v18+ önerilir)
 *   2. jkbbiu/frontend klasöründe: npm install
 *   3. MONGO_URL ortam değişkenini ayarlayın veya aşağıdaki uri'yi düzenleyin
 *   4. Bu klasörde çalıştırın: node geri_yukle.js
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const uri =
  process.env.MONGO_URL ||
  'mongodb+srv://KULLANICI:SIFRE@cluster0.xxxxx.mongodb.net/market_automation?retryWrites=true&w=majority';
const dbName = process.env.DB_NAME || 'market_automation';
const backupDir = __dirname;

const collectionFiles = [
  'users.json',
  'products.json',
  'categories.json',
  'customers.json',
  'suppliers.json',
  'sales.json',
  'cash_registers.json',
  'purchase_orders.json',
];

async function restore() {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 30000 });
  await client.connect();
  const db = client.db(dbName);

  console.log(`Hedef veritabanı: ${dbName}`);

  for (const file of collectionFiles) {
    const filePath = path.join(backupDir, file);
    if (!fs.existsSync(filePath)) {
      console.log(`Atlandı (dosya yok): ${file}`);
      continue;
    }

    const collectionName = file.replace('.json', '');
    const docs = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (!Array.isArray(docs)) {
      throw new Error(`${file} geçerli bir JSON dizisi değil.`);
    }

    await db.collection(collectionName).deleteMany({});
    if (docs.length > 0) {
      await db.collection(collectionName).insertMany(docs);
    }

    console.log(`${collectionName}: ${docs.length} kayıt yüklendi`);
  }

  await client.close();
  console.log('\nGeri yükleme tamamlandı.');
}

restore().catch((err) => {
  console.error('Geri yükleme hatası:', err.message);
  process.exit(1);
});
