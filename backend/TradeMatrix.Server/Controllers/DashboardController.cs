using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TradeMatrix.Server.Data;
using TradeMatrix.Server.DTOs;

namespace TradeMatrix.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DashboardController> _logger;

        public DashboardController(ApplicationDbContext context, ILogger<DashboardController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Returns aggregated stats for all role-based dashboard views.
        /// </summary>
        [HttpGet("summary")]
        public async Task<ActionResult<ApiResponse<DashboardSummaryDto>>> GetSummary()
        {
            try
            {
                var now = DateTime.UtcNow;
                var today = now.Date;
                var weekAgo = today.AddDays(-6);
                var monthStart = new DateTime(now.Year, now.Month, 1);
                var monthEnd = monthStart.AddMonths(1);

                // ── Shared counts ────────────────────────────────────────────
                var totalUsers = await _context.Users.CountAsync(u => !u.IsArchived);
                var activeEmployees = await _context.Employees.CountAsync(e => e.IsActive);
                var totalProducts = await _context.Products.CountAsync(p => p.IsActive);
                var lowStockCount = await _context.Products
                    .CountAsync(p => p.IsActive && p.Stock <= p.ReorderLevel);
                var monthlyExpenses = await _context.Expenses
                    .Where(e => e.ExpenseDate >= monthStart && e.ExpenseDate < monthEnd)
                    .SumAsync(e => (decimal?)e.Amount) ?? 0m;
                var pendingPOs = await _context.PurchaseOrders
                    .CountAsync(po => po.Status == "Pending");
                var presentToday = await _context.Attendances
                    .CountAsync(a => a.Date == today && a.Status == "Present");

                // ── Security alerts (failed events in last 24 h) ─────────────
                var securityAlerts = await _context.AuditLogs
                    .CountAsync(a => a.Timestamp >= now.AddHours(-24) && a.Status == "Failure");

                // ── Recent audit events (last 5) ─────────────────────────────
                var recentLogs = await _context.AuditLogs
                    .OrderByDescending(a => a.Timestamp)
                    .Take(5)
                    .ToListAsync();

                var recentEvents = recentLogs
                    .Select(a => new RecentEventDto
                    {
                        Event = a.Event,
                        Time = FormatRelativeTime(a.Timestamp, now),
                        Status = MapSeverityToStatus(a.Severity)
                    })
                    .ToList();

                // ── Weekly expenses (last 7 days, grouped in memory) ─────────
                var rawExpenses = await _context.Expenses
                    .Where(e => e.ExpenseDate >= weekAgo && e.ExpenseDate < today.AddDays(1))
                    .Select(e => new { e.ExpenseDate, e.Amount })
                    .ToListAsync();

                var weeklyExpenses = Enumerable.Range(0, 7).Select(i =>
                {
                    var date = weekAgo.AddDays(i);
                    var total = rawExpenses
                        .Where(e => e.ExpenseDate.Date == date.Date)
                        .Sum(e => e.Amount);
                    return new WeeklyExpenseDto { Name = date.ToString("ddd"), Sales = total };
                }).ToList();

                // ── Expenses by category (current month) ─────────────────────
                var expensesByCategory = await _context.Expenses
                    .Where(e => e.ExpenseDate >= monthStart && e.ExpenseDate < monthEnd)
                    .GroupBy(e => e.ExpenseCategory)
                    .Select(g => new CategoryExpenseDto { Name = g.Key, Value = g.Sum(e => e.Amount) })
                    .ToListAsync();

                // ── Low-stock product list ────────────────────────────────────
                var lowStockItems = await _context.Products
                    .Where(p => p.IsActive && p.Stock <= p.ReorderLevel)
                    .OrderBy(p => p.Stock)
                    .Take(5)
                    .Select(p => new LowStockItemDto
                    {
                        Name = p.Name,
                        Stock = p.Stock,
                        Status = p.Stock == 0 ? "Out of Stock"
                               : p.Stock <= p.ReorderLevel / 2 ? "Critical"
                               : "Low"
                    })
                    .ToListAsync();

                // ── Pending purchase orders list ──────────────────────────────
                var pendingPOModels = await _context.PurchaseOrders
                    .Include(po => po.Supplier)
                    .Where(po => po.Status == "Pending")
                    .OrderBy(po => po.ExpectedDeliveryDate)
                    .Take(5)
                    .ToListAsync();

                var pendingPOList = pendingPOModels.Select(po => new PendingPODto
                {
                    Id = po.PONumber,
                    Supplier = po.Supplier?.CompanyName ?? "Unknown",
                    Status = po.Status,
                    Eta = po.ExpectedDeliveryDate.HasValue
                        ? (po.ExpectedDeliveryDate.Value.Date <= today
                            ? "Today"
                            : po.ExpectedDeliveryDate.Value.ToString("MMM dd"))
                        : "TBD"
                }).ToList();

                var summary = new DashboardSummaryDto
                {
                    TotalUsers = totalUsers,
                    ActiveEmployees = activeEmployees,
                    TotalProducts = totalProducts,
                    LowStockCount = lowStockCount,
                    MonthlyExpenses = monthlyExpenses,
                    PendingPurchaseOrders = pendingPOs,
                    PresentToday = presentToday,
                    SecurityAlerts = securityAlerts,
                    RecentEvents = recentEvents,
                    WeeklyExpenses = weeklyExpenses,
                    ExpensesByCategory = expensesByCategory,
                    LowStockItems = lowStockItems,
                    PendingPOs = pendingPOList
                };

                return Ok(ApiResponse<DashboardSummaryDto>.SuccessResponse(summary, "Dashboard summary retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving dashboard summary");
                return StatusCode(500, ApiResponse<DashboardSummaryDto>.ErrorResponse("An error occurred while retrieving dashboard summary"));
            }
        }

        private static string FormatRelativeTime(DateTime timestamp, DateTime now)
        {
            var diff = now - timestamp;
            if (diff.TotalMinutes < 2) return "Just now";
            if (diff.TotalMinutes < 60) return $"{(int)diff.TotalMinutes} mins ago";
            if (diff.TotalHours < 24) return $"{(int)diff.TotalHours} hours ago";
            if (diff.TotalDays < 2) return "Yesterday";
            return timestamp.ToString("MMM dd");
        }

        private static string MapSeverityToStatus(string severity) => severity?.ToLower() switch
        {
            "critical" or "high" => "error",
            "medium" or "warning" => "warning",
            "success" => "success",
            _ => "info"
        };
    }
}
