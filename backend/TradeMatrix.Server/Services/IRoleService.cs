using TradeMatrix.Server.DTOs;

namespace TradeMatrix.Server.Services
{
    public interface IRoleService
    {
        Task<IEnumerable<RoleDto>> GetRolesAsync();
        Task<RoleDto?> GetRoleByIdAsync(int id);
        Task<ApiResponse<RoleDto>> CreateRoleAsync(CreateRoleDto createRoleDto);
        Task<ApiResponse<RoleDto>> UpdateRoleAsync(int id, UpdateRoleDto updateRoleDto);
        Task<ApiResponse<bool>> DeleteRoleAsync(int id);
        Task<ApiResponse<bool>> ArchiveRoleAsync(int id);
        Task<ApiResponse<bool>> RestoreRoleAsync(int id);
    }
}
