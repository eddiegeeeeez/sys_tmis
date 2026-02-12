import { UserRole } from '@/types';

/**
 * Maps UserRole enum to their dashboard routes
 */
export const ROLE_ROUTES: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: '/super-admin',
    [UserRole.SYSTEM_ADMIN]: '/admin',
    [UserRole.MANAGER]: '/manager',
    [UserRole.CASHIER]: '/cashier',
    [UserRole.INVENTORY_CLERK]: '/inventory',
};

/**
 * Gets the dashboard route for a specific role
 */
export function getRoleRoute(role: UserRole): string {
    return ROLE_ROUTES[role] || '/dashboard';
}

/**
 * Checks if a route belongs to a specific role
 */
export function isRoleRoute(route: string, role: UserRole): boolean {
    return route === ROLE_ROUTES[role];
}

/**
 * Gets the role from a route path
 */
export function getRoleFromRoute(pathname: string): UserRole | null {
    for (const [role, route] of Object.entries(ROLE_ROUTES)) {
        if (pathname.startsWith(route)) {
            return role as UserRole;
        }
    }
    return null;
}
