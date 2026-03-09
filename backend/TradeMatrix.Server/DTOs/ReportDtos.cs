namespace TradeMatrix.Server.DTOs
{
    // ── Sales Report ──────────────────────────────────────────
    public class SalesReportDto
    {
        public decimal TotalRevenue { get; set; }
        public decimal TotalTax { get; set; }
        public decimal NetRevenue { get; set; }
        public int TransactionCount { get; set; }
        public int ItemsSold { get; set; }
        public decimal AverageOrderValue { get; set; }
        public int VoidedCount { get; set; }
        public decimal VoidedAmount { get; set; }
        public List<DailyBreakdownDto> DailyBreakdown { get; set; } = new();
        public List<PaymentMethodBreakdownDto> PaymentMethodBreakdown { get; set; } = new();
    }

    public class DailyBreakdownDto
    {
        public DateTime Date { get; set; }
        public decimal Revenue { get; set; }
        public int TransactionCount { get; set; }
    }

    public class PaymentMethodBreakdownDto
    {
        public string Method { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public int Count { get; set; }
    }

    // ── Inventory Valuation Report ────────────────────────────
    public class InventoryValuationDto
    {
        public decimal TotalCostValue { get; set; }
        public decimal TotalRetailValue { get; set; }
        public decimal PotentialProfit { get; set; }
        public int TotalSKUs { get; set; }
        public int OutOfStockCount { get; set; }
        public int LowStockCount { get; set; }
        public List<CategoryValuationDto> CategoryBreakdown { get; set; } = new();
    }

    public class CategoryValuationDto
    {
        public string Category { get; set; } = string.Empty;
        public int SKUCount { get; set; }
        public decimal CostValue { get; set; }
        public decimal RetailValue { get; set; }
    }

    // ── HR Summary Report ─────────────────────────────────────
    public class HRSummaryDto
    {
        public int TotalEmployees { get; set; }
        public int ActiveCount { get; set; }
        public int DepartmentCount { get; set; }
        public decimal AttendanceRate { get; set; }
        public decimal TotalPayrollGross { get; set; }
        public decimal TotalPayrollNet { get; set; }
        public decimal TotalDeductions { get; set; }
        public List<DepartmentBreakdownDto> DepartmentBreakdown { get; set; } = new();
    }

    public class DepartmentBreakdownDto
    {
        public string Department { get; set; } = string.Empty;
        public int Headcount { get; set; }
        public decimal PayrollCost { get; set; }
    }

    // ── Procurement Summary Report ────────────────────────────
    public class ProcurementSummaryDto
    {
        public int TotalPOs { get; set; }
        public int PendingCount { get; set; }
        public int ReceivedCount { get; set; }
        public decimal TotalSpend { get; set; }
        public List<SupplierBreakdownDto> SupplierBreakdown { get; set; } = new();
    }

    public class SupplierBreakdownDto
    {
        public string SupplierName { get; set; } = string.Empty;
        public int POCount { get; set; }
        public decimal TotalAmount { get; set; }
    }
}
