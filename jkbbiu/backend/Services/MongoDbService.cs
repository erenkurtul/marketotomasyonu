using MongoDB.Driver;
using backend.Models;

namespace backend.Services
{
    public class MongoDbService
    {
        private readonly IMongoDatabase _database;

        public MongoDbService(IConfiguration configuration)
        {
            var connectionString = Environment.GetEnvironmentVariable("MONGO_URL")
                ?? configuration["MongoDB:ConnectionString"]
                ?? "mongodb://localhost:27017";

            var databaseName = Environment.GetEnvironmentVariable("DB_NAME")
                ?? configuration["MongoDB:DatabaseName"]
                ?? "market_automation";

            connectionString = AppendConnectionOption(connectionString, "family", "4");

            var settings = MongoClientSettings.FromConnectionString(connectionString);
            settings.AllowInsecureTls = true;
            settings.ServerSelectionTimeout = TimeSpan.FromSeconds(30);
            settings.ConnectTimeout = TimeSpan.FromSeconds(30);

            var client = new MongoClient(settings);
            _database = client.GetDatabase(databaseName);
            DatabaseName = databaseName;
        }

        public string DatabaseName { get; }

        public IMongoCollection<User> Users => _database.GetCollection<User>("users");
        public IMongoCollection<Product> Products => _database.GetCollection<Product>("products");
        public IMongoCollection<Category> Categories => _database.GetCollection<Category>("categories");
        public IMongoCollection<Customer> Customers => _database.GetCollection<Customer>("customers");
        public IMongoCollection<Supplier> Suppliers => _database.GetCollection<Supplier>("suppliers");
        public IMongoCollection<Sale> Sales => _database.GetCollection<Sale>("sales");
        public IMongoCollection<CashRegister> CashRegisters => _database.GetCollection<CashRegister>("cash_registers");
        public IMongoCollection<PurchaseOrder> PurchaseOrders => _database.GetCollection<PurchaseOrder>("purchase_orders");

        private static string AppendConnectionOption(string connectionString, string key, string value)
        {
            if (connectionString.Contains($"{key}=", StringComparison.OrdinalIgnoreCase))
                return connectionString;

            var separator = connectionString.Contains('?') ? '&' : '?';
            return $"{connectionString}{separator}{key}={value}";
        }
    }
}