using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TradeMatrix.Server.Models
{
    public class Budget
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Category { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal AllocatedAmount { get; set; }

        [Range(1, 12)]
        public int Month { get; set; }

        public int Year { get; set; }

        [MaxLength(200)]
        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [MaxLength(100)]
        public string? CreatedBy { get; set; }
    }
}
