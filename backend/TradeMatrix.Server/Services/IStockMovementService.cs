using TradeMatrix.Server.DTOs;

namespace TradeMatrix.Server.Services
{
    public interface IStockMovementService
    {
        /// <summary>Record a stock movement and update Product.Stock atomically.</summary>
        Task<StockMovementDto> RecordMovementAsync(int productId, string movementType, int quantity, string recordedBy, string? reference = null, string? notes = null, decimal? costPrice = null);

        /// <summary>Get paginated stock movements with optional filters.</summary>
        Task<(List<StockMovementDto> Items, int TotalCount)> GetMovementsAsync(int? productId = null, string? movementType = null, DateTime? from = null, DateTime? to = null, int page = 1, int pageSize = 20);

        /// <summary>Get movement summary for a product.</summary>
        Task<StockMovementSummaryDto?> GetProductMovementSummaryAsync(int productId);
    }
}
