using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TradeMatrix.Server.DTOs;
using TradeMatrix.Server.Services;

namespace TradeMatrix.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ILogger<UsersController> _logger;

        public UsersController(IUserService userService, ILogger<UsersController> logger)
        {
            _userService = userService;
            _logger = logger;
        }

        /// <summary>
        /// Get all users with pagination and filtering
        /// </summary>
        [HttpGet("list")]
        [Authorize(Roles = "SuperAdmin,SystemAdmin")]
        public async Task<ActionResult<PaginatedResponse<UserDto>>> GetUsers(
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10, 
            [FromQuery] string? search = null, 
            [FromQuery] string? role = null)
        {
            try
            {
                var result = await _userService.GetUsersAsync(page, pageSize, search, role);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching users");
                return StatusCode(500, ApiResponse<string>.ErrorResponse("Error fetching users"));
            }
        }

        /// <summary>
        /// Get a specific user by ID
        /// </summary>
        [HttpGet("{id}")]
        [Authorize(Roles = "SuperAdmin,SystemAdmin")]
        public async Task<ActionResult<UserDetailDto>> GetUser(int id)
        {
            try
            {
                var user = await _userService.GetUserByIdAsync(id);
                if (user == null)
                    return NotFound(ApiResponse<string>.ErrorResponse("User not found"));

                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching user");
                return StatusCode(500, ApiResponse<string>.ErrorResponse("Error fetching user"));
            }
        }

        /// <summary>
        /// Create a new user
        /// </summary>
        [HttpPost("create")]
        [Authorize(Roles = "SuperAdmin,SystemAdmin")]
        public async Task<ActionResult<ApiResponse<UserDto>>> CreateUser([FromBody] CreateUserDto createUserDto)
        {
            try
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var result = await _userService.CreateUserAsync(createUserDto, currentUserId);
                
                if (!result.Success)
                    return BadRequest(result);

                return CreatedAtAction(nameof(GetUser), new { id = result.Data!.Id }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user");
                return StatusCode(500, ApiResponse<string>.ErrorResponse("Error creating user"));
            }
        }

        /// <summary>
        /// Update a user
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "SuperAdmin,SystemAdmin")]
        public async Task<ActionResult<ApiResponse<UserDto>>> UpdateUser(int id, [FromBody] UpdateUserDto updateUserDto)
        {
            try
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var result = await _userService.UpdateUserAsync(id, updateUserDto, currentUserId);
                
                if (!result.Success)
                    return BadRequest(result);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user");
                return StatusCode(500, ApiResponse<string>.ErrorResponse("Error updating user"));
            }
        }

        /// <summary>
        /// Delete a user
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteUser(int id)
        {
            try
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var result = await _userService.DeleteUserAsync(id, currentUserId);
                
                if (!result.Success)
                    return BadRequest(result);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user");
                return StatusCode(500, ApiResponse<string>.ErrorResponse("Error deleting user"));
            }
        }

        /// <summary>
        /// Unlock a user account (reset lockout)
        /// </summary>
        [HttpPost("{id}/unlock")]
        [Authorize(Roles = "SuperAdmin,SystemAdmin")]
        public async Task<ActionResult<ApiResponse<bool>>> UnlockUser(int id)
        {
            try
            {
                var result = await _userService.UnlockUserAsync(id);
                if (!result.Success)
                    return BadRequest(result);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unlocking user");
                return StatusCode(500, ApiResponse<string>.ErrorResponse("Error unlocking user"));
            }
        }

        /// <summary>
        /// Reset a user's password
        /// </summary>
        [HttpPost("{id}/reset-password")]
        [Authorize(Roles = "SuperAdmin,SystemAdmin")]
        public async Task<ActionResult<ApiResponse<bool>>> ResetPassword(int id, [FromBody] ResetPasswordDto resetPasswordDto)
        {
            try
            {
                var result = await _userService.ResetPasswordAsync(id, resetPasswordDto.NewPassword);
                if (!result.Success)
                    return BadRequest(result);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting password");
                return StatusCode(500, ApiResponse<string>.ErrorResponse("Error resetting password"));
            }
        }
    }
}
