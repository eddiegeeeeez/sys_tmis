using Amazon.S3;
using Amazon.S3.Model;

namespace TradeMatrix.Server.Services
{
    public interface IS3StorageService
    {
        Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType, string folder = "products");
        Task<bool> DeleteFileAsync(string fileUrl);
        bool ValidateFileSignature(Stream fileStream, string contentType);
    }

    public class S3StorageService : IS3StorageService
    {
        private readonly IAmazonS3 _s3Client;
        private readonly string _bucketName;
        private readonly string _baseUrl;
        private readonly ILogger<S3StorageService> _logger;

        // Magic byte signatures for allowed image types
        private static readonly Dictionary<string, byte[][]> FileSignatures = new()
        {
            { "image/jpeg", new[] { new byte[] { 0xFF, 0xD8, 0xFF } } },
            { "image/png", new[] { new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A } } },
            { "image/gif", new[] { new byte[] { 0x47, 0x49, 0x46, 0x38 } } },
            { "image/webp", new[] { new byte[] { 0x52, 0x49, 0x46, 0x46 } } } // RIFF header
        };

        public S3StorageService(IAmazonS3 s3Client, IConfiguration configuration, ILogger<S3StorageService> logger)
        {
            _s3Client = s3Client;
            _bucketName = configuration["AWS:S3:BucketName"]
                ?? throw new InvalidOperationException("AWS:S3:BucketName is not configured.");
            _baseUrl = configuration["AWS:S3:BaseUrl"]
                ?? throw new InvalidOperationException("AWS:S3:BaseUrl is not configured.");
            _logger = logger;
        }

        /// <summary>
        /// Validates that a file's magic bytes match the declared content type.
        /// Prevents upload of disguised malicious files.
        /// </summary>
        public bool ValidateFileSignature(Stream fileStream, string contentType)
        {
            if (!FileSignatures.TryGetValue(contentType.ToLowerInvariant(), out var signatures))
                return false;

            var headerBytes = new byte[8];
            var originalPosition = fileStream.Position;
            fileStream.Position = 0;
            var bytesRead = fileStream.Read(headerBytes, 0, headerBytes.Length);
            fileStream.Position = originalPosition;

            if (bytesRead < 3)
                return false;

            return signatures.Any(sig =>
                sig.Length <= bytesRead &&
                headerBytes.Take(sig.Length).SequenceEqual(sig));
        }

        public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType, string folder = "products")
        {
            var key = $"{folder}/{Guid.NewGuid():N}_{SanitizeFileName(fileName)}";

            var request = new PutObjectRequest
            {
                BucketName = _bucketName,
                Key = key,
                InputStream = fileStream,
                ContentType = contentType,
                CannedACL = S3CannedACL.PublicRead
            };

            // Add cache control for immutable content-addressed files
            request.Headers.CacheControl = "public, max-age=31536000, immutable";

            await _s3Client.PutObjectAsync(request);

            _logger.LogInformation("Uploaded file to S3: {Key}", key);

            return $"{_baseUrl}/{key}";
        }

        public async Task<bool> DeleteFileAsync(string fileUrl)
        {
            if (string.IsNullOrEmpty(fileUrl) || !fileUrl.Contains(_bucketName))
                return false;

            try
            {
                // Extract key from full URL
                var uri = new Uri(fileUrl);
                var key = uri.AbsolutePath.TrimStart('/');

                var request = new DeleteObjectRequest
                {
                    BucketName = _bucketName,
                    Key = key
                };

                await _s3Client.DeleteObjectAsync(request);
                _logger.LogInformation("Deleted file from S3: {Key}", key);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to delete file from S3: {Url}", fileUrl);
                return false;
            }
        }

        private static string SanitizeFileName(string fileName)
        {
            var sanitized = Path.GetFileName(fileName);
            foreach (var c in Path.GetInvalidFileNameChars())
            {
                sanitized = sanitized.Replace(c, '_');
            }
            return sanitized;
        }
    }
}
