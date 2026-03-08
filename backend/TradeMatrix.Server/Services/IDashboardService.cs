using TradeMatrix.Server.DTOs;

namespace TradeMatrix.Server.Services
{
    public interface IDashboardService
    {
        Task<DashboardSummaryDto> GetSummaryAsync();
    }
}
