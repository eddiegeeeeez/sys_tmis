using Microsoft.EntityFrameworkCore;
using TradeMatrix.Server.Data;
using TradeMatrix.Server.DTOs;

namespace TradeMatrix.Server.Services
{
    public class ReportService : IReportService
    {
        private readonly ApplicationDbContext _context;

        public ReportService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<SalesReportDto> GetSalesReportAsync(DateTime from, DateTime to)
        {
            var toEnd = to.AddDays(1);

            var completedTx = _context.Transactions
                .Where(t => t.TransactionDate >= from && t.TransactionDate < toEnd && t.Status == "Completed");

            var voidedTx = _context.Transactions
                .Where(t => t.TransactionDate >= from && t.TransactionDate < toEnd && t.Status == "Voided");

            var totalRevenue = await completedTx.SumAsync(t => (decimal?)t.TotalAmount) ?? 0m;
            var totalTax = await completedTx.SumAsync(t => (decimal?)t.TaxAmount) ?? 0m;
            var txCount = await completedTx.CountAsync();
            var itemsSold = await _context.TransactionItems
                .Where(ti => ti.Transaction!.TransactionDate >= from && ti.Transaction.TransactionDate < toEnd && ti.Transaction.Status == "Completed")
                .SumAsync(ti => (int?)ti.Quantity) ?? 0;

            var voidedCount = await voidedTx.CountAsync();
            var voidedAmount = await voidedTx.SumAsync(t => (decimal?)t.TotalAmount) ?? 0m;

            // Daily breakdown
            var dailyRaw = await completedTx
                .GroupBy(t => t.TransactionDate.Date)
                .Select(g => new DailyBreakdownDto
                {
                    Date = g.Key,
                    Revenue = g.Sum(t => t.TotalAmount),
                    TransactionCount = g.Count()
                })
                .OrderBy(d => d.Date)
                .ToListAsync();

            // Payment method breakdown
            var paymentBreakdown = await completedTx
                .GroupBy(t => t.PaymentMethod)
                .Select(g => new PaymentMethodBreakdownDto
                {
                    Method = g.Key,
                    Amount = g.Sum(t => t.TotalAmount),
                    Count = g.Count()
                })
                .OrderByDescending(p => p.Amount)
                .ToListAsync();

            return new SalesReportDto
            {
                TotalRevenue = totalRevenue,
                TotalTax = totalTax,
                NetRevenue = totalRevenue - totalTax,
                TransactionCount = txCount,
                ItemsSold = itemsSold,
                AverageOrderValue = txCount > 0 ? Math.Round(totalRevenue / txCount, 2) : 0,
                VoidedCount = voidedCount,
                VoidedAmount = voidedAmount,
                DailyBreakdown = dailyRaw,
                PaymentMethodBreakdown = paymentBreakdown
            };
        }

        public async Task<InventoryValuationDto> GetInventoryValuationAsync()
        {
            var products = await _context.Products
                .Where(p => p.IsActive)
                .Select(p => new { p.Category, p.CostPrice, p.SellingPrice, p.Stock, p.ReorderLevel })
                .ToListAsync();

            var totalCost = products.Sum(p => p.CostPrice * p.Stock);
            var totalRetail = products.Sum(p => p.SellingPrice * p.Stock);

            var categoryBreakdown = products
                .GroupBy(p => p.Category)
                .Select(g => new CategoryValuationDto
                {
                    Category = g.Key,
                    SKUCount = g.Count(),
                    CostValue = g.Sum(p => p.CostPrice * p.Stock),
                    RetailValue = g.Sum(p => p.SellingPrice * p.Stock)
                })
                .OrderByDescending(c => c.RetailValue)
                .ToList();

            return new InventoryValuationDto
            {
                TotalCostValue = totalCost,
                TotalRetailValue = totalRetail,
                PotentialProfit = totalRetail - totalCost,
                TotalSKUs = products.Count,
                OutOfStockCount = products.Count(p => p.Stock == 0),
                LowStockCount = products.Count(p => p.Stock > 0 && p.Stock <= p.ReorderLevel),
                CategoryBreakdown = categoryBreakdown
            };
        }

        public async Task<HRSummaryDto> GetHRSummaryAsync(DateTime from, DateTime to)
        {
            var toEnd = to.AddDays(1);

            var employees = await _context.Employees.Where(e => e.IsActive).ToListAsync();
            var totalEmployees = employees.Count;
            var departments = employees.Select(e => e.Department).Distinct().Count();

            // Attendance rate for the period
            var totalAttendanceDays = await _context.Attendances
                .CountAsync(a => a.Date >= from.Date && a.Date < toEnd);
            var presentDays = await _context.Attendances
                .CountAsync(a => a.Date >= from.Date && a.Date < toEnd && a.Status == "Present");
            var attendanceRate = totalAttendanceDays > 0
                ? Math.Round((decimal)presentDays / totalAttendanceDays * 100, 1)
                : 0m;

            // Payroll totals for the period
            var payrollRecords = await _context.PayrollRecords
                .Where(pr => pr.PayPeriodStart >= from && pr.PayPeriodEnd < toEnd)
                .ToListAsync();

            var totalGross = payrollRecords.Sum(pr => pr.GrossPay);
            var totalNet = payrollRecords.Sum(pr => pr.NetPay);
            var totalDeductions = payrollRecords.Sum(pr => pr.TotalDeductions);

            // Department breakdown
            var deptBreakdown = employees
                .GroupBy(e => e.Department)
                .Select(g =>
                {
                    var empIds = g.Select(e => e.Id).ToHashSet();
                    var deptPayroll = payrollRecords.Where(pr => empIds.Contains(pr.EmployeeId)).Sum(pr => pr.GrossPay);
                    return new DepartmentBreakdownDto
                    {
                        Department = g.Key,
                        Headcount = g.Count(),
                        PayrollCost = deptPayroll
                    };
                })
                .OrderByDescending(d => d.Headcount)
                .ToList();

            return new HRSummaryDto
            {
                TotalEmployees = totalEmployees,
                ActiveCount = totalEmployees,
                DepartmentCount = departments,
                AttendanceRate = attendanceRate,
                TotalPayrollGross = totalGross,
                TotalPayrollNet = totalNet,
                TotalDeductions = totalDeductions,
                DepartmentBreakdown = deptBreakdown
            };
        }

        public async Task<ProcurementSummaryDto> GetProcurementSummaryAsync(DateTime from, DateTime to)
        {
            var toEnd = to.AddDays(1);

            var pos = await _context.PurchaseOrders
                .Include(po => po.Supplier)
                .Where(po => po.OrderDate >= from && po.OrderDate < toEnd)
                .ToListAsync();

            var supplierBreakdown = pos
                .GroupBy(po => po.Supplier?.CompanyName ?? "Unknown")
                .Select(g => new SupplierBreakdownDto
                {
                    SupplierName = g.Key,
                    POCount = g.Count(),
                    TotalAmount = g.Sum(po => po.TotalAmount)
                })
                .OrderByDescending(s => s.TotalAmount)
                .ToList();

            return new ProcurementSummaryDto
            {
                TotalPOs = pos.Count,
                PendingCount = pos.Count(po => po.Status == "Pending"),
                ReceivedCount = pos.Count(po => po.Status == "Received"),
                TotalSpend = pos.Sum(po => po.TotalAmount),
                SupplierBreakdown = supplierBreakdown
            };
        }
    }
}
