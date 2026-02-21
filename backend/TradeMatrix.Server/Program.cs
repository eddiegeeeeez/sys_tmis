using Microsoft.EntityFrameworkCore;
using TradeMatrix.Server.Data;
using TradeMatrix.Server.Middleware;
using TradeMatrix.Server.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TradeMatrix.Server.Filters;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers(options => 
{
    options.Filters.Add<AuditLogAttribute>();
});

// MonsterASP.NET shared hosting: frontend assets are flattened into the
// app root (ContentRootPath) alongside the DLLs during publish.
// WebRootPath must point there so UseStaticFiles() and MapFallbackToFile()
// can find index.html and the /assets/ folder.
if (!builder.Environment.IsDevelopment())
{
    builder.Environment.WebRootPath = builder.Environment.ContentRootPath;
}

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
                "http://localhost:3000",
                "http://localhost:3001",
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
builder.Services.AddScoped<IProcurementService, ProcurementService>();
builder.Services.AddScoped<IHRService, HRService>();
builder.Services.AddScoped<ICustomerService, CustomerService>();
builder.Services.AddScoped<IFinanceService, FinanceService>();

// Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "TradeMatrixServer",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "TradeMatrixClient",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "YourSuperSecretKeyThatIsLongEnough123!"))
        };
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

// 3. Security headers middleware (Optimized)
app.Use(async (context, next) =>
{
    context.Response.OnStarting(() =>
    {
        if (!context.Response.Headers.ContainsKey("Content-Security-Policy"))
        {
            context.Response.Headers.Append("Content-Security-Policy", 
                "default-src 'self'; " +
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
                "font-src 'self' https://fonts.gstatic.com; " +
                "img-src 'self' data: blob:; " +
                "connect-src 'self'; " +
                "frame-ancestors 'self'");
        }
        
        if (!context.Response.Headers.ContainsKey("X-Content-Type-Options"))
            context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
            
        if (!context.Response.Headers.ContainsKey("X-Frame-Options"))
            context.Response.Headers.Append("X-Frame-Options", "SAMEORIGIN");
            
        return Task.CompletedTask;
    });
    await next();
});

// 4. Static Files & Routing
app.UseStaticFiles();
app.UseRouting();
app.UseCors("AllowFrontend");

// 5. Auth & Endpoints
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// 6. SPA Fallback
app.MapFallbackToFile("index.html");

// using (var scope = app.Services.CreateScope())
// {
//     var services = scope.ServiceProvider;
//     try
//     {
//         var context = services.GetRequiredService<ApplicationDbContext>();
//         context.Database.Migrate();
//         // var passwordHashing = services.GetRequiredService<IPasswordHashingService>();
//         // TradeMatrix.Server.Data.DbSeeder.Seed(context, passwordHashing);
//     }
//     catch (Exception ex)
//     {
//         var logger = services.GetRequiredService<ILogger<Program>>();
//         logger.LogError(ex, "An error occurred migrating or seeding the DB.");
//     }
// }

app.Run();
