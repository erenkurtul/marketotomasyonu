using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class ProductDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        [Required]
        public string Barcode { get; set; } = string.Empty;

        [Required]
        public string CategoryId { get; set; } = string.Empty;

        [Required]
        public decimal PurchasePrice { get; set; }

        [Required]
        public decimal SalePrice { get; set; }

        [Required]
        public decimal TaxRate { get; set; } = 18;

        [Required]
        public int StockQuantity { get; set; }

        [Required]
        public int MinimumStockLevel { get; set; } = 10;

        public string Unit { get; set; } = "Adet";
        public string? ImageUrl { get; set; }
    }
}