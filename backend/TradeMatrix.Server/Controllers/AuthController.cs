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
                .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            // Check if account is locked out
            if (user != null && user.LockoutUntil.HasValue && user.LockoutUntil > DateTime.UtcNow)
            {
                var remainingSeconds = (int)(user.LockoutUntil.Value - DateTime.UtcNow).TotalSeconds;
                _logger.LogWarning($"Login attempt on locked account: {loginDto.Email}");
                return Unauthorized(new { message = $"Account is locked. Try again in {remainingSeconds} seconds." });
            }

            // Verify password first before any database updates
            if (user == null || !_passwordHashing.VerifyPassword(loginDto.Password, user.PasswordHash))
            {
                // Record failed attempt only if user exists
                if (user != null)
                {
                    // Re-fetch user for update (remove AsNoTracking)
                    var userForUpdate = await _context.Users.FirstOrDefaultAsync(u => u.Id == user.Id);
                    if (userForUpdate != null)
                    {
                        userForUpdate.FailedLoginAttempts++;
                        
                        // Lock account after 5 failed attempts
                        if (userForUpdate.FailedLoginAttempts >= 5)
                        {
                            userForUpdate.LockoutUntil = DateTime.UtcNow.AddMinutes(15);
                            _logger.LogWarning($"Account locked due to failed login attempts: {loginDto.Email}");
                        }

                        await _context.SaveChangesAsync();
                    }
                }

                _logger.LogWarning($"Failed login attempt for email: {loginDto.Email}");
                return Unauthorized(new { message = "Invalid email or password" });
            }

            if (!user.IsActive)
            {
                _logger.LogWarning($"Login attempt on inactive account: {loginDto.Email}");
                return Unauthorized(new { message = "User account is inactive" });
            }

            // Successful login - fetch tracked user and update all fields in one call
            var trackedUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == user.Id);
            if (trackedUser != null)
            {
                trackedUser.FailedLoginAttempts = 0;
                trackedUser.LockoutUntil = null;
                trackedUser.LastLogin = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            var token = GenerateJwtToken(user);
            _logger.LogInformation($"Successful login for user: {user.Email}");

            return Ok(new 
            { 
                token = token, 
                role = user.Role.ToString(), 
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
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdClaim?.Value, out int userId))
            {
                return Unauthorized();
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound();
            }

            return Ok(new 
            { 
                id = user.Id,
                name = user.Name,
                email = user.Email,
                role = user.Role.ToString(),
                isActive = user.IsActive,
                lastLogin = user.LastLogin
            });
        }

        private string GenerateJwtToken(User user)
        {
            var jwtKey = _configuration["Jwt:Key"] ?? "YourSuperSecretKeyThatIsLongEnough123!";
            var jwtIssuer = _configuration["Jwt:Issuer"] ?? "TradeMatrixServer";
            var jwtAudience = _configuration["Jwt:Audience"] ?? "TradeMatrixClient";

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim("Name", user.Name)
            };

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.Now.AddHours(24),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
