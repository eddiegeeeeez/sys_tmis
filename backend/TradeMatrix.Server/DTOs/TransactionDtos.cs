using System.ComponentModel.DataAnnotations;

namespace TradeMatrix.Server.DTOs
{
    public class CreateTransactionDto
    {
        [Required]
        public string PaymentMethod { get; set; } = "Cash";

        public decimal AmountTendered { get; set; }

        [Required]
        [MinLength(1)]
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
