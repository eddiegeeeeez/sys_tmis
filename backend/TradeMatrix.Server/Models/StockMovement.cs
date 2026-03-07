using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TradeMatrix.Server.Models
{
    public class StockMovement
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ProductId { get; set; }

        [ForeignKey("ProductId")]
        public Product? Product { get; set; }

        [Required]
        [MaxLength(20)]
        public string MovementType { get; set; } = string.Empty; // STOCK_IN, SALE, WASTE, ADJUSTMENT, VOID_RESTORE

        public int Quantity { get; set; }

        [MaxLength(100)]
        public string? Reference { get; set; } // PO number, TRX number, reason

        [MaxLength(500)]
        public string? Notes { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? CostPrice { get; set; } // Cost at time of movement (for stock-in)

        [Required]
        [MaxLength(100)]
        public string RecordedBy { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
