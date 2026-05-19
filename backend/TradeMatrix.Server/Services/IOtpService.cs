namespace TradeMatrix.Server.Services
{
    /// <summary>
    /// OTP (One-Time Password) service for two-factor authentication and password reset.
    /// OTPs are stored as PBKDF2 hashes — never in plaintext.
    /// </summary>
    public interface IOtpService
    {
        /// <summary>
        /// Generates a 6-digit OTP, hashes it, stores it against the user's email,
        /// and returns the plaintext OTP to be sent via email/SMS.
        /// </summary>
        Task<string> GenerateOtpAsync(string email, string purpose);

        /// <summary>
        /// Verifies the submitted OTP against the stored hash.
        /// Returns true and invalidates the OTP on success.
        /// Returns false if the OTP is wrong, expired, or already used.
        /// </summary>
        Task<bool> VerifyOtpAsync(string email, string purpose, string otp);

        /// <summary>Invalidates any existing OTP for the given email + purpose.</summary>
        Task InvalidateOtpAsync(string email, string purpose);
    }
}
