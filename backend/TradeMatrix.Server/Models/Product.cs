using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TradeMatrix.Server.Models
{
    public class Product
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string SKU { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Category { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal CostPrice { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal SellingPrice { get; set; }

        public int Stock { get; set; }

        public int ReorderLevel { get; set; } = 10;

        public string UnitOfMeasure { get; set; } = "pcs";

        public int? SupplierId { get; set; }
        
        [ForeignKey("SupplierId")]
        public Supplier? Supplier { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;

        [MaxLength(500)]
        public string? ImageUrl { get; set; }
    }
}
