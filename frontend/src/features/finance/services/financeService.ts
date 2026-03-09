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

export interface ExpenseSummary {
    category: string;
    totalAmount: number;
    count: number;
    percentageOfTotal: number;
}

export interface Budget {
    id: number;
    category: string;
    allocatedAmount: number;
    month: number;
    year: number;
    notes?: string;
    createdAt: string;
    createdBy?: string;
}

export interface CreateBudget {
    category: string;
    allocatedAmount: number;
    month: number;
    year: number;
    notes?: string;
}

export interface BudgetVsActualItem {
    category: string;
    allocatedAmount: number;
    actualAmount: number;
    varianceAmount: number;
    variancePercent: number;
    status: string;
}

export interface BudgetSummary {
    month: number;
    year: number;
    totalAllocated: number;
    totalActual: number;
    totalVariance: number;
    overBudgetCount: number;
    underBudgetCount: number;
    items: BudgetVsActualItem[];
}

export const financeService = {
    getExpenses: async (from?: string, to?: string, category?: string) => {
        const params = new URLSearchParams();
        if (from) params.set('from', from);
        if (to) params.set('to', to);
        if (category) params.set('category', category);
        const qs = params.toString();
        const response = await api.get<ApiResponse<Expense[]>>(`finance/expenses${qs ? `?${qs}` : ''}`);
        return response.data;
    },
    createExpense: async (data: Partial<Expense>) => {
        const response = await api.post<ApiResponse<Expense>>('finance/expenses', data);
        return response.data;
    },
    updateExpense: async (id: number, data: Partial<Expense>) => {
        const response = await api.put<ApiResponse<Expense>>(`finance/expenses/${id}`, data);
        return response.data;
    },
    getSummary: async (month: number, year: number) => {
        const response = await api.get<ApiResponse<number>>(`finance/summary?month=${month}&year=${year}`);
        return response.data;
    },
    getExpenseSummary: async (from?: string, to?: string) => {
        const params = new URLSearchParams();
        if (from) params.set('from', from);
        if (to) params.set('to', to);
        const qs = params.toString();
        const response = await api.get<ApiResponse<ExpenseSummary[]>>(`finance/expenses/summary${qs ? `?${qs}` : ''}`);
        return response.data;
    },
    getBudgets: async (month?: number, year?: number) => {
        const params = new URLSearchParams();
        if (month) params.set('month', month.toString());
        if (year) params.set('year', year.toString());
        const qs = params.toString();
        const response = await api.get<ApiResponse<Budget[]>>(`finance/budgets${qs ? `?${qs}` : ''}`);
        return response.data;
    },
    createBudget: async (data: CreateBudget) => {
        const response = await api.post<ApiResponse<Budget>>('finance/budgets', data);
        return response.data;
    },
    updateBudget: async (id: number, data: CreateBudget) => {
        const response = await api.put<ApiResponse<Budget>>(`finance/budgets/${id}`, data);
        return response.data;
    },
    deleteBudget: async (id: number) => {
        const response = await api.delete<ApiResponse<boolean>>(`finance/budgets/${id}`);
        return response.data;
    },
    getBudgetVsActual: async (month: number, year: number) => {
        const response = await api.get<ApiResponse<BudgetSummary>>(`finance/budget-vs-actual?month=${month}&year=${year}`);
        return response.data;
    },
};
