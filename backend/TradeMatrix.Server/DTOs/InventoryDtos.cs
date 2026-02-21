using System.ComponentModel.DataAnnotations;

namespace TradeMatrix.Server.DTOs
{
    public class ProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal CostPrice { get; set; }
        public decimal SellingPrice { get; set; }
        public int Stock { get; set; }
        public int ReorderLevel { get; set; }
        public string UnitOfMeasure { get; set; } = string.Empty;
        public int? SupplierId { get; set; }
        public string? SupplierName { get; set; }
    }

    public class CreateProductDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        [Required]
        public string Category { get; set; } = string.Empty;
        public decimal CostPrice { get; set; }
        public decimal SellingPrice { get; set; }
        public int InitialStock { get; set; }
        public int ReorderLevel { get; set; } = 10;
        public string UnitOfMeasure { get; set; } = "pcs";
        public int? SupplierId { get; set; }
    }
}
