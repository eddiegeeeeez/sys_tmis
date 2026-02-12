using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TradeMatrix.Server.Data;
using TradeMatrix.Server.Models;
using TradeMatrix.Server.Services;

namespace TradeMatrix.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IPasswordHashingService _passwordHashing;
        private readonly ILogger<UsersController> _logger;

        public UsersController(
            ApplicationDbContext context,
            IPasswordHashingService passwordHashing,
            ILogger<UsersController> logger)
        {
            _context = context;
            _passwordHashing = passwordHashing;
            _logger = logger;
        }

        /// <summary>
        /// Get all users with pagination and filtering
        /// </summary>
        [HttpGet("list")]
        [Authorize(Roles = "SuperAdmin,SystemAdmin")]
        public async Task<IActionResult> GetUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null, [FromQuery] string? role = null)
        {
            try
            {
                var query = _context.Users.AsQueryable();

                // Filter by search term (name or email)
                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(u => u.Name.Contains(search) || u.Email.Contains(search));
                }

                // Filter by role
                if (!string.IsNullOrEmpty(role) && Enum.TryParse<UserRole>(role, out var roleEnum))
                {
                    query = query.Where(u => u.Role == roleEnum);
                }

                var total = await query.CountAsync();
                var users = await query
                    .OrderBy(u => u.Name)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(u => new
                    {
                        u.Id,
                        u.Name,
                        u.Email,
                        Role = u.Role.ToString(),
                        u.IsActive,
                        u.LastLogin,
                        u.CreatedAt,
                        u.CreatedBy
                    })
                    .ToListAsync();

                return Ok(new
                {
                    data = users,
                    pagination = new
                    {
                        page,
                        pageSize,
                        total,
                        pages = (int)Math.Ceiling(total / (double)pageSize)
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching users: {ex.Message}");
                return StatusCode(500, new { message = "Error fetching users" });
            }
        }

        /// <summary>
        /// Get a specific user by ID
        /// </summary>
        [HttpGet("{id}")]
        [Authorize(Roles = "SuperAdmin,SystemAdmin")]
        public async Task<IActionResult> GetUser(int id)
        {
            try
            {
                var user = await _context.Users
                    .Where(u => u.Id == id)
                    .Select(u => new
                    {
                        u.Id,
                        u.Name,
                        u.Email,
                        Role = u.Role.ToString(),
                        u.IsActive,
                        u.LastLogin,
                        u.FailedLoginAttempts,
                        u.LockoutUntil,
                        u.CreatedAt,
                        u.CreatedBy,
                        u.UpdatedAt,
                        u.UpdatedBy
                    })
                    .FirstOrDefaultAsync();

                if (user == null)
                    return NotFound(new { message = "User not found" });

                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching user: {ex.Message}");
                return StatusCode(500, new { message = "Error fetching user" });
            }
        }

        /// <summary>
        /// Create a new user
        /// </summary>
        [HttpPost("create")]
        [Authorize(Roles = "SuperAdmin,SystemAdmin")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto createUserDto)
        {
            try
            {
                // Validate input
                if (string.IsNullOrWhiteSpace(createUserDto.Name) || string.IsNullOrWhiteSpace(createUserDto.Email))
                {
                    return BadRequest(new { message = "Name and Email are required" });
                }

                // Check if user already exists
                var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == createUserDto.Email);
                if (existingUser != null)
                {
                    return Conflict(new { message = "User with this email already exists" });
                }

                // Validate role
                if (!Enum.TryParse<UserRole>(createUserDto.Role, out var roleEnum))
                {
                    return BadRequest(new { message = "Invalid role" });
                }

                // Get current user info from JWT claims
                var currentUserId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

                var newUser = new User
                {
                    Name = createUserDto.Name,
                    Email = createUserDto.Email,
                    PasswordHash = _passwordHashing.HashPassword(createUserDto.Password ?? "DefaultPassword123!"),
                    Role = roleEnum,
                    IsActive = createUserDto.IsActive ?? true,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = currentUserId > 0 ? currentUserId.ToString() : null
                };

                _context.Users.Add(newUser);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"User created: {newUser.Email} by user ID: {currentUserId}");

                return CreatedAtAction(nameof(GetUser), new { id = newUser.Id }, new
                {
                    newUser.Id,
                    newUser.Name,
                    newUser.Email,
                    Role = newUser.Role.ToString(),
                    newUser.IsActive,
                    newUser.CreatedAt
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error creating user: {ex.Message}");
                return StatusCode(500, new { message = "Error creating user" });
            }
        }

        /// <summary>
        /// Update a user
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "SuperAdmin,SystemAdmin")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto updateUserDto)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                    return NotFound(new { message = "User not found" });

                // Get current user info
                var currentUserId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

                // Update fields
                if (!string.IsNullOrWhiteSpace(updateUserDto.Name))
                    user.Name = updateUserDto.Name;

                if (!string.IsNullOrWhiteSpace(updateUserDto.Email) && updateUserDto.Email != user.Email)
                {
                    // Check if new email already exists
                    var emailExists = await _context.Users.AnyAsync(u => u.Email == updateUserDto.Email && u.Id != id);
                    if (emailExists)
                        return Conflict(new { message = "Email already in use" });
                    user.Email = updateUserDto.Email;
                }

                if (!string.IsNullOrWhiteSpace(updateUserDto.Role) && Enum.TryParse<UserRole>(updateUserDto.Role, out var roleEnum))
                    user.Role = roleEnum;

                if (updateUserDto.IsActive.HasValue)
                    user.IsActive = updateUserDto.IsActive.Value;

                user.UpdatedAt = DateTime.UtcNow;
                user.UpdatedBy = currentUserId > 0 ? currentUserId.ToString() : null;

                await _context.SaveChangesAsync();

                _logger.LogInformation($"User updated: {user.Email} by user ID: {currentUserId}");

                return Ok(new
                {
                    user.Id,
                    user.Name,
                    user.Email,
                    Role = user.Role.ToString(),
                    user.IsActive,
                    user.UpdatedAt
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating user: {ex.Message}");
                return StatusCode(500, new { message = "Error updating user" });
            }
        }

        /// <summary>
        /// Delete a user
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                    return NotFound(new { message = "User not found" });

                // Prevent deleting yourself
                var currentUserId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
                if (id == currentUserId)
                    return BadRequest(new { message = "Cannot delete your own account" });

                _context.Users.Remove(user);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"User deleted: {user.Email} by user ID: {currentUserId}");

                return Ok(new { message = "User deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting user: {ex.Message}");
                return StatusCode(500, new { message = "Error deleting user" });
            }
        }

        /// <summary>
        /// Unlock a user account (reset lockout)
        /// </summary>
        [HttpPost("{id}/unlock")]
        [Authorize(Roles = "SuperAdmin,SystemAdmin")]
        public async Task<IActionResult> UnlockUser(int id)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                    return NotFound(new { message = "User not found" });

                user.FailedLoginAttempts = 0;
                user.LockoutUntil = null;

                await _context.SaveChangesAsync();

                _logger.LogInformation($"User account unlocked: {user.Email}");

                return Ok(new { message = "User account unlocked" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error unlocking user: {ex.Message}");
                return StatusCode(500, new { message = "Error unlocking user" });
            }
        }

        /// <summary>
        /// Reset a user's password
        /// </summary>
        [HttpPost("{id}/reset-password")]
        [Authorize(Roles = "SuperAdmin,SystemAdmin")]
        public async Task<IActionResult> ResetPassword(int id, [FromBody] ResetPasswordDto resetPasswordDto)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                    return NotFound(new { message = "User not found" });

                if (string.IsNullOrWhiteSpace(resetPasswordDto.NewPassword))
                    return BadRequest(new { message = "New password is required" });

                user.PasswordHash = _passwordHashing.HashPassword(resetPasswordDto.NewPassword);
                user.FailedLoginAttempts = 0;
                user.LockoutUntil = null;

                await _context.SaveChangesAsync();

                _logger.LogInformation($"Password reset for user: {user.Email}");

                return Ok(new { message = "Password reset successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error resetting password: {ex.Message}");
                return StatusCode(500, new { message = "Error resetting password" });
            }
        }
    }

    // DTOs
    public class CreateUserDto
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Password { get; set; }
        public string Role { get; set; } = "Manager";
        public bool? IsActive { get; set; } = true;
    }

    public class UpdateUserDto
    {
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Role { get; set; }
        public bool? IsActive { get; set; }
    }

    public class ResetPasswordDto
    {
        public string NewPassword { get; set; } = string.Empty;
    }
}
