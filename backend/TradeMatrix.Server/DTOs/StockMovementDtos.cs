using System.ComponentModel.DataAnnotations;

namespace TradeMatrix.Server.DTOs
{
    public class StockMovementDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string ProductSKU { get; set; } = string.Empty;
        public string MovementType { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public string? Reference { get; set; }
        public string? Notes { get; set; }
        public decimal? CostPrice { get; set; }
        public string RecordedBy { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class CreateStockMovementDto
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        [RegularExpression("STOCK_IN|WASTE|ADJUSTMENT", ErrorMessage = "MovementType must be STOCK_IN, WASTE, or ADJUSTMENT.")]
        public string MovementType { get; set; } = string.Empty;

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1.")]
        public int Quantity { get; set; }

        [MaxLength(100)]
        public string? Reference { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }

        public decimal? CostPrice { get; set; }
    }

    public class StockMovementSummaryDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string ProductSKU { get; set; } = string.Empty;
        public int TotalStockIn { get; set; }
        public int TotalSales { get; set; }
        public int TotalWaste { get; set; }
        public int TotalAdjustments { get; set; }
        public int TotalVoidRestored { get; set; }
        public int CalculatedStock { get; set; }
        public int CurrentStock { get; set; }
    }
}
