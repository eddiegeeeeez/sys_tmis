using TradeMatrix.Server.DTOs;

namespace TradeMatrix.Server.Services
{
    public interface IAuthService
    {
        Task<AuthResultDto?> LoginAsync(LoginDto loginDto);
        Task<UserProfileDto?> GetProfileAsync(int userId);
        Task<bool> VerifyPasswordAsync(int userId, string password);
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
