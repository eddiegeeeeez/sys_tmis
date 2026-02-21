import api from '../../../lib/axios';
import { ApiResponse } from '../../../types';

export interface Expense {
    id: number;
    expenseCategory: string;
    description: string;
    amount: number;
    expenseDate: string;
    status: string;
    referenceNumber?: string;
}

export const financeService = {
    getExpenses: async () => {
        const response = await api.get<ApiResponse<Expense[]>>('/api/finance/expenses');
        return response.data;
    },
    createExpense: async (data: Partial<Expense>) => {
        const response = await api.post<ApiResponse<Expense>>('/api/finance/expenses', data);
        return response.data;
    },
    getSummary: async (month: number, year: number) => {
        const response = await api.get<ApiResponse<number>>(`/api/finance/summary?month=${month}&year=${year}`);
        return response.data;
    }
};
