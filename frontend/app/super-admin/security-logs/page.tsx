"use client";
import React, { useState, useMemo } from 'react';
import RoleGuard from "@/components/auth/role-guard";
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { useAdminNavigation } from '@/lib/hooks/useAdminNavigation';
import { MOCK_AUDIT_LOGS } from '@/lib/mocks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';



export default function SecurityLogsPage() {
    const { currentRole, handleLogout, handleNavigate } = useAdminNavigation();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const totalPages = Math.ceil(MOCK_AUDIT_LOGS.length / itemsPerPage);
    const paginatedLogs = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return MOCK_AUDIT_LOGS.slice(startIndex, startIndex + itemsPerPage);
    }, [currentPage]);

    return (
        <RoleGuard allowedRoles={["SuperAdmin"]}>
            <DashboardLayout
                currentRole={currentRole}
                activeView="admin-security"
                onNavigate={handleNavigate}
                onLogout={handleLogout}
            >
                <div className="space-y-6 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div>
                        <h3 className="text-lg font-medium text-zinc-900">Security & Audit Logs</h3>
                        <p className="text-sm text-zinc-500">View system activity and user actions.</p>
                    </div>

                    <div className="space-y-3">
                        <div className="px-1">
                            <h4 className="text-sm font-semibold text-zinc-900">Recent Activity</h4>
                            <p className="text-xs text-zinc-500 mt-0.5">System audit logs and user actions</p>
                        </div>
                        
                        <Card className="border-zinc-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                        <thead className="bg-zinc-50/80 border-b border-zinc-200">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600">Action</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600">User</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600">Timestamp</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600">Status</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600">Details</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100">
                                            {paginatedLogs.map((log) => (
                                                <tr key={log.id} className="hover:bg-zinc-50/70 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm font-medium text-zinc-900">{log.action}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm text-zinc-600">{log.user}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-xs text-zinc-500">{log.timestamp}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${log.status === 'Success' ? 'text-emerald-700' : 'text-red-700'}`}>
                                                            {log.status === 'Success' ? <Check className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                                                            {log.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-xs text-zinc-500">{log.details}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                        </Card>
                        
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-1">
                                <p className="text-xs text-zinc-500">
                                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, MOCK_AUDIT_LOGS.length)} of {MOCK_AUDIT_LOGS.length} results
                                </p>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="h-8 w-8 p-0"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <Button
                                            key={page}
                                            variant={currentPage === page ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setCurrentPage(page)}
                                            className="h-8 w-8 p-0"
                                        >
                                            {page}
                                        </Button>
                                    ))}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="h-8 w-8 p-0"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        </RoleGuard>
    );
}
