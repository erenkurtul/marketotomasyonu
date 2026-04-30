using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using backend.Models;
using backend.Services;
using System.Security.Claims;
using backend.DTOs;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SalesController : ControllerBase
    {
        private readonly MongoDbService _mongoDb;

        public SalesController(MongoDbService mongoDb)
        {
            _mongoDb = mongoDb;
        }

        [HttpPost]
        public async Task<IActionResult> CreateSale([FromBody] CreateSaleDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            // Tüm ürünleri tek sorguda çek (N+1 query problemi önlemi)
            var productIds = dto.Items.Select(i => i.ProductId).ToList();
            var products = await _mongoDb.Products
                .Find(p => productIds.Contains(p.Id))
                .ToListAsync();
            
            var productDict = products.ToDictionary(p => p.Id!);

            // Ürün bilgilerini al ve stok kontrolü yap
            var saleItems = new List<SaleItem>();
            decimal subtotal = 0;
            decimal taxAmount = 0;

            foreach (var item in dto.Items)
            {
                if (!productDict.TryGetValue(item.ProductId, out var product))
                    return BadRequest(new { message = $"Ürün bulunamadı: {item.ProductId}" });

                if (product.StockQuantity < item.Quantity)
                    return BadRequest(new { message = $"{product.Name} için yeterli stok yok. Mevcut: {product.StockQuantity}" });

                var itemSubtotal = product.SalePrice * item.Quantity;
                var itemTaxAmount = itemSubtotal * (product.TaxRate / 100);
                var itemTotal = itemSubtotal + itemTaxAmount;

                saleItems.Add(new SaleItem
                {
                    ProductId = product.Id!,
                    ProductName = product.Name,
                    Barcode = product.Barcode,
                    Quantity = item.Quantity,
                    UnitPrice = product.SalePrice,
                    TaxRate = product.TaxRate,
                    Subtotal = itemSubtotal,
                    TaxAmount = itemTaxAmount,
                    Total = itemTotal
                });

                subtotal += itemSubtotal;
                taxAmount += itemTaxAmount;

                // Stok güncelle
                product.StockQuantity -= item.Quantity;
                await _mongoDb.Products.ReplaceOneAsync(p => p.Id == product.Id, product);
            }

            var total = subtotal + taxAmount - dto.Discount;
            var changeAmount = dto.PaidAmount - total;

            if (changeAmount < 0)
                return BadRequest(new { message = "Ödenen miktar yetersiz." });

            // Fatura numarası oluştur
            var invoiceNumber = $"INV-{DateTime.UtcNow:yyyyMMddHHmmss}";

            var sale = new Sale
            {
                InvoiceNumber = invoiceNumber,
                CustomerId = dto.CustomerId,
                CashierId = userId,
                Items = saleItems,
                Subtotal = subtotal,
                TaxAmount = taxAmount,
                Total = total,
                Discount = dto.Discount,
                PaymentMethod = dto.PaymentMethod,
                PaidAmount = dto.PaidAmount,
                ChangeAmount = changeAmount,
                Notes = dto.Notes,
                IsRefunded = false,
                CreatedAt = DateTime.UtcNow
            };

            await _mongoDb.Sales.InsertOneAsync(sale);

            // Müşteri varsa güncelle
            if (!string.IsNullOrEmpty(dto.CustomerId))
            {
                var customer = await _mongoDb.Customers.Find(c => c.Id == dto.CustomerId).FirstOrDefaultAsync();
                if (customer != null)
                {
                    customer.TotalPurchases++;
                    customer.LastPurchaseDate = DateTime.UtcNow;
                    customer.LoyaltyPoints += (int)(total / 10); // Her 10 TL için 1 puan
                    await _mongoDb.Customers.ReplaceOneAsync(c => c.Id == customer.Id, customer);
                }
            }

            return CreatedAtAction(nameof(GetById), new { id = sale.Id }, sale);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var sale = await _mongoDb.Sales.Find(s => s.Id == id).FirstOrDefaultAsync();
            if (sale == null)
                return NotFound();

            return Ok(sale);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var filter = Builders<Sale>.Filter.Empty;

            if (startDate.HasValue && endDate.HasValue)
            {
                filter = Builders<Sale>.Filter.And(
                    Builders<Sale>.Filter.Gte(s => s.CreatedAt, startDate.Value),
                    Builders<Sale>.Filter.Lte(s => s.CreatedAt, endDate.Value)
                );
            }

            var sales = await _mongoDb.Sales
                .Find(filter)
                .SortByDescending(s => s.CreatedAt)
                .Limit(1000)
                .ToListAsync();
            return Ok(sales);
        }

        [HttpPost("{id}/refund")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> RefundSale(string id)
        {
            var sale = await _mongoDb.Sales.Find(s => s.Id == id).FirstOrDefaultAsync();
            if (sale == null)
                return NotFound();

            if (sale.IsRefunded)
                return BadRequest(new { message = "Bu satış zaten iade edilmiş." });

            // Stokları geri ekle
            foreach (var item in sale.Items)
            {
                var product = await _mongoDb.Products.Find(p => p.Id == item.ProductId).FirstOrDefaultAsync();
                if (product != null)
                {
                    product.StockQuantity += item.Quantity;
                    await _mongoDb.Products.ReplaceOneAsync(p => p.Id == product.Id, product);
                }
            }

            sale.IsRefunded = true;
            await _mongoDb.Sales.ReplaceOneAsync(s => s.Id == id, sale);

            return Ok(new { message = "Satış iadesi başarıyla tamamlandı.", sale });
        }

        [HttpGet("daily-summary")]
        public async Task<IActionResult> GetDailySummary([FromQuery] DateTime? date)
        {
            var targetDate = date ?? DateTime.UtcNow.Date;
            var startDate = targetDate;
            var endDate = targetDate.AddDays(1);

            var sales = await _mongoDb.Sales.Find(s => 
                s.CreatedAt >= startDate && 
                s.CreatedAt < endDate && 
                !s.IsRefunded
            ).ToListAsync();

            var summary = new
            {
                Date = targetDate.ToString("yyyy-MM-dd"),
                TotalSales = sales.Sum(s => s.Total),
                TotalTransactions = sales.Count,
                CashSales = sales.Where(s => s.PaymentMethod == PaymentMethod.Cash).Sum(s => s.Total),
                CardSales = sales.Where(s => s.PaymentMethod == PaymentMethod.CreditCard || s.PaymentMethod == PaymentMethod.DebitCard).Sum(s => s.Total),
                TotalTax = sales.Sum(s => s.TaxAmount),
                TotalDiscount = sales.Sum(s => s.Discount)
            };

            return Ok(summary);
        }
    }
}