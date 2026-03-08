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

        public AuthService(
            ApplicationDbContext context,
            IConfiguration configuration,
            IPasswordHashingService passwordHashing)
        {
            _context = context;
            _configuration = configuration;
            _passwordHashing = passwordHashing;
        }

        public async Task<AuthResultDto?> LoginAsync(LoginDto loginDto)
        {
            var user = await _context.Users
                .AsNoTracking()
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if (user == null || !_passwordHashing.VerifyPassword(loginDto.Password, user.PasswordHash))
                return null;

            if (!user.IsActive)
                return null;

            // Update LastLogin on tracked entity
            var trackedUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == user.Id);
            if (trackedUser != null)
            {
                trackedUser.LastLogin = DateTime.UtcNow;
                trackedUser.FailedLoginAttempts = 0;
                trackedUser.LockoutUntil = null;
                await _context.SaveChangesAsync();
            }

            var token = GenerateJwtToken(user);

            return new AuthResultDto
            {
                Token = token,
                Role = user.Role.Name,
                Name = user.Name,
                Email = user.Email
            };
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
