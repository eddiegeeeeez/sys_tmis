using Microsoft.EntityFrameworkCore;
using TradeMatrix.Server.Data;
using TradeMatrix.Server.DTOs;
using TradeMatrix.Server.Models;

namespace TradeMatrix.Server.Services
{
    public class ProcurementService : IProcurementService
    {
        private readonly ApplicationDbContext _context;
        private readonly IStockMovementService _stockMovementService;

        public ProcurementService(ApplicationDbContext context, IStockMovementService stockMovementService)
        {
            _context = context;
            _stockMovementService = stockMovementService;
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

        public async Task<List<PurchaseOrderDto>> GetPurchaseOrdersAsync()
        {
            return await _context.PurchaseOrders
                .Include(po => po.Supplier)
                .OrderByDescending(po => po.OrderDate)
                .Select(po => new PurchaseOrderDto
                {
                    Id = po.Id,
                    PONumber = po.PONumber,
                    SupplierId = po.SupplierId,
                    SupplierName = po.Supplier != null ? po.Supplier.CompanyName : "Unknown",
                    OrderDate = po.OrderDate,
                    ExpectedDeliveryDate = po.ExpectedDeliveryDate,
                    TotalAmount = po.TotalAmount,
                    Status = po.Status,
                    ReceivedDate = po.ReceivedDate,
                    ReceivedBy = po.ReceivedBy
                })
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

        public async Task<PurchaseOrderDto?> ReceivePurchaseOrderAsync(int id, string receivedBy)
        {
            var po = await _context.PurchaseOrders
                .Include(p => p.Items)
                .Include(p => p.Supplier)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (po == null) return null;
            if (po.Status == "Received")
                throw new ArgumentException("Purchase order has already been received.");

            // Create STOCK_IN movement for each PO item
            foreach (var item in po.Items)
            {
                await _stockMovementService.RecordMovementAsync(
                    item.ProductId,
                    "STOCK_IN",
                    item.Quantity,
                    receivedBy,
                    reference: po.PONumber,
                    notes: $"Received from PO {po.PONumber}",
                    costPrice: item.UnitCost);
            }

            po.Status = "Received";
            po.ReceivedDate = DateTime.UtcNow;
            po.ReceivedBy = receivedBy;
            await _context.SaveChangesAsync();

            return new PurchaseOrderDto
            {
                Id = po.Id,
                PONumber = po.PONumber,
                SupplierId = po.SupplierId,
                SupplierName = po.Supplier?.CompanyName ?? "Unknown",
                OrderDate = po.OrderDate,
                ExpectedDeliveryDate = po.ExpectedDeliveryDate,
                TotalAmount = po.TotalAmount,
                Status = po.Status,
                ReceivedDate = po.ReceivedDate,
                ReceivedBy = po.ReceivedBy
            };
        }
    }
}
