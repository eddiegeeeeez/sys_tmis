export enum UserRole {
    SUPER_ADMIN = 'SuperAdmin',
    SYSTEM_ADMIN = 'SystemAdmin',
    MANAGER = 'Manager',
    CASHIER = 'Cashier',
    INVENTORY_CLERK = 'InventoryClerk',
}

export interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    sku: string;
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
    status: 'Active' | 'Inactive';
    lastLogin?: string;
}

export interface Transaction {
    id: string;
    date: string;
    total: number;
    status: 'Completed' | 'Refunded';
}

export interface AuditLog {
    id: number;
    action: string;
    user: string;
    time: string;
    status: 'Success' | 'Warning' | 'Error';
}
