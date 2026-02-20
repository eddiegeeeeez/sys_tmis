namespace TradeMatrix.Server.DTOs
{
    public class RoleDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Permissions { get; set; } = string.Empty;
        public bool IsSystemRole { get; set; }
        public bool IsArchived { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateRoleDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Permissions { get; set; }
    }

    public class UpdateRoleDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Permissions { get; set; } = string.Empty;
    }
}
