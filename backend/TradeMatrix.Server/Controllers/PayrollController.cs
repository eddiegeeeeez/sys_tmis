using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TradeMatrix.Server.DTOs;
using TradeMatrix.Server.Services;

namespace TradeMatrix.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "SuperAdmin,Manager")]
    public class PayrollController : ControllerBase
    {
        private readonly IHRService _hrService;
        private readonly ILogger<PayrollController> _logger;

        public PayrollController(IHRService hrService, ILogger<PayrollController> logger)
        {
            _hrService = hrService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<PayrollRecordDto>>>> GetPayrollRecords()
        {
            try
            {
                var records = await _hrService.GetPayrollRecordsAsync();
                return Ok(ApiResponse<List<PayrollRecordDto>>.SuccessResponse(records, "Payroll records retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving payroll records");
                return StatusCode(500, ApiResponse<List<PayrollRecordDto>>.ErrorResponse("An error occurred while retrieving payroll records"));
            }
        }

        [HttpPost("run")]
        public async Task<ActionResult<ApiResponse<bool>>> RunPayroll([FromBody] RunPayrollDto dto)
        {
            try
            {
                var result = await _hrService.RunPayrollAsync(dto);
                return Ok(ApiResponse<bool>.SuccessResponse(result, "Payroll processed successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error running payroll");
                return StatusCode(500, ApiResponse<bool>.ErrorResponse("An error occurred while running payroll"));
            }
        }
    }
}
