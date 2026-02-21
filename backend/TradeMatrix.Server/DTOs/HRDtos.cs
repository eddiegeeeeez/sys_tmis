namespace TradeMatrix.Server.DTOs
{
    public class EmployeeDto
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? ContactNumber { get; set; }
        public string Department { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty;
        public string EmploymentStatus { get; set; } = string.Empty;
        public decimal BasicSalary { get; set; }
        public DateTime HireDate { get; set; }
        public bool IsActive { get; set; }
    }

    public class CreateEmployeeDto
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? ContactNumber { get; set; }
        public string Department { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty;
        public string EmploymentStatus { get; set; } = "Full-time";
        public decimal BasicSalary { get; set; }
        public DateTime HireDate { get; set; } = DateTime.UtcNow;
    }

    public class AttendanceDto
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public TimeSpan? TimeIn { get; set; }
        public TimeSpan? TimeOut { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Remarks { get; set; }
    }

    public class LogAttendanceDto
    {
        public int EmployeeId { get; set; }
        public DateTime Date { get; set; } = DateTime.UtcNow.Date;
        public TimeSpan? TimeIn { get; set; }
        public TimeSpan? TimeOut { get; set; }
        public string Status { get; set; } = "Present";
        public string? Remarks { get; set; }
    }

    public class PayrollRecordDto
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public DateTime PayPeriodStart { get; set; }
        public DateTime PayPeriodEnd { get; set; }
        public decimal BasicSalary { get; set; }
        public decimal GrossPay { get; set; }
        public decimal TotalDeductions { get; set; }
        public decimal NetPay { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? PaymentDate { get; set; }
    }

    public class RunPayrollDto
    {
        public DateTime PayPeriodStart { get; set; }
        public DateTime PayPeriodEnd { get; set; }
    }
}
