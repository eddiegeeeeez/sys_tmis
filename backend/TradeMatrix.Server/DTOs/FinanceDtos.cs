namespace TradeMatrix.Server.DTOs
{
    public class ExpenseDto
    {
        public int Id { get; set; }
        public string ExpenseCategory { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime ExpenseDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? ReferenceNumber { get; set; }
    }

    public class CreateExpenseDto
    {
        public string ExpenseCategory { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime ExpenseDate { get; set; } = DateTime.UtcNow;
        public string Status { get; set; } = "Paid";
        public string? ReferenceNumber { get; set; }
    }
}
