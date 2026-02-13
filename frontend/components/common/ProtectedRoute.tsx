import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
    currentRole: UserRole;
    isLoggedIn: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles,
    currentRole,
    isLoggedIn
}) => {
    const location = useLocation();

    if (!isLoggedIn) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(currentRole)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
};
