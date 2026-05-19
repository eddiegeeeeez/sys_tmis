using Microsoft.AspNetCore.DataProtection;
using System.Text.RegularExpressions;

namespace TradeMatrix.Server.Services
{
    /// <summary>
    /// AES-256 encryption and data masking service.
    ///
    /// Encryption uses ASP.NET Core Data Protection (AES-256-CBC + HMACSHA256).
    /// The key ring is managed automatically and can be persisted to disk or Azure Key Vault.
    ///
    /// Data masking hides sensitive fields in API responses so confidential data
    /// is never fully exposed to unauthorized viewers.
    /// </summary>
    public class EncryptionService : IEncryptionService
    {
        private readonly IDataProtector _protector;
        private readonly ILogger<EncryptionService> _logger;

        // Purpose string scopes the protector — data encrypted with one purpose
        // cannot be decrypted with a different purpose string.
        private const string Purpose = "TradeMatrix.SensitiveData.v1";

        public EncryptionService(IDataProtectionProvider provider, ILogger<EncryptionService> logger)
        {
            _protector = provider.CreateProtector(Purpose);
            _logger = logger;
        }

        /// <inheritdoc />
        public string Encrypt(string plaintext)
        {
            if (string.IsNullOrEmpty(plaintext)) return plaintext;
            try
            {
                return _protector.Protect(plaintext);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Encryption failed.");
                throw;
            }
        }

        /// <inheritdoc />
        public string Decrypt(string ciphertext)
        {
            if (string.IsNullOrEmpty(ciphertext)) return ciphertext;
            try
            {
                return _protector.Unprotect(ciphertext);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Decryption failed — data may be tampered or key rotated.");
                throw new InvalidOperationException("Unable to decrypt data.", ex);
            }
        }

        /// <inheritdoc />
        /// <example>john.doe@example.com → j***@example.com</example>
        public string MaskEmail(string email)
        {
            if (string.IsNullOrEmpty(email)) return email;

            var atIndex = email.IndexOf('@');
            if (atIndex <= 0) return "***";

            var local = email[..atIndex];
            var domain = email[atIndex..];

            // Show first char + *** + domain
            var masked = local.Length > 1
                ? local[0] + new string('*', Math.Min(local.Length - 1, 3))
                : "*";

            return masked + domain;
        }

        /// <inheritdoc />
        /// <example>09171234567 → ***-***-4567</example>
        public string MaskPhone(string phone)
        {
            if (string.IsNullOrEmpty(phone)) return phone;

            // Strip non-digits
            var digits = Regex.Replace(phone, @"\D", "");
            if (digits.Length < 4) return "***";

            var last4 = digits[^4..];
            return $"***-***-{last4}";
        }

        /// <inheritdoc />
        /// <example>EMP-00123 → ****0123</example>
        public string MaskId(string id)
        {
            if (string.IsNullOrEmpty(id)) return id;
            if (id.Length <= 4) return new string('*', id.Length);
            return new string('*', id.Length - 4) + id[^4..];
        }
    }
}
