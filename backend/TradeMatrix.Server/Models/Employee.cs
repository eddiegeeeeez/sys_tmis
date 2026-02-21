using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TradeMatrix.Server.Models
{
    public class Employee
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? ContactNumber { get; set; }

        [Required]
        [MaxLength(50)]
        public string Department { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Position { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string EmploymentStatus { get; set; } = "Full-time"; // Full-time, Part-time, Contract

        [Column(TypeName = "decimal(18,2)")]
        public decimal BasicSalary { get; set; }

        public DateTime HireDate { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
        public ICollection<PayrollRecord> PayrollRecords { get; set; } = new List<PayrollRecord>();
    }
}
