using System.ComponentModel.DataAnnotations;
using backend.Models;

namespace backend.DTOs
{
    public class CreateSaleDto
    {
        public string? CustomerId { get; set; }
        
        [Required]
        public List<SaleItemDto> Items { get; set; } = new();

        public decimal Discount { get; set; } = 0;
        
        [Required]
        public PaymentMethod PaymentMethod { get; set; }

        [Required]
        public decimal PaidAmount { get; set; }

        public string Notes { get; set; } = string.Empty;
    }

    public class SaleItemDto
    {
        [Required]
        public string ProductId { get; set; } = string.Empty;

        [Required]
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
    }
}