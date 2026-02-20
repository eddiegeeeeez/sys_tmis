using Microsoft.EntityFrameworkCore;
using TradeMatrix.Server.Data;
using TradeMatrix.Server.DTOs;
using TradeMatrix.Server.Models;

namespace TradeMatrix.Server.Services
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;
        private readonly IPasswordHashingService _passwordHashing;
        private readonly ILogger<UserService> _logger;

        public UserService(
            ApplicationDbContext context,
            IPasswordHashingService passwordHashing,
            ILogger<UserService> logger)
        {
            _context = context;
            _passwordHashing = passwordHashing;
            _logger = logger;
        }

        public async Task<PaginatedResponse<UserDto>> GetUsersAsync(int page, int pageSize, string? search, string? role)
        {
            var query = _context.Users.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(u => u.Name.Contains(search) || u.Email.Contains(search));
            }

            if (!string.IsNullOrEmpty(role))
            {
                query = query.Where(u => u.Role.Name == role);
            }

            var total = await query.CountAsync();
            var users = await query
                .OrderBy(u => u.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Name = u.Name,
                    Email = u.Email,
                    Role = u.Role.Name,
                    IsActive = u.IsActive,
                    IsArchived = u.IsArchived,
                    LastLogin = u.LastLogin,
                    CreatedAt = u.CreatedAt,
                    CreatedBy = u.CreatedBy
                })
                .ToListAsync();

            return new PaginatedResponse<UserDto>(users, page, pageSize, total);
        }

        public async Task<UserDetailDto?> GetUserByIdAsync(int id)
        {
            return await _context.Users
                .Include(u => u.Role)
                .Where(u => u.Id == id)
                .Select(u => new UserDetailDto
                {
                    Id = u.Id,
                    Name = u.Name,
                    Email = u.Email,
                    Role = u.Role.Name,
                    IsActive = u.IsActive,
                    IsArchived = u.IsArchived,
                    LastLogin = u.LastLogin,
                    CreatedAt = u.CreatedAt,
                    CreatedBy = u.CreatedBy,
                    FailedLoginAttempts = u.FailedLoginAttempts,
                    LockoutUntil = u.LockoutUntil,
                    UpdatedAt = u.UpdatedAt,
                    UpdatedBy = u.UpdatedBy
                })
                .FirstOrDefaultAsync();
        }

        public async Task<ApiResponse<UserDto>> CreateUserAsync(CreateUserDto createUserDto, string? currentUserId)
        {
            if (string.IsNullOrWhiteSpace(createUserDto.Name) || string.IsNullOrWhiteSpace(createUserDto.Email))
            {
                return ApiResponse<UserDto>.ErrorResponse("Name and Email are required");
            }

            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == createUserDto.Email);
            if (existingUser != null)
            {
                return ApiResponse<UserDto>.ErrorResponse("User with this email already exists");
            }

            var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == createUserDto.Role);
            if (role == null)
            {
                return ApiResponse<UserDto>.ErrorResponse("Invalid role");
            }

            // Security Restriction: SystemAdmin can only create InventoryClerk and Cashier
            if (role.Name == "SuperAdmin" && currentUserId != null)
            {
                var creator = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id.ToString() == currentUserId);
                if (creator?.Role.Name != "SuperAdmin")
                {
                    return ApiResponse<UserDto>.ErrorResponse("Unauthorized to assign SuperAdmin role");
                }
            }

            if (currentUserId != null)
            {
                var creator = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id.ToString() == currentUserId);
                if (creator?.Role.Name == "SystemAdmin")
                {
                    if (role.Name != "InventoryClerk" && role.Name != "Cashier")
                    {
                        return ApiResponse<UserDto>.ErrorResponse("SystemAdmin can only create Inventory Clerk or Cashier accounts");
                    }
                }
            }

            var newUser = new User
            {
                Name = createUserDto.Name,
                Email = createUserDto.Email,
                PasswordHash = _passwordHashing.HashPassword(createUserDto.Password ?? "TradeMatrix2024!"),
                Role = role,
                IsActive = createUserDto.IsActive ?? true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = currentUserId
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"User created: {newUser.Email} by user ID: {currentUserId}");

            var userDto = new UserDto
            {
                Id = newUser.Id,
                Name = newUser.Name,
                Email = newUser.Email,
                Role = newUser.Role.Name,
                IsActive = newUser.IsActive,
                IsArchived = newUser.IsArchived,
                CreatedAt = newUser.CreatedAt,
                CreatedBy = newUser.CreatedBy
            };

            return ApiResponse<UserDto>.SuccessResponse(userDto, "User created successfully");
        }

        public async Task<ApiResponse<UserDto>> UpdateUserAsync(int id, UpdateUserDto updateUserDto, string? currentUserId)
        {
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == id);
            if (user == null)
            {
                return ApiResponse<UserDto>.ErrorResponse("User not found");
            }

            if (!string.IsNullOrWhiteSpace(updateUserDto.Name))
                user.Name = updateUserDto.Name;

            if (!string.IsNullOrWhiteSpace(updateUserDto.Email) && updateUserDto.Email != user.Email)
            {
                var emailExists = await _context.Users.AnyAsync(u => u.Email == updateUserDto.Email && u.Id != id);
                if (emailExists)
                    return ApiResponse<UserDto>.ErrorResponse("Email already in use");
                user.Email = updateUserDto.Email;
            }

            Role? role = null;
            if (!string.IsNullOrWhiteSpace(updateUserDto.Role))
            {
                role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == updateUserDto.Role);
                if (role == null)
                {
                    return ApiResponse<UserDto>.ErrorResponse("Invalid role");
                }
            }

            if (role != null)
            {
                    // Security Restriction for Update
                    if (role.Name != user.Role.Name && currentUserId != null)
                    {
                        var updater = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id.ToString() == currentUserId);
                        if (updater?.Role.Name == "SystemAdmin")
                        {
                            if (role.Name != "InventoryClerk" && role.Name != "Cashier")
                            {
                                return ApiResponse<UserDto>.ErrorResponse("SystemAdmin can only reassign to Inventory Clerk or Cashier roles");
                            }
                        }
                        
                        if (role.Name == "SuperAdmin" && updater?.Role.Name != "SuperAdmin")
                        {
                            return ApiResponse<UserDto>.ErrorResponse("Unauthorized to assign SuperAdmin role");
                        }
                    }
                    user.Role = role;
                }

            if (updateUserDto.IsActive.HasValue)
                user.IsActive = updateUserDto.IsActive.Value;

            user.UpdatedAt = DateTime.UtcNow;
            user.UpdatedBy = currentUserId;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"User updated: {user.Email} by user ID: {currentUserId}");

            var userDto = new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role.Name,
                IsActive = user.IsActive,
                IsArchived = user.IsArchived,
                UpdatedAt = user.UpdatedAt,
                UpdatedBy = user.UpdatedBy
            };

            return ApiResponse<UserDto>.SuccessResponse(userDto, "User updated successfully");
        }

        public async Task<ApiResponse<bool>> DeleteUserAsync(int id, string? currentUserId)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return ApiResponse<bool>.ErrorResponse("User not found");
            }

            if (id.ToString() == currentUserId)
            {
                return ApiResponse<bool>.ErrorResponse("Cannot delete your own account");
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"User deleted: {user.Email} by user ID: {currentUserId}");

            return ApiResponse<bool>.SuccessResponse(true, "User deleted successfully");
        }

        public async Task<ApiResponse<bool>> UnlockUserAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return ApiResponse<bool>.ErrorResponse("User not found");
            }

            user.FailedLoginAttempts = 0;
            user.LockoutUntil = null;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"User account unlocked: {user.Email}");

            return ApiResponse<bool>.SuccessResponse(true, "User account unlocked");
        }

        public async Task<ApiResponse<bool>> ResetPasswordAsync(int id, string newPassword)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return ApiResponse<bool>.ErrorResponse("User not found");
            }

            if (string.IsNullOrWhiteSpace(newPassword))
            {
                return ApiResponse<bool>.ErrorResponse("New password is required");
            }

            user.PasswordHash = _passwordHashing.HashPassword(newPassword);
            user.FailedLoginAttempts = 0;
            user.LockoutUntil = null;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Password reset for user: {user.Email}");

            return ApiResponse<bool>.SuccessResponse(true, "Password reset successfully");
        }

        public async Task<ApiResponse<bool>> ArchiveUserAsync(int id, string? currentUserId)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return ApiResponse<bool>.ErrorResponse("User not found");
            if (id.ToString() == currentUserId) return ApiResponse<bool>.ErrorResponse("Cannot archive your own account");

            user.IsActive = false;
            user.IsArchived = true;
            await _context.SaveChangesAsync();

            _logger.LogInformation($"User archived: {user.Email} by user ID: {currentUserId}");
            return ApiResponse<bool>.SuccessResponse(true, "User archived successfully");
        }

        public async Task<ApiResponse<bool>> RestoreUserAsync(int id, string? currentUserId)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return ApiResponse<bool>.ErrorResponse("User not found");

            user.IsActive = true;
            user.IsArchived = false;
            await _context.SaveChangesAsync();

            _logger.LogInformation($"User restored: {user.Email} by user ID: {currentUserId}");
            return ApiResponse<bool>.SuccessResponse(true, "User restored successfully");
        }
    }
}
