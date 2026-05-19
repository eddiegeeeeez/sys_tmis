using System.ComponentModel.DataAnnotations;

namespace TradeMatrix.Server.DTOs
{
    public class UserDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public bool IsArchived { get; set; }
        public DateTime? LastLogin { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? UpdatedBy { get; set; }
    }

    public class UserDetailDto : UserDto
    {
        public int FailedLoginAttempts { get; set; }
        public DateTime? LockoutUntil { get; set; }
    }

    public class CreateUserDto
    {
        [Required(ErrorMessage = "Name is required")]
        [StringLength(100, MinimumLength = 2)]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        [StringLength(150)]
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Must satisfy the password policy:
        /// 8–72 chars, uppercase, lowercase, digit, special character.
        /// </summary>
        [Required(ErrorMessage = "Password is required")]
        [StringLength(72, MinimumLength = 8, ErrorMessage = "Password must be 8–72 characters")]
        [RegularExpression(
            @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$",
            ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character.")]
        public string? Password { get; set; }

        public string Role { get; set; } = "Manager";
        public bool? IsActive { get; set; } = true;
    }

    public class UpdateUserDto
    {
        [StringLength(100, MinimumLength = 2)]
        public string? Name { get; set; }

        [EmailAddress(ErrorMessage = "Invalid email format")]
        [StringLength(150)]
        public string? Email { get; set; }

        public string? Role { get; set; }
        public bool? IsActive { get; set; }
    }

    public class ResetPasswordDto
    {
        [Required(ErrorMessage = "New password is required")]
        [StringLength(72, MinimumLength = 8, ErrorMessage = "Password must be 8–72 characters")]
        [RegularExpression(
            @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$",
            ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character.")]
        public string NewPassword { get; set; } = string.Empty;
    }
}
