using Microsoft.EntityFrameworkCore;
using TradeMatrix.Server.Data;
using TradeMatrix.Server.DTOs;
using TradeMatrix.Server.Models;

namespace TradeMatrix.Server.Services
{
    public class HRService : IHRService
    {
        private readonly ApplicationDbContext _context;

        public HRService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<EmployeeDto>> GetEmployeesAsync()
        {
            return await _context.Employees
                .Where(e => e.IsActive)
                .Select(e => new EmployeeDto
                {
                    Id = e.Id,
                    FirstName = e.FirstName,
                    LastName = e.LastName,
                    Email = e.Email,
                    ContactNumber = e.ContactNumber,
                    Department = e.Department,
                    Position = e.Position,
                    EmploymentStatus = e.EmploymentStatus,
                    BasicSalary = e.BasicSalary,
                    HireDate = e.HireDate,
                    IsActive = e.IsActive
                }).ToListAsync();
        }

        public async Task<EmployeeDto?> GetEmployeeByIdAsync(int id)
        {
            var e = await _context.Employees.FindAsync(id);
            if (e == null) return null;

            return new EmployeeDto
            {
                Id = e.Id,
                FirstName = e.FirstName,
                LastName = e.LastName,
                Email = e.Email,
                ContactNumber = e.ContactNumber,
                Department = e.Department,
                Position = e.Position,
                EmploymentStatus = e.EmploymentStatus,
                BasicSalary = e.BasicSalary,
                HireDate = e.HireDate,
                IsActive = e.IsActive
            };
        }

        public async Task<EmployeeDto> CreateEmployeeAsync(CreateEmployeeDto dto)
        {
            var employee = new Employee
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                ContactNumber = dto.ContactNumber,
                Department = dto.Department,
                Position = dto.Position,
                EmploymentStatus = dto.EmploymentStatus,
                BasicSalary = dto.BasicSalary,
                HireDate = dto.HireDate
            };

            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();

            return await GetEmployeeByIdAsync(employee.Id) ?? new EmployeeDto();
        }

        public async Task<List<AttendanceDto>> GetAttendanceAsync(DateTime? date)
        {
            var query = _context.Attendances.Include(a => a.Employee).AsQueryable();
            
            if (date.HasValue)
            {
                var targetDate = date.Value.Date;
                query = query.Where(a => a.Date == targetDate);
            }

            return await query.Select(a => new AttendanceDto
            {
                Id = a.Id,
                EmployeeId = a.EmployeeId,
                EmployeeName = $"{a.Employee!.FirstName} {a.Employee.LastName}",
                Date = a.Date,
                TimeIn = a.TimeIn,
                TimeOut = a.TimeOut,
                Status = a.Status,
                Remarks = a.Remarks
            }).ToListAsync();
        }

        public async Task<AttendanceDto> LogAttendanceAsync(LogAttendanceDto dto)
        {
            var attendance = new Attendance
            {
                EmployeeId = dto.EmployeeId,
                Date = dto.Date,
                TimeIn = dto.TimeIn,
                TimeOut = dto.TimeOut,
                Status = dto.Status,
                Remarks = dto.Remarks
            };

            _context.Attendances.Add(attendance);
            await _context.SaveChangesAsync();
            
            return (await GetAttendanceAsync(dto.Date)).First(a => a.Id == attendance.Id);
        }

        public async Task<List<PayrollRecordDto>> GetPayrollRecordsAsync()
        {
            return await _context.PayrollRecords
                .Include(p => p.Employee)
                .OrderByDescending(p => p.PayPeriodEnd)
                .Select(p => new PayrollRecordDto
                {
                    Id = p.Id,
                    EmployeeId = p.EmployeeId,
                    EmployeeName = $"{p.Employee!.FirstName} {p.Employee.LastName}",
                    PayPeriodStart = p.PayPeriodStart,
                    PayPeriodEnd = p.PayPeriodEnd,
                    BasicSalary = p.BasicSalary,
                    GrossPay = p.GrossPay,
                    TotalDeductions = p.TotalDeductions,
                    NetPay = p.NetPay,
                    Status = p.Status,
                    PaymentDate = p.PaymentDate
                }).ToListAsync();
        }

        public async Task<bool> RunPayrollAsync(RunPayrollDto dto)
        {
            var activeEmployees = await _context.Employees.Where(e => e.IsActive).ToListAsync();
            
            foreach (var emp in activeEmployees)
            {
                // Simple payroll logic for now
                var record = new PayrollRecord
                {
                    EmployeeId = emp.Id,
                    PayPeriodStart = dto.PayPeriodStart,
                    PayPeriodEnd = dto.PayPeriodEnd,
                    BasicSalary = emp.BasicSalary,
                    GrossPay = emp.BasicSalary, // Simplified: no allowances yet
                    TotalDeductions = 0, // Simplified: no deductions yet
                    NetPay = emp.BasicSalary,
                    Status = "Pending"
                };
                _context.PayrollRecords.Add(record);
            }

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
