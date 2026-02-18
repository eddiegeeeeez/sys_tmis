using Microsoft.EntityFrameworkCore;
using TradeMatrix.Server.Data;
using TradeMatrix.Server.Models;

namespace TradeMatrix.Server.Services
{
    public class SystemService : ISystemService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<SystemService> _logger;

        public SystemService(ApplicationDbContext context, ILogger<SystemService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<SystemSetting>> GetSettingsAsync()
        {
            return await _context.SystemSettings.ToListAsync();
        }

        public async Task<bool> UpdateSettingAsync(string key, string value)
        {
            var setting = await _context.SystemSettings.FindAsync(key);

            if (setting == null)
            {
                return false;
            }

            setting.Value = value;
            setting.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            _logger.LogInformation($"System setting '{key}' updated.");
            
            return true;
        }
    }
}
