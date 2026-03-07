import api from '../../../lib/axios';
import { ApiResponse } from '../../admin/services/adminService';

export interface Product {
    id: number;
    name: string;
    sku: string;
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

export const inventoryService = {
    getProducts: () =>
        api.get<ApiResponse<Product[]>>('/inventory/products'),

    createProduct: (productData: any) =>
        api.post<ApiResponse<Product>>('/inventory/products', productData),

    updateProduct: (id: number, productData: any) =>
        api.put<ApiResponse<Product>>(`/inventory/products/${id}`, productData),

    adjustStock: (id: number, quantityChange: number) =>
        api.post<ApiResponse<boolean>>(`/inventory/products/${id}/adjust-stock`, quantityChange),

    uploadProductImage: (id: number, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post<ApiResponse<Product>>(`/inventory/products/${id}/upload-image`, formData);
    },

    deleteProductImage: (id: number) =>
        api.delete<ApiResponse<Product>>(`/inventory/products/${id}/image`),
};
