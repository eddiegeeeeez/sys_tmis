using System.ComponentModel.DataAnnotations;

namespace TradeMatrix.Server.DTOs
{
    public class SupplierDto
    {
        public int Id { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string ContactPerson { get; set; } = string.Empty;
        public string ContactNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
    }

    public class CreateSupplierDto
    {
        [Required]
        public string CompanyName { get; set; } = string.Empty;
        [Required]
        public string ContactPerson { get; set; } = string.Empty;
        [Required]
        public string ContactNumber { get; set; } = string.Empty;
        [Required]
        public string Email { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
    }

    public class CreatePODto
    {
        [Required]
        public int SupplierId { get; set; }
        public DateTime ExpectedDeliveryDate { get; set; }
        public List<CreatePOItemDto> Items { get; set; } = new();
    }

    public class CreatePOItemDto
    {
        [Required]
        public int ProductId { get; set; }
        [Required]
        public int Quantity { get; set; }
        [Required]
        public decimal UnitCost { get; set; }
    }

    public class PurchaseOrderDto
    {
        public int Id { get; set; }
        public string PONumber { get; set; } = string.Empty;
        public int SupplierId { get; set; }
        public string SupplierName { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; }
        public DateTime? ExpectedDeliveryDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
