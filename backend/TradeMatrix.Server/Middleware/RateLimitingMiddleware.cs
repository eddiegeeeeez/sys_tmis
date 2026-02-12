using System.Collections.Concurrent;

namespace TradeMatrix.Server.Middleware
{
    /// <summary>
    /// Simple rate limiting middleware to prevent brute force attacks
    /// Tracks failed login attempts per IP/Email
    /// </summary>
    public class RateLimitingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RateLimitingMiddleware> _logger;
        private static readonly ConcurrentDictionary<string, RateLimitEntry> RateLimitStore = new();

        private const int MaxAttempts = 5;
        private const int LockoutDurationSeconds = 900; // 15 minutes

        public RateLimitingMiddleware(RequestDelegate next, ILogger<RateLimitingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Only rate limit login attempts
            if (context.Request.Path.StartsWithSegments("/api/auth/login", StringComparison.OrdinalIgnoreCase) &&
                context.Request.Method == HttpMethods.Post)
            {
                var ipAddress = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
                var rateLimit = "login_" + ipAddress;

                if (!RateLimitStore.TryGetValue(rateLimit, out var entry))
                {
                    entry = new RateLimitEntry { Attempts = 0, LastAttempt = DateTime.UtcNow };
                    RateLimitStore.TryAdd(rateLimit, entry);
                }

                // Check if locked out
                if (entry.IsLockedOut())
                {
                    context.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                    context.Response.ContentType = "application/json";
                    await context.Response.WriteAsJsonAsync(new 
                    { 
                        message = "Too many login attempts. Please try again later.",
                        remainingSeconds = entry.GetRemainingLockoutSeconds()
                    });
                    return;
                }

                // Increment attempt
                entry.Attempts++;
                entry.LastAttempt = DateTime.UtcNow;

                if (entry.Attempts > MaxAttempts)
                {
                    entry.LockedOutUntil = DateTime.UtcNow.AddSeconds(LockoutDurationSeconds);
                    _logger.LogWarning($"Rate limit exceeded for IP: {ipAddress}");
                }
            }

            await _next(context);
        }
    }

    public class RateLimitEntry
    {
        public int Attempts { get; set; }
        public DateTime LastAttempt { get; set; }
        public DateTime? LockedOutUntil { get; set; }

        public bool IsLockedOut() => LockedOutUntil.HasValue && LockedOutUntil > DateTime.UtcNow;

        public int GetRemainingLockoutSeconds()
        {
            if (!LockedOutUntil.HasValue) return 0;
            var remaining = (LockedOutUntil.Value - DateTime.UtcNow).TotalSeconds;
            return Math.Max(0, (int)remaining);
        }
    }
}
