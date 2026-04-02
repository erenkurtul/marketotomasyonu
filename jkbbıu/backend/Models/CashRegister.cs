using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class CashRegister
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required]
        public string CashierId { get; set; } = string.Empty;

        [Required]
        public decimal OpeningBalance { get; set; }

        public decimal ClosingBalance { get; set; }
        public decimal TotalCashSales { get; set; }
        public decimal TotalCardSales { get; set; }
        public decimal TotalSales { get; set; }
        public int TotalTransactions { get; set; }
        public List<CashMovement> Movements { get; set; } = new();
        public CashRegisterStatus Status { get; set; } = CashRegisterStatus.Open;
        public DateTime OpenedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ClosedAt { get; set; }
    }

    public class CashMovement
    {
        public string Type { get; set; } = string.Empty; // "Income" veya "Expense"
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    public enum CashRegisterStatus
    {
        Open,
        Closed
    }
}