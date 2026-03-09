using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TradeMatrix.Server.Data;
using TradeMatrix.Server.DTOs;
using TradeMatrix.Server.Models;

namespace TradeMatrix.Server.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IPasswordHashingService _passwordHashing;
        private readonly ILogger<AuthService> _logger;

        // Account lockout settings
        private const int MaxFailedAttempts = 5;
        private static readonly TimeSpan LockoutDuration = TimeSpan.FromMinutes(15);

        public AuthService(
            ApplicationDbContext context,
            IConfiguration configuration,
            IPasswordHashingService passwordHashing,
            ILogger<AuthService> logger)
        {
            _context = context;
            _configuration = configuration;
            _passwordHashing = passwordHashing;
            _logger = logger;
        }

        public async Task<LoginResultDto> LoginAsync(LoginDto loginDto)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if (user == null)
            {
                // Return generic failure — don't reveal whether user exists
                return LoginResultDto.Failed("Invalid email or password");
            }

            bool isLockedOut = user.LockoutUntil.HasValue
                            && user.LockoutUntil.Value > DateTime.UtcNow;

            // Verify password FIRST — correct password bypasses lockout so the
            // legitimate owner is never blocked by an attacker's failed attempts
            // from another device.
            if (!_passwordHashing.VerifyPassword(loginDto.Password, user.PasswordHash))
            {
                // Wrong password while locked out — return lockout message, don't
                // increment counter (already maxed).
                if (isLockedOut)
                {
                    var remaining = (int)(user.LockoutUntil!.Value - DateTime.UtcNow).TotalMinutes + 1;
                    _logger.LogWarning("Failed login on locked account: {UserId}", user.Id);
                    return LoginResultDto.Locked($"Account is locked. Try again in {remaining} minute(s).");
                }

                // Wrong password, not locked — increment failure counter
                user.FailedLoginAttempts++;

                if (user.FailedLoginAttempts >= MaxFailedAttempts)
                {
                    user.LockoutUntil = DateTime.UtcNow.Add(LockoutDuration);
                    _logger.LogWarning("Account locked after {Attempts} failed attempts: {UserId}",
                        user.FailedLoginAttempts, user.Id);
                }

                await _context.SaveChangesAsync();
                return LoginResultDto.Failed("Invalid email or password");
            }

            if (!user.IsActive)
                return LoginResultDto.Failed("Account is deactivated. Contact your administrator.");

            if (user.IsArchived)
                return LoginResultDto.Failed("Account has been archived. Contact your administrator.");

            // Successful login — reset lockout counters
            user.LastLogin = DateTime.UtcNow;
            user.FailedLoginAttempts = 0;
            user.LockoutUntil = null;
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(user);

            return LoginResultDto.Success(new AuthResultDto
            {
                Token = token,
                Role = user.Role.Name,
                Name = user.Name,
                Email = user.Email
            });
        }

        public async Task<UserProfileDto?> GetProfileAsync(int userId)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null) return null;

            return new UserProfileDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role.Name,
                IsActive = user.IsActive,
                LastLogin = user.LastLogin
            };
        }

        public async Task<bool> VerifyPasswordAsync(int userId, string password)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            return _passwordHashing.VerifyPassword(password, user.PasswordHash);
        }

        private string GenerateJwtToken(User user)
        {
            var jwtKey = _configuration["Jwt:Key"]
                ?? throw new InvalidOperationException("JWT signing key (Jwt:Key) is not configured. Application cannot issue tokens.");
            var jwtIssuer = _configuration["Jwt:Issuer"]
                ?? throw new InvalidOperationException("JWT issuer (Jwt:Issuer) is not configured.");
            var jwtAudience = _configuration["Jwt:Audience"]
                ?? throw new InvalidOperationException("JWT audience (Jwt:Audience) is not configured.");
            var expiryMinutes = int.TryParse(_configuration["Jwt:ExpiryMinutes"], out var m) ? m : 60;

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
