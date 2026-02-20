namespace TradeMatrix.Server.DTOs
{
    public class AuditLogDto
    {
        public string Id { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public AuditActorDto Actor { get; set; } = new AuditActorDto();
        public string Event { get; set; } = string.Empty;
        public string Resource { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public object Metadata { get; set; } = new object(); // parsed dynamically or returned as dict
    }

    public class AuditActorDto
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Ip { get; set; } = string.Empty;
    }
}
