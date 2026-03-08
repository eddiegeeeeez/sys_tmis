namespace TradeMatrix.Server.DTOs
{
    public class DatabaseInfoDto
    {
        public string Server { get; set; } = string.Empty;
        public string Database { get; set; } = string.Empty;
        public bool IsConnected { get; set; }
        public string? Provider { get; set; }
        public int AppliedMigrations { get; set; }
        public int PendingMigrations { get; set; }
        public MigrationsListDto MigrationsList { get; set; } = new();
    }

    public class MigrationsListDto
    {
        public IEnumerable<string> Applied { get; set; } = new List<string>();
        public IEnumerable<string> Pending { get; set; } = new List<string>();
    }

    public class DatabaseStatisticsDto
    {
        public UserStatsDto Users { get; set; } = new();
        public IEnumerable<object> RoleDistribution { get; set; } = new List<object>();
        public IEnumerable<object> RecentActivity { get; set; } = new List<object>();
    }

    public class UserStatsDto
    {
        public int Total { get; set; }
        public int Active { get; set; }
        public int Locked { get; set; }
        public int Inactive { get; set; }
    }

    public class DatabaseHealthDto
    {
        public string Status { get; set; } = string.Empty;
        public bool Connected { get; set; }
        public string ResponseTime { get; set; } = string.Empty;
        public int PendingMigrations { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class ConnectionInfoDto
    {
        public string Server { get; set; } = string.Empty;
        public string Database { get; set; } = string.Empty;
        public PoolSettingsDto PoolSettings { get; set; } = new();
        public bool Encryption { get; set; }
        public bool MultipleActiveResultSets { get; set; }
    }

    public class PoolSettingsDto
    {
        public string MinSize { get; set; } = string.Empty;
        public string MaxSize { get; set; } = string.Empty;
        public string ConnectionLifetime { get; set; } = string.Empty;
    }

    public class BackupRecordDto
    {
        public int Id { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string? S3Url { get; set; }
        public long FileSizeBytes { get; set; }
        public string TriggeredBy { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? ErrorMessage { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
