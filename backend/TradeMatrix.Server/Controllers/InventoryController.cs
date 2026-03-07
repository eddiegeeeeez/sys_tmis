using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TradeMatrix.Server.DTOs;
using TradeMatrix.Server.Services;

namespace TradeMatrix.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryService _inventoryService;
        private readonly IS3StorageService _s3StorageService;
        private readonly ILogger<InventoryController> _logger;

        public InventoryController(IInventoryService inventoryService, IS3StorageService s3StorageService, ILogger<InventoryController> logger)
        {
            _inventoryService = inventoryService;
            _s3StorageService = s3StorageService;
            _logger = logger;
        }

        [HttpGet("products")]
        public async Task<ActionResult<ApiResponse<List<ProductDto>>>> GetProducts()
        {
            try
            {
                var products = await _inventoryService.GetProductsAsync();
                return Ok(ApiResponse<List<ProductDto>>.SuccessResponse(products));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching products");
                return StatusCode(500, ApiResponse<string>.ErrorResponse("Error fetching products"));
            }
        }

        [HttpPost("products")]
        [Authorize(Roles = "SuperAdmin,Manager,InventoryClerk,Cashier")]
        public async Task<ActionResult<ApiResponse<ProductDto>>> CreateProduct([FromBody] CreateProductDto dto)
        {
            try
            {
                var result = await _inventoryService.CreateProductAsync(dto);
                return Ok(ApiResponse<ProductDto>.SuccessResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating product");
                return StatusCode(500, ApiResponse<string>.ErrorResponse("Error creating product"));
            }
        }

        [HttpPost("products/{id}/adjust-stock")]
        [Authorize(Roles = "SuperAdmin,Manager,InventoryClerk")]
        public async Task<ActionResult<ApiResponse<bool>>> AdjustStock(int id, [FromBody] int quantityChange)
        {
            try
            {
                var result = await _inventoryService.UpdateStockAsync(id, quantityChange);
                if (!result) return NotFound(ApiResponse<bool>.ErrorResponse("Product not found"));
                return Ok(ApiResponse<bool>.SuccessResponse(true));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adjusting stock");
                return StatusCode(500, ApiResponse<string>.ErrorResponse("Error adjusting stock"));
            }
        }

        [HttpPut("products/{id}")]
        [Authorize(Roles = "SuperAdmin,Manager,InventoryClerk")]
        public async Task<ActionResult<ApiResponse<ProductDto>>> UpdateProduct(int id, [FromBody] CreateProductDto dto)
        {
            try
            {
                var result = await _inventoryService.UpdateProductAsync(id, dto);
                if (result == null) return NotFound(ApiResponse<ProductDto>.ErrorResponse("Product not found"));
                return Ok(ApiResponse<ProductDto>.SuccessResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating product");
                return StatusCode(500, ApiResponse<string>.ErrorResponse("Error updating product"));
            }
        }

        [HttpPost("products/{id}/upload-image")]
        [Authorize(Roles = "SuperAdmin,Manager,InventoryClerk")]
        public async Task<ActionResult<ApiResponse<ProductDto>>> UploadProductImage(int id, IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("No file uploaded"));

                // Validate file type
                var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp", "image/gif" };
                if (!allowedTypes.Contains(file.ContentType.ToLower()))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Only JPEG, PNG, WebP, and GIF images are allowed"));

                // Validate file size (max 5MB)
                if (file.Length > 5 * 1024 * 1024)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Image must be less than 5MB"));

                var product = await _inventoryService.GetProductByIdAsync(id);
                if (product == null)
                    return NotFound(ApiResponse<string>.ErrorResponse("Product not found"));

                // Delete old image if exists
                if (!string.IsNullOrEmpty(product.ImageUrl))
                    await _s3StorageService.DeleteFileAsync(product.ImageUrl);

                // Upload new image
                using var stream = file.OpenReadStream();
                var imageUrl = await _s3StorageService.UploadFileAsync(stream, file.FileName, file.ContentType, "products");

                // Update product with new image URL
                var result = await _inventoryService.UpdateProductImageAsync(id, imageUrl);
                if (result == null)
                    return NotFound(ApiResponse<ProductDto>.ErrorResponse("Product not found"));

                return Ok(ApiResponse<ProductDto>.SuccessResponse(result, "Image uploaded successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading product image for product {Id}", id);
                return StatusCode(500, ApiResponse<string>.ErrorResponse("Error uploading product image"));
            }
        }

        [HttpDelete("products/{id}/image")]
        [Authorize(Roles = "SuperAdmin,Manager,InventoryClerk")]
        public async Task<ActionResult<ApiResponse<ProductDto>>> DeleteProductImage(int id)
        {
            try
            {
                var product = await _inventoryService.GetProductByIdAsync(id);
                if (product == null)
                    return NotFound(ApiResponse<string>.ErrorResponse("Product not found"));

                if (!string.IsNullOrEmpty(product.ImageUrl))
                    await _s3StorageService.DeleteFileAsync(product.ImageUrl);

                var result = await _inventoryService.UpdateProductImageAsync(id, null);
                if (result == null)
                    return NotFound(ApiResponse<ProductDto>.ErrorResponse("Product not found"));

                return Ok(ApiResponse<ProductDto>.SuccessResponse(result, "Image removed"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting product image for product {Id}", id);
                return StatusCode(500, ApiResponse<string>.ErrorResponse("Error deleting product image"));
            }
        }
    }
}
