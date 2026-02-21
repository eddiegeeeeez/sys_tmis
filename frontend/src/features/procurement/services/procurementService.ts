import api from '../../../lib/axios';
import { ApiResponse } from '../../admin/services/adminService';

export interface Supplier {
    id: number;
    companyName: string;
    contactPerson: string;
    contactNumber: string;
    email: string;
    address: string;
}

export interface PurchaseOrder {
    id: number;
    poNumber: string;
    supplierId: number;
    supplierName?: string;
    orderDate: string;
    expectedDeliveryDate?: string;
    totalAmount: number;
    status: string;
}

export const procurementService = {
    getSuppliers: () =>
        api.get<ApiResponse<Supplier[]>>('/procurement/suppliers'),

    createSupplier: (supplierData: any) =>
        api.post<ApiResponse<Supplier>>('/procurement/suppliers', supplierData),

    getPurchaseOrders: () =>
        api.get<ApiResponse<PurchaseOrder[]>>('/procurement/purchase-orders'),

    createPurchaseOrder: (poData: any) =>
        api.post<ApiResponse<PurchaseOrder>>('/procurement/purchase-orders', poData),
};
