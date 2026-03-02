import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const routeToTitleMap: Record<string, string> = {
    '/': 'TradeMatrix - Internal System',
    '/login': 'Login - TradeMatrix',
    '/dashboard': 'Dashboard - TradeMatrix',
    '/pos': 'Point of Sale - TradeMatrix',
    '/inventory': 'Inventory Management - TradeMatrix',
    '/procurement': 'Procurement - TradeMatrix',
    '/hr': 'Human Resources - TradeMatrix',
    '/crm': 'CRM - TradeMatrix',
    '/finance': 'Finance & Accounting - TradeMatrix',
    '/admin/users': 'User Management - TradeMatrix Admin',
    '/admin/roles': 'Role Management - TradeMatrix Admin',
    '/admin/db': 'Database Administration - TradeMatrix Admin',
    '/admin/security': 'Audit Logs - TradeMatrix Admin',
    '/unauthorized': 'Unauthorized Access - TradeMatrix'
};

export const PageTitle = () => {
    const location = useLocation();

    useEffect(() => {
        let title = 'TradeMatrix';

        // Exact match
        if (routeToTitleMap[location.pathname]) {
            title = routeToTitleMap[location.pathname];
        }
        // Handle dynamic routes like /admin/roles/edit/SuperAdmin
        else if (location.pathname.startsWith('/admin/roles/edit/')) {
            const roleName = location.pathname.split('/').pop() || '';
            title = `Edit Permissions: ${decodeURIComponent(roleName)} - TradeMatrix Admin`;
        }

        document.title = title;
    }, [location]);

    return null; // This component doesn't render anything visually
};
