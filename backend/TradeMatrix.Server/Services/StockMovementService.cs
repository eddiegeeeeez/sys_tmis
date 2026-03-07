using Microsoft.EntityFrameworkCore;
using TradeMatrix.Server.Data;
using TradeMatrix.Server.DTOs;
using TradeMatrix.Server.Models;

namespace TradeMatrix.Server.Services
{
    public class StockMovementService : IStockMovementService
    {
        private readonly ApplicationDbContext _context;

        public StockMovementService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<StockMovementDto> RecordMovementAsync(
            int productId, string movementType, int quantity, string recordedBy,
            string? reference = null, string? notes = null, decimal? costPrice = null)
        {
            var product = await _context.Products.FindAsync(productId)
                ?? throw new ArgumentException($"Product ID {productId} not found.");

            // Calculate stock change based on movement type
            int stockChange = movementType switch
            {
                "STOCK_IN" or "VOID_RESTORE" => quantity,
                "SALE" or "WASTE" => -quantity,
                "ADJUSTMENT" => quantity, // Can be positive or negative (caller decides sign)
                _ => throw new ArgumentException($"Invalid movement type: {movementType}")
            };

            // For ADJUSTMENT, quantity is already signed (positive = add, negative = remove)
            // For other types, we enforce positive quantity input and compute direction above
            if (movementType != "ADJUSTMENT" && quantity <= 0)
                throw new ArgumentException("Quantity must be positive for non-adjustment movements.");

            product.Stock += stockChange;

            var movement = new StockMovement
            {
                ProductId = productId,
                MovementType = movementType,
                Quantity = quantity,
                Reference = reference,
                Notes = notes,
                CostPrice = costPrice,
                RecordedBy = recordedBy,
                CreatedAt = DateTime.UtcNow
            };

            _context.StockMovements.Add(movement);
            await _context.SaveChangesAsync();

            return new StockMovementDto
            {
                Id = movement.Id,
                ProductId = product.Id,
                ProductName = product.Name,
                ProductSKU = product.SKU,
                MovementType = movement.MovementType,
                Quantity = movement.Quantity,
                Reference = movement.Reference,
                Notes = movement.Notes,
                CostPrice = movement.CostPrice,
                RecordedBy = movement.RecordedBy,
                CreatedAt = movement.CreatedAt
            };
        }

        public async Task<(List<StockMovementDto> Items, int TotalCount)> GetMovementsAsync(
            int? productId = null, string? movementType = null,
            DateTime? from = null, DateTime? to = null,
            int page = 1, int pageSize = 20)
        {
            var query = _context.StockMovements
                .Include(sm => sm.Product)
                .AsQueryable();

            if (productId.HasValue) query = query.Where(sm => sm.ProductId == productId.Value);
            if (!string.IsNullOrEmpty(movementType)) query = query.Where(sm => sm.MovementType == movementType);
            if (from.HasValue) query = query.Where(sm => sm.CreatedAt >= from.Value);
            if (to.HasValue) query = query.Where(sm => sm.CreatedAt <= to.Value.AddDays(1));

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(sm => sm.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(sm => new StockMovementDto
                {
                    Id = sm.Id,
                    ProductId = sm.ProductId,
                    ProductName = sm.Product != null ? sm.Product.Name : "",
                    ProductSKU = sm.Product != null ? sm.Product.SKU : "",
                    MovementType = sm.MovementType,
                    Quantity = sm.Quantity,
                    Reference = sm.Reference,
                    Notes = sm.Notes,
                    CostPrice = sm.CostPrice,
                    RecordedBy = sm.RecordedBy,
                    CreatedAt = sm.CreatedAt
                })
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<StockMovementSummaryDto?> GetProductMovementSummaryAsync(int productId)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null) return null;

            var movements = await _context.StockMovements
                .Where(sm => sm.ProductId == productId)
                .GroupBy(sm => sm.MovementType)
                .Select(g => new { Type = g.Key, Total = g.Sum(sm => sm.Quantity) })
                .ToListAsync();

            var totalStockIn = movements.FirstOrDefault(m => m.Type == "STOCK_IN")?.Total ?? 0;
            var totalSales = movements.FirstOrDefault(m => m.Type == "SALE")?.Total ?? 0;
            var totalWaste = movements.FirstOrDefault(m => m.Type == "WASTE")?.Total ?? 0;
            var totalAdjustments = movements.FirstOrDefault(m => m.Type == "ADJUSTMENT")?.Total ?? 0;
            var totalVoidRestored = movements.FirstOrDefault(m => m.Type == "VOID_RESTORE")?.Total ?? 0;

            return new StockMovementSummaryDto
            {
                ProductId = product.Id,
                ProductName = product.Name,
                ProductSKU = product.SKU,
                TotalStockIn = totalStockIn,
                TotalSales = totalSales,
                TotalWaste = totalWaste,
                TotalAdjustments = totalAdjustments,
                TotalVoidRestored = totalVoidRestored,
                CalculatedStock = totalStockIn - totalSales - totalWaste + totalAdjustments + totalVoidRestored,
                CurrentStock = product.Stock
            };
        }
    }
}
