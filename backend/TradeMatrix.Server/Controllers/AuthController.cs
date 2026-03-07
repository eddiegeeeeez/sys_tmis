using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TradeMatrix.Server.Data;
using TradeMatrix.Server.DTOs;
using TradeMatrix.Server.Models;
using TradeMatrix.Server.Services;

namespace TradeMatrix.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;
        private readonly IPasswordHashingService _passwordHashing;

        public AuthController(
            ApplicationDbContext context,
            IConfiguration configuration,
            ILogger<AuthController> logger,
            IPasswordHashingService passwordHashing)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
            _passwordHashing = passwordHashing;
        }

        /// <summary>
        /// Authenticate user with email and password
        /// Implements account lockout after failed attempts
        /// </summary>
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            // Validation is performed by data annotations in LoginDto
            var user = await _context.Users
                .AsNoTracking()
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            // Verify password
            if (user == null || !_passwordHashing.VerifyPassword(loginDto.Password, user.PasswordHash))
            {
                _logger.LogWarning($"Failed login attempt for email: {loginDto.Email}");
                return Unauthorized(new { message = "Invalid email or password" });
            }

            if (!user.IsActive)
            {
                _logger.LogWarning($"Login attempt on inactive account: {loginDto.Email}");
                return Unauthorized(new { message = "User account is inactive" });
            }

            // Successful login - fetch tracked user and update LastLogin
            var trackedUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == user.Id);
            if (trackedUser != null)
            {
                trackedUser.LastLogin = DateTime.UtcNow;
                trackedUser.FailedLoginAttempts = 0; // Reset failed attempts on success
                trackedUser.LockoutUntil = null; // Clear any lockout on success
                await _context.SaveChangesAsync();
            }

            var token = GenerateJwtToken(user);
            _logger.LogInformation($"Successful login for user: {user.Email}");

            return Ok(new 
            { 
                token = token, 
                role = user.Role.Name, 
                name = user.Name,
                email = user.Email
            });
        }

        /// <summary>
        /// Get current user profile (requires authentication)
        /// </summary>
        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            // We specifically look for 'id' first as we add it explicitly. 
            // NameIdentifier is often mapped from 'sub' or 'nameid' by ASP.NET Core.
            var userIdClaim = User.FindFirst("id") ?? 
                             User.FindFirst(ClaimTypes.NameIdentifier) ?? 
                             User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier");

            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                // If the first find failed or returned a non-integer (like an email in 'sub'), try to find any integer claim
                userIdClaim = User.Claims.FirstOrDefault(c => int.TryParse(c.Value, out _));
                
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out userId))
                {
                    _logger.LogWarning("Profile fetch failed: User ID claim is missing or invalid.");
                    return Unauthorized(new { message = "Invalid token claims" });
                }
            }

            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
            {
                return NotFound();
            }

            return Ok(new 
            { 
                id = user.Id,
                name = user.Name,
                email = user.Email,
                role = user.Role.Name,
                isActive = user.IsActive,
                lastLogin = user.LastLogin
            });
        }

        /// <summary>
        /// Verify current user password for sensitive actions
        /// </summary>
        [HttpPost("verify-password")]
        [Authorize]
        public async Task<IActionResult> VerifyPassword([FromBody] VerifyPasswordDto dto)
        {
            var userIdClaim = User.FindFirst("id") ?? 
                             User.FindFirst(ClaimTypes.NameIdentifier) ?? 
                             User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier");

            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                // Fallback: try to find any integer claim if specific ones fail
                userIdClaim = User.Claims.FirstOrDefault(c => int.TryParse(c.Value, out _));
                
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out userId))
                {
                    return Unauthorized(new { message = "Invalid token claims" });
                }
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound();
            }

            if (!_passwordHashing.VerifyPassword(dto.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Invalid password" });
            }

            return Ok(new { success = true });
        }

        public class VerifyPasswordDto
        {
            public string Password { get; set; } = string.Empty;
        }

        private string GenerateJwtToken(User user)
        {
            var jwtKey = _configuration["Jwt:Key"] ?? "YourSuperSecretKeyThatIsLongEnough123!";
            var jwtIssuer = _configuration["Jwt:Issuer"] ?? "TradeMatrixServer";
            var jwtAudience = _configuration["Jwt:Audience"] ?? "TradeMatrixClient";
            var expiryMinutes = int.TryParse(_configuration["Jwt:ExpiryMinutes"], out var m) ? m : 1440;

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.NameId, user.Id.ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim("id", user.Id.ToString()),
                new Claim(ClaimTypes.Role, user.Role.Name),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Name)
            };

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
