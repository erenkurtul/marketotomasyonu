using backend.Models;
using Bogus;
using MongoDB.Driver;

namespace backend.Services
{
    public class DatabaseSeedService
    {
        private const int MinSeedCountPerCollection = 10;
        private const string DefaultUserPassword = "Admin123!";
        private readonly MongoDbService _mongoDb;

        public DatabaseSeedService(MongoDbService mongoDb)
        {
            _mongoDb = mongoDb;
        }

        public async Task SeedAsync()
        {
            var users = await SeedUsersAsync();
            var categories = await SeedCategoriesAsync();
            var products = await SeedProductsAsync(categories);
            var customers = await SeedCustomersAsync();
            var suppliers = await SeedSuppliersAsync();
            await SeedPurchaseOrdersAsync(suppliers, products);
            await SeedSalesAsync(customers, users, products);
            await SeedCashRegistersAsync(users);
        }

        private async Task<List<User>> SeedUsersAsync()
        {
            var existingUsers = await _mongoDb.Users.Find(_ => true).ToListAsync();
            if (existingUsers.Count >= MinSeedCountPerCollection)
            {
                return existingUsers;
            }

            var usersToInsert = new List<User>();
            if (!existingUsers.Any(u => u.Username == "admin"))
            {
                usersToInsert.Add(new User
                {
                    Username = "admin",
                    Email = "admin@market.local",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(DefaultUserPassword),
                    FullName = "System Admin",
                    Phone = string.Empty,
                    Role = UserRole.Admin,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-90)
                });
            }

            var faker = new Faker("tr");
            var requiredCount = MinSeedCountPerCollection - (existingUsers.Count + usersToInsert.Count);
            for (var i = 0; i < requiredCount; i++)
            {
                var fullName = faker.Name.FullName();
                var username = $"user{existingUsers.Count + usersToInsert.Count + 1}";
                usersToInsert.Add(new User
                {
                    Username = username,
                    Email = $"{username}@market.local",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(DefaultUserPassword),
                    FullName = fullName,
                    Phone = faker.Phone.PhoneNumber("05#########"),
                    Role = faker.PickRandom<UserRole>(),
                    IsActive = faker.Random.Bool(0.9f),
                    CreatedAt = faker.Date.Past(1, DateTime.UtcNow.AddDays(-5))
                });
            }

            if (usersToInsert.Count > 0)
            {
                await _mongoDb.Users.InsertManyAsync(usersToInsert);
            }

            return await _mongoDb.Users.Find(_ => true).ToListAsync();
        }

        private async Task<List<Category>> SeedCategoriesAsync()
        {
            var existingCategories = await _mongoDb.Categories.Find(_ => true).ToListAsync();
            if (existingCategories.Count >= MinSeedCountPerCollection)
            {
                return existingCategories;
            }

            var categoryNames = new[]
            {
                "Icecek", "Atistirmalik", "Sut Urunleri", "Temizlik", "Meyve Sebze",
                "Bakliyat", "Unlu Mamuller", "Kisisel Bakim", "Dondurulmus Gida", "Ev Gerecleri"
            };

            var faker = new Faker("tr");
            var existingNames = existingCategories.Select(x => x.Name).ToHashSet(StringComparer.OrdinalIgnoreCase);
            var categoriesToInsert = new List<Category>();
            foreach (var categoryName in categoryNames)
            {
                if (existingNames.Contains(categoryName))
                {
                    continue;
                }

                categoriesToInsert.Add(new Category
                {
                    Name = categoryName,
                    Description = $"{categoryName} urun grubu",
                    IsActive = true,
                    CreatedAt = faker.Date.Past(2)
                });
            }

            if (categoriesToInsert.Count > 0)
            {
                await _mongoDb.Categories.InsertManyAsync(categoriesToInsert);
            }

            return await _mongoDb.Categories.Find(_ => true).ToListAsync();
        }

