using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TradeMatrix.Server.DTOs;
using TradeMatrix.Server.Services;

namespace TradeMatrix.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "SuperAdmin")]
    public class DatabaseController : ControllerBase
    {
        private readonly IDatabaseService _databaseService;

        public DatabaseController(IDatabaseService databaseService)
        {
            _databaseService = databaseService;
        }

        [HttpGet("info")]
        public async Task<ActionResult<ApiResponse<DatabaseInfoDto>>> GetDatabaseInfo()
        {
            try
            {
                var info = await _databaseService.GetDatabaseInfoAsync();
                return Ok(ApiResponse<DatabaseInfoDto>.SuccessResponse(info));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<DatabaseInfoDto>.ErrorResponse(ex.Message));
            }
        }

        [HttpGet("statistics")]
        public async Task<ActionResult<ApiResponse<DatabaseStatisticsDto>>> GetStatistics()
        {
            try
            {
                var stats = await _databaseService.GetStatisticsAsync();
                return Ok(ApiResponse<DatabaseStatisticsDto>.SuccessResponse(stats));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<DatabaseStatisticsDto>.ErrorResponse(ex.Message));
            }
        }

        [HttpPost("migrate")]
        public async Task<ActionResult<ApiResponse<object>>> RunMigrations()
        {
            try
            {
                var result = await _databaseService.RunMigrationsAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse(ex.Message));
            }
        }

        [HttpGet("health")]
        public async Task<ActionResult<ApiResponse<DatabaseHealthDto>>> CheckHealth()
        {
            try
            {
                var health = await _databaseService.CheckHealthAsync();
                return Ok(ApiResponse<DatabaseHealthDto>.SuccessResponse(health));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<DatabaseHealthDto>.ErrorResponse(ex.Message));
            }
        }

        [HttpGet("connection-info")]
        public async Task<ActionResult<ApiResponse<ConnectionInfoDto>>> GetConnectionInfo()
        {
            try
            {
                var info = await _databaseService.GetConnectionInfoAsync();
                return Ok(ApiResponse<ConnectionInfoDto>.SuccessResponse(info));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<ConnectionInfoDto>.ErrorResponse(ex.Message));
            }
        }

        [HttpPost("backup/export-users")]
        public async Task<ActionResult<ApiResponse<object>>> ExportUsersBackup()
        {
            try
            {
                var result = await _databaseService.ExportUsersAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse(ex.Message));
            }
        }

        [HttpPost("backup/request")]
        public IActionResult RequestBackup()
        {
            // This remains a static info call as it doesn't involve complex DB logic beyond the service's scope for now
            return Ok(ApiResponse<object>.SuccessResponse(new
            {
                provider = "MonsterASP.NET",
                backupFrequency = "Automatic daily backups",
                retentionPeriod = "30 days",
                recommendation = "Contact support@monsterasp.net for manual backup requests or restore operations"
            }, "Database is hosted on MonsterASP.NET. Backups are managed automatically."));
        }
    }
}
