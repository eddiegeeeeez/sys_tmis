import { UserRole } from '@/types';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    Shield,
    Settings,
    Database,
    Lock,
    LucideIcon,
} from 'lucide-react';

export interface NavItem {
    id: string;
    label: string;
    icon: LucideIcon;
    route: string;
}

export interface QuickAction {
    id: string;
    label: string;
    icon: LucideIcon;
    route: string;
    description?: string;
}

export interface RoleConfig {
    role: UserRole;
    navItems: NavItem[];
    quickActions: QuickAction[];
    displayName: string;
}

/**
 * Role-based configuration for navigation and quick actions
 * Defines what each role can access throughout the application
 */
export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
    [UserRole.SUPER_ADMIN]: {
        role: UserRole.SUPER_ADMIN,
        displayName: 'Super Administrator',
        navItems: [
            {
                id: 'dashboard',
                label: 'Overview',
                icon: LayoutDashboard,
                route: '/super-admin',
            },
            {
                id: 'admin-users',
                label: 'User Management',
                icon: Users,
                route: '/super-admin/user-management',
            },
            {
                id: 'admin-roles',
                label: 'Role Management',
                icon: Shield,
                route: '/super-admin/role-management',
            },
            {
                id: 'admin-config',
                label: 'System Config',
                icon: Settings,
                route: '/super-admin/system-config',
            },
            {
                id: 'admin-db',
                label: 'Database Admin',
                icon: Database,
                route: '/super-admin/database-admin',
            },
            {
                id: 'admin-security',
                label: 'Security & Logs',
                icon: Lock,
                route: '/super-admin/security-logs',
            },
        ],
        quickActions: [
            {
                id: 'manage-users',
                label: 'Manage Users',
                icon: Users,
                route: '/super-admin/user-management',
                description: 'Add, edit, and manage system users',
            },
            {
                id: 'manage-roles',
                label: 'Manage Roles',
                icon: Shield,
                route: '/super-admin/role-management',
                description: 'Configure user roles and permissions',
            },
            {
                id: 'system-config',
                label: 'System Config',
                icon: Settings,
                route: '/super-admin/system-config',
                description: 'Configure system settings',
            },
            {
                id: 'database-admin',
                label: 'Database Admin',
                icon: Database,
                route: '/super-admin/database-admin',
                description: 'Manage database backups and maintenance',
            },
            {
                id: 'security-logs',
                label: 'Security & Logs',
                icon: Lock,
                route: '/super-admin/security-logs',
                description: 'View audit trails and security logs',
            },
        ],
    },

    [UserRole.SYSTEM_ADMIN]: {
        role: UserRole.SYSTEM_ADMIN,
        displayName: 'System Administrator',
        navItems: [
            {
                id: 'dashboard',
                label: 'Overview',
                icon: LayoutDashboard,
                route: '/admin',
            },
            {
                id: 'admin-users',
                label: 'User Management',
                icon: Users,
                route: '/admin/user-management',
            },
            {
                id: 'admin-roles',
                label: 'Role Management',
                icon: Shield,
                route: '/admin/role-management',
            },
            {
                id: 'admin-config',
                label: 'System Config',
                icon: Settings,
                route: '/admin/system-config',
            },
            {
                id: 'admin-security',
                label: 'Security & Logs',
                icon: Lock,
                route: '/admin/security-logs',
            },
        ],
        quickActions: [
            {
                id: 'manage-users',
                label: 'Manage Users',
                icon: Users,
                route: '/admin/user-management',
                description: 'Add, edit, and manage system users',
            },
            {
                id: 'manage-roles',
                label: 'Manage Roles',
                icon: Shield,
                route: '/admin/role-management',
                description: 'Configure user roles and permissions',
            },
            {
                id: 'system-config',
                label: 'System Config',
                icon: Settings,
                route: '/admin/system-config',
                description: 'Configure system settings',
            },
            {
                id: 'security-logs',
                label: 'Security & Logs',
                icon: Lock,
                route: '/admin/security-logs',
                description: 'View audit trails and security logs',
            },
        ],
    },

    [UserRole.MANAGER]: {
        role: UserRole.MANAGER,
        displayName: 'Manager',
        navItems: [
            {
                id: 'dashboard',
                label: 'Dashboard',
                icon: LayoutDashboard,
                route: '/manager',
            },
            {
                id: 'inventory',
                label: 'Inventory',
                icon: Package,
                route: '/inventory',
            },
            {
                id: 'pos',
                label: 'Point of Sale',
                icon: ShoppingCart,
                route: '/cashier',
            },
        ],
        quickActions: [
            {
                id: 'view-inventory',
                label: 'View Inventory',
                icon: Package,
                route: '/inventory',
                description: 'Check stock levels and products',
            },
            {
                id: 'point-of-sale',
                label: 'Point of Sale',
                icon: ShoppingCart,
                route: '/cashier',
                description: 'Process sales transactions',
            },
        ],
    },

    [UserRole.CASHIER]: {
        role: UserRole.CASHIER,
        displayName: 'Cashier',
        navItems: [
            {
                id: 'pos',
                label: 'Point of Sale',
                icon: ShoppingCart,
                route: '/cashier',
            },
            {
                id: 'inventory-view',
                label: 'Stock Lookup',
                icon: Package,
                route: '/inventory',
            },
        ],
        quickActions: [
            {
                id: 'point-of-sale',
                label: 'Point of Sale',
                icon: ShoppingCart,
                route: '/cashier',
                description: 'Process customer transactions',
            },
            {
                id: 'stock-lookup',
                label: 'Stock Lookup',
                icon: Package,
                route: '/inventory',
                description: 'Check product availability',
            },
        ],
    },

    [UserRole.INVENTORY_CLERK]: {
        role: UserRole.INVENTORY_CLERK,
        displayName: 'Inventory Clerk',
        navItems: [
            {
                id: 'inventory',
                label: 'Inventory',
                icon: Package,
                route: '/inventory',
            },
        ],
        quickActions: [
            {
                id: 'manage-inventory',
                label: 'Manage Inventory',
                icon: Package,
                route: '/inventory',
                description: 'Update stock levels and manage products',
            },
        ],
    },
};

/**
 * Get configuration for a specific role
 */
export function getRoleConfig(role: UserRole): RoleConfig {
    return ROLE_CONFIGS[role];
}

/**
 * Get navigation items for a specific role
 */
export function getRoleNavItems(role: UserRole): NavItem[] {
    return ROLE_CONFIGS[role]?.navItems || [];
}

/**
 * Get quick actions for a specific role
 */
export function getRoleQuickActions(role: UserRole): QuickAction[] {
    return ROLE_CONFIGS[role]?.quickActions || [];
}

/**
 * Get display name for a role
 */
export function getRoleDisplayName(role: UserRole): string {
    return ROLE_CONFIGS[role]?.displayName || role;
}

/**
 * Check if a user has access to a specific view
 */
export function canAccessView(role: UserRole, viewId: string): boolean {
    const config = getRoleConfig(role);
    return config.navItems.some((item) => item.id === viewId);
}

/**
 * Check if a user has access to a specific route
 */
export function canAccessRoute(role: UserRole, route: string): boolean {
    const config = getRoleConfig(role);
    return config.navItems.some((item) => item.route === route);
}
