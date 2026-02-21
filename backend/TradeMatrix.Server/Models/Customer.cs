using System.ComponentModel.DataAnnotations;

namespace TradeMatrix.Server.Models
{
    public class Customer
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string CustomerName { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string CustomerType { get; set; } = "Retail"; // Retail, Wholesale, Corporate

        [MaxLength(20)]
        public string? ContactNumber { get; set; }

        [MaxLength(100)]
        public string? Email { get; set; }

        [MaxLength(200)]
        public string? Address { get; set; }

        public int LoyaltyPoints { get; set; } = 0;

        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
