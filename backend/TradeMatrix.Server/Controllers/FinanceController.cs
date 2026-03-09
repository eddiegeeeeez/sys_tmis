using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TradeMatrix.Server.DTOs;
using TradeMatrix.Server.Services;

namespace TradeMatrix.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "SuperAdmin,Manager")]
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
        public async Task<ActionResult<ApiResponse<List<ExpenseDto>>>> GetExpenses(
            [FromQuery] DateTime? from, [FromQuery] DateTime? to, [FromQuery] string? category)
        {
            try
            {
                var expenses = (from.HasValue || to.HasValue || !string.IsNullOrWhiteSpace(category))
                    ? await _financeService.GetExpensesAsync(from, to, category)
                    : await _financeService.GetExpensesAsync();
                return Ok(ApiResponse<List<ExpenseDto>>.SuccessResponse(expenses, "Expenses retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving expenses");
                return StatusCode(500, ApiResponse<List<ExpenseDto>>.ErrorResponse("An error occurred while retrieving expenses"));
            }
        }

        [HttpGet("expenses/summary")]
        public async Task<ActionResult<ApiResponse<List<ExpenseSummaryDto>>>> GetExpenseSummary(
            [FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            try
            {
                var fromDate = from ?? new DateTime(2000, 1, 1);
                var toDate = to ?? DateTime.UtcNow.AddDays(1);
                var summary = await _financeService.GetExpenseSummaryAsync(fromDate, toDate);
                return Ok(ApiResponse<List<ExpenseSummaryDto>>.SuccessResponse(summary, "Expense summary retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving expense summary");
                return StatusCode(500, ApiResponse<List<ExpenseSummaryDto>>.ErrorResponse("An error occurred while retrieving expense summary"));
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

        // ── Budget Endpoints ────────────────────────────────────────

        [HttpGet("budgets")]
        public async Task<ActionResult<ApiResponse<List<BudgetDto>>>> GetBudgets(
            [FromQuery] int month, [FromQuery] int year)
        {
            try
            {
                var budgets = await _financeService.GetBudgetsAsync(month, year);
                return Ok(ApiResponse<List<BudgetDto>>.SuccessResponse(budgets, "Budgets retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving budgets");
                return StatusCode(500, ApiResponse<List<BudgetDto>>.ErrorResponse("An error occurred while retrieving budgets"));
            }
        }

        [HttpPost("budgets")]
        public async Task<ActionResult<ApiResponse<BudgetDto>>> CreateBudget([FromBody] CreateBudgetDto dto)
        {
            try
            {
                var createdBy = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
                var budget = await _financeService.CreateBudgetAsync(dto, createdBy);
                return Ok(ApiResponse<BudgetDto>.SuccessResponse(budget, "Budget created successfully"));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ApiResponse<BudgetDto>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating budget");
                return StatusCode(500, ApiResponse<BudgetDto>.ErrorResponse("An error occurred while creating budget"));
            }
        }

        [HttpPut("budgets/{id}")]
        public async Task<ActionResult<ApiResponse<BudgetDto>>> UpdateBudget(int id, [FromBody] CreateBudgetDto dto)
        {
            try
            {
                var result = await _financeService.UpdateBudgetAsync(id, dto);
                if (result == null) return NotFound(ApiResponse<BudgetDto>.ErrorResponse("Budget not found"));
                return Ok(ApiResponse<BudgetDto>.SuccessResponse(result, "Budget updated successfully"));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ApiResponse<BudgetDto>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating budget");
                return StatusCode(500, ApiResponse<BudgetDto>.ErrorResponse("An error occurred while updating budget"));
            }
        }

        [HttpDelete("budgets/{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteBudget(int id)
        {
            try
            {
                var result = await _financeService.DeleteBudgetAsync(id);
                if (!result) return NotFound(ApiResponse<bool>.ErrorResponse("Budget not found"));
                return Ok(ApiResponse<bool>.SuccessResponse(true, "Budget deleted successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting budget");
                return StatusCode(500, ApiResponse<bool>.ErrorResponse("An error occurred while deleting budget"));
            }
        }

        [HttpGet("budget-vs-actual")]
        public async Task<ActionResult<ApiResponse<BudgetSummaryDto>>> GetBudgetVsActual(
            [FromQuery] int month, [FromQuery] int year)
        {
            try
            {
                var summary = await _financeService.GetBudgetVsActualAsync(month, year);
                return Ok(ApiResponse<BudgetSummaryDto>.SuccessResponse(summary, "Budget vs actual retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving budget vs actual");
                return StatusCode(500, ApiResponse<BudgetSummaryDto>.ErrorResponse("An error occurred while retrieving budget vs actual"));
            }
        }
    }
}
