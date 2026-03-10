using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TradeMatrix.Server.DTOs;
using TradeMatrix.Server.Services;

namespace TradeMatrix.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Manager")]
    public class ReportController : ControllerBase
    {
        private readonly IReportService _reportService;
        private readonly ILogger<ReportController> _logger;

        public ReportController(IReportService reportService, ILogger<ReportController> logger)
        {
            _reportService = reportService;
            _logger = logger;
        }

        [HttpGet("sales")]
        public async Task<ActionResult<ApiResponse<SalesReportDto>>> GetSalesReport(
            [FromQuery] DateTime from, [FromQuery] DateTime to)
        {
            try
            {
                var report = await _reportService.GetSalesReportAsync(from, to);
                return Ok(ApiResponse<SalesReportDto>.SuccessResponse(report, "Sales report generated successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating sales report");
                return StatusCode(500, ApiResponse<SalesReportDto>.ErrorResponse("An error occurred while generating sales report"));
            }
        }

        [HttpGet("inventory-valuation")]
        public async Task<ActionResult<ApiResponse<InventoryValuationDto>>> GetInventoryValuation()
        {
            try
            {
                var report = await _reportService.GetInventoryValuationAsync();
                return Ok(ApiResponse<InventoryValuationDto>.SuccessResponse(report, "Inventory valuation generated successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating inventory valuation");
                return StatusCode(500, ApiResponse<InventoryValuationDto>.ErrorResponse("An error occurred while generating inventory valuation"));
            }
        }

        [HttpGet("hr-summary")]
        public async Task<ActionResult<ApiResponse<HRSummaryDto>>> GetHRSummary(
            [FromQuery] DateTime from, [FromQuery] DateTime to)
        {
            try
            {
                var report = await _reportService.GetHRSummaryAsync(from, to);
                return Ok(ApiResponse<HRSummaryDto>.SuccessResponse(report, "HR summary generated successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating HR summary");
                return StatusCode(500, ApiResponse<HRSummaryDto>.ErrorResponse("An error occurred while generating HR summary"));
            }
        }

        [HttpGet("procurement-summary")]
        public async Task<ActionResult<ApiResponse<ProcurementSummaryDto>>> GetProcurementSummary(
            [FromQuery] DateTime from, [FromQuery] DateTime to)
        {
            try
            {
                var report = await _reportService.GetProcurementSummaryAsync(from, to);
                return Ok(ApiResponse<ProcurementSummaryDto>.SuccessResponse(report, "Procurement summary generated successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating procurement summary");
                return StatusCode(500, ApiResponse<ProcurementSummaryDto>.ErrorResponse("An error occurred while generating procurement summary"));
            }
        }
    }
}
