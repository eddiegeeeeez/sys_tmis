// Centralized mock data for admin pages
// Single source of truth to avoid duplication across multiple admin page files

export const MOCK_USERS = [
    { id: 1, name: 'Juan Dela Cruz', email: 'juan@tmis.com', role: 'Manager', status: 'Active', lastLogin: '2026-02-11 10:30 AM', createdAt: '2026-01-15' },
    { id: 2, name: 'Maria Santos', email: 'maria@tmis.com', role: 'Cashier', status: 'Active', lastLogin: '2026-02-11 09:15 AM', createdAt: '2026-01-20' },
    { id: 3, name: 'Pedro Reyes', email: 'pedro@tmis.com', role: 'InventoryClerk', status: 'Inactive', lastLogin: '2026-02-10 03:45 PM', createdAt: '2026-01-25' },
    { id: 4, name: 'Ana Garcia', email: 'ana@tmis.com', role: 'Manager', status: 'Active', lastLogin: '2026-02-11 08:20 AM', createdAt: '2026-01-18' },
    { id: 5, name: 'Carlos Mendoza', email: 'carlos@tmis.com', role: 'Cashier', status: 'Active', lastLogin: '2026-02-09 05:00 PM', createdAt: '2026-02-01' },
];

export const MOCK_ROLES = [
    { id: 1, name: 'SuperAdmin', permissions: 25, description: 'Full system access' },
    { id: 2, name: 'SystemAdmin', permissions: 18, description: 'User and configuration management' },
    { id: 3, name: 'Manager', permissions: 12, description: 'Store operations and inventory' },
    { id: 4, name: 'Cashier', permissions: 5, description: 'Point of sale access' },
    { id: 5, name: 'InventoryClerk', permissions: 4, description: 'Inventory management' },
];

export const ALL_PERMISSIONS = [
    'view_dashboard', 'manage_users', 'manage_roles', 'view_inventory', 'manage_inventory',
    'process_transactions', 'view_pos', 'view_reports', 'manage_security', 'database_admin',
    'system_settings', 'audit_logs', 'backup_restore', 'user_activity', 'role_permissions'
];

export const MOCK_AUDIT_LOGS = [
    { id: 1, action: 'User Login', user: 'juan@tmis.com', timestamp: '2026-02-11 10:30 AM', status: 'Success', details: 'Login from IP: 192.168.1.100' },
    { id: 2, action: 'User Created', user: 'admin@tmis.com', timestamp: '2026-02-11 09:45 AM', status: 'Success', details: 'Created user: Maria Santos' },
    { id: 3, action: 'Role Modified', user: 'admin@tmis.com', timestamp: '2026-02-11 09:20 AM', status: 'Success', details: 'Modified Manager role permissions' },
    { id: 4, action: 'Failed Login', user: 'unknown@tmis.com', timestamp: '2026-02-11 08:50 AM', status: 'Error', details: 'Invalid password attempt' },
    { id: 5, action: 'User Deactivated', user: 'admin@tmis.com', timestamp: '2026-02-10 03:30 PM', status: 'Success', details: 'Deactivated user: Pedro Reyes' },
];

// Admin chart data for manager/admin dashboards
export const SALES_DATA = [
    { month: 'Jan', sales: 4000, revenue: 2400 },
    { month: 'Feb', sales: 3000, revenue: 1398 },
    { month: 'Mar', sales: 2000, revenue: 9800 },
    { month: 'Apr', sales: 2780, revenue: 3908 },
    { month: 'May', sales: 1890, revenue: 4800 },
    { month: 'Jun', sales: 2390, revenue: 3800 },
];

export const CATEGORY_DATA = [
    { name: 'Electronics', value: 35 },
    { name: 'Clothing', value: 25 },
    { name: 'Food', value: 20 },
    { name: 'Other', value: 20 },
];

export const INVENTORY_ALERTS = [
    { id: 1, product: 'Item A', stock: 5, threshold: 10, status: 'Low' },
    { id: 2, product: 'Item B', stock: 2, threshold: 5, status: 'Critical' },
    { id: 3, product: 'Item C', stock: 15, threshold: 20, status: 'Low' },
];

export const COLORS = ['#18181b', '#52525b', '#a1a1aa', '#e4e4e7'];
