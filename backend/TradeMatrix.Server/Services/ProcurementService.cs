using Microsoft.EntityFrameworkCore;
using TradeMatrix.Server.Data;
using TradeMatrix.Server.DTOs;
using TradeMatrix.Server.Models;

namespace TradeMatrix.Server.Services
{
    public class ProcurementService : IProcurementService
    {
        private readonly ApplicationDbContext _context;

        public ProcurementService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<SupplierDto>> GetSuppliersAsync()
        {
            return await _context.Suppliers
                .Where(s => s.IsActive)
                .Select(s => new SupplierDto
                {
                    Id = s.Id,
                    CompanyName = s.CompanyName,
                    ContactPerson = s.ContactPerson,
                    ContactNumber = s.ContactNumber,
                    Email = s.Email,
                    Address = s.Address
                })
                .ToListAsync();
        }

        public async Task<SupplierDto> CreateSupplierAsync(CreateSupplierDto dto)
        {
            var supplier = new Supplier
            {
                CompanyName = dto.CompanyName,
                ContactPerson = dto.ContactPerson,
                ContactNumber = dto.ContactNumber,
                Email = dto.Email,
                Address = dto.Address
            };

            _context.Suppliers.Add(supplier);
            await _context.SaveChangesAsync();

            return new SupplierDto
            {
                Id = supplier.Id,
                CompanyName = supplier.CompanyName,
                ContactPerson = supplier.ContactPerson,
                ContactNumber = supplier.ContactNumber,
                Email = supplier.Email,
                Address = supplier.Address
            };
        }

        public async Task<SupplierDto?> UpdateSupplierAsync(int id, CreateSupplierDto dto)
        {
            var supplier = await _context.Suppliers.FindAsync(id);
            if (supplier == null) return null;

            supplier.CompanyName = dto.CompanyName;
            supplier.ContactPerson = dto.ContactPerson;
            supplier.ContactNumber = dto.ContactNumber;
            supplier.Email = dto.Email;
            supplier.Address = dto.Address;

            await _context.SaveChangesAsync();
            return new SupplierDto
            {
                Id = supplier.Id,
                CompanyName = supplier.CompanyName,
                ContactPerson = supplier.ContactPerson,
                ContactNumber = supplier.ContactNumber,
                Email = supplier.Email,
                Address = supplier.Address
            };
        }

        public async Task<List<PurchaseOrder>> GetPurchaseOrdersAsync()
        {
            return await _context.PurchaseOrders
                .Include(po => po.Supplier)
                .Include(po => po.Items)
                .ThenInclude(i => i.Product)
                .ToListAsync();
        }

        public async Task<PurchaseOrder> CreatePurchaseOrderAsync(CreatePODto dto)
        {
            var po = new PurchaseOrder
            {
                SupplierId = dto.SupplierId,
                ExpectedDeliveryDate = dto.ExpectedDeliveryDate,
                PONumber = $"PO-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..4].ToUpper()}",
                Status = "Pending"
            };

            decimal totalAmount = 0;
            foreach (var itemDto in dto.Items)
            {
                var item = new PurchaseOrderItem
                {
                    ProductId = itemDto.ProductId,
                    Quantity = itemDto.Quantity,
                    UnitCost = itemDto.UnitCost
                };
                po.Items.Add(item);
                totalAmount += itemDto.Quantity * itemDto.UnitCost;
            }

            po.TotalAmount = totalAmount;
            _context.PurchaseOrders.Add(po);
            await _context.SaveChangesAsync();

            return po;
        }
    }
}
