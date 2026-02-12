"use client";
import React from 'react';
import RoleGuard from "@/components/auth/role-guard";
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield, Settings, Database, Activity } from 'lucide-react';
import { useAdminNavigation } from '@/lib/hooks/useAdminNavigation';
import { QuickActionsCard } from '@/components/QuickActionsCard';
import { MOCK_USERS, MOCK_ROLES } from '@/lib/mocks';

export default function SuperAdminPage() {
    const { currentRole, handleLogout, handleNavigate } = useAdminNavigation();

    return (
        <RoleGuard allowedRoles={["SuperAdmin"]}>
            <DashboardLayout
                currentRole={currentRole}
                activeView="dashboard"
                onNavigate={handleNavigate}
                onLogout={handleLogout}
            >
                <div className="space-y-8 pb-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-foreground">Super Admin Dashboard</h2>
                            <p className="text-muted-foreground mt-1">Full system control, manage users, roles, security, and configuration.</p>
                        </div>
                    </div>

                    {/* Dashboard Overview */}
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card className="border-border hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold tracking-tight text-foreground">{MOCK_USERS.length}</div>
                                    <p className="text-xs text-muted-foreground mt-1">System registered users</p>
                                </CardContent>
                            </Card>

                            <Card className="border-border hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Roles</CardTitle>
                                    <Shield className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold tracking-tight text-foreground">{MOCK_ROLES.length}</div>
                                    <p className="text-xs text-muted-foreground mt-1">System-defined roles</p>
                                </CardContent>
                            </Card>

                            <Card className="border-border hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Sessions</CardTitle>
                                    <Activity className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold tracking-tight text-foreground">7</div>
                                    <p className="text-xs text-muted-foreground mt-1">Current logged-in users</p>
                                </CardContent>
                            </Card>

                            <Card className="border-border hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Database Size</CardTitle>
                                    <Database className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold tracking-tight text-foreground">1.24 GB</div>
                                    <p className="text-xs text-muted-foreground mt-1">Total database storage</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Actions */}
                        <QuickActionsCard role={currentRole} onNavigate={handleNavigate} />
                    </div>
                </div>
            </DashboardLayout>
        </RoleGuard>
    );
}

