using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TradeMatrix.Server.DTOs;
using TradeMatrix.Server.Services;

namespace TradeMatrix.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            IAuthService authService,
            ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        /// <summary>
        /// Authenticate user with email and password
        /// Implements account lockout after failed attempts
        /// </summary>
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            var result = await _authService.LoginAsync(loginDto);
            if (result == null)
            {
                _logger.LogWarning("Failed login attempt for email: {Email}", loginDto.Email);
                return Unauthorized(new { message = "Invalid email or password" });
            }

            _logger.LogInformation("Successful login for user: {Email}", result.Email);
            return Ok(new
            {
                token = result.Token,
                role = result.Role,
                name = result.Name,
                email = result.Email
            });
        }

        /// <summary>
        /// Get current user profile (requires authentication)
        /// </summary>
        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                _logger.LogWarning("Profile fetch failed: User ID claim is missing or invalid.");
                return Unauthorized(new { message = "Invalid token claims" });
            }

            var profile = await _authService.GetProfileAsync(userId.Value);
            if (profile == null) return NotFound();

            return Ok(new
            {
                id = profile.Id,
                name = profile.Name,
                email = profile.Email,
                role = profile.Role,
                isActive = profile.IsActive,
                lastLogin = profile.LastLogin
            });
        }

        /// <summary>
        /// Verify current user password for sensitive actions
        /// </summary>
        [HttpPost("verify-password")]
        [Authorize]
        public async Task<IActionResult> VerifyPassword([FromBody] VerifyPasswordDto dto)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized(new { message = "Invalid token claims" });

            var isValid = await _authService.VerifyPasswordAsync(userId.Value, dto.Password);
            if (!isValid)
                return Unauthorized(new { message = "Invalid password" });

            return Ok(new { success = true });
        }

        public class VerifyPasswordDto
        {
            public string Password { get; set; } = string.Empty;
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("id") ??
                             User.FindFirst(ClaimTypes.NameIdentifier) ??
                             User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier");

            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
                return userId;

            // Fallback: try to find any integer claim
            userIdClaim = User.Claims.FirstOrDefault(c => int.TryParse(c.Value, out _));
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out userId))
                return userId;

            return null;
        }
    }
}
