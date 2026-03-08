using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TradeMatrix.Server.DTOs;
using TradeMatrix.Server.Services;

namespace TradeMatrix.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "SuperAdmin,Manager")]
    public class HRController : ControllerBase
    {
        private readonly IHRService _hrService;
        private readonly ILogger<HRController> _logger;

        public HRController(IHRService hrService, ILogger<HRController> logger)
        {
            _hrService = hrService;
            _logger = logger;
        }

        [HttpGet("employees")]
        public async Task<ActionResult<ApiResponse<List<EmployeeDto>>>> GetEmployees()
        {
            try
            {
                var employees = await _hrService.GetEmployeesAsync();
                return Ok(ApiResponse<List<EmployeeDto>>.SuccessResponse(employees, "Employees retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving employees");
                return StatusCode(500, ApiResponse<List<EmployeeDto>>.ErrorResponse("An error occurred while retrieving employees"));
            }
        }

        [HttpPost("employees")]
        public async Task<ActionResult<ApiResponse<EmployeeDto>>> CreateEmployee([FromBody] CreateEmployeeDto dto)
        {
            try
            {
                var employee = await _hrService.CreateEmployeeAsync(dto);
                return Ok(ApiResponse<EmployeeDto>.SuccessResponse(employee, "Employee created successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating employee");
                return StatusCode(500, ApiResponse<EmployeeDto>.ErrorResponse("An error occurred while creating employee"));
            }
        }

        [HttpGet("attendance")]
        public async Task<ActionResult<ApiResponse<List<AttendanceDto>>>> GetAttendance([FromQuery] DateTime? date)
        {
            try
            {
                var attendance = await _hrService.GetAttendanceAsync(date);
                return Ok(ApiResponse<List<AttendanceDto>>.SuccessResponse(attendance, "Attendance retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving attendance");
                return StatusCode(500, ApiResponse<List<AttendanceDto>>.ErrorResponse("An error occurred while retrieving attendance"));
            }
        }

        [HttpPost("attendance")]
        public async Task<ActionResult<ApiResponse<AttendanceDto>>> LogAttendance([FromBody] LogAttendanceDto dto)
        {
            try
            {
                var attendance = await _hrService.LogAttendanceAsync(dto);
                return Ok(ApiResponse<AttendanceDto>.SuccessResponse(attendance, "Attendance logged successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging attendance");
                return StatusCode(500, ApiResponse<AttendanceDto>.ErrorResponse("An error occurred while logging attendance"));
            }
        }

        [HttpPut("employees/{id}")]
        [Authorize(Roles = "SuperAdmin,Manager")]
        public async Task<ActionResult<ApiResponse<EmployeeDto>>> UpdateEmployee(int id, [FromBody] CreateEmployeeDto dto)
        {
            try
            {
                var result = await _hrService.UpdateEmployeeAsync(id, dto);
                if (result == null) return NotFound(ApiResponse<EmployeeDto>.ErrorResponse("Employee not found"));
                return Ok(ApiResponse<EmployeeDto>.SuccessResponse(result, "Employee updated successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating employee");
                return StatusCode(500, ApiResponse<EmployeeDto>.ErrorResponse("An error occurred while updating employee"));
            }
        }
    }
}
