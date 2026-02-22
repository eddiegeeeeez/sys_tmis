using TradeMatrix.Server.DTOs;

namespace TradeMatrix.Server.Services
{
    public interface IFinanceService
    {
        Task<List<ExpenseDto>> GetExpensesAsync();
        Task<ExpenseDto> CreateExpenseAsync(CreateExpenseDto dto);
        Task<ExpenseDto?> UpdateExpenseAsync(int id, CreateExpenseDto dto);
        Task<decimal> GetTotalExpensesForMonthAsync(int month, int year);
    }
}
