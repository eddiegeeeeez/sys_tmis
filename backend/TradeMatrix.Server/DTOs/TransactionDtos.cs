using System.ComponentModel.DataAnnotations;

namespace TradeMatrix.Server.DTOs
{
    public class CreateTransactionDto
    {
        [Required]
        [RegularExpression("^(Cash|Card|GCash|PayMaya)$", ErrorMessage = "PaymentMethod must be Cash, Card, GCash, or PayMaya.")]
        public string PaymentMethod { get; set; } = "Cash";

        [Range(0, (double)decimal.MaxValue, ErrorMessage = "AmountTendered cannot be negative.")]
        public decimal AmountTendered { get; set; }

        [MaxLength(100)]
        public string? ReferenceNumber { get; set; }

        [Required]
        [MinLength(1)]
        [MaxLength(100, ErrorMessage = "A transaction cannot contain more than 100 line items.")]
        public List<CreateTransactionItemDto> Items { get; set; } = new();
    }

    public class CreateTransactionItemDto
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
    }

    public class TransactionDto
    {
        public int Id { get; set; }
        public string TransactionNumber { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public decimal Subtotal { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal AmountTendered { get; set; }
        public decimal Change { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime TransactionDate { get; set; }
        public string? CashierName { get; set; }
        public string? ReferenceNumber { get; set; }
        public List<TransactionItemDto> Items { get; set; } = new();
    }

    public class TransactionItemDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public decimal LineTotal { get; set; }
    }
}
