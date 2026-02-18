using System.ComponentModel.DataAnnotations;

namespace TradeMatrix.Server.Models
{
    public class SystemSetting
    {
        [Key]
        [MaxLength(100)]
        public string Key { get; set; } = string.Empty;

        public string Value { get; set; } = string.Empty;

        [MaxLength(200)]
        public string Description { get; set; } = string.Empty;

        public string Group { get; set; } = "General"; // e.g., "General", "Security", "Email"

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
