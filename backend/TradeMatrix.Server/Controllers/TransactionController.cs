using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TradeMatrix.Server.Data;
using TradeMatrix.Server.DTOs;
using TradeMatrix.Server.Models;

namespace TradeMatrix.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TransactionController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<TransactionController> _logger;

        public TransactionController(ApplicationDbContext context, ILogger<TransactionController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Create a new transaction (POS checkout). Decrements product stock automatically.
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "SuperAdmin,Manager,Cashier")]
        public async Task<ActionResult<ApiResponse<TransactionDto>>> CreateTransaction([FromBody] CreateTransactionDto dto)
        {
            if (!dto.Items.Any())
                return BadRequest(ApiResponse<TransactionDto>.ErrorResponse("Transaction must have at least one item."));

            await using var dbTransaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var productIds = dto.Items.Select(i => i.ProductId).Distinct().ToList();
                var products = await _context.Products
                    .Where(p => productIds.Contains(p.Id) && p.IsActive)
                    .ToListAsync();

                // Validate all products exist and have sufficient stock
                foreach (var item in dto.Items)
                {
                    var product = products.FirstOrDefault(p => p.Id == item.ProductId);
                    if (product == null)
                        return BadRequest(ApiResponse<TransactionDto>.ErrorResponse($"Product ID {item.ProductId} not found."));
                    if (product.Stock < item.Quantity)
                        return BadRequest(ApiResponse<TransactionDto>.ErrorResponse($"Insufficient stock for '{product.Name}'. Available: {product.Stock}."));
                }

                // Generate transaction number: TRX-YYYYMMDD-XXXX
                var today = DateTime.UtcNow.Date;
                var todayCount = await _context.Transactions
                    .CountAsync(t => t.TransactionDate >= today);
                var txNumber = $"TRX-{today:yyyyMMdd}-{(todayCount + 1):D4}";

                // Get cashier identity
                var cashierIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                int? cashierId = int.TryParse(cashierIdStr, out var parsed) ? parsed : null;

                // Build transaction items and update stock
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

                    product.Stock -= item.Quantity;
                }

                var taxAmount = Math.Round(subtotal * 0.10m, 2);
                var total = subtotal + taxAmount;
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

                var cashierName = await _context.Users
                    .Where(u => u.Id == cashierId)
                    .Select(u => u.Name)
                    .FirstOrDefaultAsync();

                return Ok(ApiResponse<TransactionDto>.SuccessResponse(MapToDto(transaction, cashierName), "Transaction completed successfully."));
            }
            catch (Exception ex)
            {
                await dbTransaction.RollbackAsync();
                _logger.LogError(ex, "Error creating transaction");
                return StatusCode(500, ApiResponse<TransactionDto>.ErrorResponse("An error occurred while processing the transaction."));
            }
        }

        /// <summary>
        /// Get all transactions (paginated, optional date filter).
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "SuperAdmin,Manager")]
        public async Task<ActionResult<ApiResponse<List<TransactionDto>>>> GetTransactions(
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            try
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
                return Ok(ApiResponse<List<TransactionDto>>.SuccessResponse(result, $"{total} transaction(s) found."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving transactions");
                return StatusCode(500, ApiResponse<List<TransactionDto>>.ErrorResponse("An error occurred while retrieving transactions."));
            }
        }

        /// <summary>
        /// Get today's transactions for the logged-in cashier.
        /// </summary>
        [HttpGet("my-today")]
        [Authorize(Roles = "SuperAdmin,Manager,Cashier")]
        public async Task<ActionResult<ApiResponse<List<TransactionDto>>>> GetMyTodayTransactions()
        {
            try
            {
                var cashierIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(cashierIdStr, out var cashierId))
                    return Unauthorized(ApiResponse<List<TransactionDto>>.ErrorResponse("Invalid token."));

                var today = DateTime.UtcNow.Date;
                var items = await _context.Transactions
                    .Include(t => t.Items)
                    .Where(t => t.CashierId == cashierId && t.TransactionDate >= today)
                    .OrderByDescending(t => t.TransactionDate)
                    .Take(10)
                    .ToListAsync();

                var result = items.Select(t => MapToDto(t, null)).ToList();
                return Ok(ApiResponse<List<TransactionDto>>.SuccessResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving cashier transactions");
                return StatusCode(500, ApiResponse<List<TransactionDto>>.ErrorResponse("An error occurred."));
            }
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
