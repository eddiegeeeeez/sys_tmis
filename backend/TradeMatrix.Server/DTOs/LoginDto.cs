using System.ComponentModel.DataAnnotations;

namespace TradeMatrix.Server.DTOs
{
    public class LoginDto
    {
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        [StringLength(150)]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required")]
        [StringLength(72, MinimumLength = 8, ErrorMessage = "Password must be 8–72 characters")]
        public string Password { get; set; } = string.Empty;

        /// <summary>
        /// Google reCAPTCHA v2 response token submitted by the frontend.
        /// Required in production; optional in development (controlled by ReCaptcha:Enabled config).
        /// </summary>
        public string? RecaptchaToken { get; set; }
    }

    /// <summary>DTO for submitting an OTP code during login or password reset.</summary>
    public class OtpVerifyDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(6, MinimumLength = 6, ErrorMessage = "OTP must be exactly 6 digits")]
        [RegularExpression(@"^\d{6}$", ErrorMessage = "OTP must be 6 numeric digits")]
        public string Otp { get; set; } = string.Empty;

        /// <summary>Purpose: "login" or "password-reset"</summary>
        [Required]
        public string Purpose { get; set; } = string.Empty;
    }

    /// <summary>DTO for requesting an OTP to be sent.</summary>
    public class OtpRequestDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        /// <summary>Purpose: "login" or "password-reset"</summary>
        [Required]
        public string Purpose { get; set; } = string.Empty;
    }
}
