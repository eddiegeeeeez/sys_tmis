using TradeMatrix.Server.Models;

namespace TradeMatrix.Server.Services
{
    public interface ISystemService
    {
        Task<IEnumerable<SystemSetting>> GetSettingsAsync();
        Task<bool> UpdateSettingAsync(string key, string value);
    }
}
