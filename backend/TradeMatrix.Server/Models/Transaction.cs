using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TradeMatrix.Server.Models
{
    public class Transaction
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(30)]
        public string TransactionNumber { get; set; } = string.Empty; // e.g. TRX-20260222-0001

        public int? CashierId { get; set; }

        [ForeignKey("CashierId")]
        public User? Cashier { get; set; }

        [MaxLength(30)]
        public string PaymentMethod { get; set; } = "Cash"; // Cash, GCash, PayMaya

        [MaxLength(100)]
        public string? ReferenceNumber { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Subtotal { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TaxAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal AmountTendered { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Change { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Completed"; // Completed, Refunded, Voided

        public DateTime TransactionDate { get; set; } = DateTime.UtcNow;

        public ICollection<TransactionItem> Items { get; set; } = new List<TransactionItem>();
    }

    public class TransactionItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int TransactionId { get; set; }

        [ForeignKey("TransactionId")]
        public Transaction? Transaction { get; set; }

        [Required]
        public int ProductId { get; set; }

        [ForeignKey("ProductId")]
        public Product? Product { get; set; }

        [Required]
        [MaxLength(100)]
        public string ProductName { get; set; } = string.Empty; // snapshot at time of sale

        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; }

        public int Quantity { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal LineTotal { get; set; }
    }
}