        private async Task<List<Product>> SeedProductsAsync(List<Category> categories)
        {
            var existingProducts = await _mongoDb.Products.Find(_ => true).ToListAsync();
            if (existingProducts.Count >= MinSeedCountPerCollection || categories.Count == 0)
            {
                return existingProducts;
            }

            var faker = new Faker("tr");
            var requiredCount = MinSeedCountPerCollection - existingProducts.Count;
            var productsToInsert = new List<Product>();
            for (var i = 0; i < requiredCount; i++)
            {
                var category = faker.PickRandom(categories);
                var purchasePrice = faker.Random.Decimal(5, 300);
                var taxRate = faker.PickRandom(new[] { 1m, 8m, 18m, 20m });
                var stockQuantity = faker.Random.Int(10, 250);
                var barcode = faker.Random.ReplaceNumbers("869##########");

                productsToInsert.Add(new Product
                {
                    Name = $"{faker.Commerce.ProductAdjective()} {faker.Commerce.Product()}",
                    Description = faker.Commerce.ProductDescription(),
                    Barcode = barcode,
                    CategoryId = category.Id ?? string.Empty,
                    PurchasePrice = purchasePrice,
                    SalePrice = decimal.Round(purchasePrice * faker.Random.Decimal(1.15m, 1.75m), 2),
                    TaxRate = taxRate,
                    StockQuantity = stockQuantity,
                    MinimumStockLevel = faker.Random.Int(5, 20),
                    Unit = faker.PickRandom(new[] { "Adet", "Kg", "Lt", "Paket" }),
                    IsActive = faker.Random.Bool(0.95f),
                    CreatedAt = faker.Date.Past(1),
                    UpdatedAt = faker.Date.Recent(30)
                });
            }

            if (productsToInsert.Count > 0)
            {
                await _mongoDb.Products.InsertManyAsync(productsToInsert);
            }

            return await _mongoDb.Products.Find(_ => true).ToListAsync();
        }

        private async Task<List<Customer>> SeedCustomersAsync()
        {
            var existingCustomers = await _mongoDb.Customers.Find(_ => true).ToListAsync();
            if (existingCustomers.Count >= MinSeedCountPerCollection)
            {
                return existingCustomers;
            }

            var faker = new Faker("tr");
            var customersToInsert = new List<Customer>();
            var requiredCount = MinSeedCountPerCollection - existingCustomers.Count;
            for (var i = 0; i < requiredCount; i++)
            {
                customersToInsert.Add(new Customer
                {
                    FullName = faker.Name.FullName(),
                    Phone = faker.Phone.PhoneNumber("05#########"),
                    Email = faker.Internet.Email(),
                    Address = faker.Address.FullAddress(),
                    LoyaltyPoints = faker.Random.Decimal(0, 200),
                    TotalDebt = faker.Random.Decimal(0, 1500),
                    TotalPurchases = faker.Random.Int(0, 75),
                    IsActive = faker.Random.Bool(0.95f),
                    CreatedAt = faker.Date.Past(2),
                    LastPurchaseDate = faker.Date.Recent(60)
                });
            }

            if (customersToInsert.Count > 0)
            {
                await _mongoDb.Customers.InsertManyAsync(customersToInsert);
            }

            return await _mongoDb.Customers.Find(_ => true).ToListAsync();
        }

        private async Task<List<Supplier>> SeedSuppliersAsync()
        {
            var existingSuppliers = await _mongoDb.Suppliers.Find(_ => true).ToListAsync();
            if (existingSuppliers.Count >= MinSeedCountPerCollection)
            {
                return existingSuppliers;
            }

            var faker = new Faker("tr");
            var suppliersToInsert = new List<Supplier>();
            var requiredCount = MinSeedCountPerCollection - existingSuppliers.Count;
            for (var i = 0; i < requiredCount; i++)
            {
                suppliersToInsert.Add(new Supplier
                {
                    CompanyName = faker.Company.CompanyName(),
                    ContactPerson = faker.Name.FullName(),
                    Phone = faker.Phone.PhoneNumber("0##########"),
                    Email = faker.Internet.Email(),
                    Address = faker.Address.FullAddress(),
                    TaxNumber = faker.Random.ReplaceNumbers("##########"),
                    TotalDebt = faker.Random.Decimal(0, 10000),
                    IsActive = faker.Random.Bool(0.9f),
                    CreatedAt = faker.Date.Past(2)
                });
            }

            if (suppliersToInsert.Count > 0)
            {
                await _mongoDb.Suppliers.InsertManyAsync(suppliersToInsert);
            }

            return await _mongoDb.Suppliers.Find(_ => true).ToListAsync();
        }

