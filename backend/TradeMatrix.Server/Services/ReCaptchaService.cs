using System.Text.Json;

namespace TradeMatrix.Server.Services
{
    /// <summary>
    /// Verifies Google reCAPTCHA v2 tokens by calling Google's siteverify API.
    ///
    /// Configuration (appsettings / environment variables):
    ///   ReCaptcha__SecretKey  — your reCAPTCHA v2 secret key
    ///
    /// How it works:
    ///   The frontend sends the reCAPTCHA response token with the login request.
    ///   This service POSTs it to Google's API and checks the "success" field.
    ///   If verification fails, the login request is rejected before any DB query.
    /// </summary>
    public class ReCaptchaService : IReCaptchaService
    {
        private const string VerifyUrl = "https://www.google.com/recaptcha/api/siteverify";

        private readonly HttpClient _httpClient;
        private readonly string _secretKey;
        private readonly ILogger<ReCaptchaService> _logger;

        public ReCaptchaService(IHttpClientFactory httpClientFactory, IConfiguration config, ILogger<ReCaptchaService> logger)
        {
            _httpClient = httpClientFactory.CreateClient("ReCaptcha");
            _secretKey = config["ReCaptcha:SecretKey"]
                ?? throw new InvalidOperationException("ReCaptcha:SecretKey is not configured.");
            _logger = logger;
        }

        public async Task<bool> VerifyAsync(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
            {
                _logger.LogWarning("reCAPTCHA verification skipped — empty token.");
                return false;
            }

            try
            {
                var content = new FormUrlEncodedContent(new[]
                {
                    new KeyValuePair<string, string>("secret", _secretKey),
                    new KeyValuePair<string, string>("response", token)
                });

                var response = await _httpClient.PostAsync(VerifyUrl, content);
                response.EnsureSuccessStatusCode();

                var json = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(json);

                var success = doc.RootElement.GetProperty("success").GetBoolean();

                if (!success)
                {
                    _logger.LogWarning("reCAPTCHA verification failed. Response: {Json}", json);
                }

                return success;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "reCAPTCHA verification threw an exception.");
                // Fail open in development so reCAPTCHA issues don't block testing.
                // In production this should return false.
                return false;
            }
        }
    }
}
