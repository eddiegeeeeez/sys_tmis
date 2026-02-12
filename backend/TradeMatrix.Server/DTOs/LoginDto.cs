using System.ComponentModel.DataAnnotations;

namespace TradeMatrix.Server.DTOs
{
    public class LoginDto
    {
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        [StringLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required")]
        [StringLength(255, MinimumLength = 6, ErrorMessage = "Password must be 6-255 characters")]
        public string Password { get; set; } = string.Empty;
    }
}
