import api from '../../../lib/axios';
import { ApiResponse } from '../../../types';

export interface Employee {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    contactNumber?: string;
    department: string;
    position: string;
    employmentStatus: string;
    basicSalary: number;
    hireDate: string;
    isActive: boolean;
}

export interface Attendance {
    id: number;
    employeeId: number;
    employeeName: string;
    date: string;
    timeIn?: string;
    timeOut?: string;
    status: string;
    remarks?: string;
}

export interface PayrollRecord {
    id: number;
    employeeId: number;
    employeeName: string;
    payPeriodStart: string;
    payPeriodEnd: string;
    basicSalary: number;
    grossPay: number;
    totalDeductions: number;
    netPay: number;
    status: string;
    paymentDate?: string;
}

export const hrService = {
    getEmployees: async () => {
        const response = await api.get<ApiResponse<Employee[]>>('/api/hr/employees');
        return response.data;
    },
    createEmployee: async (data: Partial<Employee>) => {
        const response = await api.post<ApiResponse<Employee>>('/api/hr/employees', data);
        return response.data;
    },
    getAttendance: async (date?: string) => {
        const response = await api.get<ApiResponse<Attendance[]>>(`/api/hr/attendance${date ? `?date=${date}` : ''}`);
        return response.data;
    },
    logAttendance: async (data: Partial<Attendance>) => {
        const response = await api.post<ApiResponse<Attendance>>('/api/hr/attendance', data);
        return response.data;
    },
    getPayrollRecords: async () => {
        const response = await api.get<ApiResponse<PayrollRecord[]>>('/api/payroll');
        return response.data;
    },
    runPayroll: async (data: { payPeriodStart: string; payPeriodEnd: string }) => {
        const response = await api.post<ApiResponse<boolean>>('/api/payroll/run', data);
        return response.data;
    }
};
