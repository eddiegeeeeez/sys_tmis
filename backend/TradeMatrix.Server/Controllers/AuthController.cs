using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using TradeMatrix.Server.DTOs;
using TradeMatrix.Server.Services;

namespace TradeMatrix.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [EnableRateLimiting("AuthEndpoints")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IAuditService _auditService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            IAuthService authService,
            IAuditService auditService,
            ILogger<AuthController> logger)
        {
            _authService = authService;
            _auditService = auditService;
            _logger = logger;
        }

        /// <summary>
        /// Authenticate user with email, password, and reCAPTCHA token.
        /// Implements account lockout after failed attempts.
        /// </summary>
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            var result = await _authService.LoginAsync(loginDto);

            if (result.IsLockedOut)
            {
                _logger.LogWarning("Login attempt on locked account: {Email}", loginDto.Email);
                return StatusCode(429, new { message = result.ErrorMessage });
            }

            if (!result.IsSuccess || result.Data == null)
            {
                _logger.LogWarning("Failed login attempt for email: {Email}", loginDto.Email);
                return Unauthorized(new { message = result.ErrorMessage ?? "Invalid email or password" });
            }

            _logger.LogInformation("Successful login for user: {Email}", result.Data.Email);
            return Ok(new
            {
                token = result.Data.Token,
                role = result.Data.Role,
                name = result.Data.Name,
                email = result.Data.Email,
                mustChangePassword = result.Data.MustChangePassword
            });
        }

        /// <summary>
        /// Logout — records the logout event in the persistent audit log.
        /// The client is responsible for discarding the JWT.
        /// </summary>
        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            var userId = GetCurrentUserId();
            var email = User.FindFirst(ClaimTypes.Email)?.Value ?? "unknown";
            var name = User.FindFirst(ClaimTypes.Name)?.Value ?? "unknown";
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

            await _auditService.LogEventAsync(
                "auth.logout",
                $"User: {email}",
                name, email, ip,
                "Success", "Low",
                new { userId });

            _logger.LogInformation("User {Email} logged out", email);
            return Ok(new { message = "Logged out successfully" });
        }

        /// <summary>
        /// Get current user profile (requires authentication).
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
                lastLogin = profile.LastLogin,
                mustChangePassword = profile.MustChangePassword
            });
        }

        /// <summary>
        /// Verify current user password for sensitive actions.
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

        /// <summary>
        /// Force-change password — clears MustChangePassword flag on success.
        /// Requires current password to prevent account takeover via stolen JWT.
        /// Enforces full password policy (complexity + length).
        /// </summary>
        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized(new { message = "Invalid token claims" });

            var currentValid = await _authService.VerifyPasswordAsync(userId.Value, dto.CurrentPassword);
            if (!currentValid)
                return Unauthorized(new { message = "Current password is incorrect" });

            var result = await _authService.ChangePasswordAsync(userId.Value, dto.NewPassword);
            if (!result.Success)
                return BadRequest(new { message = result.Message });

            return Ok(new { message = result.Message });
        }

        /// <summary>
        /// Request an OTP to be sent to the user's email.
        /// Used for two-factor login or password reset flows.
        /// </summary>
        [HttpPost("otp/request")]
        [AllowAnonymous]
        public async Task<IActionResult> RequestOtp([FromBody] OtpRequestDto dto)
        {
            var result = await _authService.RequestOtpAsync(dto.Email, dto.Purpose);
            // Always return success to prevent email enumeration
            return Ok(new { message = result.Message });
        }

        /// <summary>
        /// Verify an OTP submitted by the user.
        /// Returns a short-lived session token on success.
        /// </summary>
        [HttpPost("otp/verify")]
        [AllowAnonymous]
        public async Task<IActionResult> VerifyOtp([FromBody] OtpVerifyDto dto)
        {
            var result = await _authService.VerifyOtpAsync(dto.Email, dto.Purpose, dto.Otp);
            if (!result.Success)
                return BadRequest(new { message = result.Message });

            return Ok(new { message = result.Message, sessionToken = result.Data });
        }

        // ── Nested DTOs ────────────────────────────────────────────────────────

        public class ChangePasswordDto
        {
            [Required]
            public string CurrentPassword { get; set; } = string.Empty;

            [Required]
            [MinLength(8)]
            [RegularExpression(
                @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$",
                ErrorMessage = "Password must contain uppercase, lowercase, digit, and special character.")]
            public string NewPassword { get; set; } = string.Empty;
        }

        public class VerifyPasswordDto
        {
            public string Password { get; set; } = string.Empty;
        }

        // ── Helpers ────────────────────────────────────────────────────────────

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("id") ??
                             User.FindFirst(ClaimTypes.NameIdentifier) ??
                             User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier");

            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
                return userId;

            return null;
        }
    }
}
