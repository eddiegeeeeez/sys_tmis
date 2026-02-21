import api from '../../../lib/axios';
import { User, Role, SystemSetting } from '../../../types';

export interface PaginatedResponse<T> {
    data: T[];
    page: number;
    pageSize: number;
    total: number;
    pages: number;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
    errors?: string[];
}

export const adminService = {
    // User Management
    getUsers: (page = 1, pageSize = 10, search = '', role = '', isArchived?: boolean) =>
        api.get<ApiResponse<PaginatedResponse<User>>>('/users/list', { params: { page, pageSize, search, role, isArchived } }),

    getUser: (id: string | number) =>
        api.get<ApiResponse<User>>(`/users/${id}`),

    createUser: (userData: any) =>
        api.post<ApiResponse<User>>('/users/create', userData),

    updateUser: (id: string | number, userData: any) =>
        api.put<ApiResponse<User>>(`/users/${id}`, userData),

    deleteUser: (id: string | number) =>
        api.delete<ApiResponse<boolean>>(`/users/${id}`),

    unlockUser: (id: string | number) =>
        api.post<ApiResponse<boolean>>(`/users/${id}/unlock`),

    resetPassword: (id: string | number, data: any) =>
        api.post<ApiResponse<boolean>>(`/users/${id}/reset-password`, data),

    // Role Management
    getRoles: (isArchived?: boolean) =>
        api.get<ApiResponse<Role[]>>('/roles', { params: { isArchived } }),

    getRole: (id: string | number) =>
        api.get<ApiResponse<Role>>(`/roles/${id}`),

    createRole: (roleData: any) =>
        api.post<ApiResponse<Role>>('/roles', roleData),

    updateRole: (id: string | number, roleData: any) =>
        api.put<ApiResponse<Role>>(`/roles/${id}`, roleData),

    deleteRole: (id: string | number) =>
        api.delete<ApiResponse<boolean>>(`/roles/${id}`),

    archiveUser: (id: string | number) =>
        api.put<ApiResponse<boolean>>(`/users/${id}/archive`),

    restoreUser: (id: string | number) =>
        api.put<ApiResponse<boolean>>(`/users/${id}/restore`),

    archiveRole: (id: string | number) =>
        api.put<ApiResponse<boolean>>(`/roles/${id}/archive`),

    restoreRole: (id: string | number) =>
        api.put<ApiResponse<boolean>>(`/roles/${id}/restore`),

    // Audit Logs / Security
    getAuditLogs: (params?: any) =>
        api.get<ApiResponse<any[]>>('/Audit/logs', { params }),

    // System Configuration
    getSystemSettings: () =>
        api.get<ApiResponse<SystemSetting[]>>('/System/settings'),

    updateSystemSetting: (key: string, value: string) =>
        api.put<ApiResponse<boolean>>(`/System/settings/${key}`, { value }),

    // Database Administration
    getDatabaseInfo: () =>
        api.get<ApiResponse<any>>('/Database/info'),

    getDatabaseStats: () =>
        api.get<ApiResponse<any>>('/Database/statistics'),

    getDatabaseHealth: () =>
        api.get<ApiResponse<any>>('/Database/health'),

    runDatabaseBackup: () =>
        api.post<ApiResponse<any>>('/Database/backup/request'),

    runDatabaseMigrations: () =>
        api.post<ApiResponse<any>>('/Database/migrate'),

    exportUsers: () =>
        api.post<ApiResponse<any>>('/Database/backup/export-users'),
};
