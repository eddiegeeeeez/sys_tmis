using Microsoft.EntityFrameworkCore;
using TradeMatrix.Server.Data;
using TradeMatrix.Server.DTOs;
using TradeMatrix.Server.Models;

namespace TradeMatrix.Server.Services
{
    public class CustomerService : ICustomerService
    {
        private readonly ApplicationDbContext _context;

        public CustomerService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<CustomerDto>> GetCustomersAsync()
        {
            return await _context.Customers
                .Where(c => c.IsActive)
                .Select(c => new CustomerDto
                {
                    Id = c.Id,
                    CustomerName = c.CustomerName,
                    CustomerType = c.CustomerType,
                    ContactNumber = c.ContactNumber,
                    Email = c.Email,
                    Address = c.Address,
                    LoyaltyPoints = c.LoyaltyPoints,
                    IsActive = c.IsActive
                }).ToListAsync();
        }

        public async Task<CustomerDto?> GetCustomerByIdAsync(int id)
        {
            var c = await _context.Customers.FindAsync(id);
            if (c == null) return null;

            return new CustomerDto
            {
                Id = c.Id,
                CustomerName = c.CustomerName,
                CustomerType = c.CustomerType,
                ContactNumber = c.ContactNumber,
                Email = c.Email,
                Address = c.Address,
                LoyaltyPoints = c.LoyaltyPoints,
                IsActive = c.IsActive
            };
        }

        public async Task<CustomerDto> CreateCustomerAsync(CreateCustomerDto dto)
        {
            var customer = new Customer
            {
                CustomerName = dto.CustomerName,
                CustomerType = dto.CustomerType,
                ContactNumber = dto.ContactNumber,
                Email = dto.Email,
                Address = dto.Address
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            return await GetCustomerByIdAsync(customer.Id) ?? new CustomerDto();
        }

        public async Task<CustomerDto?> UpdateCustomerAsync(int id, CreateCustomerDto dto)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return null;

            customer.CustomerName = dto.CustomerName;
            customer.CustomerType = dto.CustomerType;
            customer.ContactNumber = dto.ContactNumber;
            customer.Email = dto.Email;
            customer.Address = dto.Address;

            await _context.SaveChangesAsync();
            return await GetCustomerByIdAsync(id);
        }
    }
}
