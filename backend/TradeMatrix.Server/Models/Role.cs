using System.ComponentModel.DataAnnotations;

namespace TradeMatrix.Server.Models
{
    public class Role
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(200)]
        public string Description { get; set; } = string.Empty;

        // JSON string or comma-separated list of permissions
        public string Permissions { get; set; } = string.Empty;

        public bool IsSystemRole { get; set; } = false; // Prevent deletion of core roles
        public bool IsArchived { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
