using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TradeMatrix.Server.Models
{
    public class Attendance
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int EmployeeId { get; set; }

        [ForeignKey("EmployeeId")]
        public Employee? Employee { get; set; }

        public DateTime Date { get; set; } = DateTime.UtcNow.Date;

        public TimeSpan? TimeIn { get; set; }
        public TimeSpan? TimeOut { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = "Present"; // Present, Absent, Late, On Leave
        
        public string? Remarks { get; set; }
    }
}