        private async Task SeedPurchaseOrdersAsync(List<Supplier> suppliers, List<Product> products)
        {
            var existingCount = await _mongoDb.PurchaseOrders.CountDocumentsAsync(_ => true);
            if (existingCount >= MinSeedCountPerCollection || suppliers.Count == 0 || products.Count == 0)
            {
                return;
            }

            var faker = new Faker("tr");
            var purchaseOrders = new List<PurchaseOrder>();
            var requiredCount = MinSeedCountPerCollection - (int)existingCount;
            for (var i = 0; i < requiredCount; i++)
            {
                var itemCount = faker.Random.Int(1, 4);
                var selectedProducts = faker.PickRandom(products, itemCount).ToList();
                var items = selectedProducts.Select(p =>
                {
                    var quantity = faker.Random.Int(5, 40);
                    var unitPrice = p.PurchasePrice <= 0 ? faker.Random.Decimal(5, 100) : p.PurchasePrice;
                    return new PurchaseOrderItem
                    {
                        ProductId = p.Id ?? string.Empty,
                        ProductName = p.Name,
                        Quantity = quantity,
                        UnitPrice = unitPrice,
                        Total = decimal.Round(unitPrice * quantity, 2)
                    };
                }).ToList();

                var total = items.Sum(x => x.Total);
                var orderDate = faker.Date.Recent(120);
                var status = faker.PickRandom<PurchaseOrderStatus>();
                purchaseOrders.Add(new PurchaseOrder
                {
                    OrderNumber = $"PO-{DateTime.UtcNow:yyyyMMdd}-{1000 + i}",
                    SupplierId = faker.PickRandom(suppliers).Id ?? string.Empty,
                    Items = items,
                    Total = total,
                    Status = status,
                    OrderDate = orderDate,
                    DeliveryDate = status == PurchaseOrderStatus.Pending ? null : orderDate.AddDays(faker.Random.Int(1, 7)),
                    Notes = faker.Lorem.Sentence()
                });
            }

            await _mongoDb.PurchaseOrders.InsertManyAsync(purchaseOrders);
        }

        private async Task SeedSalesAsync(List<Customer> customers, List<User> users, List<Product> products)
        {
            var existingCount = await _mongoDb.Sales.CountDocumentsAsync(_ => true);
            if (existingCount >= MinSeedCountPerCollection || users.Count == 0 || products.Count == 0)
            {
                return;
            }

            var faker = new Faker("tr");
            var cashierIds = users
                .Where(u => u.Role == UserRole.Admin || u.Role == UserRole.Cashier || u.Role == UserRole.Manager)
                .Select(u => u.Id ?? string.Empty)
                .Where(id => !string.IsNullOrWhiteSpace(id))
                .ToList();

            if (cashierIds.Count == 0)
            {
                return;
            }

            var sales = new List<Sale>();
            var requiredCount = MinSeedCountPerCollection - (int)existingCount;
            for (var i = 0; i < requiredCount; i++)
            {
                var itemCount = faker.Random.Int(1, 5);
                var selectedProducts = faker.PickRandom(products, itemCount).ToList();
                var items = selectedProducts.Select(p =>
                {
                    var quantity = faker.Random.Int(1, 3);
                    var unitPrice = p.SalePrice <= 0 ? faker.Random.Decimal(8, 200) : p.SalePrice;
                    var subtotal = decimal.Round(unitPrice * quantity, 2);
                    var taxAmount = decimal.Round(subtotal * (p.TaxRate / 100m), 2);
                    return new SaleItem
                    {
                        ProductId = p.Id ?? string.Empty,
                        ProductName = p.Name,
                        Barcode = p.Barcode,
                        Quantity = quantity,
                        UnitPrice = unitPrice,
                        TaxRate = p.TaxRate,
                        Subtotal = subtotal,
                        TaxAmount = taxAmount,
                        Total = subtotal + taxAmount
                    };
                }).ToList();

                var subtotalAmount = items.Sum(x => x.Subtotal);
                var taxTotal = items.Sum(x => x.TaxAmount);
                var discount = decimal.Round(faker.Random.Decimal(0, subtotalAmount * 0.1m), 2);
                var total = decimal.Round(subtotalAmount + taxTotal - discount, 2);
                var paymentMethod = faker.PickRandom<PaymentMethod>();
                var paidAmount = paymentMethod == PaymentMethod.Cash
                    ? decimal.Round(total + faker.Random.Decimal(0, 10), 2)
                    : total;

                sales.Add(new Sale
                {
                    InvoiceNumber = $"INV-{DateTime.UtcNow:yyyyMMdd}-{2000 + i}",
                    CustomerId = customers.Count > 0 && faker.Random.Bool(0.75f) ? faker.PickRandom(customers).Id : null,
                    CashierId = faker.PickRandom(cashierIds),
                    Items = items,
                    Subtotal = subtotalAmount,
                    TaxAmount = taxTotal,
                    Total = total,
                    Discount = discount,
                    PaymentMethod = paymentMethod,
                    PaidAmount = paidAmount,
                    ChangeAmount = decimal.Max(paidAmount - total, 0),
                    Notes = faker.Lorem.Sentence(),
                    IsRefunded = faker.Random.Bool(0.03f),
                    CreatedAt = faker.Date.Recent(90)
                });
            }

            await _mongoDb.Sales.InsertManyAsync(sales);
        }

