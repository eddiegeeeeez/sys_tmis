using Amazon.S3;
using Amazon.S3.Model;

namespace TradeMatrix.Server.Services
{
    public interface IS3StorageService
    {
        Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType, string folder = "products");
        Task<bool> DeleteFileAsync(string fileUrl);
    }

    public class S3StorageService : IS3StorageService
    {
        private readonly IAmazonS3 _s3Client;
        private readonly string _bucketName;
        private readonly string _baseUrl;
        private readonly ILogger<S3StorageService> _logger;

        public S3StorageService(IAmazonS3 s3Client, IConfiguration configuration, ILogger<S3StorageService> logger)
        {
            _s3Client = s3Client;
            _bucketName = configuration["AWS:S3:BucketName"] ?? "tradematrix-uploads";
            _baseUrl = configuration["AWS:S3:BaseUrl"] ?? "";
            _logger = logger;
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
