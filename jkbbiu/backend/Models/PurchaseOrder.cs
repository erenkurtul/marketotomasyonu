using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend.Models
{
    public class PurchaseOrder
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string OrderNumber { get; set; } = string.Empty;
        public string SupplierId { get; set; } = string.Empty;
        public List<PurchaseOrderItem> Items { get; set; } = new();
        public decimal Total { get; set; }
        public PurchaseOrderStatus Status { get; set; } = PurchaseOrderStatus.Pending;
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public DateTime? DeliveryDate { get; set; }
        public string Notes { get; set; } = string.Empty;
    }

    public class PurchaseOrderItem
    {
        public string ProductId { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Total { get; set; }
    }

    public enum PurchaseOrderStatus
    {
        Pending,
        Approved,
        Delivered,
        Cancelled
    }
}