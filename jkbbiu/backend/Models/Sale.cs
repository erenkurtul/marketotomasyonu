using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Sale
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required]
        public string InvoiceNumber { get; set; } = string.Empty;

        public string? CustomerId { get; set; }
        
        [Required]
        public string CashierId { get; set; } = string.Empty;

        [Required]
        public List<SaleItem> Items { get; set; } = new();

        [Required]
        public decimal Subtotal { get; set; }

        [Required]
        public decimal TaxAmount { get; set; }

        [Required]
        public decimal Total { get; set; }

        public decimal Discount { get; set; } = 0;
        
        [Required]
        public PaymentMethod PaymentMethod { get; set; }

        public decimal PaidAmount { get; set; }
        public decimal ChangeAmount { get; set; }
        public string Notes { get; set; } = string.Empty;
        public bool IsRefunded { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class SaleItem
    {
        public string ProductId { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string Barcode { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TaxRate { get; set; }
        public decimal Subtotal { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal Total { get; set; }
    }

    public enum PaymentMethod
    {
        Cash,
        CreditCard,
        DebitCard,
        Mixed
    }
}