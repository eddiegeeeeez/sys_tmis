using TradeMatrix.Server.DTOs;

namespace TradeMatrix.Server.Services
{
    public interface IReportService
    {
        Task<SalesReportDto> GetSalesReportAsync(DateTime from, DateTime to);
        Task<InventoryValuationDto> GetInventoryValuationAsync();
        Task<HRSummaryDto> GetHRSummaryAsync(DateTime from, DateTime to);
        Task<ProcurementSummaryDto> GetProcurementSummaryAsync(DateTime from, DateTime to);
    }
}
