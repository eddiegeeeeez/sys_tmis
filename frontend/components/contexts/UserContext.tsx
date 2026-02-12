"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { UserRole } from '@/types';
import { authService } from '@/lib/auth';

interface UserContextType {
    currentRole: UserRole;
    setCurrentRole: (role: UserRole) => void;
    isLoaded: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Map role string to UserRole enum
const mapRoleToEnum = (roleString: string): UserRole => {
    const roleMap: Record<string, UserRole> = {
        'SuperAdmin': UserRole.SUPER_ADMIN,
        'SystemAdmin': UserRole.SYSTEM_ADMIN,
        'Manager': UserRole.MANAGER,
        'Cashier': UserRole.CASHIER,
        'InventoryClerk': UserRole.INVENTORY_CLERK,
    };
    return roleMap[roleString] || UserRole.MANAGER;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.MANAGER);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Initialize role from authenticated user on mount and on storage changes
        const initializeRole = () => {
            const user = authService.getUser();
            console.log('[UserContext] Initializing role, user from auth:', user);
            
            if (user && user.role) {
                const mappedRole = mapRoleToEnum(user.role);
                console.log('[UserContext] Mapped role:', mappedRole, 'from:', user.role);
                setCurrentRole(mappedRole);
            } else {
                // If no user, keep default but mark as loaded
                console.log('[UserContext] No user found, using default MANAGER role');
                setCurrentRole(UserRole.MANAGER);
            }
            setIsLoaded(true);
        };

        // Initialize on mount
        initializeRole();

        // Listen for storage changes (for logout from other tabs)
        const handleStorageChange = (e: StorageEvent) => {
            console.log('[UserContext] Storage change detected:', e.key);
            if (e.key === 'tmis_user' || e.key === null) {
                initializeRole();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return (
        <UserContext.Provider value={{ currentRole, setCurrentRole, isLoaded }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
