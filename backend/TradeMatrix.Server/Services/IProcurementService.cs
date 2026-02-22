using TradeMatrix.Server.DTOs;
using TradeMatrix.Server.Models;

namespace TradeMatrix.Server.Services
{
    public interface IProcurementService
    {
        Task<List<SupplierDto>> GetSuppliersAsync();
        Task<SupplierDto> CreateSupplierAsync(CreateSupplierDto dto);
        Task<SupplierDto?> UpdateSupplierAsync(int id, CreateSupplierDto dto);
        Task<List<PurchaseOrder>> GetPurchaseOrdersAsync();
        Task<PurchaseOrder> CreatePurchaseOrderAsync(CreatePODto dto);
    }
}
