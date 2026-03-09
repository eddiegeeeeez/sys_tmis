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
        private readonly IStockMovementService _stockMovementService;
        private readonly IS3StorageService _s3StorageService;
        private readonly ILogger<InventoryController> _logger;

        public InventoryController(IInventoryService inventoryService, IStockMovementService stockMovementService, IS3StorageService s3StorageService, ILogger<InventoryController> logger)
        {
            _inventoryService = inventoryService;
            _stockMovementService = stockMovementService;
            _s3StorageService = s3StorageService;
            _logger = logger;
        }

        [HttpGet("products")]
        [Authorize(Roles = "SuperAdmin,Manager,InventoryClerk,Cashier")]
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
        [Authorize(Roles = "SuperAdmin,Manager,InventoryClerk")]
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

        [HttpPost("products/{id}/stock-movements")]
        [Authorize(Roles = "SuperAdmin,Manager,InventoryClerk")]
        public async Task<ActionResult<ApiResponse<StockMovementDto>>> RecordStockMovement(int id, [FromBody] CreateStockMovementDto dto)
        {
            try
            {
                if (dto.ProductId != id)
                    dto.ProductId = id;

                var userName = User.FindFirst("Name")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value ?? "Unknown";
                var result = await _stockMovementService.RecordMovementAsync(
                    dto.ProductId, dto.MovementType, dto.Quantity, userName, dto.Reference, dto.Notes, dto.CostPrice);
                return Ok(ApiResponse<StockMovementDto>.SuccessResponse(result, "Stock movement recorded."));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ApiResponse<StockMovementDto>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error recording stock movement");
                return StatusCode(500, ApiResponse<string>.ErrorResponse("Error recording stock movement"));
            }
        }

        [HttpGet("products/{id}/stock-movements")]
        [Authorize(Roles = "SuperAdmin,Manager,InventoryClerk")]
        public async Task<ActionResult<ApiResponse<List<StockMovementDto>>>> GetProductMovements(
            int id,
            [FromQuery] string? movementType = null,
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                var (items, total) = await _stockMovementService.GetMovementsAsync(id, movementType, from, to, page, pageSize);
                return Ok(ApiResponse<List<StockMovementDto>>.SuccessResponse(items, $"{total} movement(s) found."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching stock movements");
                return StatusCode(500, ApiResponse<string>.ErrorResponse("Error fetching stock movements"));
            }
        }

        [HttpGet("products/{id}/stock-summary")]
        [Authorize(Roles = "SuperAdmin,Manager,InventoryClerk")]
        public async Task<ActionResult<ApiResponse<StockMovementSummaryDto>>> GetProductStockSummary(int id)
        {
            try
            {
                var result = await _stockMovementService.GetProductMovementSummaryAsync(id);
                if (result == null) return NotFound(ApiResponse<StockMovementSummaryDto>.ErrorResponse("Product not found"));
                return Ok(ApiResponse<StockMovementSummaryDto>.SuccessResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching stock summary");
                return StatusCode(500, ApiResponse<string>.ErrorResponse("Error fetching stock summary"));
            }
        }

        [HttpGet("products/lookup/{code}")]
        [Authorize(Roles = "SuperAdmin,Manager,InventoryClerk,Cashier")]
        public async Task<ActionResult<ApiResponse<ProductDto>>> LookupProduct(string code)
        {
            try
            {
                var result = await _inventoryService.GetProductBySkuAsync(code);
                if (result == null) return NotFound(ApiResponse<ProductDto>.ErrorResponse("Product not found"));
                return Ok(ApiResponse<ProductDto>.SuccessResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error looking up product");
                return StatusCode(500, ApiResponse<string>.ErrorResponse("Error looking up product"));
            }
        }

        [HttpGet("stock-movements")]
        [Authorize(Roles = "SuperAdmin,Manager,InventoryClerk")]
        public async Task<ActionResult<ApiResponse<List<StockMovementDto>>>> GetAllMovements(
            [FromQuery] int? productId = null,
            [FromQuery] string? movementType = null,
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                var (items, total) = await _stockMovementService.GetMovementsAsync(productId, movementType, from, to, page, pageSize);
                return Ok(ApiResponse<List<StockMovementDto>>.SuccessResponse(items, $"{total} movement(s) found."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching stock movements");
                return StatusCode(500, ApiResponse<string>.ErrorResponse("Error fetching stock movements"));
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

                // Validate file signature (magic bytes) to prevent disguised uploads
                using var validationStream = file.OpenReadStream();
                if (!_s3StorageService.ValidateFileSignature(validationStream, file.ContentType))
                    return BadRequest(ApiResponse<string>.ErrorResponse("File content does not match the declared type. Upload rejected."));

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

        [HttpDelete("products/{id}")]
        [Authorize(Roles = "SuperAdmin,Manager,InventoryClerk")]
        public async Task<ActionResult<ApiResponse<string>>> DeleteProduct(int id)
        {
            try
            {
                var product = await _inventoryService.GetProductByIdAsync(id);
                if (product == null)
                    return NotFound(ApiResponse<string>.ErrorResponse("Product not found"));

                // Clean up S3 image if exists
                if (!string.IsNullOrEmpty(product.ImageUrl))
                    await _s3StorageService.DeleteFileAsync(product.ImageUrl);

                var success = await _inventoryService.DeleteProductAsync(id);
                if (!success)
                    return NotFound(ApiResponse<string>.ErrorResponse("Product not found"));

                return Ok(ApiResponse<string>.SuccessResponse("Product deleted successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting product {Id}", id);
                return StatusCode(500, ApiResponse<string>.ErrorResponse("Error deleting product"));
            }
        }

        [HttpGet("products/{id}")]
        [Authorize(Roles = "SuperAdmin,Manager,InventoryClerk,Cashier")]
        public async Task<ActionResult<ApiResponse<ProductDto>>> GetProductById(int id)
        {
            try
            {
                var result = await _inventoryService.GetProductDetailAsync(id);
                if (result == null)
                    return NotFound(ApiResponse<ProductDto>.ErrorResponse("Product not found"));
                return Ok(ApiResponse<ProductDto>.SuccessResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching product {Id}", id);
                return StatusCode(500, ApiResponse<string>.ErrorResponse("Error fetching product"));
            }
        }

    }
}
