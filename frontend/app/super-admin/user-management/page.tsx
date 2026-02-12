"use client";
import React, { useState, useMemo } from 'react';
import RoleGuard from "@/components/auth/role-guard";
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Edit2, Trash2, Plus, ArrowUpDown, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAdminNavigation } from '@/lib/hooks/useAdminNavigation';
import { MOCK_USERS } from '@/lib/mocks';

export default function UserManagementPage() {
    const { currentRole, handleLogout, handleNavigate } = useAdminNavigation();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredUsers = useMemo(() => {
        let filtered = MOCK_USERS.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        filtered.sort((a, b) => {
            const aValue = a[sortConfig.key as keyof typeof a];
            const bValue = b[sortConfig.key as keyof typeof b];
            
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        
        return filtered;
    }, [searchTerm, sortConfig]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredUsers, currentPage]);

    const handleSort = (key: string) => {
        setSortConfig({
            key,
            direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
        });
    };

    return (
        <RoleGuard allowedRoles={["SuperAdmin"]}>
            <DashboardLayout
                currentRole={currentRole}
                activeView="admin-users"
                onNavigate={handleNavigate}
                onLogout={handleLogout}
            >
                <div className="space-y-6 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-medium text-foreground">User Management</h3>
                            <p className="text-sm text-muted-foreground">Manage user accounts, permissions, and access levels.</p>
                        </div>
                        <Button className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Create User
                        </Button>
                    </div>

                    <div className="space-y-3">
                        <div className="px-1">
                            <h4 className="text-sm font-semibold text-foreground">Users List</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">View and manage all registered users</p>
                        </div>
                        
                        <Card className="border-border shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                        <thead className="bg-muted/50 border-b border-border">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground cursor-pointer hover:bg-muted select-none transition-colors" onClick={() => handleSort('name')}>
                                                    <div className="flex items-center gap-1">Name<ArrowUpDown className="w-3.5 h-3.5 opacity-50" /></div>
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground cursor-pointer hover:bg-muted select-none transition-colors" onClick={() => handleSort('email')}>
                                                    <div className="flex items-center gap-1">Email<ArrowUpDown className="w-3.5 h-3.5 opacity-50" /></div>
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground cursor-pointer hover:bg-muted select-none transition-colors" onClick={() => handleSort('role')}>
                                                    <div className="flex items-center gap-1">Role<ArrowUpDown className="w-3.5 h-3.5 opacity-50" /></div>
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {paginatedUsers.map((user) => (
                                                <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm font-medium text-foreground">{user.name}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm text-muted-foreground">{user.email}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-muted text-foreground">{user.role}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${user.status === 'Active' ? 'text-emerald-700' : 'text-muted-foreground'}`}>
                                                            {user.status === 'Active' ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                                                            {user.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex justify-end gap-1">
                                                            <button className="p-1.5 hover:bg-muted rounded transition-colors" title="Edit user">
                                                                <Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                                                            </button>
                                                            <button className="p-1.5 hover:bg-red-50 rounded transition-colors" title="Delete user">
                                                                <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                        </Card>
                        
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-1">
                                <p className="text-xs text-muted-foreground">
                                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} results
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
