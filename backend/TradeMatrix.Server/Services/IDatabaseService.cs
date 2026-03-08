using TradeMatrix.Server.DTOs;

namespace TradeMatrix.Server.Services
{
    public interface IDatabaseService
    {
        Task<DatabaseInfoDto> GetDatabaseInfoAsync();
        Task<DatabaseStatisticsDto> GetStatisticsAsync();
        Task<DatabaseHealthDto> CheckHealthAsync();
        Task<ConnectionInfoDto> GetConnectionInfoAsync();
        Task<ApiResponse<object>> RunMigrationsAsync();
        Task<ApiResponse<object>> ExportUsersAsync();
        Task<ApiResponse<BackupRecordDto>> CreateBackupAsync(string triggeredBy);
        Task<ApiResponse<List<BackupRecordDto>>> GetBackupHistoryAsync();
    }
}
