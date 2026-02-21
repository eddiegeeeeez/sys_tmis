using TradeMatrix.Server.DTOs;
using TradeMatrix.Server.Models;

namespace TradeMatrix.Server.Services
{
    public interface IHRService
    {
        // Employees
        Task<List<EmployeeDto>> GetEmployeesAsync();
        Task<EmployeeDto?> GetEmployeeByIdAsync(int id);
        Task<EmployeeDto> CreateEmployeeAsync(CreateEmployeeDto dto);
        
        // Attendance
        Task<List<AttendanceDto>> GetAttendanceAsync(DateTime? date);
        Task<AttendanceDto> LogAttendanceAsync(LogAttendanceDto dto);
        
        // Payroll
        Task<List<PayrollRecordDto>> GetPayrollRecordsAsync();
        Task<bool> RunPayrollAsync(RunPayrollDto dto);
    }
}
