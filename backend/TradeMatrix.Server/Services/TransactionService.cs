using Microsoft.EntityFrameworkCore;
using TradeMatrix.Server.Data;
using TradeMatrix.Server.DTOs;
using TradeMatrix.Server.Models;

namespace TradeMatrix.Server.Services
{
    public class TransactionService : ITransactionService
    {
        private readonly ApplicationDbContext _context;
        private readonly IStockMovementService _stockMovementService;

        public TransactionService(ApplicationDbContext context, IStockMovementService stockMovementService)
        {
            _context = context;
            _stockMovementService = stockMovementService;
        }

        public async Task<TransactionDto> CreateTransactionAsync(CreateTransactionDto dto, int? cashierId, string cashierName)
        {
            if (!dto.Items.Any())
                throw new ArgumentException("Transaction must have at least one item.");

            await using var dbTransaction = await _context.Database.BeginTransactionAsync();

            var productIds = dto.Items.Select(i => i.ProductId).Distinct().ToList();
            var products = await _context.Products
                .Where(p => productIds.Contains(p.Id) && p.IsActive)
                .ToListAsync();

            // Validate all products exist and have sufficient stock
            foreach (var item in dto.Items)
            {
                var product = products.FirstOrDefault(p => p.Id == item.ProductId)
                    ?? throw new ArgumentException($"Product ID {item.ProductId} not found.");
                if (product.Stock < item.Quantity)
                    throw new ArgumentException($"Insufficient stock for '{product.Name}'. Available: {product.Stock}.");
            }

            // Generate transaction number: TRX-YYYYMMDD-XXXX
            var today = DateTime.UtcNow.Date;
            var todayCount = await _context.Transactions
                .CountAsync(t => t.TransactionDate >= today);
            var txNumber = $"TRX-{today:yyyyMMdd}-{(todayCount + 1):D4}";

            // Build transaction items and create SALE stock movements
            var txItems = new List<TransactionItem>();
            decimal subtotal = 0;
            foreach (var item in dto.Items)
            {
                var product = products.First(p => p.Id == item.ProductId);
                var lineTotal = product.SellingPrice * item.Quantity;
                subtotal += lineTotal;

                txItems.Add(new TransactionItem
                {
                    ProductId = product.Id,
                    ProductName = product.Name,
                    UnitPrice = product.SellingPrice,
                    Quantity = item.Quantity,
                    LineTotal = lineTotal
                });

                // Record SALE movement (this also decrements Product.Stock)
                await _stockMovementService.RecordMovementAsync(
                    product.Id, "SALE", item.Quantity, cashierName,
                    reference: txNumber,
                    notes: $"POS sale: {item.Quantity}x {product.Name}");
            }

            // Philippine standard VAT rate is 12%
            var vatableSales = Math.Round(subtotal / 1.12m, 2);
            var taxAmount = subtotal - vatableSales;
            taxAmount = Math.Round(taxAmount, 2);
            var total = subtotal;
            var change = Math.Round(dto.AmountTendered - total, 2);

            var transaction = new Transaction
            {
                TransactionNumber = txNumber,
                CashierId = cashierId,
                PaymentMethod = dto.PaymentMethod,
                Subtotal = Math.Round(subtotal, 2),
                TaxAmount = taxAmount,
                TotalAmount = Math.Round(total, 2),
                AmountTendered = dto.AmountTendered,
                Change = Math.Max(0, change),
                Status = "Completed",
                TransactionDate = DateTime.UtcNow,
                Items = txItems
            };

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();
            await dbTransaction.CommitAsync();

            return MapToDto(transaction, cashierName);
        }

        public async Task<(List<TransactionDto> Items, int TotalCount)> GetTransactionsAsync(
            DateTime? from, DateTime? to, int page, int pageSize)
        {
            var query = _context.Transactions
                .Include(t => t.Items)
                .Include(t => t.Cashier)
                .AsQueryable();

            if (from.HasValue) query = query.Where(t => t.TransactionDate >= from.Value);
            if (to.HasValue) query = query.Where(t => t.TransactionDate <= to.Value.AddDays(1));

            var total = await query.CountAsync();
            var items = await query
                .OrderByDescending(t => t.TransactionDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var result = items.Select(t => MapToDto(t, t.Cashier?.Name)).ToList();
            return (result, total);
        }

        public async Task<List<TransactionDto>> GetCashierTodayTransactionsAsync(int cashierId)
        {
            var today = DateTime.UtcNow.Date;
            var items = await _context.Transactions
                .Include(t => t.Items)
                .Where(t => t.CashierId == cashierId && t.TransactionDate >= today)
                .OrderByDescending(t => t.TransactionDate)
                .Take(10)
                .ToListAsync();

            return items.Select(t => MapToDto(t, null)).ToList();
        }

        public async Task<TransactionDto?> GetTransactionByIdAsync(int id, int? requesterId, string? role)
        {
            var query = _context.Transactions
                .Include(t => t.Items)
                .Include(t => t.Cashier)
                .Where(t => t.Id == id);

            // Cashiers can only see their own transactions
            if (role == "Cashier" && requesterId.HasValue)
                query = query.Where(t => t.CashierId == requesterId.Value);

            var transaction = await query.FirstOrDefaultAsync();
            if (transaction == null) return null;

            return MapToDto(transaction, transaction.Cashier?.Name);
        }

        public async Task<TransactionDto> VoidTransactionAsync(int id, string voidedBy)
        {
            await using var dbTransaction = await _context.Database.BeginTransactionAsync();

            var transaction = await _context.Transactions
                .Include(t => t.Items)
                .Include(t => t.Cashier)
                .FirstOrDefaultAsync(t => t.Id == id)
                ?? throw new ArgumentException("Transaction not found.");

            if (transaction.Status == "Voided")
                throw new ArgumentException("Transaction is already voided.");

            // Restore stock via VOID_RESTORE movements
            foreach (var item in transaction.Items)
            {
                await _stockMovementService.RecordMovementAsync(
                    item.ProductId, "VOID_RESTORE", item.Quantity, voidedBy,
                    reference: transaction.TransactionNumber,
                    notes: $"Void restore: {item.Quantity}x {item.ProductName}");
            }

            transaction.Status = "Voided";
            await _context.SaveChangesAsync();
            await dbTransaction.CommitAsync();

            return MapToDto(transaction, transaction.Cashier?.Name);
        }

        private static TransactionDto MapToDto(Transaction t, string? cashierName) => new()
        {
            Id = t.Id,
            TransactionNumber = t.TransactionNumber,
            PaymentMethod = t.PaymentMethod,
            Subtotal = t.Subtotal,
            TaxAmount = t.TaxAmount,
            TotalAmount = t.TotalAmount,
            AmountTendered = t.AmountTendered,
            Change = t.Change,
            Status = t.Status,
            TransactionDate = t.TransactionDate,
            CashierName = cashierName,
            Items = t.Items.Select(i => new TransactionItemDto
            {
                ProductId = i.ProductId,
                ProductName = i.ProductName,
                UnitPrice = i.UnitPrice,
                Quantity = i.Quantity,
                LineTotal = i.LineTotal
            }).ToList()
        };
    }
}
