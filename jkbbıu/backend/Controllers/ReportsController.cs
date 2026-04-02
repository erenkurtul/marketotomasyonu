using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using backend.Models;
using backend.Services;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Manager")]
    public class ReportsController : ControllerBase
    {
        private readonly MongoDbService _mongoDb;

        public ReportsController(MongoDbService mongoDb)
        {
            _mongoDb = mongoDb;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var today = DateTime.UtcNow.Date;
            var todayEnd = today.AddDays(1);

            var todaySales = await _mongoDb.Sales.Find(s => 
                s.CreatedAt >= today && 
                s.CreatedAt < todayEnd && 
                !s.IsRefunded
            ).Limit(10000).ToListAsync();

            var totalProducts = await _mongoDb.Products.CountDocumentsAsync(_ => true);
            var lowStockProducts = await _mongoDb.Products.CountDocumentsAsync(p => p.StockQuantity <= p.MinimumStockLevel);
            var totalCustomers = await _mongoDb.Customers.CountDocumentsAsync(_ => true);

            var dashboard = new
            {
                TodaySales = new
                {
                    Total = todaySales.Sum(s => s.Total),
                    Transactions = todaySales.Count,
                    CashSales = todaySales.Where(s => s.PaymentMethod == PaymentMethod.Cash).Sum(s => s.Total),
                    CardSales = todaySales.Where(s => s.PaymentMethod == PaymentMethod.CreditCard || s.PaymentMethod == PaymentMethod.DebitCard).Sum(s => s.Total)
                },
                Inventory = new
                {
                    TotalProducts = totalProducts,
                    LowStockProducts = lowStockProducts
                },
                Customers = new
                {
                    Total = totalCustomers
                }
            };

            return Ok(dashboard);
        }

        [HttpGet("sales-report")]
        public async Task<IActionResult> GetSalesReport([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var sales = await _mongoDb.Sales.Find(s => 
                s.CreatedAt >= startDate && 
                s.CreatedAt <= endDate && 
                !s.IsRefunded
            ).Limit(10000).ToListAsync();

            var report = new
            {
                Period = new { StartDate = startDate, EndDate = endDate },
                TotalSales = sales.Sum(s => s.Total),
                TotalTransactions = sales.Count,
                TotalTax = sales.Sum(s => s.TaxAmount),
                TotalDiscount = sales.Sum(s => s.Discount),
                PaymentMethods = new
                {
                    Cash = sales.Where(s => s.PaymentMethod == PaymentMethod.Cash).Sum(s => s.Total),
                    CreditCard = sales.Where(s => s.PaymentMethod == PaymentMethod.CreditCard).Sum(s => s.Total),
                    DebitCard = sales.Where(s => s.PaymentMethod == PaymentMethod.DebitCard).Sum(s => s.Total)
                },
                DailyBreakdown = sales.GroupBy(s => s.CreatedAt.Date)
                    .Select(g => new
                    {
                        Date = g.Key,
                        Total = g.Sum(s => s.Total),
                        Transactions = g.Count()
                    })
                    .OrderBy(x => x.Date)
                    .ToList()
            };

            return Ok(report);
        }

        [HttpGet("top-products")]
        public async Task<IActionResult> GetTopProducts([FromQuery] int limit = 10)
        {
            var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
            var sales = await _mongoDb.Sales
                .Find(s => s.CreatedAt >= thirtyDaysAgo && !s.IsRefunded)
                .Limit(10000)
                .ToListAsync();

            var productSales = sales
                .SelectMany(s => s.Items)
                .GroupBy(i => new { i.ProductId, i.ProductName })
                .Select(g => new
                {
                    ProductId = g.Key.ProductId,
                    ProductName = g.Key.ProductName,
                    TotalQuantity = g.Sum(i => i.Quantity),
                    TotalRevenue = g.Sum(i => i.Total)
                })
                .OrderByDescending(x => x.TotalRevenue)
                .Take(limit)
                .ToList();

            return Ok(productSales);
        }
    }
}