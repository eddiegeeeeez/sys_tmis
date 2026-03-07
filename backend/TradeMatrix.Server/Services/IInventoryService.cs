using TradeMatrix.Server.DTOs;

namespace TradeMatrix.Server.Services
{
    public interface IInventoryService
    {
        Task<List<ProductDto>> GetProductsAsync();
        Task<ProductDto?> GetProductByIdAsync(int id);
        Task<ProductDto> CreateProductAsync(CreateProductDto dto);
        Task<ProductDto?> UpdateProductAsync(int id, CreateProductDto dto);
        Task<bool> UpdateStockAsync(int productId, int quantityChange);
        Task<ProductDto?> UpdateProductImageAsync(int id, string? imageUrl);
    }
}
