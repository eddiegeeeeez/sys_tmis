using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TradeMatrix.Server.Models
{
    public class BackupRecord
    {
        public int Id { get; set; }

        [Required, MaxLength(200)]
        public string FileName { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? S3Url { get; set; }

        public long FileSizeBytes { get; set; }

        [Required, MaxLength(100)]
        public string TriggeredBy { get; set; } = string.Empty;   // "Automatic" or user display name

        [Required, MaxLength(20)]
        public string Status { get; set; } = "Success";           // "Success" | "Failed"

        [MaxLength(500)]
        public string? ErrorMessage { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
