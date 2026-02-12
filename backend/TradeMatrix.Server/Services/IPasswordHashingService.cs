namespace TradeMatrix.Server.Services
{
    /// <summary>
    /// Password hashing and verification (PBKDF2). Used for per-user authentication.
    /// </summary>
    public interface IPasswordHashingService
    {
        /// <summary>Hash a password with a new random salt for storage.</summary>
        string HashPassword(string password);

        /// <summary>Verify a password against a stored hash. Uses constant-time comparison.</summary>
        bool VerifyPassword(string password, string storedHash);
    }
}
