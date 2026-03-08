// Standard System Roles
export const UserRole = {
  SUPER_ADMIN: 'SuperAdmin',
  MANAGER: 'Manager',
  CASHIER: 'Cashier',
  INVENTORY_CLERK: 'InventoryClerk',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole] | string;

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sku: string;
  reorderLevel: number;
  unitOfMeasure: string;
  image?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive?: boolean;
  isArchived?: boolean;
  status?: 'Active' | 'Inactive';
  lastLogin?: string;
}

export interface SystemSetting {
  key: string;
  value: string;
  description: string;
  group: string;
  updatedAt: string;
}

export interface PurchaseOrder {
  PurchaseOrderID: string;
  PONumber: string;
  SupplierName: string;
  OrderDate: string;
  ExpectedDeliveryDate: string;
  TotalAmount: number;
  Status: 'Pending' | 'Approved' | 'Received' | 'Cancelled';
}

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string;
  isSystemRole: boolean;
  isArchived: boolean;
  createdAt?: string;
}

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

export const ALL_PERMISSIONS = [
  'view_dashboard', 'manage_users', 'manage_roles', 'view_inventory', 'manage_inventory',
  'view_pos', 'process_transactions', 'view_reports', 'manage_settings', 'view_audit_logs',
  'manage_database', 'manage_employees', 'process_payroll', 'manage_suppliers', 'manage_customers'
];