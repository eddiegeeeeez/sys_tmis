'use client';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/contexts/UserContext';
import { authService } from '@/lib/auth';
import { getRoleConfig } from '@/lib/roleConfig';

/**
 * useAdminNavigation Hook
 * 
 * Provides shared navigation logic for all admin pages (SuperAdmin, Admin, Manager, Cashier)
 * Eliminates code duplication across multiple admin page files
 * 
 * @returns Object containing:
 *   - currentRole: User's current role from context
 *   - handleLogout: Function to logout and redirect to login
 *   - handleNavigate: Function to navigate to admin routes using role-based config
 * 
 * @example
 * const { currentRole, handleLogout, handleNavigate } = useAdminNavigation();
 */
export function useAdminNavigation() {
    const router = useRouter();
    const { currentRole } = useUser();

    const handleLogout = () => {
        authService.logout();
        router.push('/login');
    };

    const handleNavigate = (viewId: string) => {
        const roleConfig = getRoleConfig(currentRole);
        
        // Look for matching nav item
        const navItem = roleConfig.navItems.find(item => item.id === viewId);
        if (navItem) {
            router.push(navItem.route);
            return;
        }

        // Look for matching quick action
        const quickAction = roleConfig.quickActions.find(action => action.id === viewId);
        if (quickAction) {
            router.push(quickAction.route);
            return;
        }

        // Fallback to role's default dashboard
        const defaultItem = roleConfig.navItems[0];
        if (defaultItem) {
            router.push(defaultItem.route);
        }
    };

    return {
        currentRole,
        handleLogout,
        handleNavigate,
    };
}
