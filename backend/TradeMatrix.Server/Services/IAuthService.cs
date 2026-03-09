using TradeMatrix.Server.DTOs;

namespace TradeMatrix.Server.Services
{
    public interface IAuthService
    {
        Task<LoginResultDto> LoginAsync(LoginDto loginDto);
        Task<UserProfileDto?> GetProfileAsync(int userId);
        Task<bool> VerifyPasswordAsync(int userId, string password);
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
    }

    public class UserProfileDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime? LastLogin { get; set; }
    }
}
