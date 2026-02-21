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
        private readonly ILogger<InventoryController> _logger;

        public InventoryController(IInventoryService inventoryService, ILogger<InventoryController> logger)
        {
            _inventoryService = inventoryService;
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
    }
}
