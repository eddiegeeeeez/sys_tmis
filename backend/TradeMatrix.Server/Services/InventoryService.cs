using Microsoft.EntityFrameworkCore;
using TradeMatrix.Server.Data;
using TradeMatrix.Server.DTOs;
using TradeMatrix.Server.Models;

namespace TradeMatrix.Server.Services
{
    public class InventoryService : IInventoryService
    {
        private readonly ApplicationDbContext _context;

        public InventoryService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<ProductDto>> GetProductsAsync()
        {
            return await _context.Products
                .Include(p => p.Supplier)
                .Select(p => new ProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    SKU = p.SKU,
                    Category = p.Category,
                    CostPrice = p.CostPrice,
                    SellingPrice = p.SellingPrice,
                    Stock = p.Stock,
                    ReorderLevel = p.ReorderLevel,
                    UnitOfMeasure = p.UnitOfMeasure,
                    SupplierId = p.SupplierId,
                    SupplierName = p.Supplier != null ? p.Supplier.CompanyName : null
                })
                .ToListAsync();
        }

        public async Task<ProductDto?> GetProductByIdAsync(int id)
        {
            var p = await _context.Products
                .Include(p => p.Supplier)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (p == null) return null;

            return new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                SKU = p.SKU,
                Category = p.Category,
                CostPrice = p.CostPrice,
                SellingPrice = p.SellingPrice,
                Stock = p.Stock,
                ReorderLevel = p.ReorderLevel,
                UnitOfMeasure = p.UnitOfMeasure,
                SupplierId = p.SupplierId,
                SupplierName = p.Supplier != null ? p.Supplier.CompanyName : null
            };
        }

        public async Task<ProductDto> CreateProductAsync(CreateProductDto dto)
        {
            var product = new Product
            {
                Name = dto.Name,
                SKU = dto.SKU,
                Category = dto.Category,
                CostPrice = dto.CostPrice,
                SellingPrice = dto.SellingPrice,
                Stock = dto.InitialStock,
                ReorderLevel = dto.ReorderLevel,
                UnitOfMeasure = dto.UnitOfMeasure,
                SupplierId = dto.SupplierId
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return await GetProductByIdAsync(product.Id) ?? new ProductDto();
        }

        public async Task<ProductDto?> UpdateProductAsync(int id, CreateProductDto dto)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return null;

            product.Name = dto.Name;
            product.SKU = dto.SKU;
            product.Category = dto.Category;
            product.CostPrice = dto.CostPrice;
            product.SellingPrice = dto.SellingPrice;
            product.ReorderLevel = dto.ReorderLevel;
            product.UnitOfMeasure = dto.UnitOfMeasure;
            product.SupplierId = dto.SupplierId;

            await _context.SaveChangesAsync();
            return await GetProductByIdAsync(id);
        }

        public async Task<bool> UpdateStockAsync(int productId, int quantityChange)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null) return false;

            product.Stock += quantityChange;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
