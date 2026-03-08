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
                .Where(p => p.IsActive)
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
                    SupplierName = p.Supplier != null ? p.Supplier.CompanyName : null,
                    ImageUrl = p.ImageUrl,
                    Barcode = p.Barcode
                })
                .ToListAsync();
        }

        public async Task<ProductDto?> GetProductByIdAsync(int id)
        {
            var p = await _context.Products
                .Include(p => p.Supplier)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (p == null) return null;

            return MapToDto(p);
        }

        public async Task<ProductDto?> GetProductByBarcodeOrSkuAsync(string code)
        {
            var p = await _context.Products
                .Include(p => p.Supplier)
                .FirstOrDefaultAsync(p => p.IsActive &&
                    (p.SKU == code || p.Barcode == code));

            if (p == null) return null;

            return MapToDto(p);
        }

        public async Task<ProductDto> CreateProductAsync(CreateProductDto dto)
        {
            // Auto-generate SKU if not provided
            var sku = string.IsNullOrWhiteSpace(dto.SKU)
                ? await GenerateSkuAsync(dto.Category)
                : dto.SKU;

            var product = new Product
            {
                Name = dto.Name,
                SKU = sku,
                Category = dto.Category,
                CostPrice = dto.CostPrice,
                SellingPrice = dto.SellingPrice,
                Stock = dto.InitialStock,
                ReorderLevel = dto.ReorderLevel,
                UnitOfMeasure = dto.UnitOfMeasure,
                SupplierId = dto.SupplierId,
                Barcode = dto.Barcode
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            // If initial stock > 0, create a STOCK_IN movement for traceability
            if (dto.InitialStock > 0)
            {
                _context.StockMovements.Add(new StockMovement
                {
                    ProductId = product.Id,
                    MovementType = "STOCK_IN",
                    Quantity = dto.InitialStock,
                    Reference = "Initial stock on product creation",
                    CostPrice = dto.CostPrice,
                    RecordedBy = "System",
                    CreatedAt = DateTime.UtcNow
                });
                await _context.SaveChangesAsync();
            }

            return await GetProductByIdAsync(product.Id) ?? new ProductDto();
        }

        public async Task<ProductDto?> UpdateProductAsync(int id, CreateProductDto dto)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return null;

            product.Name = dto.Name;
            product.SKU = string.IsNullOrWhiteSpace(dto.SKU) ? product.SKU : dto.SKU;
            product.Category = dto.Category;
            product.CostPrice = dto.CostPrice;
            product.SellingPrice = dto.SellingPrice;
            product.ReorderLevel = dto.ReorderLevel;
            product.UnitOfMeasure = dto.UnitOfMeasure;
            product.SupplierId = dto.SupplierId;
            product.Barcode = dto.Barcode;

            await _context.SaveChangesAsync();
            return await GetProductByIdAsync(id);
        }

        public async Task<ProductDto?> UpdateProductImageAsync(int id, string? imageUrl)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return null;

            product.ImageUrl = imageUrl;
            await _context.SaveChangesAsync();
            return await GetProductByIdAsync(id);
        }

        public async Task<bool> DeleteProductAsync(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return false;

            // Soft delete — mark as inactive
            product.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<ProductDto?> GetProductDetailAsync(int id)
        {
            return await GetProductByIdAsync(id);
        }

        private async Task<string> GenerateSkuAsync(string category)
        {
            // Build prefix from category: take first 2-3 uppercase letters
            var prefix = GetCategoryPrefix(category);

            // Find the highest existing sequence number for this prefix
            var lastSku = await _context.Products
                .Where(p => p.SKU.StartsWith(prefix + "-"))
                .OrderByDescending(p => p.SKU)
                .Select(p => p.SKU)
                .FirstOrDefaultAsync();

            int nextSeq = 1;
            if (lastSku != null)
            {
                var parts = lastSku.Split('-');
                if (parts.Length == 2 && int.TryParse(parts[1], out var lastSeq))
                    nextSeq = lastSeq + 1;
            }

            return $"{prefix}-{nextSeq:D4}";
        }

        private static string GetCategoryPrefix(string category)
        {
            // Common Philippine retail categories
            return category.ToUpperInvariant() switch
            {
                "ELECTRONICS" => "ELC",
                "FOOD" or "FOOD & BEVERAGES" => "FD",
                "DRINKS" or "BEVERAGES" => "DRK",
                "CLOTHING" or "APPAREL" => "CLT",
                "HOUSEHOLD" or "HOME" => "HSH",
                "HEALTH" or "HEALTH & BEAUTY" => "HLT",
                "OFFICE" or "OFFICE SUPPLIES" => "OFC",
                "TOYS" => "TOY",
                "SPORTS" => "SPT",
                "AUTOMOTIVE" => "AUT",
                "GROCERY" => "GRC",
                "PERSONAL CARE" => "PRC",
                "SNACKS" => "SNK",
                "CANNED GOODS" => "CAN",
                "CONDIMENTS" => "CND",
                "DAIRY" => "DRY",
                "FROZEN" => "FRZ",
                _ => new string(category.Where(char.IsLetter).Take(3).ToArray()).ToUpperInvariant()
            };
        }

        private static ProductDto MapToDto(Product p) => new()
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
            SupplierName = p.Supplier != null ? p.Supplier.CompanyName : null,
            ImageUrl = p.ImageUrl,
            Barcode = p.Barcode
        };
    }
}
