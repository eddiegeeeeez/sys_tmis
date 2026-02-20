using Microsoft.EntityFrameworkCore;
using TradeMatrix.Server.Data;
using TradeMatrix.Server.DTOs;

namespace TradeMatrix.Server.Services
{
    public class DatabaseService : IDatabaseService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public DatabaseService(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<DatabaseInfoDto> GetDatabaseInfoAsync()
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection") ?? "";
            var serverName = ExtractServerName(connectionString);
            var databaseName = ExtractDatabaseName(connectionString);

            var canConnect = await _context.Database.CanConnectAsync();
            var pendingMigrations = await _context.Database.GetPendingMigrationsAsync();
            var appliedMigrations = await _context.Database.GetAppliedMigrationsAsync();

            return new DatabaseInfoDto
            {
                Server = serverName,
                Database = databaseName,
                IsConnected = canConnect,
                Provider = _context.Database.ProviderName,
                AppliedMigrations = appliedMigrations.Count(),
                PendingMigrations = pendingMigrations.Count(),
                MigrationsList = new MigrationsListDto
                {
                    Applied = appliedMigrations,
                    Pending = pendingMigrations
                }
            };
        }

        public async Task<DatabaseStatisticsDto> GetStatisticsAsync()
        {
            var usersCount = await _context.Users.CountAsync();
            var activeUsers = await _context.Users.CountAsync(u => u.IsActive);
            var lockedUsers = await _context.Users.CountAsync(u => u.LockoutUntil != null && u.LockoutUntil > DateTime.UtcNow);

            var roleDistribution = await _context.Users
                .GroupBy(u => u.Role.Name)
                .Select(g => new { role = g.Key, count = g.Count() })
                .Cast<object>()
                .ToListAsync();

            var recentLogins = await _context.Users
                .Where(u => u.LastLogin != null)
                .OrderByDescending(u => u.LastLogin)
                .Take(10)
                .Select(u => new { u.Name, u.Email, u.LastLogin, Role = u.Role.Name })
                .Cast<object>()
                .ToListAsync();

            return new DatabaseStatisticsDto
            {
                Users = new UserStatsDto
                {
                    Total = usersCount,
                    Active = activeUsers,
                    Locked = lockedUsers,
                    Inactive = usersCount - activeUsers
                },
                RoleDistribution = roleDistribution,
                RecentActivity = recentLogins
            };
        }

        public async Task<DatabaseHealthDto> CheckHealthAsync()
        {
            var canConnect = await _context.Database.CanConnectAsync();
            if (!canConnect)
            {
                return new DatabaseHealthDto
                {
                    Status = "Unhealthy",
                    Connected = false,
                    Message = "Cannot connect to database"
                };
            }

            var pendingMigrations = await _context.Database.GetPendingMigrationsAsync();
            var status = pendingMigrations.Any() ? "Warning" : "Healthy";

            return new DatabaseHealthDto
            {
                Status = status,
                Connected = true,
                ResponseTime = "< 100ms",
                PendingMigrations = pendingMigrations.Count(),
                Message = pendingMigrations.Any() 
                    ? $"{pendingMigrations.Count()} pending migration(s)" 
                    : "All systems operational"
            };
        }

        public Task<ConnectionInfoDto> GetConnectionInfoAsync()
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection") ?? "";
            var server = ExtractServerName(connectionString);
            var database = ExtractDatabaseName(connectionString);
            var minPoolSize = ExtractValue(connectionString, "Min Pool Size");
            var maxPoolSize = ExtractValue(connectionString, "Max Pool Size");
            var connectionLifetime = ExtractValue(connectionString, "Connection Lifetime");

            return Task.FromResult(new ConnectionInfoDto
            {
                Server = server,
                Database = database,
                PoolSettings = new PoolSettingsDto
                {
                    MinSize = minPoolSize ?? "5",
                    MaxSize = maxPoolSize ?? "100",
                    ConnectionLifetime = connectionLifetime ?? "300"
                },
                Encryption = connectionString.Contains("Encrypt=True"),
                MultipleActiveResultSets = connectionString.Contains("MultipleActiveResultSets=True")
            });
        }

        public async Task<ApiResponse<object>> RunMigrationsAsync()
        {
            var pendingMigrations = await _context.Database.GetPendingMigrationsAsync();
                
            if (!pendingMigrations.Any())
            {
                return ApiResponse<object>.SuccessResponse(new { applied = 0 }, "No pending migrations");
            }

            await _context.Database.MigrateAsync();
            
            return ApiResponse<object>.SuccessResponse(new
            {
                applied = pendingMigrations.Count(),
                migrations = pendingMigrations
            }, "Migrations applied successfully");
        }

        public async Task<ApiResponse<object>> ExportUsersAsync()
        {
            var users = await _context.Users
                .Select(u => new
                {
                    u.Id,
                    u.Name,
                    u.Email,
                    Role = u.Role.Name,
                    u.IsActive,
                    u.CreatedAt,
                    u.LastLogin
                })
                .ToListAsync();

            var timestamp = DateTime.UtcNow.ToString("yyyyMMdd_HHmmss");
            var filename = $"users_backup_{timestamp}.json";

            return ApiResponse<object>.SuccessResponse(new
            {
                filename,
                recordCount = users.Count,
                data = users,
                timestamp = DateTime.UtcNow
            }, "User data export completed successfully");
        }

        private string ExtractServerName(string connectionString)
        {
            var serverPart = connectionString.Split(';')
                .FirstOrDefault(x => x.Trim().StartsWith("Server=", StringComparison.OrdinalIgnoreCase));
            return serverPart?.Split('=')[1].Trim() ?? "Unknown";
        }

        private string ExtractDatabaseName(string connectionString)
        {
            var dbPart = connectionString.Split(';')
                .FirstOrDefault(x => x.Trim().StartsWith("Database=", StringComparison.OrdinalIgnoreCase));
            return dbPart?.Split('=')[1].Trim() ?? "Unknown";
        }

        private string? ExtractValue(string connectionString, string key)
        {
            var part = connectionString.Split(';')
                .FirstOrDefault(x => x.Trim().StartsWith($"{key}=", StringComparison.OrdinalIgnoreCase));
            return part?.Split('=')[1].Trim();
        }
    }
}