        private async Task SeedCashRegistersAsync(List<User> users)
        {
            var existingCount = await _mongoDb.CashRegisters.CountDocumentsAsync(_ => true);
            if (existingCount >= MinSeedCountPerCollection || users.Count == 0)
            {
                return;
            }

            var cashierIds = users
                .Select(u => u.Id ?? string.Empty)
                .Where(id => !string.IsNullOrWhiteSpace(id))
                .ToList();

            if (cashierIds.Count == 0)
            {
                return;
            }

            var faker = new Faker("tr");
            var registers = new List<CashRegister>();
            var requiredCount = MinSeedCountPerCollection - (int)existingCount;
            for (var i = 0; i < requiredCount; i++)
            {
                var opening = decimal.Round(faker.Random.Decimal(300, 1500), 2);
                var cashSales = decimal.Round(faker.Random.Decimal(500, 5000), 2);
                var cardSales = decimal.Round(faker.Random.Decimal(300, 4000), 2);
                var totalSales = cashSales + cardSales;
                var closed = faker.Random.Bool(0.8f);
                var openedAt = faker.Date.Recent(45);
                var movements = new List<CashMovement>
                {
                    new()
                    {
                        Type = "Income",
                        Amount = decimal.Round(faker.Random.Decimal(50, 500), 2),
                        Description = "Manual cash income",
                        Timestamp = openedAt.AddHours(2)
                    },
                    new()
                    {
                        Type = "Expense",
                        Amount = decimal.Round(faker.Random.Decimal(20, 250), 2),
                        Description = "Petty cash expense",
                        Timestamp = openedAt.AddHours(5)
                    }
                };

                registers.Add(new CashRegister
                {
                    CashierId = faker.PickRandom(cashierIds),
                    OpeningBalance = opening,
                    ClosingBalance = closed ? opening + cashSales + movements.Sum(m => m.Type == "Income" ? m.Amount : -m.Amount) : 0,
                    TotalCashSales = cashSales,
                    TotalCardSales = cardSales,
                    TotalSales = totalSales,
                    TotalTransactions = faker.Random.Int(8, 60),
                    Movements = movements,
                    Status = closed ? CashRegisterStatus.Closed : CashRegisterStatus.Open,
                    OpenedAt = openedAt,
                    ClosedAt = closed ? openedAt.AddHours(faker.Random.Int(8, 14)) : null
                });
            }

            await _mongoDb.CashRegisters.InsertManyAsync(registers);
        }
    }
}
