"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService } from "@/lib/auth";
import { getRoleRoute } from "@/lib/roleRoutes";
import { UserRole } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: string[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkAccess = () => {
            try {
                const user = authService.getUser();
                console.log('[RoleGuard] User from auth:', user);
                console.log('[RoleGuard] Allowed Roles:', allowedRoles);

                if (!user) {
                    console.log('[RoleGuard] No user found, redirecting to login');
                    router.push("/login");
                    return;
                }

                // Get the user's actual role from localStorage
                const userRole = user.role;
                console.log('[RoleGuard] User Role:', userRole);
                
                // Check if user's role is in allowedRoles (case-insensitive)
                const hasAccess = allowedRoles.some(
                    (role) => role.toLowerCase() === userRole.toLowerCase()
                );

                console.log('[RoleGuard] Has Access:', hasAccess);

                if (!hasAccess) {
                    // User doesn't have access to this page, redirect to their dashboard
                    const roleMap: Record<string, UserRole> = {
                        'SuperAdmin': UserRole.SUPER_ADMIN,
                        'SystemAdmin': UserRole.SYSTEM_ADMIN,
                        'Manager': UserRole.MANAGER,
                        'Cashier': UserRole.CASHIER,
                        'InventoryClerk': UserRole.INVENTORY_CLERK,
                    };

                    const userEnumRole = roleMap[userRole];
                    console.log('[RoleGuard] Mapped Role:', userEnumRole);
                    
                    if (userEnumRole) {
                        const userDashboard = getRoleRoute(userEnumRole);
                        console.log('[RoleGuard] Redirecting to:', userDashboard);
                        router.push(userDashboard);
                    } else {
                        console.log('[RoleGuard] Role not found in map, redirecting to login');
                        router.push("/login");
                    }
                    return;
                }

                console.log('[RoleGuard] Access granted, showing page');
                setAuthorized(true);
            } finally {
                setIsChecking(false);
            }
        };

        checkAccess();
    }, []);

    if (isChecking || !authorized) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md space-y-4">
                    <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                    <Skeleton className="h-4 w-3/4 mx-auto" />
                    <div className="space-y-3">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
                <p className="mt-6 text-muted-foreground">Verifying access...</p>
            </div>
        );
    }

    return <>{children}</>;
}
