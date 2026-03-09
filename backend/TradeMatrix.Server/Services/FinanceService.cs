using Microsoft.EntityFrameworkCore;
using TradeMatrix.Server.Data;
using TradeMatrix.Server.DTOs;
using TradeMatrix.Server.Models;

namespace TradeMatrix.Server.Services
{
    public class FinanceService : IFinanceService
    {
        private readonly ApplicationDbContext _context;

        public FinanceService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<ExpenseDto>> GetExpensesAsync()
        {
            return await _context.Expenses
                .OrderByDescending(e => e.ExpenseDate)
                .Select(e => new ExpenseDto
                {
                    Id = e.Id,
                    ExpenseCategory = e.ExpenseCategory,
                    Description = e.Description,
                    Amount = e.Amount,
                    ExpenseDate = e.ExpenseDate,
                    Status = e.Status,
                    ReferenceNumber = e.ReferenceNumber
                }).ToListAsync();
        }

        public async Task<ExpenseDto> CreateExpenseAsync(CreateExpenseDto dto)
        {
            var expense = new Expense
            {
                ExpenseCategory = dto.ExpenseCategory,
                Description = dto.Description,
                Amount = dto.Amount,
                ExpenseDate = dto.ExpenseDate,
                Status = dto.Status,
                ReferenceNumber = dto.ReferenceNumber
            };

            _context.Expenses.Add(expense);
            await _context.SaveChangesAsync();

            return await _context.Expenses
                .Select(e => new ExpenseDto
                {
                    Id = e.Id,
                    ExpenseCategory = e.ExpenseCategory,
                    Description = e.Description,
                    Amount = e.Amount,
                    ExpenseDate = e.ExpenseDate,
                    Status = e.Status,
                    ReferenceNumber = e.ReferenceNumber
                }).FirstAsync(e => e.Id == expense.Id);
        }

        public async Task<ExpenseDto?> UpdateExpenseAsync(int id, CreateExpenseDto dto)
        {
            var expense = await _context.Expenses.FindAsync(id);
            if (expense == null) return null;

            expense.ExpenseCategory = dto.ExpenseCategory;
            expense.Description = dto.Description;
            expense.Amount = dto.Amount;
            expense.ExpenseDate = dto.ExpenseDate;
            expense.Status = dto.Status;
            expense.ReferenceNumber = dto.ReferenceNumber;

            await _context.SaveChangesAsync();
            return await _context.Expenses
                .Select(e => new ExpenseDto
                {
                    Id = e.Id,
                    ExpenseCategory = e.ExpenseCategory,
                    Description = e.Description,
                    Amount = e.Amount,
                    ExpenseDate = e.ExpenseDate,
                    Status = e.Status,
                    ReferenceNumber = e.ReferenceNumber
                }).FirstAsync(e => e.Id == id);
        }

        public async Task<decimal> GetTotalExpensesForMonthAsync(int month, int year)
        {
            return await _context.Expenses
                .Where(e => e.ExpenseDate.Month == month && e.ExpenseDate.Year == year)
                .SumAsync(e => e.Amount);
        }

        public async Task<List<ExpenseDto>> GetExpensesAsync(DateTime? from, DateTime? to, string? category)
        {
            var query = _context.Expenses.AsQueryable();

            if (from.HasValue)
                query = query.Where(e => e.ExpenseDate >= from.Value);
            if (to.HasValue)
                query = query.Where(e => e.ExpenseDate < to.Value.AddDays(1));
            if (!string.IsNullOrWhiteSpace(category))
                query = query.Where(e => e.ExpenseCategory == category);

            return await query
                .OrderByDescending(e => e.ExpenseDate)
                .Select(e => new ExpenseDto
                {
                    Id = e.Id,
                    ExpenseCategory = e.ExpenseCategory,
                    Description = e.Description,
                    Amount = e.Amount,
                    ExpenseDate = e.ExpenseDate,
                    Status = e.Status,
                    ReferenceNumber = e.ReferenceNumber
                }).ToListAsync();
        }

        public async Task<List<ExpenseSummaryDto>> GetExpenseSummaryAsync(DateTime from, DateTime to)
        {
            var toEnd = to.AddDays(1);
            var groups = await _context.Expenses
                .Where(e => e.ExpenseDate >= from && e.ExpenseDate < toEnd)
                .GroupBy(e => e.ExpenseCategory)
                .Select(g => new { Category = g.Key, TotalAmount = g.Sum(e => e.Amount), Count = g.Count() })
                .ToListAsync();

            var grandTotal = groups.Sum(g => g.TotalAmount);

            return groups.Select(g => new ExpenseSummaryDto
            {
                Category = g.Category,
                TotalAmount = g.TotalAmount,
                Count = g.Count,
                PercentageOfTotal = grandTotal > 0 ? Math.Round(g.TotalAmount / grandTotal * 100, 2) : 0
            }).OrderByDescending(s => s.TotalAmount).ToList();
        }

        // ── Budget Methods ────────────────────────────────────────

