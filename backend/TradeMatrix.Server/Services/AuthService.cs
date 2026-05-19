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
        private readonly IReCaptchaService _recaptcha;
        private readonly IOtpService _otpService;
        private readonly IAuditService _auditService;
        private readonly ILogger<AuthService> _logger;

        // Account lockout settings
        private const int MaxFailedAttempts = 5;
        private static readonly TimeSpan LockoutDuration = TimeSpan.FromMinutes(15);

        // Password expiry: 90 days (set to null to disable)
        private static readonly TimeSpan? PasswordExpiryDuration = TimeSpan.FromDays(90);

        public AuthService(
            ApplicationDbContext context,
            IConfiguration configuration,
            IPasswordHashingService passwordHashing,
            IReCaptchaService recaptcha,
            IOtpService otpService,
            IAuditService auditService,
            ILogger<AuthService> logger)
        {
            _context = context;
            _configuration = configuration;
            _passwordHashing = passwordHashing;
            _recaptcha = recaptcha;
            _otpService = otpService;
            _auditService = auditService;
            _logger = logger;
        }

        public async Task<LoginResultDto> LoginAsync(LoginDto loginDto)
        {
            // ── 1. reCAPTCHA verification ──────────────────────────────────────
            // Skip in development if ReCaptcha:Enabled is false
            var recaptchaEnabled = _configuration.GetValue<bool>("ReCaptcha:Enabled", true);
            if (recaptchaEnabled)
            {
                if (string.IsNullOrWhiteSpace(loginDto.RecaptchaToken))
                {
                    _logger.LogWarning("Login rejected — missing reCAPTCHA token for {Email}", loginDto.Email);
                    return LoginResultDto.Failed("reCAPTCHA verification is required.");
                }

                var captchaValid = await _recaptcha.VerifyAsync(loginDto.RecaptchaToken);
                if (!captchaValid)
                {
                    _logger.LogWarning("Login rejected — reCAPTCHA failed for {Email}", loginDto.Email);
                    return LoginResultDto.Failed("reCAPTCHA verification failed. Please try again.");
                }
            }

            // ── 2. Look up user ────────────────────────────────────────────────
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if (user == null)
            {
                // Generic message — don't reveal whether the email exists
                return LoginResultDto.Failed("Invalid email or password");
            }

            bool isLockedOut = user.LockoutUntil.HasValue
                            && user.LockoutUntil.Value > DateTime.UtcNow;

            // ── 3. Password verification ───────────────────────────────────────
            if (!_passwordHashing.VerifyPassword(loginDto.Password, user.PasswordHash))
            {
                if (isLockedOut)
                {
                    _logger.LogWarning("Failed login on locked account: {UserId}", user.Id);
                    // Same generic message to prevent lockout-state enumeration
                    return LoginResultDto.Failed("Invalid email or password");
                }

                user.FailedLoginAttempts++;

                if (user.FailedLoginAttempts >= MaxFailedAttempts)
                {
                    user.LockoutUntil = DateTime.UtcNow.Add(LockoutDuration);
                    _logger.LogWarning("Account locked after {Attempts} failed attempts: {UserId}",
                        user.FailedLoginAttempts, user.Id);

                    // Persist audit log for account lockout
                    await _auditService.LogEventAsync(
                        "auth.account.locked",
                        $"User: {user.Email}",
                        user.Name, user.Email, "system",
                        "Warning", "High",
                        new { reason = "Too many failed login attempts", attempts = user.FailedLoginAttempts });
                }

                await _context.SaveChangesAsync();

                // Persist audit log for failed login
                await _auditService.LogEventAsync(
                    "auth.login.failed",
                    $"User: {user.Email}",
                    user.Name, user.Email, "system",
                    "Failure", "Medium",
                    new { attempts = user.FailedLoginAttempts });

                return LoginResultDto.Failed("Invalid email or password");
            }

            // ── 4. Account state checks ────────────────────────────────────────
            if (!user.IsActive)
                return LoginResultDto.Failed("Account is deactivated. Contact your administrator.");

            if (user.IsArchived)
                return LoginResultDto.Failed("Account has been archived. Contact your administrator.");

            // ── 5. Password expiry check ───────────────────────────────────────
            if (PasswordExpiryDuration.HasValue && user.PasswordChangedAt.HasValue)
            {
                var passwordAge = DateTime.UtcNow - user.PasswordChangedAt.Value;
                if (passwordAge > PasswordExpiryDuration.Value)
                {
                    user.MustChangePassword = true;
                    await _context.SaveChangesAsync();
                    _logger.LogInformation("Password expired for user {UserId}", user.Id);
                }
            }

            // ── 6. Successful login — reset lockout counters ───────────────────
            user.LastLogin = DateTime.UtcNow;
            user.FailedLoginAttempts = 0;
            user.LockoutUntil = null;
            await _context.SaveChangesAsync();

            // Persist audit log for successful login
            await _auditService.LogEventAsync(
                "auth.login.success",
                $"User: {user.Email}",
                user.Name, user.Email, "system",
                "Success", "Low",
                new { role = user.Role.Name, mustChangePassword = user.MustChangePassword });

            var token = GenerateJwtToken(user);

            return LoginResultDto.Success(new AuthResultDto
            {
                Token = token,
                Role = user.Role.Name,
                Name = user.Name,
                Email = user.Email,
                MustChangePassword = user.MustChangePassword
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
                LastLogin = user.LastLogin,
                MustChangePassword = user.MustChangePassword
            };
        }

        public async Task<bool> VerifyPasswordAsync(int userId, string password)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;
            return _passwordHashing.VerifyPassword(password, user.PasswordHash);
        }

        public async Task<ApiResponse<bool>> ChangePasswordAsync(int userId, string newPassword)
        {
            // Enforce password policy
            var policyError = ValidatePasswordPolicy(newPassword);
            if (policyError != null)
                return ApiResponse<bool>.ErrorResponse(policyError);

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return ApiResponse<bool>.ErrorResponse("User not found");

            user.PasswordHash = _passwordHashing.HashPassword(newPassword);
            user.MustChangePassword = false;
            user.PasswordChangedAt = DateTime.UtcNow;
            user.FailedLoginAttempts = 0;
            user.LockoutUntil = null;
            await _context.SaveChangesAsync();

            // Persist audit log for password change
            await _auditService.LogEventAsync(
                "auth.password.changed",
                $"User: {user.Email}",
                user.Name, user.Email, "system",
                "Success", "Medium",
                new { userId });

            _logger.LogInformation("User {UserId} completed password change", userId);
            return ApiResponse<bool>.SuccessResponse(true, "Password changed successfully");
        }

        // ── OTP ────────────────────────────────────────────────────────────────

        public async Task<ApiResponse<bool>> RequestOtpAsync(string email, string purpose)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                // Don't reveal whether the email exists
                return ApiResponse<bool>.SuccessResponse(true, "If that email exists, an OTP has been sent.");
            }

            var otp = await _otpService.GenerateOtpAsync(email, purpose);

            // TODO: Replace this log line with your actual email/SMS sending logic.
            // Example: await _emailService.SendOtpAsync(email, otp);
            _logger.LogInformation("[OTP] Code for {Email} [{Purpose}]: {Otp} (remove this log in production)", email, purpose, otp);

            await _auditService.LogEventAsync(
                $"auth.otp.requested",
                $"User: {email}",
                user.Name, email, "system",
                "Success", "Low",
                new { purpose });

            return ApiResponse<bool>.SuccessResponse(true, "If that email exists, an OTP has been sent.");
        }

        public async Task<ApiResponse<string>> VerifyOtpAsync(string email, string purpose, string otp)
        {
            var isValid = await _otpService.VerifyOtpAsync(email, purpose, otp);

            if (!isValid)
            {
                await _auditService.LogEventAsync(
                    "auth.otp.failed",
                    $"User: {email}",
                    email, email, "system",
                    "Failure", "High",
                    new { purpose });

                return ApiResponse<string>.ErrorResponse("Invalid or expired OTP.");
            }

            await _auditService.LogEventAsync(
                "auth.otp.verified",
                $"User: {email}",
                email, email, "system",
                "Success", "Low",
                new { purpose });

            // Return a short-lived token scoped to the OTP purpose (e.g., password reset)
            var token = GenerateOtpSessionToken(email, purpose);
            return ApiResponse<string>.SuccessResponse(token, "OTP verified successfully.");
        }

        // ── Helpers ────────────────────────────────────────────────────────────

        /// <summary>
        /// Validates the password against the system's password policy.
        /// Returns null if valid, or an error message string if invalid.
        /// </summary>
        public static string? ValidatePasswordPolicy(string password)
        {
            if (string.IsNullOrWhiteSpace(password))
                return "Password is required.";

            if (password.Length < 8)
                return "Password must be at least 8 characters.";

            if (password.Length > 72)
                return "Password must not exceed 72 characters.";

            if (!password.Any(char.IsUpper))
                return "Password must contain at least one uppercase letter.";

            if (!password.Any(char.IsLower))
                return "Password must contain at least one lowercase letter.";

            if (!password.Any(char.IsDigit))
                return "Password must contain at least one digit.";

            if (!password.Any(c => !char.IsLetterOrDigit(c)))
                return "Password must contain at least one special character.";

            return null; // Valid
        }

        private string GenerateJwtToken(User user)
        {
            var jwtKey = _configuration["Jwt:Key"]
                ?? throw new InvalidOperationException("JWT signing key (Jwt:Key) is not configured.");
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

        /// <summary>
        /// Generates a short-lived JWT scoped to an OTP purpose (e.g., password reset).
        /// This token can only be used for the specific purpose, not for general API access.
        /// </summary>
        private string GenerateOtpSessionToken(string email, string purpose)
        {
            var jwtKey = _configuration["Jwt:Key"]
                ?? throw new InvalidOperationException("JWT signing key is not configured.");
            var jwtIssuer = _configuration["Jwt:Issuer"] ?? "TradeMatrixServer";
            var jwtAudience = _configuration["Jwt:Audience"] ?? "TradeMatrixClient";

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.Email, email),
                new Claim("otp_purpose", purpose),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(15), // Short-lived: 15 minutes
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
