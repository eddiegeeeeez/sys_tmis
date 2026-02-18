using TradeMatrix.Server.DTOs;

namespace TradeMatrix.Server.Services
{
    public interface IUserService
    {
        Task<PaginatedResponse<UserDto>> GetUsersAsync(int page, int pageSize, string? search, string? role);
        Task<UserDetailDto?> GetUserByIdAsync(int id);
        Task<ApiResponse<UserDto>> CreateUserAsync(CreateUserDto createUserDto, string? currentUserId);
        Task<ApiResponse<UserDto>> UpdateUserAsync(int id, UpdateUserDto updateUserDto, string? currentUserId);
        Task<ApiResponse<bool>> DeleteUserAsync(int id, string? currentUserId);
        Task<ApiResponse<bool>> UnlockUserAsync(int id);
        Task<ApiResponse<bool>> ResetPasswordAsync(int id, string newPassword);
    }
}
