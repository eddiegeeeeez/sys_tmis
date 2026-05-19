namespace TradeMatrix.Server.Services
{
    /// <summary>
    /// AES-256 encryption service for protecting sensitive data at rest.
    /// Uses ASP.NET Core Data Protection under the hood.
    /// </summary>
    public interface IEncryptionService
    {
        /// <summary>Encrypts a plaintext string. Returns a Base64-encoded ciphertext.</summary>
        string Encrypt(string plaintext);

        /// <summary>Decrypts a Base64-encoded ciphertext. Returns the original plaintext.</summary>
        string Decrypt(string ciphertext);

        /// <summary>Masks an email address: j***@example.com</summary>
        string MaskEmail(string email);

        /// <summary>Masks a phone number: ***-***-1234</summary>
        string MaskPhone(string phone);

        /// <summary>Masks an ID: shows only last 4 chars: ****5678</summary>
        string MaskId(string id);
    }
}
