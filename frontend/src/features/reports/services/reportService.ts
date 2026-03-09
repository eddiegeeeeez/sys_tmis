import api from '../../../lib/axios';
import { ApiResponse } from '../../../types';

// --- Sales Report ---
export interface DailyBreakdown {
    date: string;
    revenue: number;
    transactionCount: number;
}

export interface PaymentMethodBreakdown {
    method: string;
    amount: number;
    count: number;
}

export interface SalesReport {
    totalRevenue: number;
    totalTax: number;
    netRevenue: number;
    transactionCount: number;
    itemsSold: number;
    averageOrderValue: number;
    voidedCount: number;
    voidedAmount: number;
    dailyBreakdown: DailyBreakdown[];
    paymentMethodBreakdown: PaymentMethodBreakdown[];
}

// --- Inventory Valuation ---
export interface CategoryBreakdown {
    category: string;
    skuCount: number;
    costValue: number;
    retailValue: number;
}

export interface InventoryValuation {
    totalCostValue: number;
    totalRetailValue: number;
    potentialProfit: number;
    totalSKUs: number;
    outOfStockCount: number;
    lowStockCount: number;
    categoryBreakdown: CategoryBreakdown[];
}

// --- HR Summary ---
export interface DepartmentBreakdown {
    department: string;
    headcount: number;
    payrollCost: number;
}

export interface HRSummary {
    totalEmployees: number;
    activeCount: number;
    departmentCount: number;
    attendanceRate: number;
    totalPayrollGross: number;
    totalPayrollNet: number;
    totalDeductions: number;
    departmentBreakdown: DepartmentBreakdown[];
}

// --- Procurement Summary ---
export interface SupplierBreakdown {
    supplierName: string;
    poCount: number;
    totalAmount: number;
}

export interface ProcurementSummary {
    totalPOs: number;
    pendingCount: number;
    receivedCount: number;
    totalSpend: number;
    supplierBreakdown: SupplierBreakdown[];
}

export const reportService = {
    getSalesReport: async (from: string, to: string) => {
        const response = await api.get<ApiResponse<SalesReport>>(`report/sales?from=${from}&to=${to}`);
        return response.data;
    },
    getInventoryValuation: async () => {
        const response = await api.get<ApiResponse<InventoryValuation>>('report/inventory-valuation');
        return response.data;
    },
    getHRSummary: async (from: string, to: string) => {
        const response = await api.get<ApiResponse<HRSummary>>(`report/hr-summary?from=${from}&to=${to}`);
        return response.data;
    },
    getProcurementSummary: async (from: string, to: string) => {
        const response = await api.get<ApiResponse<ProcurementSummary>>(`report/procurement-summary?from=${from}&to=${to}`);
        return response.data;
    },
};
