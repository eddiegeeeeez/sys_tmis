using System.Security.Cryptography;

namespace TradeMatrix.Server.Services
{
    /// <summary>
    /// Password hashing using PBKDF2 (Rfc2898) with SHA-256.
    /// New passwords are hashed with SHA-256 and 100,000 iterations.
    /// Verification supports legacy SHA-1 hashes (36-byte salt+hash) for backward compatibility.
    /// </summary>
    public sealed class PasswordHashingService : IPasswordHashingService
    {
        private const int SaltLength = 16;        // 128 bits

        // New parameters (SHA-256)
        private const int NewHashLength = 32;      // 256 bits (SHA-256 output)
        private const int NewIterations = 100_000; // OWASP 2023 recommendation for PBKDF2-SHA256

        // Legacy parameters (SHA-1) — read-only, for verifying existing hashes
        private const int LegacyHashLength = 20;   // 160 bits (SHA-1 output)
        private const int LegacyIterations = 10_000;

        /// <inheritdoc />
        public string HashPassword(string password)
        {
            if (string.IsNullOrEmpty(password))
                throw new ArgumentException("Password cannot be null or empty.", nameof(password));

            byte[] salt = new byte[SaltLength];
            using (var rng = RandomNumberGenerator.Create())
                rng.GetBytes(salt);

            byte[] hash = DeriveBytes(password, salt, NewIterations, HashAlgorithmName.SHA256, NewHashLength);
            byte[] hashWithSalt = new byte[SaltLength + NewHashLength];
            Buffer.BlockCopy(salt, 0, hashWithSalt, 0, SaltLength);
            Buffer.BlockCopy(hash, 0, hashWithSalt, SaltLength, NewHashLength);
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

            byte[] salt = new byte[SaltLength];

            // Determine hash format by total length
            if (hashWithSalt.Length == SaltLength + NewHashLength)
            {
                // New format: SHA-256, 100k iterations
                Buffer.BlockCopy(hashWithSalt, 0, salt, 0, SaltLength);
                byte[] expectedHash = DeriveBytes(password, salt, NewIterations, HashAlgorithmName.SHA256, NewHashLength);
                byte[] storedHashOnly = new byte[NewHashLength];
                Buffer.BlockCopy(hashWithSalt, SaltLength, storedHashOnly, 0, NewHashLength);
                return CryptographicOperations.FixedTimeEquals(storedHashOnly, expectedHash);
            }
            else if (hashWithSalt.Length == SaltLength + LegacyHashLength)
            {
                // Legacy format: SHA-1, 10k iterations (read-only, for existing DB hashes)
                Buffer.BlockCopy(hashWithSalt, 0, salt, 0, SaltLength);
                byte[] expectedHash = DeriveBytes(password, salt, LegacyIterations, HashAlgorithmName.SHA1, LegacyHashLength);
                byte[] storedHashOnly = new byte[LegacyHashLength];
                Buffer.BlockCopy(hashWithSalt, SaltLength, storedHashOnly, 0, LegacyHashLength);
                return CryptographicOperations.FixedTimeEquals(storedHashOnly, expectedHash);
            }

            return false;
        }

        private static byte[] DeriveBytes(string password, byte[] salt, int iterations, HashAlgorithmName algorithm, int hashLength)
        {
            using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, iterations, algorithm);
            return pbkdf2.GetBytes(hashLength);
        }
    }
}