        public async Task<List<BudgetDto>> GetBudgetsAsync(int month, int year)
        {
            return await _context.Budgets
                .Where(b => b.Month == month && b.Year == year)
                .OrderBy(b => b.Category)
                .Select(b => new BudgetDto
                {
                    Id = b.Id,
                    Category = b.Category,
                    AllocatedAmount = b.AllocatedAmount,
                    Month = b.Month,
                    Year = b.Year,
                    Notes = b.Notes,
                    CreatedAt = b.CreatedAt,
                    CreatedBy = b.CreatedBy
                }).ToListAsync();
        }

        public async Task<BudgetDto> CreateBudgetAsync(CreateBudgetDto dto, string? createdBy)
        {
            // Check for duplicate category in same month/year
            var exists = await _context.Budgets
                .AnyAsync(b => b.Category == dto.Category && b.Month == dto.Month && b.Year == dto.Year);
            if (exists)
                throw new ArgumentException($"Budget for '{dto.Category}' in {dto.Month}/{dto.Year} already exists");

            var budget = new Budget
            {
                Category = dto.Category,
                AllocatedAmount = dto.AllocatedAmount,
                Month = dto.Month,
                Year = dto.Year,
                Notes = dto.Notes,
                CreatedBy = createdBy
            };

            _context.Budgets.Add(budget);
            await _context.SaveChangesAsync();

            return new BudgetDto
            {
                Id = budget.Id,
                Category = budget.Category,
                AllocatedAmount = budget.AllocatedAmount,
                Month = budget.Month,
                Year = budget.Year,
                Notes = budget.Notes,
                CreatedAt = budget.CreatedAt,
                CreatedBy = budget.CreatedBy
            };
        }

        public async Task<BudgetDto?> UpdateBudgetAsync(int id, CreateBudgetDto dto)
        {
            var budget = await _context.Budgets.FindAsync(id);
            if (budget == null) return null;

            // If category/month/year changed, check for duplicates
            if (budget.Category != dto.Category || budget.Month != dto.Month || budget.Year != dto.Year)
            {
                var exists = await _context.Budgets
                    .AnyAsync(b => b.Id != id && b.Category == dto.Category && b.Month == dto.Month && b.Year == dto.Year);
                if (exists)
                    throw new ArgumentException($"Budget for '{dto.Category}' in {dto.Month}/{dto.Year} already exists");
            }

            budget.Category = dto.Category;
            budget.AllocatedAmount = dto.AllocatedAmount;
            budget.Month = dto.Month;
            budget.Year = dto.Year;
            budget.Notes = dto.Notes;

            await _context.SaveChangesAsync();

            return new BudgetDto
            {
                Id = budget.Id,
                Category = budget.Category,
                AllocatedAmount = budget.AllocatedAmount,
                Month = budget.Month,
                Year = budget.Year,
                Notes = budget.Notes,
                CreatedAt = budget.CreatedAt,
                CreatedBy = budget.CreatedBy
            };
        }

        public async Task<bool> DeleteBudgetAsync(int id)
        {
            var budget = await _context.Budgets.FindAsync(id);
            if (budget == null) return false;

            _context.Budgets.Remove(budget);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<BudgetSummaryDto> GetBudgetVsActualAsync(int month, int year)
        {
            var budgets = await _context.Budgets
                .Where(b => b.Month == month && b.Year == year)
                .ToListAsync();

            var monthStart = new DateTime(year, month, 1);
            var monthEnd = monthStart.AddMonths(1);

            var actuals = await _context.Expenses
                .Where(e => e.ExpenseDate >= monthStart && e.ExpenseDate < monthEnd)
                .GroupBy(e => e.ExpenseCategory)
                .Select(g => new { Category = g.Key, Total = g.Sum(e => e.Amount) })
                .ToListAsync();

            var actualDict = actuals.ToDictionary(a => a.Category, a => a.Total);

            // Merge budgets with actuals (include categories from both sides)
            var allCategories = budgets.Select(b => b.Category)
                .Union(actualDict.Keys)
                .Distinct()
                .ToList();

            var items = allCategories.Select(cat =>
            {
                var allocated = budgets.FirstOrDefault(b => b.Category == cat)?.AllocatedAmount ?? 0m;
                var actual = actualDict.GetValueOrDefault(cat, 0m);
                var variance = allocated - actual;
                var variancePct = allocated > 0 ? Math.Round(variance / allocated * 100, 1) : 0m;

                string status;
                if (allocated == 0) status = "No Budget";
                else if (actual > allocated) status = "Over Budget";
                else if (actual >= allocated * 0.9m) status = "On Track";
                else status = "Under Budget";

                return new BudgetVsActualDto
                {
                    Category = cat,
                    AllocatedAmount = allocated,
                    ActualAmount = actual,
                    VarianceAmount = variance,
                    VariancePercent = variancePct,
                    Status = status
                };
            }).OrderByDescending(i => i.ActualAmount).ToList();

            return new BudgetSummaryDto
            {
                Month = month,
                Year = year,
                TotalAllocated = items.Sum(i => i.AllocatedAmount),
                TotalActual = items.Sum(i => i.ActualAmount),
                TotalVariance = items.Sum(i => i.VarianceAmount),
                OverBudgetCount = items.Count(i => i.Status == "Over Budget"),
                UnderBudgetCount = items.Count(i => i.Status == "Under Budget"),
                Items = items
            };
        }
    }
}
