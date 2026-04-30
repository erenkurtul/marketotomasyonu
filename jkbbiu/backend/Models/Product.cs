using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Product
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        [Required]
        public string Barcode { get; set; } = string.Empty;

        [Required]
        public string CategoryId { get; set; } = string.Empty;

        [Required]
        [Range(0, double.MaxValue)]
        public decimal PurchasePrice { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public decimal SalePrice { get; set; }

        [Required]
        [Range(0, 100)]
        public decimal TaxRate { get; set; } = 18;

        [Required]
        [Range(0, int.MaxValue)]
        public int StockQuantity { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int MinimumStockLevel { get; set; } = 10;

        public string Unit { get; set; } = "Adet";
        public string? ImageUrl { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}