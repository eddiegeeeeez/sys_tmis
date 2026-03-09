using System.ComponentModel.DataAnnotations;

namespace TradeMatrix.Server.DTOs
{
    public class BudgetDto
    {
        public int Id { get; set; }
        public string Category { get; set; } = string.Empty;
        public decimal AllocatedAmount { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? CreatedBy { get; set; }
    }

    public class CreateBudgetDto
    {
        [Required]
        [MaxLength(50)]
        public string Category { get; set; } = string.Empty;

        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be positive")]
        public decimal AllocatedAmount { get; set; }

        [Range(1, 12)]
        public int Month { get; set; }

        [Range(2020, 2100)]
        public int Year { get; set; }

        [MaxLength(200)]
        public string? Notes { get; set; }
    }

    public class BudgetVsActualDto
    {
        public string Category { get; set; } = string.Empty;
        public decimal AllocatedAmount { get; set; }
        public decimal ActualAmount { get; set; }
        public decimal VarianceAmount { get; set; }
        public decimal VariancePercent { get; set; }
        public string Status { get; set; } = string.Empty; // "Under Budget", "Over Budget", "On Track"
    }

    public class BudgetSummaryDto
    {
        public int Month { get; set; }
        public int Year { get; set; }
        public decimal TotalAllocated { get; set; }
        public decimal TotalActual { get; set; }
        public decimal TotalVariance { get; set; }
        public int OverBudgetCount { get; set; }
        public int UnderBudgetCount { get; set; }
        public List<BudgetVsActualDto> Items { get; set; } = new();
    }
}
