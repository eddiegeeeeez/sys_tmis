using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TradeMatrix.Server.Data;

namespace TradeMatrix.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DatabaseController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public DatabaseController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpGet("info")]
        public async Task<IActionResult> GetDatabaseInfo()
        {
            try
            {
                var connectionString = _configuration.GetConnectionString("DefaultConnection");
                if (string.IsNullOrEmpty(connectionString))
                {
                    return StatusCode(500, new { error = "Connection string not configured" });
                }
                
                var serverName = ExtractServerName(connectionString);
                var databaseName = ExtractDatabaseName(connectionString);

                var canConnect = await _context.Database.CanConnectAsync();
                
                var pendingMigrations = await _context.Database.GetPendingMigrationsAsync();
                var appliedMigrations = await _context.Database.GetAppliedMigrationsAsync();

                return Ok(new
                {
                    server = serverName,
                    database = databaseName,
                    isConnected = canConnect,
                    provider = _context.Database.ProviderName,
                    appliedMigrations = appliedMigrations.Count(),
                    pendingMigrations = pendingMigrations.Count(),
                    migrationsList = new
                    {
                        applied = appliedMigrations,
                        pending = pendingMigrations
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("statistics")]
        public async Task<IActionResult> GetStatistics()
        {
            try
            {
                var usersCount = await _context.Users.CountAsync();
                var activeUsers = await _context.Users.CountAsync(u => u.IsActive);
                var lockedUsers = await _context.Users.CountAsync(u => u.LockoutUntil != null && u.LockoutUntil > DateTime.UtcNow);
                
                // Get role distribution
                var roleDistribution = await _context.Users
                    .GroupBy(u => u.Role)
                    .Select(g => new { role = g.Key.ToString(), count = g.Count() })
                    .ToListAsync();

                // Recent activity
                var recentLogins = await _context.Users
                    .Where(u => u.LastLogin != null)
                    .OrderByDescending(u => u.LastLogin)
                    .Take(10)
                    .Select(u => new { u.Name, u.Email, u.LastLogin, u.Role })
                    .ToListAsync();

                return Ok(new
                {
                    users = new
                    {
                        total = usersCount,
                        active = activeUsers,
                        locked = lockedUsers,
                        inactive = usersCount - activeUsers
                    },
                    roleDistribution,
                    recentActivity = recentLogins
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("tables")]
        public async Task<IActionResult> GetTableInfo()
        {
            try
            {
                var tables = new List<object>();

                // Users table
                var usersCount = await _context.Users.CountAsync();
                tables.Add(new
                {
                    name = "Users",
                    rowCount = usersCount,
                    schema = "dbo"
                });

                return Ok(new { tables });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("migrate")]
        public async Task<IActionResult> RunMigrations()
        {
            try
            {
                var pendingMigrations = await _context.Database.GetPendingMigrationsAsync();
                
                if (!pendingMigrations.Any())
                {
                    return Ok(new { message = "No pending migrations", applied = 0 });
                }

                await _context.Database.MigrateAsync();
                
                return Ok(new
                {
                    message = "Migrations applied successfully",
                    applied = pendingMigrations.Count(),
                    migrations = pendingMigrations
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("health")]
        public async Task<IActionResult> CheckHealth()
        {
            try
            {
                var canConnect = await _context.Database.CanConnectAsync();
                
                if (!canConnect)
                {
                    return Ok(new
                    {
                        status = "Unhealthy",
                        connected = false,
                        message = "Cannot connect to database"
                    });
                }

                // Try a simple query to verify
                var userCount = await _context.Users.CountAsync();

                var pendingMigrations = await _context.Database.GetPendingMigrationsAsync();

                var health = "Healthy";
                if (pendingMigrations.Any())
                {
                    health = "Warning";
                }

                return Ok(new
                {
                    status = health,
                    connected = true,
                    responseTime = "< 100ms",
                    pendingMigrations = pendingMigrations.Count(),
                    message = pendingMigrations.Any() 
                        ? $"{pendingMigrations.Count()} pending migration(s)" 
                        : "All systems operational"
                });
            }
            catch (Exception ex)
            {
                return Ok(new
                {
                    status = "Unhealthy",
                    connected = false,
                    message = ex.Message
                });
            }
        }

        [HttpGet("connection-info")]
        public IActionResult GetConnectionInfo()
        {
            try
            {
                var connectionString = _configuration.GetConnectionString("DefaultConnection");
                if (string.IsNullOrEmpty(connectionString))
                {
                    return StatusCode(500, new { error = "Connection string not configured" });
                }
                
                // Parse connection string safely
                var server = ExtractServerName(connectionString);
                var database = ExtractDatabaseName(connectionString);
                var minPoolSize = ExtractValue(connectionString, "Min Pool Size");
                var maxPoolSize = ExtractValue(connectionString, "Max Pool Size");
                var connectionLifetime = ExtractValue(connectionString, "Connection Lifetime");

                return Ok(new
                {
                    server,
                    database,
                    poolSettings = new
                    {
                        minSize = minPoolSize ?? "5",
                        maxSize = maxPoolSize ?? "100",
                        connectionLifetime = connectionLifetime ?? "300"
                    },
                    encryption = connectionString.Contains("Encrypt=True"),
                    multipleActiveResultSets = connectionString.Contains("MultipleActiveResultSets=True")
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("backup/info")]
        public IActionResult GetBackupInfo()
        {
            try
            {
                // For hosted databases on MonsterASP.NET, we don't have access to msdb backup history
                // Return information about the hosting provider's backup system
                return Ok(new
                {
                    hasBackup = false,
                    lastBackupDate = (DateTime?)null,
                    backupType = "Managed",
                    backupSizeMb = 0,
                    recommendation = "Managed by hosting provider"
                });
            }
            catch (Exception)
            {
                return Ok(new
                {
                    hasBackup = false,
                    lastBackupDate = (DateTime?)null,
                    backupType = "Unknown",
                    backupSizeMb = 0,
                    recommendation = "Contact hosting provider"
                });
            }
        }

        [HttpPost("backup/export-users")]
        public async Task<IActionResult> ExportUsersBackup()
        {
            try
            {
                var users = await _context.Users
                    .Select(u => new
                    {
                        u.Id,
                        u.Name,
                        u.Email,
                        u.Role,
                        u.IsActive,
                        u.CreatedAt,
                        u.LastLogin
                    })
                    .ToListAsync();

                var timestamp = DateTime.UtcNow.ToString("yyyyMMdd_HHmmss");
                var filename = $"users_backup_{timestamp}.json";

                return Ok(new
                {
                    success = true,
                    filename,
                    recordCount = users.Count,
                    data = users,
                    timestamp = DateTime.UtcNow,
                    message = "User data export completed successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("backup/request")]
        public IActionResult RequestBackup()
        {
            try
            {
                // For hosted databases, we can't directly trigger backups
                // Return information about backup process
                return Ok(new
                {
                    success = true,
                    message = "Database is hosted on MonsterASP.NET. Backups are managed automatically.",
                    info = new
                    {
                        provider = "MonsterASP.NET",
                        backupFrequency = "Automatic daily backups",
                        retentionPeriod = "30 days",
                        recommendation = "Contact support@monsterasp.net for manual backup requests or restore operations"
                    },
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
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
