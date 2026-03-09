using Microsoft.EntityFrameworkCore;
using TradeMatrix.Server.Data;
using TradeMatrix.Server.Middleware;
using TradeMatrix.Server.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TradeMatrix.Server.Filters;
using Amazon.S3;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers(options => 
{
    options.Filters.Add<AuditLogAttribute>();
});

builder.Services.AddLogging(config =>
{
    config.ClearProviders();
    config.AddConsole();
    config.AddDebug();
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            var allowedOrigins = new List<string>
            {
                "http://localhost:4000",
                "http://localhost:4001",
                "http://localhost:5173",
                "http://localhost:8080"  // For testing production builds locally
            };

            // Add production origins if configured
            var productionOrigin = builder.Configuration["Frontend:ProductionUrl"];
            if (!string.IsNullOrEmpty(productionOrigin))
            {
                allowedOrigins.Add(productionOrigin);
                // Also add www variant if not already included
                if (!productionOrigin.Contains("www."))
                {
                    allowedOrigins.Add(productionOrigin.Replace("://", "://www."));
                }
            }

            policy.WithOrigins(allowedOrigins.ToArray())
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

// DB Context with optimized settings
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions => 
        {
            sqlOptions.CommandTimeout(30); // 30 seconds timeout
            sqlOptions.EnableRetryOnFailure(
                maxRetryCount: 3,
                maxRetryDelay: TimeSpan.FromSeconds(5),
                errorNumbersToAdd: null);
        }));

builder.Services.AddScoped<IPasswordHashingService, PasswordHashingService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<ISystemService, SystemService>();
builder.Services.AddScoped<IDatabaseService, DatabaseService>();
builder.Services.AddScoped<IAuditService, AuditService>();
builder.Services.AddScoped<IInventoryService, InventoryService>();
builder.Services.AddScoped<IStockMovementService, StockMovementService>();
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<IProcurementService, ProcurementService>();
builder.Services.AddScoped<IHRService, HRService>();
builder.Services.AddScoped<ICustomerService, CustomerService>();
builder.Services.AddScoped<IFinanceService, FinanceService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// AWS S3
builder.Services.AddSingleton<IAmazonS3>(sp =>
{
    var config = builder.Configuration.GetSection("AWS:S3");
    var s3Config = new AmazonS3Config
    {
        RegionEndpoint = Amazon.RegionEndpoint.GetBySystemName(config["Region"] ?? "ap-southeast-1")
    };
    var accessKey = config["AccessKey"];
    var secretKey = config["SecretKey"];
    if (!string.IsNullOrEmpty(accessKey) && !string.IsNullOrEmpty(secretKey))
        return new AmazonS3Client(accessKey, secretKey, s3Config);
    // Fall back to environment credentials / IAM role
    return new AmazonS3Client(s3Config);
});
builder.Services.AddScoped<IS3StorageService, S3StorageService>();

// Background Services
builder.Services.AddHostedService<MidnightBackupService>();

// Authentication
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("FATAL: Jwt:Key is not configured. Cannot start application.");
var jwtIssuer = builder.Configuration["Jwt:Issuer"]
    ?? throw new InvalidOperationException("FATAL: Jwt:Issuer is not configured.");
var jwtAudience = builder.Configuration["Jwt:Audience"]
    ?? throw new InvalidOperationException("FATAL: Jwt:Audience is not configured.");

if (jwtKey.Length < 32)
    throw new InvalidOperationException("FATAL: Jwt:Key must be at least 32 characters (256 bits) for HMAC-SHA256.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.FromMinutes(1) // Reduce default 5-min skew
        };
    });

// Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // Global sliding window: 100 requests per minute per IP
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetSlidingWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new SlidingWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1),
                SegmentsPerWindow = 4,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            }));

    // Strict rate limit for auth endpoints
    options.AddPolicy("AuthEndpoints", context =>
        RateLimitPartition.GetSlidingWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new SlidingWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(5),
                SegmentsPerWindow = 5,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            }));
});

var app = builder.Build();

Console.WriteLine($"[STARTUP] ContentRootPath: {app.Environment.ContentRootPath}");
Console.WriteLine($"[STARTUP] WebRootPath: {app.Environment.WebRootPath}");

// Configure the HTTP request pipeline.

// 1. Health check (High Priority, no Auth required)
app.MapGet("/api/health-check", () => Results.Ok(new { status = "Healthy", time = DateTime.UtcNow }));

// 2. Custom middleware
app.UseMiddleware<GlobalExceptionHandlingMiddleware>();

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// 3. Security headers middleware
app.Use(async (context, next) =>
{
    context.Response.OnStarting(() =>
    {
        if (!context.Response.Headers.ContainsKey("Content-Security-Policy"))
        {
            context.Response.Headers.Append("Content-Security-Policy", 
                "default-src 'self'; " +
                "script-src 'self'; " +
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
                "font-src 'self' https://fonts.gstatic.com; " +
                "img-src 'self' data: blob: https://*.s3.us-east-1.amazonaws.com https://*.s3.ap-southeast-1.amazonaws.com; " +
                "connect-src 'self'; " +
                "frame-ancestors 'none'; " +
                "base-uri 'self'; " +
                "form-action 'self'");
        }
        
        if (!context.Response.Headers.ContainsKey("X-Content-Type-Options"))
            context.Response.Headers.Append("X-Content-Type-Options", "nosniff");

        if (!context.Response.Headers.ContainsKey("X-Frame-Options"))
            context.Response.Headers.Append("X-Frame-Options", "DENY");

        // HSTS: tell browsers to always use HTTPS for this domain for 1 year (production only)
        if (app.Environment.IsProduction() && !context.Response.Headers.ContainsKey("Strict-Transport-Security"))
            context.Response.Headers.Append("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

        if (!context.Response.Headers.ContainsKey("Referrer-Policy"))
            context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");

        if (!context.Response.Headers.ContainsKey("Permissions-Policy"))
            context.Response.Headers.Append("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

        if (!context.Response.Headers.ContainsKey("X-Permitted-Cross-Domain-Policies"))
            context.Response.Headers.Append("X-Permitted-Cross-Domain-Policies", "none");
            
        return Task.CompletedTask;
    });
    await next();
});

// 4. Static Files & Routing
// In Development: disable browser caching so rebuilt frontend is always served fresh.
// In Production: Vite content-hashes all JS/CSS, so long-term caching is safe.
if (app.Environment.IsDevelopment())
{
    app.UseStaticFiles(new StaticFileOptions
    {
        OnPrepareResponse = ctx =>
        {
            ctx.Context.Response.Headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
            ctx.Context.Response.Headers["Pragma"] = "no-cache";
            ctx.Context.Response.Headers["Expires"] = "0";
        }
    });
}
else
{
    app.UseStaticFiles();
}
app.UseRouting();
app.UseCors("AllowFrontend");
app.UseRateLimiter();

// 5. Auth & Endpoints
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Catch-all for unmatched /api/* routes — return 404 JSON instead of falling through to the SPA.
// Without this, MapFallbackToFile would serve index.html for any unknown /api/ path.
app.Map("/api/{**path}", () => Results.NotFound(new { error = "API endpoint not found", status = 404 }));

// 6. SPA Fallback
app.MapFallbackToFile("index.html");

app.Run();
