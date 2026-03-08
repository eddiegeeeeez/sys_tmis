namespace TradeMatrix.Server.Services
{
    /// <summary>
    /// Runs a full JSON data backup every night at midnight Philippine Time (UTC+8).
    /// Registered as a hosted BackgroundService — runs inside the IIS/Kestrel process.
    /// </summary>
    public class MidnightBackupService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<MidnightBackupService> _logger;

        // Philippine Standard Time — UTC+8 (no DST)
        private static readonly TimeZoneInfo PhilippineTime =
            TimeZoneInfo.FindSystemTimeZoneById("Asia/Manila");

        public MidnightBackupService(IServiceScopeFactory scopeFactory, ILogger<MidnightBackupService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("[MidnightBackup] Service started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                var delay = GetDelayUntilNextMidnightPHT();
                _logger.LogInformation("[MidnightBackup] Next backup in {Hours:F1} hours.", delay.TotalHours);

                try
                {
                    await Task.Delay(delay, stoppingToken);
                }
                catch (TaskCanceledException)
                {
                    break;
                }

                if (stoppingToken.IsCancellationRequested) break;

                await RunBackupAsync(stoppingToken);
            }

            _logger.LogInformation("[MidnightBackup] Service stopped.");
        }

        private async Task RunBackupAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("[MidnightBackup] Starting automatic midnight backup.");
            try
            {
                // DatabaseService is Scoped — must resolve via a new scope
                using var scope = _scopeFactory.CreateScope();
                var dbService = scope.ServiceProvider.GetRequiredService<IDatabaseService>();
                var result = await dbService.CreateBackupAsync("Automatic");

                if (result.Success)
                    _logger.LogInformation("[MidnightBackup] Backup succeeded: {FileName}", result.Data?.FileName);
                else
                    _logger.LogWarning("[MidnightBackup] Backup recorded as failed: {Msg}", result.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[MidnightBackup] Unhandled exception during backup.");
            }
        }

        /// <summary>
        /// Calculates how long to wait until the next 00:00:00 PHT.
        /// Adds a 5-second buffer so we never fire fractionally before midnight.
        /// </summary>
        private static TimeSpan GetDelayUntilNextMidnightPHT()
        {
            var nowUtc = DateTime.UtcNow;
            var nowPht = TimeZoneInfo.ConvertTimeFromUtc(nowUtc, PhilippineTime);

            // Next midnight PHT
            var nextMidnightPht = nowPht.Date.AddDays(1);
            var nextMidnightUtc = TimeZoneInfo.ConvertTimeToUtc(nextMidnightPht, PhilippineTime);

            var delay = nextMidnightUtc - nowUtc + TimeSpan.FromSeconds(5);
            return delay < TimeSpan.Zero ? TimeSpan.Zero : delay;
        }
    }
}
