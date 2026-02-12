"use client";
import React, { useState } from 'react';
import RoleGuard from "@/components/auth/role-guard";
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit2, LayoutGrid, List, Shield, Users, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAdminNavigation } from '@/lib/hooks/useAdminNavigation';
import { MOCK_ROLES } from '@/lib/mocks';
import { Badge } from '@/components/ui/badge';

export default function RoleManagementPage() {
    const { currentRole, handleLogout, handleNavigate } = useAdminNavigation();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const totalPages = Math.ceil(MOCK_ROLES.length / itemsPerPage);
    const paginatedRoles = MOCK_ROLES.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getRoleColor = (roleName: string) => {
        switch (roleName) {
            case 'SuperAdmin':
                return { bg: 'bg-red-50 dark:bg-red-950', border: 'border-red-200 dark:border-red-800', badge: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' };
            case 'SystemAdmin':
                return { bg: 'bg-purple-50 dark:bg-purple-950', border: 'border-purple-200 dark:border-purple-800', badge: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' };
            case 'Manager':
                return { bg: 'bg-blue-50 dark:bg-blue-950', border: 'border-blue-200 dark:border-blue-800', badge: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' };
            case 'Cashier':
                return { bg: 'bg-green-50 dark:bg-green-950', border: 'border-green-200 dark:border-green-800', badge: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' };
            case 'InventoryClerk':
                return { bg: 'bg-amber-50 dark:bg-amber-950', border: 'border-amber-200 dark:border-amber-800', badge: 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200' };
            default:
                return { bg: 'bg-gray-50 dark:bg-gray-950', border: 'border-gray-200 dark:border-gray-800', badge: 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200' };
        }
    };

    const getRoleIcon = (roleName: string) => {
        switch (roleName) {
            case 'SuperAdmin':
            case 'SystemAdmin':
                return Lock;
            case 'Manager':
                return Shield;
            default:
                return Users;
        }
    };

    return (
        <RoleGuard allowedRoles={["SuperAdmin"]}>
            <DashboardLayout
                currentRole={currentRole}
                activeView="admin-roles"
                onNavigate={handleNavigate}
                onLogout={handleLogout}
            >
                <div className="space-y-6 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Header */}
                    <div className="flex justify-between items-start md:items-center gap-4 flex-col md:flex-row">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Role Management</h2>
                            <p className="text-muted-foreground mt-1">Create and manage user roles and permissions.</p>
                        </div>
                        <Button className="flex items-center gap-2 shrink-0">
                            <Plus className="w-4 h-4" />
                            Create Role
                        </Button>
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-1 w-fit">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded transition-all ${
                                viewMode === 'grid'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-accent'
                            }`}
                            title="Grid View"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded transition-all ${
                                viewMode === 'list'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-accent'
                            }`}
                            title="List View"
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Grid View */}
                    {viewMode === 'grid' && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {paginatedRoles.map((role) => {
                                const colors = getRoleColor(role.name);
                                const RoleIcon = getRoleIcon(role.name);
                                const permissionPercent = (role.permissions / 25) * 100;

                                return (
                                    <Card
                                        key={role.id}
                                        className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 ${colors.bg} ${colors.border} group`}
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className={`p-2 rounded-md ${colors.badge}`}>
                                                        <RoleIcon className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <CardTitle className="text-lg">{role.name}</CardTitle>
                                                        <p className="text-xs text-muted-foreground mt-0.5">{role.permissions} permissions</p>
                                                    </div>
                                                </div>
                                                <Badge className={colors.badge} variant="secondary">
                                                    {permissionPercent.toFixed(0)}%
                                                </Badge>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-4">
                                            <p className="text-sm text-muted-foreground">{role.description}</p>

                                            {/* Progress Bar */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span>Permission Level</span>
                                                    <span>{role.permissions}/25</span>
                                                </div>
                                                <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                                                    <div
                                                        className="bg-gradient-to-r from-primary to-primary/50 h-2.5 rounded-full transition-all duration-500"
                                                        style={{ width: `${permissionPercent}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2 pt-2">
                                                <button className="flex-1 px-3 py-2 text-sm font-medium text-center bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 group-hover:shadow">
                                                    <Edit2 className="w-4 h-4" />
                                                    Edit
                                                </button>
                                                <button className="px-3 py-2 text-center hover:bg-destructive/10 border border-destructive/30 rounded-md transition-colors hover:border-destructive/50">
                                                    <Trash2 className="w-4 h-4 text-destructive" />
                                                </button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                            </div>
                            
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-1">
                                    <p className="text-xs text-muted-foreground">
                                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, MOCK_ROLES.length)} of {MOCK_ROLES.length} results
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
                    )}

                    {/* List View */}
                    {viewMode === 'list' && (
                        <div className="space-y-3">
                            <div className="px-1">
                                <h4 className="text-sm font-semibold text-foreground">Roles List</h4>
                                <p className="text-xs text-muted-foreground mt-0.5">System roles and their permissions</p>
                            </div>
                            
                            <div className="border border-border rounded-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-muted border-b border-border">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Role Name</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Description</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Permissions</th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-foreground">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {paginatedRoles.map((role) => {
                                                const colors = getRoleColor(role.name);
                                                const RoleIcon = getRoleIcon(role.name);
                                                const permissionPercent = (role.permissions / 25) * 100;

                                                return (
                                                    <tr key={role.id} className="hover:bg-muted/50 transition-colors">
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`p-1.5 rounded-md ${colors.badge}`}>
                                                                    <RoleIcon className="w-3.5 h-3.5" />
                                                                </div>
                                                                <span className="text-sm font-medium">{role.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className="text-sm text-muted-foreground">{role.description}</span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-28 bg-muted rounded-full h-1.5">
                                                                    <div
                                                                        className="bg-gradient-to-r from-primary to-primary/50 h-1.5 rounded-full transition-all"
                                                                        style={{ width: `${permissionPercent}%` }}
                                                                    ></div>
                                                                </div>
                                                                <span className="text-xs font-medium text-muted-foreground">{role.permissions}/25</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <button className="p-1.5 hover:bg-accent rounded-md transition-colors text-primary hover:text-primary/80" title="Edit role">
                                                                    <Edit2 className="w-4 h-4" />
                                                                </button>
                                                                <button className="p-1.5 hover:bg-destructive/10 rounded-md transition-colors text-destructive hover:text-destructive/80" title="Delete role">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-1">
                                    <p className="text-xs text-muted-foreground">
                                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, MOCK_ROLES.length)} of {MOCK_ROLES.length} results
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
                    )}
                </div>
            </DashboardLayout>
        </RoleGuard>
    );
}
