using TradeMatrix.Server.DTOs;

namespace TradeMatrix.Server.Services
{
    public interface IInventoryService
    {
        Task<List<ProductDto>> GetProductsAsync();
        Task<ProductDto?> GetProductByIdAsync(int id);
        Task<ProductDto?> GetProductByBarcodeOrSkuAsync(string code);
        Task<ProductDto> CreateProductAsync(CreateProductDto dto);
        Task<ProductDto?> UpdateProductAsync(int id, CreateProductDto dto);
        Task<ProductDto?> UpdateProductImageAsync(int id, string? imageUrl);
        Task<bool> DeleteProductAsync(int id);
        Task<ProductDto?> GetProductDetailAsync(int id);
    }
}
