import api from '../../../lib/axios';
import { ApiResponse } from '../../../types';

export interface Customer {
    id: number;
    customerName: string;
    customerType: string;
    contactNumber?: string;
    email?: string;
    address?: string;
    loyaltyPoints: number;
    isActive: boolean;
}

export const customerService = {
    getCustomers: async () => {
        const response = await api.get<ApiResponse<Customer[]>>('customer');
        return response.data;
    },
    createCustomer: async (data: Partial<Customer>) => {
        const response = await api.post<ApiResponse<Customer>>('customer', data);
        return response.data;
    },
    updateCustomer: async (id: number, data: Partial<Customer>) => {
        const response = await api.put<ApiResponse<Customer>>(`customer/${id}`, data);
        return response.data;
    }
};
