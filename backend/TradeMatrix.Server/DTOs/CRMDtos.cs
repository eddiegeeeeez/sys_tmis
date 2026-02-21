namespace TradeMatrix.Server.DTOs
{
    public class CustomerDto
    {
        public int Id { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerType { get; set; } = string.Empty;
        public string? ContactNumber { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public int LoyaltyPoints { get; set; }
        public bool IsActive { get; set; }
    }

    public class CreateCustomerDto
    {
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerType { get; set; } = "Retail";
        public string? ContactNumber { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
    }
}
