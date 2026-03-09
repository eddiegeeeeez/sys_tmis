using TradeMatrix.Server.DTOs;

namespace TradeMatrix.Server.Services
{
    public interface IFinanceService
    {
        Task<List<ExpenseDto>> GetExpensesAsync();
        Task<List<ExpenseDto>> GetExpensesAsync(DateTime? from, DateTime? to, string? category);
        Task<ExpenseDto> CreateExpenseAsync(CreateExpenseDto dto);
        Task<ExpenseDto?> UpdateExpenseAsync(int id, CreateExpenseDto dto);
        Task<decimal> GetTotalExpensesForMonthAsync(int month, int year);
        Task<List<ExpenseSummaryDto>> GetExpenseSummaryAsync(DateTime from, DateTime to);

        // Budget methods
        Task<List<BudgetDto>> GetBudgetsAsync(int month, int year);
        Task<BudgetDto> CreateBudgetAsync(CreateBudgetDto dto, string? createdBy);
        Task<BudgetDto?> UpdateBudgetAsync(int id, CreateBudgetDto dto);
        Task<bool> DeleteBudgetAsync(int id);
        Task<BudgetSummaryDto> GetBudgetVsActualAsync(int month, int year);
    }
}
