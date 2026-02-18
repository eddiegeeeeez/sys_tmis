using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TradeMatrix.Server.Data;
using TradeMatrix.Server.Models;

namespace TradeMatrix.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "SuperAdmin")]
    public class SystemController : ControllerBase
    {
        private readonly ISystemService _systemService;
        private readonly ILogger<SystemController> _logger;

        public SystemController(ISystemService systemService, ILogger<SystemController> logger)
        {
            _systemService = systemService;
            _logger = logger;
        }

        // GET: api/System/settings
        [HttpGet("settings")]
        public async Task<ActionResult<ApiResponse<IEnumerable<SystemSetting>>>> GetSettings()
        {
            var settings = await _systemService.GetSettingsAsync();
            return Ok(ApiResponse<IEnumerable<SystemSetting>>.SuccessResponse(settings));
        }

        // PUT: api/System/settings/{key}
        [HttpPut("settings/{key}")]
        public async Task<ActionResult<ApiResponse<bool>>> UpdateSetting(string key, [FromBody] UpdateSettingDto settingDto)
        {
            var result = await _systemService.UpdateSettingAsync(key, settingDto.Value);

            if (!result)
            {
                return NotFound(ApiResponse<bool>.ErrorResponse("Setting not found"));
            }

            return Ok(ApiResponse<bool>.SuccessResponse(true, $"System setting '{key}' updated."));
        }
    }

    public class UpdateSettingDto
    {
        public string Value { get; set; } = string.Empty;
    }
}
