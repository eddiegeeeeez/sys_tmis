using Microsoft.EntityFrameworkCore;
using TradeMatrix.Server.Data;
using TradeMatrix.Server.DTOs;
using TradeMatrix.Server.Models;

namespace TradeMatrix.Server.Services
{
    public class RoleService : IRoleService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<RoleService> _logger;

        public RoleService(ApplicationDbContext context, ILogger<RoleService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<RoleDto>> GetRolesAsync(bool? isArchived = false)
        {
            var query = _context.Roles.AsQueryable();

            if (isArchived.HasValue)
            {
                query = query.Where(r => r.IsArchived == isArchived.Value);
            }

            return await query
                .Select(r => new RoleDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Description = r.Description,
                    Permissions = r.Permissions,
                    IsSystemRole = r.IsSystemRole,
                    IsArchived = r.IsArchived,
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<RoleDto?> GetRoleByIdAsync(int id)
        {
            return await _context.Roles
                .Where(r => r.Id == id)
                .Select(r => new RoleDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Description = r.Description,
                    Permissions = r.Permissions,
                    IsSystemRole = r.IsSystemRole,
                    IsArchived = r.IsArchived,
                    CreatedAt = r.CreatedAt
                })
                .FirstOrDefaultAsync();
        }

        public async Task<ApiResponse<RoleDto>> CreateRoleAsync(CreateRoleDto createRoleDto)
        {
            if (await _context.Roles.AnyAsync(r => r.Name == createRoleDto.Name))
            {
                return ApiResponse<RoleDto>.ErrorResponse("Role with this name already exists.");
            }

            var role = new Role
            {
                Name = createRoleDto.Name,
                Description = createRoleDto.Description,
                Permissions = createRoleDto.Permissions ?? string.Empty,
                IsSystemRole = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Roles.Add(role);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Role created: {role.Name}");

            var roleDto = new RoleDto
            {
                Id = role.Id,
                Name = role.Name,
                Description = role.Description,
                Permissions = role.Permissions,
                IsSystemRole = role.IsSystemRole,
                CreatedAt = role.CreatedAt
            };

            return ApiResponse<RoleDto>.SuccessResponse(roleDto, "Role created successfully.");
        }

        public async Task<ApiResponse<RoleDto>> UpdateRoleAsync(int id, UpdateRoleDto updateRoleDto)
        {
            var role = await _context.Roles.FindAsync(id);
            if (role == null)
            {
                return ApiResponse<RoleDto>.ErrorResponse("Role not found.");
            }

            // Prevent renaming system roles (can break authorization logic)
            if (role.IsSystemRole && role.Name != updateRoleDto.Name)
            {
                return ApiResponse<RoleDto>.ErrorResponse("Cannot rename system roles.");
            }

            // Specific protection for SuperAdmin
            if (role.Name == "SuperAdmin" || updateRoleDto.Name == "SuperAdmin")
            {
                // We'd ideally check current user role here, but RoleService doesn't have it yet.
                // Assuming controller level or frontend level gates for now, 
                // but let's add a generic "Cannot modify SuperAdmin" if we had the context.
            }

            role.Name = updateRoleDto.Name;
            role.Description = updateRoleDto.Description;
            role.Permissions = updateRoleDto.Permissions;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Role updated: {role.Name}");

            var roleDto = new RoleDto
            {
                Id = role.Id,
                Name = role.Name,
                Description = role.Description,
                Permissions = role.Permissions,
                IsSystemRole = role.IsSystemRole,
                CreatedAt = role.CreatedAt
            };

            return ApiResponse<RoleDto>.SuccessResponse(roleDto, "Role updated successfully.");
        }

        public async Task<ApiResponse<bool>> DeleteRoleAsync(int id)
        {
            var role = await _context.Roles.FindAsync(id);
            if (role == null)
            {
                return ApiResponse<bool>.ErrorResponse("Role not found.");
            }

            if (role.IsSystemRole)
            {
                return ApiResponse<bool>.ErrorResponse("Cannot delete system roles.");
            }

            if (await _context.Users.AnyAsync(u => u.RoleId == id))
            {
                return ApiResponse<bool>.ErrorResponse("Cannot delete role assigned to users.");
            }

            _context.Roles.Remove(role);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Role deleted: {role.Name}");

            return ApiResponse<bool>.SuccessResponse(true, "Role deleted successfully.");
        }

        public async Task<ApiResponse<bool>> ArchiveRoleAsync(int id)
        {
            var role = await _context.Roles.FindAsync(id);
            if (role == null) return ApiResponse<bool>.ErrorResponse("Role not found.");
            if (role.IsSystemRole) return ApiResponse<bool>.ErrorResponse("Cannot archive system roles.");

            role.IsArchived = true;
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Role archived: {role.Name}");
            return ApiResponse<bool>.SuccessResponse(true, "Role archived successfully.");
        }

        public async Task<ApiResponse<bool>> RestoreRoleAsync(int id)
        {
            var role = await _context.Roles.FindAsync(id);
            if (role == null) return ApiResponse<bool>.ErrorResponse("Role not found.");

            role.IsArchived = false;
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Role restored: {role.Name}");
            return ApiResponse<bool>.SuccessResponse(true, "Role restored successfully.");
        }
    }
}
