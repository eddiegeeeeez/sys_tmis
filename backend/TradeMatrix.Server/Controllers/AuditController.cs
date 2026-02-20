using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TradeMatrix.Server.DTOs;
using TradeMatrix.Server.Services;

namespace TradeMatrix.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "SuperAdmin,SystemAdmin")]
    public class AuditController : ControllerBase
    {
        private readonly IAuditService _auditService;
        private readonly ILogger<AuditController> _logger;

        public AuditController(IAuditService auditService, ILogger<AuditController> logger)
        {
            _auditService = auditService;
            _logger = logger;
        }

        // GET: api/Audit/logs
        [HttpGet("logs")]
        public async Task<ActionResult<ApiResponse<IEnumerable<AuditLogDto>>>> GetLogs()
        {
            try
            {
                var logs = await _auditService.GetLogsAsync();
                return Ok(ApiResponse<IEnumerable<AuditLogDto>>.SuccessResponse(logs));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching audit logs");
                return StatusCode(500, ApiResponse<string>.ErrorResponse("Error fetching audit logs"));
            }
        }
    }
}
