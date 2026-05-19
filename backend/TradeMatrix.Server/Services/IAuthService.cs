using TradeMatrix.Server.DTOs;

namespace TradeMatrix.Server.Services
{
    public interface IAuthService
    {
        Task<LoginResultDto> LoginAsync(LoginDto loginDto);
        Task<UserProfileDto?> GetProfileAsync(int userId);
        Task<bool> VerifyPasswordAsync(int userId, string password);
        Task<ApiResponse<bool>> ChangePasswordAsync(int userId, string newPassword);

        /// <summary>Sends an OTP to the user's email for the given purpose.</summary>
        Task<ApiResponse<bool>> RequestOtpAsync(string email, string purpose);

        /// <summary>Verifies an OTP. Returns a short-lived session token on success.</summary>
        Task<ApiResponse<string>> VerifyOtpAsync(string email, string purpose, string otp);
    }

    /// <summary>
    /// Wraps the login outcome so the controller can return distinct HTTP codes
    /// for locked accounts, invalid credentials, and success.
    /// </summary>
    public class LoginResultDto
    {
        public bool IsSuccess { get; set; }
        public bool IsLockedOut { get; set; }
        public string? ErrorMessage { get; set; }
        public AuthResultDto? Data { get; set; }

        public static LoginResultDto Success(AuthResultDto data) =>
            new() { IsSuccess = true, Data = data };

        public static LoginResultDto Failed(string message) =>
            new() { IsSuccess = false, ErrorMessage = message };

        public static LoginResultDto Locked(string message) =>
            new() { IsSuccess = false, IsLockedOut = true, ErrorMessage = message };
    }

    public class AuthResultDto
    {
        public string Token { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool MustChangePassword { get; set; }
    }

    public class UserProfileDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime? LastLogin { get; set; }
        public bool MustChangePassword { get; set; }
    }
}
