using TradeMatrix.Server.DTOs;

namespace TradeMatrix.Server.Services
{
    public interface ITransactionService
    {
        Task<TransactionDto> CreateTransactionAsync(CreateTransactionDto dto, int? cashierId, string cashierName);
        Task<(List<TransactionDto> Items, int TotalCount)> GetTransactionsAsync(DateTime? from, DateTime? to, int page, int pageSize);
        Task<List<TransactionDto>> GetCashierTodayTransactionsAsync(int cashierId);
        Task<TransactionDto?> GetTransactionByIdAsync(int id, int? requesterId, string? role);
        Task<TransactionDto> VoidTransactionAsync(int id, string voidedBy);
    }
}
