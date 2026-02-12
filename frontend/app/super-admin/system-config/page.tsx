"use client";
import React from 'react';
import RoleGuard from "@/components/auth/role-guard";
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, CheckCircle } from 'lucide-react';
import { useAdminNavigation } from '@/lib/hooks/useAdminNavigation';
import { MOCK_USERS } from '@/lib/mocks';

export default function SystemConfigPage() {
    const { currentRole, handleLogout, handleNavigate } = useAdminNavigation();

    return (
        <RoleGuard allowedRoles={["SuperAdmin"]}>
            <DashboardLayout
                currentRole={currentRole}
                activeView="admin-config"
                onNavigate={handleNavigate}
                onLogout={handleLogout}
            >
                <div className="space-y-6 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div>
                        <h3 className="text-lg font-medium text-zinc-900">System Configuration</h3>
                        <p className="text-sm text-zinc-500">Configure system settings and security parameters.</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="border-zinc-200 shadow-sm">
                            <CardHeader className="border-b border-zinc-100">
                                <CardTitle className="text-base text-zinc-900">Security Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-900">Session Timeout (minutes)</label>
                                    <Input type="number" defaultValue="30" className="border-zinc-200" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-900">Password Expiry (days)</label>
                                    <Input type="number" defaultValue="90" className="border-zinc-200" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-900">Max Login Attempts</label>
                                    <Input type="number" defaultValue="5" className="border-zinc-200" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-900">Lockout Duration (minutes)</label>
                                    <Input type="number" defaultValue="15" className="border-zinc-200" />
                                </div>
                                <Button className="w-full">Save Settings</Button>
                            </CardContent>
                        </Card>

                        <Card className="border-zinc-200 shadow-sm">
                            <CardHeader className="border-b border-zinc-100">
                                <CardTitle className="text-base text-zinc-900">System Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-6">
                                <div className="flex justify-between items-center p-3 bg-zinc-50/50 rounded border border-zinc-100">
                                    <span className="text-sm text-zinc-600">Application Version</span>
                                    <span className="text-sm font-semibold text-zinc-900">1.0.0</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-zinc-50/50 rounded border border-zinc-100">
                                    <span className="text-sm text-zinc-600">Database Connection</span>
                                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
                                        <Check className="w-3 h-3" />
                                        Connected
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-zinc-50/50 rounded border border-zinc-100">
                                    <span className="text-sm text-zinc-600">Registered Users</span>
                                    <span className="text-sm font-semibold text-zinc-900">{MOCK_USERS.length}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-zinc-50/50 rounded border border-zinc-100">
                                    <span className="text-sm text-zinc-600">System Status</span>
                                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
                                        <CheckCircle className="w-3 h-3" />
                                        Operational
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </DashboardLayout>
        </RoleGuard>
    );
}
