using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TradeMatrix.Server.DTOs;
using TradeMatrix.Server.Services;

namespace TradeMatrix.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TransactionController : ControllerBase
    {
        private readonly ITransactionService _transactionService;
        private readonly ILogger<TransactionController> _logger;

        public TransactionController(ITransactionService transactionService, ILogger<TransactionController> logger)
        {
            _transactionService = transactionService;
            _logger = logger;
        }

        [HttpPost]
        [Authorize(Roles = "SuperAdmin,Manager,Cashier")]
        public async Task<ActionResult<ApiResponse<TransactionDto>>> CreateTransaction([FromBody] CreateTransactionDto dto)
        {
            try
            {
                var cashierIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                int? cashierId = int.TryParse(cashierIdStr, out var parsed) ? parsed : null;
                var cashierName = User.FindFirst("Name")?.Value ?? User.FindFirst(ClaimTypes.Name)?.Value ?? "Unknown";

                var result = await _transactionService.CreateTransactionAsync(dto, cashierId, cashierName);
                return Ok(ApiResponse<TransactionDto>.SuccessResponse(result, "Transaction completed successfully."));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ApiResponse<TransactionDto>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating transaction");
                return StatusCode(500, ApiResponse<TransactionDto>.ErrorResponse("An error occurred while processing the transaction."));
            }
        }

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
                var (items, total) = await _transactionService.GetTransactionsAsync(from, to, page, pageSize);
                return Ok(ApiResponse<List<TransactionDto>>.SuccessResponse(items, $"{total} transaction(s) found."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving transactions");
                return StatusCode(500, ApiResponse<List<TransactionDto>>.ErrorResponse("An error occurred while retrieving transactions."));
            }
        }

        [HttpGet("my-today")]
        [Authorize(Roles = "SuperAdmin,Manager,Cashier")]
        public async Task<ActionResult<ApiResponse<List<TransactionDto>>>> GetMyTodayTransactions()
        {
            try
            {
                var cashierIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(cashierIdStr, out var cashierId))
                    return Unauthorized(ApiResponse<List<TransactionDto>>.ErrorResponse("Invalid token."));

                var result = await _transactionService.GetCashierTodayTransactionsAsync(cashierId);
                return Ok(ApiResponse<List<TransactionDto>>.SuccessResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving cashier transactions");
                return StatusCode(500, ApiResponse<List<TransactionDto>>.ErrorResponse("An error occurred."));
            }
        }

        [HttpGet("{id:int}")]
        [Authorize(Roles = "SuperAdmin,Manager,Cashier")]
        public async Task<ActionResult<ApiResponse<TransactionDto>>> GetById(int id)
        {
            try
            {
                var cashierIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                int.TryParse(cashierIdStr, out var requesterId);
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                var result = await _transactionService.GetTransactionByIdAsync(id, requesterId, role);
                if (result == null)
                    return NotFound(ApiResponse<TransactionDto>.ErrorResponse("Transaction not found."));

                return Ok(ApiResponse<TransactionDto>.SuccessResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving transaction {Id}", id);
                return StatusCode(500, ApiResponse<TransactionDto>.ErrorResponse("An error occurred."));
            }
        }

        [HttpPatch("{id:int}/void")]
        [Authorize(Roles = "SuperAdmin,Manager")]
        public async Task<ActionResult<ApiResponse<TransactionDto>>> VoidTransaction(int id)
        {
            try
            {
                var voidedBy = User.FindFirst("Name")?.Value ?? User.FindFirst(ClaimTypes.Name)?.Value ?? "Unknown";
                var result = await _transactionService.VoidTransactionAsync(id, voidedBy);

                _logger.LogInformation("Transaction {Id} voided by {User}", id,
                    User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

                return Ok(ApiResponse<TransactionDto>.SuccessResponse(result, "Transaction voided and stock restored successfully."));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ApiResponse<TransactionDto>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error voiding transaction {Id}", id);
                return StatusCode(500, ApiResponse<TransactionDto>.ErrorResponse("An error occurred while voiding the transaction."));
            }
        }
    }
}
