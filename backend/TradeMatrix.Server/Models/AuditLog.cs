using System.ComponentModel.DataAnnotations;

namespace TradeMatrix.Server.Models
{
    public class AuditLog
    {
        [Key]
        [MaxLength(50)]
        public string Id { get; set; } = string.Empty; // e.g., evt_123456

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        // Actor
        [MaxLength(100)]
        public string ActorName { get; set; } = string.Empty;
        
        [MaxLength(150)]
        public string ActorEmail { get; set; } = string.Empty;
        
        [MaxLength(50)]
        public string IpAddress { get; set; } = string.Empty;

        // Event Details
        [MaxLength(100)]
        public string Event { get; set; } = string.Empty; // e.g. auth.login.success
        
        [MaxLength(200)]
        public string Resource { get; set; } = string.Empty; // e.g. System, User: John

        // Status & Severity
        [MaxLength(20)]
        public string Status { get; set; } = string.Empty; // Success, Failure, Warning
        
        [MaxLength(20)]
        public string Severity { get; set; } = string.Empty; // Low, Medium, High, Critical

        // Metadata JSON
        public string Metadata { get; set; } = "{}";
    }
}
