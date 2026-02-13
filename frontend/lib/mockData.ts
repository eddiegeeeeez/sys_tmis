import { User, UserRole, Employee, PayrollRecord, Attendance, Supplier, PurchaseOrder, Customer, Expense } from '../types';

// --- Existing User Data ---
export const MOCK_USERS: User[] = [
  { id: '1', name: 'Pamela Mendoza', email: 'pamela@tradematrix.com', role: UserRole.SUPER_ADMIN, status: 'Active', lastLogin: 'Just now' },
  { id: '2', name: 'System Admin', email: 'admin@tradematrix.com', role: UserRole.SYSTEM_ADMIN, status: 'Active', lastLogin: '2 hours ago' },
  { id: '3', name: 'John Smith', email: 'john.s@tradematrix.com', role: UserRole.MANAGER, status: 'Active', lastLogin: 'Yesterday' },
  { id: '4', name: 'Sarah Connor', email: 'sarah.c@tradematrix.com', role: UserRole.CASHIER, status: 'Active', lastLogin: 'Today 9:00 AM' },
  { id: '5', name: 'Michael Chen', email: 'm.chen@tradematrix.com', role: UserRole.INVENTORY_CLERK, status: 'Inactive', lastLogin: '3 days ago' },
  { id: '6', name: 'Jessica Wu', email: 'jessica.w@tradematrix.com', role: UserRole.CASHIER, status: 'Active', lastLogin: '1 hour ago' },
];

// --- Simple Audit Logs (Deprecated for Security Page, kept for legacy if needed) ---
export const AUDIT_LOGS = [
  { id: 1, action: 'System Backup', user: 'System', time: '10:00 AM', status: 'Success' },
  { id: 2, action: 'Failed Login Attempt', user: 'Unknown (192.168.1.55)', time: '09:45 AM', status: 'Warning' },
  { id: 3, action: 'Role Updated: Cashier', user: 'Pamela Mendoza', time: 'Yesterday', status: 'Success' },
  { id: 4, action: 'Database Migration', user: 'Pamela Mendoza', time: '2 days ago', status: 'Success' },
];

// --- Enterprise Audit Logs ---
export interface LogEntry {
    id: string;
    timestamp: string;
    actor: { name: string; email: string; ip: string };
    event: string;
    resource: string;
    status: 'Success' | 'Failure' | 'Warning';
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    metadata: Record<string, any>;
}

