using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using backend.Models;
using backend.Services;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CashRegisterController : ControllerBase
    {
        private readonly MongoDbService _mongoDb;

        public CashRegisterController(MongoDbService mongoDb)
        {
            _mongoDb = mongoDb;
        }

        [HttpPost("open")]
        public async Task<IActionResult> OpenRegister([FromBody] decimal openingBalance)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            // Açık kasa var mı kontrol et
            var openRegister = await _mongoDb.CashRegisters
                .Find(c => c.CashierId == userId && c.Status == CashRegisterStatus.Open)
                .FirstOrDefaultAsync();

            if (openRegister != null)
                return BadRequest(new { message = "Zaten açık bir kasanız var." });

            var cashRegister = new CashRegister
            {
                CashierId = userId,
                OpeningBalance = openingBalance,
                ClosingBalance = 0,
                TotalCashSales = 0,
                TotalCardSales = 0,
                TotalSales = 0,
                TotalTransactions = 0,
                Status = CashRegisterStatus.Open,
                OpenedAt = DateTime.UtcNow
            };

            await _mongoDb.CashRegisters.InsertOneAsync(cashRegister);
            return Ok(cashRegister);
        }

        [HttpPost("close")]
        public async Task<IActionResult> CloseRegister()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var cashRegister = await _mongoDb.CashRegisters
                .Find(c => c.CashierId == userId && c.Status == CashRegisterStatus.Open)
                .FirstOrDefaultAsync();

            if (cashRegister == null)
                return BadRequest(new { message = "Açık kasa bulunamadı." });

            // Bugünün satışlarını hesapla
            var sales = await _mongoDb.Sales.Find(s => 
                s.CashierId == userId && 
                s.CreatedAt >= cashRegister.OpenedAt && 
                !s.IsRefunded
            ).Limit(10000).ToListAsync();

            cashRegister.TotalCashSales = sales.Where(s => s.PaymentMethod == PaymentMethod.Cash).Sum(s => s.Total);
            cashRegister.TotalCardSales = sales.Where(s => s.PaymentMethod == PaymentMethod.CreditCard || s.PaymentMethod == PaymentMethod.DebitCard).Sum(s => s.Total);
            cashRegister.TotalSales = sales.Sum(s => s.Total);
            cashRegister.TotalTransactions = sales.Count;
            cashRegister.ClosingBalance = cashRegister.OpeningBalance + cashRegister.TotalCashSales;
            cashRegister.Status = CashRegisterStatus.Closed;
            cashRegister.ClosedAt = DateTime.UtcNow;

            await _mongoDb.CashRegisters.ReplaceOneAsync(c => c.Id == cashRegister.Id, cashRegister);
            return Ok(cashRegister);
        }

        [HttpGet("current")]
        public async Task<IActionResult> GetCurrent()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var cashRegister = await _mongoDb.CashRegisters
                .Find(c => c.CashierId == userId && c.Status == CashRegisterStatus.Open)
                .FirstOrDefaultAsync();

            if (cashRegister == null)
                return NotFound(new { message = "Açık kasa bulunamadı." });

            return Ok(cashRegister);
        }

        [HttpGet("history")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> GetHistory([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var filter = Builders<CashRegister>.Filter.Eq(c => c.Status, CashRegisterStatus.Closed);

            if (startDate.HasValue && endDate.HasValue)
            {
                filter = Builders<CashRegister>.Filter.And(
                    filter,
                    Builders<CashRegister>.Filter.Gte(c => c.OpenedAt, startDate.Value),
                    Builders<CashRegister>.Filter.Lte(c => c.ClosedAt, endDate.Value)
                );
            }

            var registers = await _mongoDb.CashRegisters
                .Find(filter)
                .SortByDescending(c => c.ClosedAt)
                .Limit(1000)
                .ToListAsync();
            return Ok(registers);
        }
    }
}