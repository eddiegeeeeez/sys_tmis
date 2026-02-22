using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TradeMatrix.Server.DTOs;
using TradeMatrix.Server.Services;

namespace TradeMatrix.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FinanceController : ControllerBase
    {
        private readonly IFinanceService _financeService;
        private readonly ILogger<FinanceController> _logger;

        public FinanceController(IFinanceService financeService, ILogger<FinanceController> logger)
        {
            _financeService = financeService;
            _logger = logger;
        }

        [HttpGet("expenses")]
        public async Task<ActionResult<ApiResponse<List<ExpenseDto>>>> GetExpenses()
        {
            try
            {
                var expenses = await _financeService.GetExpensesAsync();
                return Ok(ApiResponse<List<ExpenseDto>>.SuccessResponse(expenses, "Expenses retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving expenses");
                return StatusCode(500, ApiResponse<List<ExpenseDto>>.ErrorResponse("An error occurred while retrieving expenses"));
            }
        }

        [HttpPost("expenses")]
        public async Task<ActionResult<ApiResponse<ExpenseDto>>> CreateExpense([FromBody] CreateExpenseDto dto)
        {
            try
            {
                var expense = await _financeService.CreateExpenseAsync(dto);
                return Ok(ApiResponse<ExpenseDto>.SuccessResponse(expense, "Expense recorded successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating expense");
                return StatusCode(500, ApiResponse<ExpenseDto>.ErrorResponse("An error occurred while recording expense"));
            }
        }

        [HttpGet("summary")]
        public async Task<ActionResult<ApiResponse<decimal>>> GetSummary([FromQuery] int month, [FromQuery] int year)
        {
            try
            {
                var total = await _financeService.GetTotalExpensesForMonthAsync(month, year);
                return Ok(ApiResponse<decimal>.SuccessResponse(total, "Financial summary retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving financial summary");
                return StatusCode(500, ApiResponse<decimal>.ErrorResponse("An error occurred while retrieving financial summary"));
            }
        }

        [HttpPut("expenses/{id}")]
        [Authorize(Roles = "SuperAdmin,Manager")]
        public async Task<ActionResult<ApiResponse<ExpenseDto>>> UpdateExpense(int id, [FromBody] CreateExpenseDto dto)
        {
            try
            {
                var result = await _financeService.UpdateExpenseAsync(id, dto);
                if (result == null) return NotFound(ApiResponse<ExpenseDto>.ErrorResponse("Expense not found"));
                return Ok(ApiResponse<ExpenseDto>.SuccessResponse(result, "Expense updated successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating expense");
                return StatusCode(500, ApiResponse<ExpenseDto>.ErrorResponse("An error occurred while updating expense"));
            }
        }
    }
}
