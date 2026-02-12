using System.Security.Cryptography;

namespace TradeMatrix.Server.Services
{
    /// <summary>
    /// Password hashing using PBKDF2 (Rfc2898). Per-user hashes with random salt;
    /// verification uses constant-time comparison to reduce timing attack surface.
    /// </summary>
    public sealed class PasswordHashingService : IPasswordHashingService
    {
        private const int SaltLength = 16;   // 128 bits
        private const int HashLength = 20;   // 160 bits (SHA-1 size; PBKDF2 default)
        private const int Iterations = 10000; // Keep for compatibility with existing stored hashes

        /// <inheritdoc />
        public string HashPassword(string password)
        {
            if (string.IsNullOrEmpty(password))
                throw new ArgumentException("Password cannot be null or empty.", nameof(password));

            byte[] salt = new byte[SaltLength];
            using (var rng = RandomNumberGenerator.Create())
                rng.GetBytes(salt);

            byte[] hash = DeriveBytes(password, salt);
            byte[] hashWithSalt = new byte[SaltLength + HashLength];
            Buffer.BlockCopy(salt, 0, hashWithSalt, 0, SaltLength);
            Buffer.BlockCopy(hash, 0, hashWithSalt, SaltLength, HashLength);
            return Convert.ToBase64String(hashWithSalt);
        }

        /// <inheritdoc />
        public bool VerifyPassword(string password, string storedHash)
        {
            if (string.IsNullOrEmpty(password) || string.IsNullOrEmpty(storedHash))
                return false;

            byte[] hashWithSalt;
            try
            {
                hashWithSalt = Convert.FromBase64String(storedHash);
            }
            catch
            {
                return false;
            }

            if (hashWithSalt.Length != SaltLength + HashLength)
                return false;

            byte[] salt = new byte[SaltLength];
            Buffer.BlockCopy(hashWithSalt, 0, salt, 0, SaltLength);
            byte[] expectedHash = DeriveBytes(password, salt);

            byte[] storedHashOnly = new byte[HashLength];
            Buffer.BlockCopy(hashWithSalt, SaltLength, storedHashOnly, 0, HashLength);

            return CryptographicOperations.FixedTimeEquals(storedHashOnly, expectedHash);
        }

        private static byte[] DeriveBytes(string password, byte[] salt)
        {
            using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, Iterations, HashAlgorithmName.SHA256);
            return pbkdf2.GetBytes(HashLength);
        }
    }
}
