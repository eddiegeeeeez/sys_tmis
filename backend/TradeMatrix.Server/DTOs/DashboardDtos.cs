namespace TradeMatrix.Server.DTOs
{
    public class DashboardSummaryDto
    {
        // Shared across all roles
        public int TotalUsers { get; set; }
        public int ActiveEmployees { get; set; }
        public int TotalProducts { get; set; }
        public int LowStockCount { get; set; }
        public decimal MonthlyExpenses { get; set; }
        public int PendingPurchaseOrders { get; set; }
        public int PresentToday { get; set; }

        // SuperAdmin only
        public int SecurityAlerts { get; set; }
        public List<RecentEventDto> RecentEvents { get; set; } = new();

        // Manager charts
        public List<WeeklyExpenseDto> WeeklyExpenses { get; set; } = new();
        public List<CategoryExpenseDto> ExpensesByCategory { get; set; } = new();

        // Inventory
        public List<LowStockItemDto> LowStockItems { get; set; } = new();
        public List<PendingPODto> PendingPOs { get; set; } = new();

        // Cashier
        public decimal TodayRevenue { get; set; }
        public int TodayTransactionCount { get; set; }
        public int TodayItemsSold { get; set; }
        public List<RecentTransactionDto> RecentTransactions { get; set; } = new();

        // Phase 3: Revenue & Profit (Manager)
        public decimal MonthlyRevenue { get; set; }
        public decimal PreviousMonthRevenue { get; set; }
        public decimal PreviousMonthExpenses { get; set; }
        public decimal ProfitEstimate { get; set; }

        // Phase 3: Real system metrics (SuperAdmin)
        public bool DatabaseConnected { get; set; }
        public int PendingMigrationsCount { get; set; }

        // Phase 4: Trends & Monitoring
        public decimal RevenueTrend { get; set; }      // % change vs prev month
        public decimal ExpenseTrend { get; set; }      // % change vs prev month
        public decimal AttendanceRate { get; set; }    // % present / active
        public bool PayrollDueSoon { get; set; }
        public int NewStockAlerts { get; set; }        // newly low since 7d ago
    }

    public class RecentTransactionDto
    {
        public string TransactionNumber { get; set; } = string.Empty;
        public string Time { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public int ItemCount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
    }

    public class RecentEventDto
    {
        public string Event { get; set; } = string.Empty;
        public string Time { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }

    public class WeeklyExpenseDto
    {
        public string Name { get; set; } = string.Empty;
        public decimal Sales { get; set; }
    }

    public class CategoryExpenseDto
    {
        public string Name { get; set; } = string.Empty;
        public decimal Value { get; set; }
    }

    public class LowStockItemDto
    {
        public string Name { get; set; } = string.Empty;
        public int Stock { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class PendingPODto
    {
        public string Id { get; set; } = string.Empty;
        public string Supplier { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Eta { get; set; } = string.Empty;
    }
}
