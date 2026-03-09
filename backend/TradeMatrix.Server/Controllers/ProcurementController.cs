using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TradeMatrix.Server.DTOs;
using TradeMatrix.Server.Models;
using TradeMatrix.Server.Services;

namespace TradeMatrix.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "SuperAdmin,Manager,InventoryClerk")]
    public class ProcurementController : ControllerBase
    {
        private readonly IProcurementService _procurementService;
        private readonly ILogger<ProcurementController> _logger;

        public ProcurementController(IProcurementService procurementService, ILogger<ProcurementController> logger)
        {
            _procurementService = procurementService;
            _logger = logger;
        }

        [HttpGet("suppliers")]
        public async Task<ActionResult<ApiResponse<List<SupplierDto>>>> GetSuppliers()
        {
            try
            {
                var result = await _procurementService.GetSuppliersAsync();
                return Ok(ApiResponse<List<SupplierDto>>.SuccessResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching suppliers");
                return StatusCode(500, ApiResponse<string>.ErrorResponse("Error fetching suppliers"));
            }
        }

        [HttpPost("suppliers")]
        [Authorize(Roles = "SuperAdmin,Manager,InventoryClerk")]
        public async Task<ActionResult<ApiResponse<SupplierDto>>> CreateSupplier([FromBody] CreateSupplierDto dto)
        {
            try
            {
                var result = await _procurementService.CreateSupplierAsync(dto);
                return Ok(ApiResponse<SupplierDto>.SuccessResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating supplier");
                return StatusCode(500, ApiResponse<string>.ErrorResponse("Error creating supplier"));
            }
        }

        [HttpGet("purchase-orders")]
        public async Task<ActionResult<ApiResponse<List<PurchaseOrderDto>>>> GetPurchaseOrders()
        {
            try
            {
                var result = await _procurementService.GetPurchaseOrdersAsync();
                return Ok(ApiResponse<List<PurchaseOrderDto>>.SuccessResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching purchase orders");
                return StatusCode(500, ApiResponse<string>.ErrorResponse("Error fetching purchase orders"));
            }
        }

        [HttpPost("purchase-orders")]
        [Authorize(Roles = "SuperAdmin,Manager,InventoryClerk")]
        public async Task<ActionResult<ApiResponse<PurchaseOrder>>> CreatePurchaseOrder([FromBody] CreatePODto dto)
        {
            try
            {
                var result = await _procurementService.CreatePurchaseOrderAsync(dto);
                return Ok(ApiResponse<PurchaseOrder>.SuccessResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating purchase order");
                return StatusCode(500, ApiResponse<string>.ErrorResponse("Error creating purchase order"));
            }
        }

        [HttpPut("suppliers/{id}")]
        [Authorize(Roles = "SuperAdmin,Manager,InventoryClerk")]
        public async Task<ActionResult<ApiResponse<SupplierDto>>> UpdateSupplier(int id, [FromBody] CreateSupplierDto dto)
        {
            try
            {
                var result = await _procurementService.UpdateSupplierAsync(id, dto);
                if (result == null) return NotFound(ApiResponse<SupplierDto>.ErrorResponse("Supplier not found"));
                return Ok(ApiResponse<SupplierDto>.SuccessResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating supplier");
                return StatusCode(500, ApiResponse<string>.ErrorResponse("Error updating supplier"));
            }
        }

        [HttpPost("purchase-orders/{id}/receive")]
        [Authorize(Roles = "SuperAdmin,Manager,InventoryClerk")]
        public async Task<ActionResult<ApiResponse<PurchaseOrderDto>>> ReceivePurchaseOrder(int id)
        {
            try
            {
                var userName = User.FindFirst("Name")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value ?? "Unknown";
                var result = await _procurementService.ReceivePurchaseOrderAsync(id, userName);
                if (result == null)
                    return NotFound(ApiResponse<PurchaseOrderDto>.ErrorResponse("Purchase order not found"));
                return Ok(ApiResponse<PurchaseOrderDto>.SuccessResponse(result, "Purchase order received and stock updated."));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ApiResponse<PurchaseOrderDto>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error receiving purchase order {Id}", id);
                return StatusCode(500, ApiResponse<string>.ErrorResponse("Error receiving purchase order"));
            }
        }
    }
}
