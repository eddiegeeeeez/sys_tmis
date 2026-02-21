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

        public async Task<decimal> GetTotalExpensesForMonthAsync(int month, int year)
        {
            return await _context.Expenses
                .Where(e => e.ExpenseDate.Month == month && e.ExpenseDate.Year == year)
                .SumAsync(e => e.Amount);
        }
    }
}
