using MongoDB.Driver;
using backend.Models;

namespace backend.Services
{
    public class MongoDbService
    {
        private readonly IMongoDatabase _database;

        public MongoDbService(IConfiguration configuration)
        {
            // Priority: Environment variables > appsettings.json
            var connectionString = Environment.GetEnvironmentVariable("MONGO_URL") 
                ?? configuration["MongoDB:ConnectionString"] 
                ?? "mongodb://localhost:27017";
            
            var databaseName = Environment.GetEnvironmentVariable("DB_NAME") 
                ?? configuration["MongoDB:DatabaseName"] 
                ?? "market_automation";
            
            var client = new MongoClient(connectionString);
            _database = client.GetDatabase(databaseName);
        }

        public IMongoCollection<User> Users => _database.GetCollection<User>("users");
        public IMongoCollection<Product> Products => _database.GetCollection<Product>("products");
        public IMongoCollection<Category> Categories => _database.GetCollection<Category>("categories");
        public IMongoCollection<Customer> Customers => _database.GetCollection<Customer>("customers");
        public IMongoCollection<Supplier> Suppliers => _database.GetCollection<Supplier>("suppliers");
        public IMongoCollection<Sale> Sales => _database.GetCollection<Sale>("sales");
        public IMongoCollection<CashRegister> CashRegisters => _database.GetCollection<CashRegister>("cash_registers");
        public IMongoCollection<PurchaseOrder> PurchaseOrders => _database.GetCollection<PurchaseOrder>("purchase_orders");
    }
}