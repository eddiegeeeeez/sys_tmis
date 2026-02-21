using TradeMatrix.Server.DTOs;

namespace TradeMatrix.Server.Services
{
    public interface ICustomerService
    {
        Task<List<CustomerDto>> GetCustomersAsync();
        Task<CustomerDto?> GetCustomerByIdAsync(int id);
        Task<CustomerDto> CreateCustomerAsync(CreateCustomerDto dto);
        Task<CustomerDto?> UpdateCustomerAsync(int id, CreateCustomerDto dto);
    }
}