export const EXTENDED_AUDIT_LOGS: LogEntry[] = [
    {
        id: 'evt_1029384756',
        timestamp: '2023-10-26T10:42:15Z',
        actor: { name: 'Pamela Mendoza', email: 'pamela@tradematrix.com', ip: '192.168.1.45' },
        event: 'auth.login.success',
        resource: 'System',
        status: 'Success',
        severity: 'Low',
        metadata: { method: 'MFA', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', session_id: 'sess_998877' }
    },
    {
        id: 'evt_1029384757',
        timestamp: '2023-10-26T10:45:00Z',
        actor: { name: 'Pamela Mendoza', email: 'pamela@tradematrix.com', ip: '192.168.1.45' },
        event: 'iam.role.update',
        resource: 'User: Sarah Connor',
        status: 'Success',
        severity: 'High',
        metadata: { previous_role: 'Cashier', new_role: 'Manager', reason: 'Promotion' }
    },
    {
        id: 'evt_1029384758',
        timestamp: '2023-10-26T09:15:22Z',
        actor: { name: 'Unknown', email: 'unknown', ip: '45.33.22.11' },
        event: 'auth.login.failed',
        resource: 'System',
        status: 'Failure',
        severity: 'Medium',
        metadata: { reason: 'Invalid Password', attempts: 3, country: 'Russia' }
    },
    {
        id: 'evt_1029384759',
        timestamp: '2023-10-25T16:30:00Z',
        actor: { name: 'System', email: 'system@internal', ip: 'localhost' },
        event: 'db.backup.complete',
        resource: 'Primary Database',
        status: 'Success',
        severity: 'Low',
        metadata: { size: '1.24 GB', duration: '4m 32s', location: 's3://backups/daily' }
    },
    {
        id: 'evt_1029384760',
        timestamp: '2023-10-25T14:20:10Z',
        actor: { name: 'John Smith', email: 'john.s@tradematrix.com', ip: '192.168.1.102' },
        event: 'finance.payroll.execute',
        resource: 'Payroll: Oct 1-15',
        status: 'Warning',
        severity: 'High',
        metadata: { total_amount: 15420.00, employees_count: 12, flagged_items: 1 }
    },
    {
        id: 'evt_1029384761',
        timestamp: '2023-10-25T11:05:00Z',
        actor: { name: 'Sarah Connor', email: 'sarah.c@tradematrix.com', ip: '192.168.1.105' },
        event: 'inventory.stock.adjust',
        resource: 'Product: SKU-001',
        status: 'Success',
        severity: 'Medium',
        metadata: { previous_stock: 45, new_stock: 42, reason: 'Damaged Goods' }
    },
    {
        id: 'evt_1029384762',
        timestamp: '2023-10-24T09:00:00Z',
        actor: { name: 'Pamela Mendoza', email: 'pamela@tradematrix.com', ip: '192.168.1.45' },
        event: 'config.settings.update',
        resource: 'Global Settings',
        status: 'Success',
        severity: 'Critical',
        metadata: { setting: 'tax_rate', old_value: '10.0', new_value: '12.0' }
    },
    {
        id: 'evt_1029384763',
        timestamp: '2023-10-24T08:55:00Z',
        actor: { name: 'System Admin', email: 'admin@tradematrix.com', ip: '192.168.1.46' },
        event: 'user.create',
        resource: 'User: Michael Chen',
        status: 'Success',
        severity: 'Medium',
        metadata: { assigned_role: 'Inventory Clerk', created_by: 'admin' }
    }
];

export const ROLES_LIST = [
  { name: 'Super Admin', users: 1, desc: 'Full system access with developer tools.' },
  { name: 'System Admin', users: 2, desc: 'Manage configurations and users.' },
  { name: 'Manager', users: 5, desc: 'Store operations, inventory and reports.' },
  { name: 'Cashier', users: 12, desc: 'POS access and basic stock check.' },
  { name: 'Inventory Clerk', users: 3, desc: 'Stock management and receiving.' },
];

export const ALL_PERMISSIONS = [
  'view_dashboard', 'manage_users', 'manage_roles', 'view_inventory', 'manage_inventory',
  'view_pos', 'process_transactions', 'view_reports', 'manage_settings', 'view_audit_logs',
  'manage_database', 'manage_employees', 'process_payroll', 'manage_suppliers', 'manage_customers'
];

// --- New Mock Data for HR ---
export const MOCK_EMPLOYEES: Employee[] = [
  { EmployeeID: 'EMP001', FirstName: 'John', LastName: 'Smith', Position: 'Store Manager', Department: 'Operations', Email: 'john.s@tm.com', ContactNumber: '555-0101', EmploymentStatus: 'Full-time', BasicSalary: 4500.00, HireDate: '2023-01-15' },
  { EmployeeID: 'EMP002', FirstName: 'Sarah', LastName: 'Connor', Position: 'Cashier', Department: 'Sales', Email: 'sarah.c@tm.com', ContactNumber: '555-0102', EmploymentStatus: 'Full-time', BasicSalary: 2500.00, HireDate: '2023-03-10' },
  { EmployeeID: 'EMP003', FirstName: 'Michael', LastName: 'Chen', Position: 'Inventory Clerk', Department: 'Warehouse', Email: 'm.chen@tm.com', ContactNumber: '555-0103', EmploymentStatus: 'Contract', BasicSalary: 2200.00, HireDate: '2023-06-01' },
];

export const MOCK_PAYROLL: PayrollRecord[] = [
  { PayrollID: 'PR-2023-10-A', EmployeeName: 'John Smith', PayPeriodStart: '2023-10-01', PayPeriodEnd: '2023-10-15', BasicSalary: 2250.00, GrossPay: 2250.00, TotalDeductions: 250.00, NetPay: 2000.00, Status: 'Paid' },
  { PayrollID: 'PR-2023-10-B', EmployeeName: 'Sarah Connor', PayPeriodStart: '2023-10-01', PayPeriodEnd: '2023-10-15', BasicSalary: 1250.00, GrossPay: 1350.00, TotalDeductions: 150.00, NetPay: 1200.00, Status: 'Approved' },
];

export const MOCK_ATTENDANCE: Attendance[] = [
  { AttendanceID: 'ATT-001', EmployeeName: 'Sarah Connor', Date: '2023-10-25', TimeIn: '08:55 AM', TimeOut: '05:00 PM', Status: 'Present' },
  { AttendanceID: 'ATT-002', EmployeeName: 'Michael Chen', Date: '2023-10-25', TimeIn: '09:15 AM', TimeOut: '05:00 PM', Status: 'Late' },
];

// --- New Mock Data for Procurement ---
export const MOCK_SUPPLIERS: Supplier[] = [
  { SupplierID: 'SUP-001', SupplierName: 'TechGizmos Inc.', ContactPerson: 'Alice Wonder', ContactNumber: '555-9999', Email: 'sales@techgizmos.com' },
  { SupplierID: 'SUP-002', SupplierName: 'Global Apparel Co.', ContactPerson: 'Bob Builder', ContactNumber: '555-8888', Email: 'orders@globalapparel.com' },
];

export const MOCK_PO: PurchaseOrder[] = [
  { PurchaseOrderID: '1', PONumber: 'PO-2023-001', SupplierName: 'TechGizmos Inc.', OrderDate: '2023-10-20', ExpectedDeliveryDate: '2023-10-30', TotalAmount: 15000.00, Status: 'Pending' },
  { PurchaseOrderID: '2', PONumber: 'PO-2023-002', SupplierName: 'Global Apparel Co.', OrderDate: '2023-10-15', ExpectedDeliveryDate: '2023-10-25', TotalAmount: 5400.00, Status: 'Received' },
];

// --- New Mock Data for CRM ---
export const MOCK_CUSTOMERS: Customer[] = [
  { CustomerID: 'CUST-001', CustomerName: 'Jane Doe', CustomerType: 'Retail', ContactNumber: '555-1234', LoyaltyPoints: 150 },
  { CustomerID: 'CUST-002', CustomerName: 'Acme Corp', CustomerType: 'Corporate', ContactNumber: '555-5678', LoyaltyPoints: 5000 },
];

// --- New Mock Data for Finance ---
export const MOCK_EXPENSES: Expense[] = [
  { ExpenseID: 'EXP-001', ExpenseCategory: 'Utilities', Description: 'October Electricity Bill', Amount: 450.00, ExpenseDate: '2023-10-01', Status: 'Paid' },
  { ExpenseID: 'EXP-002', ExpenseCategory: 'Supplies', Description: 'Office Paper & Ink', Amount: 120.00, ExpenseDate: '2023-10-05', Status: 'Approved' },
];