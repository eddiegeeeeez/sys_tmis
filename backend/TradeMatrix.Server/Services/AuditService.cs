using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using TradeMatrix.Server.Data;
using TradeMatrix.Server.DTOs;
using TradeMatrix.Server.Models;

namespace TradeMatrix.Server.Services
{
    public class AuditService : IAuditService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AuditService> _logger;

        public AuditService(ApplicationDbContext context, ILogger<AuditService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task LogEventAsync(string eventName, string resource, string actorName, string actorEmail, string ip, string status, string severity, object metadata)
        {
            try
            {
                var auditLog = new AuditLog
                {
                    Id = $"evt_{Guid.NewGuid():N}",
                    Timestamp = DateTime.UtcNow,
                    Event = eventName ?? "Unknown.Event",
                    Resource = resource ?? "Unknown.Resource",
                    ActorName = string.IsNullOrEmpty(actorName) ? "System" : actorName,
                    ActorEmail = string.IsNullOrEmpty(actorEmail) ? "system@internal" : actorEmail,
                    IpAddress = string.IsNullOrEmpty(ip) ? "127.0.0.1" : ip,
                    Status = status ?? "Unknown",
                    Severity = severity ?? "Info",
                    Metadata = metadata != null ? JsonSerializer.Serialize(metadata) : "{}"
                };

                _context.AuditLogs.Add(auditLog);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // Never crash the main feature request because the audit log failed to save
                _logger.LogError(ex, "Failed to write audit log to database.");
            }
        }

        public async Task<IEnumerable<AuditLogDto>> GetLogsAsync()
        {
            var logs = await _context.AuditLogs
                .OrderByDescending(l => l.Timestamp)
                .Take(500) // Hard limit to prevent massive payload issues
                .ToListAsync();

            return logs.Select(l => new AuditLogDto
            {
                Id = l.Id,
                Timestamp = l.Timestamp,
                Event = l.Event,
                Resource = l.Resource,
                Status = l.Status,
                Severity = l.Severity,
                Actor = new AuditActorDto
                {
                    Name = l.ActorName,
                    Email = l.ActorEmail,
                    Ip = l.IpAddress
                },
                Metadata = ParseMetadata(l.Metadata)
            });
        }

        private object ParseMetadata(string metadataString)
        {
            try
            {
                if (string.IsNullOrEmpty(metadataString)) return new object();
                return JsonSerializer.Deserialize<Dictionary<string, object>>(metadataString) ?? new object();
            }
            catch
            {
                return new { rawError = metadataString };
            }
        }
    }
}
