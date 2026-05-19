using System.Security.Cryptography;
using System.Text;

namespace TradeMatrix.Server.Services
{
    /// <summary>
    /// In-memory OTP store backed by a thread-safe dictionary.
    /// OTPs are hashed with PBKDF2-SHA256 before storage — never stored in plaintext.
    ///
    /// How it works:
    ///   1. GenerateOtpAsync() creates a 6-digit code, hashes it, stores hash + expiry.
    ///   2. VerifyOtpAsync() re-hashes the submitted code and compares with stored hash.
    ///   3. On success the entry is deleted (single-use).
    ///   4. Expired entries are rejected and cleaned up.
    ///
    /// For production: replace the in-memory dictionary with a Redis cache or a
    /// dedicated OtpTokens database table so OTPs survive server restarts.
    /// </summary>
    public class OtpService : IOtpService
    {
        private static readonly TimeSpan OtpExpiry = TimeSpan.FromMinutes(10);
        private const int OtpLength = 6;
        private const int Iterations = 10_000;
        private const int SaltLength = 16;
        private const int HashLength = 32;

        // Key: "email:purpose"  Value: (hash, expiry)
        private readonly Dictionary<string, (string Hash, DateTime Expiry)> _store = new();
        private readonly object _lock = new();
        private readonly ILogger<OtpService> _logger;

        public OtpService(ILogger<OtpService> logger)
        {
            _logger = logger;
        }

        public Task<string> GenerateOtpAsync(string email, string purpose)
        {
            // Generate cryptographically random 6-digit OTP
            var otp = RandomNumberGenerator.GetInt32(100_000, 999_999).ToString();

            var hash = HashOtp(otp);
            var expiry = DateTime.UtcNow.Add(OtpExpiry);
            var key = BuildKey(email, purpose);

            lock (_lock)
            {
                _store[key] = (hash, expiry);
            }

            _logger.LogInformation("OTP generated for {Email} [{Purpose}], expires {Expiry:u}", email, purpose, expiry);
            return Task.FromResult(otp);
        }

        public Task<bool> VerifyOtpAsync(string email, string purpose, string otp)
        {
            var key = BuildKey(email, purpose);

            lock (_lock)
            {
                if (!_store.TryGetValue(key, out var entry))
                {
                    _logger.LogWarning("OTP verification failed — no entry found for {Email} [{Purpose}]", email, purpose);
                    return Task.FromResult(false);
                }

                if (DateTime.UtcNow > entry.Expiry)
                {
                    _store.Remove(key);
                    _logger.LogWarning("OTP expired for {Email} [{Purpose}]", email, purpose);
                    return Task.FromResult(false);
                }

                var isValid = VerifyOtpHash(otp, entry.Hash);

                if (isValid)
                {
                    _store.Remove(key); // Single-use: invalidate immediately
                    _logger.LogInformation("OTP verified successfully for {Email} [{Purpose}]", email, purpose);
                }
                else
                {
                    _logger.LogWarning("OTP mismatch for {Email} [{Purpose}]", email, purpose);
                }

                return Task.FromResult(isValid);
            }
        }

        public Task InvalidateOtpAsync(string email, string purpose)
        {
            var key = BuildKey(email, purpose);
            lock (_lock)
            {
                _store.Remove(key);
            }
            return Task.CompletedTask;
        }

        // ── Helpers ────────────────────────────────────────────────────────────

        private static string BuildKey(string email, string purpose)
            => $"{email.ToLowerInvariant()}:{purpose.ToLowerInvariant()}";

        private static string HashOtp(string otp)
        {
            byte[] salt = new byte[SaltLength];
            using (var rng = RandomNumberGenerator.Create())
                rng.GetBytes(salt);

            using var pbkdf2 = new Rfc2898DeriveBytes(otp, salt, Iterations, HashAlgorithmName.SHA256);
            byte[] hash = pbkdf2.GetBytes(HashLength);

            // Store salt + hash together
            byte[] combined = new byte[SaltLength + HashLength];
            Buffer.BlockCopy(salt, 0, combined, 0, SaltLength);
            Buffer.BlockCopy(hash, 0, combined, SaltLength, HashLength);
            return Convert.ToBase64String(combined);
        }

        private static bool VerifyOtpHash(string otp, string storedHash)
        {
            try
            {
                byte[] combined = Convert.FromBase64String(storedHash);
                if (combined.Length != SaltLength + HashLength) return false;

                byte[] salt = new byte[SaltLength];
                Buffer.BlockCopy(combined, 0, salt, 0, SaltLength);

                using var pbkdf2 = new Rfc2898DeriveBytes(otp, salt, Iterations, HashAlgorithmName.SHA256);
                byte[] expectedHash = pbkdf2.GetBytes(HashLength);

                byte[] storedHashOnly = new byte[HashLength];
                Buffer.BlockCopy(combined, SaltLength, storedHashOnly, 0, HashLength);

                return CryptographicOperations.FixedTimeEquals(storedHashOnly, expectedHash);
            }
            catch
            {
                return false;
            }
        }
    }
}
