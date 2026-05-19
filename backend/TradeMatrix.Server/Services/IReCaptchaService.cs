namespace TradeMatrix.Server.Services
{
    /// <summary>
    /// Google reCAPTCHA v2 verification service.
    /// Validates the token submitted by the frontend against Google's siteverify API.
    /// </summary>
    public interface IReCaptchaService
    {
        /// <summary>
        /// Verifies a reCAPTCHA response token.
        /// Returns true if the token is valid and the score meets the threshold.
        /// </summary>
        Task<bool> VerifyAsync(string token);
    }
}
