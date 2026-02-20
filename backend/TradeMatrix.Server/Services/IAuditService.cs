using TradeMatrix.Server.DTOs;

namespace TradeMatrix.Server.Services
{
    public interface IAuditService
    {
        Task LogEventAsync(string eventName, string resource, string actorName, string actorEmail, string ip, string status, string severity, object metadata);
        Task<IEnumerable<AuditLogDto>> GetLogsAsync();
    }
}
