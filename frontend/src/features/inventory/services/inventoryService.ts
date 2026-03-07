import api from '../../../lib/axios';
import { ApiResponse } from '../../admin/services/adminService';

export interface Product {
    id: number;
    name: string;
    sku: string;
    barcode?: string;
    category: string;
    costPrice: number;
    sellingPrice: number;
    stock: number;
    reorderLevel: number;
    unitOfMeasure: string;
    supplierId?: number;
    supplierName?: string;
    imageUrl?: string;
}

export interface StockMovement {
    id: number;
    productId: number;
    productName: string;
    productSKU: string;
    movementType: string;
    quantity: number;
    reference?: string;
    notes?: string;
    costPrice?: number;
    recordedBy: string;
    createdAt: string;
}

export interface StockMovementSummary {
    productId: number;
    productName: string;
    productSKU: string;
    totalStockIn: number;
    totalSales: number;
    totalWaste: number;
    totalAdjustments: number;
    totalVoidRestored: number;
    calculatedStock: number;
    currentStock: number;
}

export interface CreateStockMovementPayload {
    productId: number;
    movementType: 'STOCK_IN' | 'WASTE' | 'ADJUSTMENT';
    quantity: number;
    reference?: string;
    notes?: string;
    costPrice?: number;
}

export const inventoryService = {
    getProducts: () =>
        api.get<ApiResponse<Product[]>>('/inventory/products'),

    createProduct: (productData: any) =>
        api.post<ApiResponse<Product>>('/inventory/products', productData),

    updateProduct: (id: number, productData: any) =>
        api.put<ApiResponse<Product>>(`/inventory/products/${id}`, productData),

    lookupProduct: (code: string) =>
        api.get<ApiResponse<Product>>(`/inventory/products/lookup/${encodeURIComponent(code)}`),

    recordStockMovement: (id: number, payload: CreateStockMovementPayload) =>
        api.post<ApiResponse<StockMovement>>(`/inventory/products/${id}/stock-movements`, payload),

    getProductMovements: (id: number, params?: { movementType?: string; from?: string; to?: string; page?: number; pageSize?: number }) =>
        api.get<ApiResponse<StockMovement[]>>(`/inventory/products/${id}/stock-movements`, { params }),

    getProductStockSummary: (id: number) =>
        api.get<ApiResponse<StockMovementSummary>>(`/inventory/products/${id}/stock-summary`),

    getAllMovements: (params?: { productId?: number; movementType?: string; from?: string; to?: string; page?: number; pageSize?: number }) =>
        api.get<ApiResponse<StockMovement[]>>('/inventory/stock-movements', { params }),

    uploadProductImage: (id: number, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post<ApiResponse<Product>>(`/inventory/products/${id}/upload-image`, formData);
    },

    deleteProductImage: (id: number) =>
        api.delete<ApiResponse<Product>>(`/inventory/products/${id}/image`),
};
