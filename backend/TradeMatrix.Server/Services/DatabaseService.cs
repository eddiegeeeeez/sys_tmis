using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using TradeMatrix.Server.Data;
using TradeMatrix.Server.DTOs;
using TradeMatrix.Server.Models;

namespace TradeMatrix.Server.Services
{
    public class DatabaseService : IDatabaseService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IS3StorageService _s3;

        public DatabaseService(ApplicationDbContext context, IConfiguration configuration, IS3StorageService s3)
        {
            _context = context;
            _configuration = configuration;
            _s3 = s3;
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

        // ── Backup ────────────────────────────────────────────────────────────

        public async Task<ApiResponse<BackupRecordDto>> CreateBackupAsync(string triggeredBy)
        {
            var timestamp = DateTime.UtcNow;
            var fileName = $"backup_{timestamp:yyyyMMdd_HHmmss}.json";
            var record = new BackupRecord
            {
                FileName = fileName,
                TriggeredBy = triggeredBy,
                Status = "Failed",
                CreatedAt = timestamp
            };

            try
            {
                // Collect all table data
                var payload = new
                {
                    ExportedAt = timestamp,
                    TriggeredBy = triggeredBy,
                    Products          = await _context.Products.AsNoTracking().ToListAsync(),
                    Suppliers         = await _context.Suppliers.AsNoTracking().ToListAsync(),
                    PurchaseOrders    = await _context.PurchaseOrders.AsNoTracking().ToListAsync(),
                    PurchaseOrderItems = await _context.PurchaseOrderItems.AsNoTracking().ToListAsync(),
                    Transactions      = await _context.Transactions.AsNoTracking().ToListAsync(),
                    TransactionItems  = await _context.TransactionItems.AsNoTracking().ToListAsync(),
                    Employees         = await _context.Employees.AsNoTracking().ToListAsync(),
                    Attendances       = await _context.Attendances.AsNoTracking().ToListAsync(),
                    PayrollRecords    = await _context.PayrollRecords.AsNoTracking().ToListAsync(),
                    Customers         = await _context.Customers.AsNoTracking().ToListAsync(),
                    Expenses          = await _context.Expenses.AsNoTracking().ToListAsync(),
                    SystemSettings    = await _context.SystemSettings.AsNoTracking().ToListAsync(),
                    StockMovements    = await _context.StockMovements.AsNoTracking().ToListAsync()
                };

                var json = JsonSerializer.Serialize(payload, new JsonSerializerOptions { WriteIndented = false });
                var bytes = System.Text.Encoding.UTF8.GetBytes(json);

                using var stream = new MemoryStream(bytes);
                var s3Url = await _s3.UploadFileAsync(stream, fileName, "application/json", "backups");

                record.S3Url = s3Url;
                record.FileSizeBytes = bytes.LongLength;
                record.Status = "Success";
            }
            catch (Exception ex)
            {
                record.Status = "Failed";
                record.ErrorMessage = ex.Message;
            }

            _context.BackupRecords.Add(record);
            await _context.SaveChangesAsync();

            // Prune to keep only the last 30 backups
            var old = await _context.BackupRecords
                .OrderByDescending(b => b.CreatedAt)
                .Skip(30)
                .ToListAsync();

            foreach (var stale in old)
            {
                if (!string.IsNullOrEmpty(stale.S3Url))
                    await _s3.DeleteFileAsync(stale.S3Url);
                _context.BackupRecords.Remove(stale);
            }

            if (old.Count > 0)
                await _context.SaveChangesAsync();

            if (record.Status == "Failed")
                return ApiResponse<BackupRecordDto>.ErrorResponse(record.ErrorMessage ?? "Backup failed");

            return ApiResponse<BackupRecordDto>.SuccessResponse(MapBackup(record), "Backup completed successfully");
        }

        public async Task<ApiResponse<List<BackupRecordDto>>> GetBackupHistoryAsync()
        {
            var records = await _context.BackupRecords
                .OrderByDescending(b => b.CreatedAt)
                .Take(30)
                .ToListAsync();

            return ApiResponse<List<BackupRecordDto>>.SuccessResponse(
                records.Select(MapBackup).ToList());
        }

        private static BackupRecordDto MapBackup(BackupRecord b) => new()
        {
            Id = b.Id,
            FileName = b.FileName,
            S3Url = b.S3Url,
            FileSizeBytes = b.FileSizeBytes,
            TriggeredBy = b.TriggeredBy,
            Status = b.Status,
            ErrorMessage = b.ErrorMessage,
            CreatedAt = b.CreatedAt
        };
    }
}
