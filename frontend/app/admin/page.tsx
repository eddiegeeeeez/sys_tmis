"use client";
import React, { useState, useMemo } from 'react';
import RoleGuard from "@/components/auth/role-guard";
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { useAdminNavigation } from '@/lib/hooks/useAdminNavigation';
import { MOCK_USERS, MOCK_ROLES, MOCK_AUDIT_LOGS, ALL_PERMISSIONS } from '@/lib/mocks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Shield, Lock, Settings, Search, Edit2, Trash2, Plus, ArrowUpDown, Check, X, Mail, Save, Key, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminPage() {
    const { currentRole, handleLogout, handleNavigate } = useAdminNavigation();
    const [activeTab, setActiveTab] = useState('users');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [editingRole, setEditingRole] = useState<string | null>(null);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // User Management
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

    const getInitialPermissions = (roleName: string) => {
        if (roleName.includes('SuperAdmin')) return ALL_PERMISSIONS;
        if (roleName === 'SystemAdmin') return ALL_PERMISSIONS.filter(p => !p.includes('database') && !p.includes('backup'));
        if (roleName === 'Manager') return ['view_dashboard', 'view_inventory', 'manage_inventory', 'view_reports', 'view_pos'];
        if (roleName === 'Cashier') return ['view_pos', 'process_transactions', 'view_inventory'];
        if (roleName === 'InventoryClerk') return ['view_inventory', 'manage_inventory'];
        return ['view_dashboard'];
    };

    const handleEditClick = (roleName: string) => {
        setEditingRole(roleName);
        setSelectedPermissions(getInitialPermissions(roleName));
    };

    const togglePermission = (permission: string) => {
        setSelectedPermissions(prev => 
            prev.includes(permission) 
                ? prev.filter(p => p !== permission)
                : [...prev, permission]
        );
    };

    const handleSave = () => {
        console.log(`Saving permissions for ${editingRole}:`, selectedPermissions);
        setEditingRole(null);
    };

    const getRoleColor = (role: string) => {
        const colors: { [key: string]: string } = {
            'SuperAdmin': 'bg-purple-500/20 text-purple-700 dark:text-purple-300',
            'SystemAdmin': 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
            'Manager': 'bg-green-500/20 text-green-700 dark:text-green-300',
            'Cashier': 'bg-amber-500/20 text-amber-700 dark:text-amber-300',
            'InventoryClerk': 'bg-pink-500/20 text-pink-700 dark:text-pink-300',
        };
        return colors[role] || 'bg-muted text-muted-foreground';
    };

    const TabButton = ({ id, label, icon: Icon }: any) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 font-medium text-sm transition-all ${
                activeTab === id
                    ? 'border-b-2 border-primary text-foreground'
                    : 'text-muted-foreground hover:text-foreground border-b-2 border-transparent'
            }`}
        >
            <Icon className="w-4 h-4" />
            {label}
        </button>
    );

    return (
        <RoleGuard allowedRoles={["SuperAdmin", "SystemAdmin"]}>
            <DashboardLayout
                currentRole={currentRole}
                activeView="admin"
                onNavigate={handleNavigate}
                onLogout={handleLogout}
            >
                <div className="space-y-8 pb-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-foreground">System Administration</h2>
                            <p className="text-muted-foreground mt-1">Manage users, roles, security, and system configuration.</p>
                        </div>
                    </div>

                    {/* Edit Permissions Modal */}
                    {editingRole && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                            <Card className="w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
                                <CardHeader className="border-b py-4 shrink-0">
                                    <CardTitle className="text-xl">Edit Permissions: {editingRole}</CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">Configure the access control list for this role. Changes will take effect immediately.</p>
                                </CardHeader>
                                <CardContent className="pt-6 overflow-y-auto flex-1">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {ALL_PERMISSIONS.map((permission) => (
                                            <label 
                                                key={permission} 
                                                className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-all ${
                                                    selectedPermissions.includes(permission) 
                                                        ? 'bg-primary/10 border-primary ring-1 ring-primary' 
                                                        : 'bg-background border-border hover:border-primary/50'
                                                }`}
                                            >
                                                <input 
                                                    type="checkbox" 
                                                    className="h-5 w-5 rounded border-border text-primary focus:ring-primary accent-primary mt-0.5"
                                                    checked={selectedPermissions.includes(permission)}
                                                    onChange={() => togglePermission(permission)}
                                                />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-foreground leading-none capitalize">
                                                        {permission.replace(/_/g, ' ')}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground mt-1">
                                                        Grants access to {permission.split('_')[0]} {permission.split('_')[1]}
                                                    </span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </CardContent>
                                <div className="p-6 border-t border-border flex justify-end gap-3 shrink-0 bg-muted/50 rounded-b-lg">
                                    <Button variant="outline" onClick={() => setEditingRole(null)}>Cancel</Button>
                                    <Button onClick={handleSave} className="min-w-[120px]">Save Changes</Button>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="border-b border-border flex gap-8">
                        <TabButton id="users" label="User Management" icon={Users} />
                        <TabButton id="roles" label="Role Management" icon={Shield} />
                        <TabButton id="security" label="Security & Logs" icon={Lock} />
                        <TabButton id="config" label="System Config" icon={Settings} />
                    </div>

                    {/* Tab Content */}
                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                <div className="w-full sm:w-64">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search by name or email..."
                                            className="pl-10"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <Button className="flex items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    Add User
                                </Button>
                            </div>

                            <div className="space-y-3">
                                <div className="px-1">
                                    <h4 className="text-sm font-semibold text-foreground">Users ({filteredUsers.length})</h4>
                                    <p className="text-xs text-muted-foreground mt-0.5">Manage all user accounts and permissions</p>
                                </div>
                                
                                <Card className="border-border shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                                <thead className="bg-muted/80 border-b border-border">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-foreground cursor-pointer hover:bg-muted select-none transition-colors" onClick={() => handleSort('name')}>
                                                            <div className="flex items-center gap-1">Name<ArrowUpDown className="w-3.5 h-3.5 opacity-50" /></div>
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-foreground cursor-pointer hover:bg-muted select-none transition-colors" onClick={() => handleSort('email')}>
                                                            <div className="flex items-center gap-1">Email<ArrowUpDown className="w-3.5 h-3.5 opacity-50" /></div>
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-foreground cursor-pointer hover:bg-muted select-none transition-colors" onClick={() => handleSort('role')}>
                                                            <div className="flex items-center gap-1">Role<ArrowUpDown className="w-3.5 h-3.5 opacity-50" /></div>
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Status</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Last Login</th>
                                                        <th className="px-4 py-3 text-right text-xs font-semibold text-foreground">Actions</th>
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
                                                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getRoleColor(user.role)}`}>
                                                                    {user.role}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className={`inline-flex items-center gap-1 text-xs font-medium ${user.status === 'Active' ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                                                                    {user.status === 'Active' ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                                                                    {user.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className="text-xs text-muted-foreground">{user.lastLogin}</span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex justify-end gap-1">
                                                                    <button className="p-1.5 hover:bg-muted rounded transition-colors" title="Edit user">
                                                                        <Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                                                                    </button>
                                                                    <button className="p-1.5 hover:bg-destructive/10 rounded transition-colors" title="Delete user">
                                                                        <Trash2 className="w-4 h-4 text-destructive" />
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
                    )}

                    {/* Roles Tab */}
                    {activeTab === 'roles' && (
                        <div className="space-y-6">
                            <div className="flex justify-end">
                                <Button className="flex items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    Create New Role
                                </Button>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {MOCK_ROLES.map((role) => (
                                    <Card key={role.id} className="flex flex-col hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-base">{role.name}</CardTitle>
                                            <p className="text-sm text-muted-foreground mt-2">{role.description}</p>
                                        </CardHeader>
                                        <CardContent className="mt-auto pt-0">
                                            <div className="mb-4">
                                                <p className="text-xs text-muted-foreground mb-2">Permissions: {role.permissions}/25</p>
                                                <div className="w-full bg-muted rounded-full h-2">
                                                    <div
                                                        className="bg-primary h-2 rounded-full transition-all"
                                                        style={{ width: `${(role.permissions / 25) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 pt-4 border-t border-border">
                                                <Button size="sm" variant="outline" className="flex-1 text-xs">View Permissions</Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    className="flex-1 text-xs"
                                                    onClick={() => handleEditClick(role.name)}
                                                >
                                                    Edit
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Audit Log</CardTitle>
                                    <p className="text-sm text-muted-foreground mt-2">Recent system activity and user actions</p>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {MOCK_AUDIT_LOGS.map((log) => (
                                            <div key={log.id} className="flex items-start justify-between p-4 bg-muted/50 rounded-lg border border-border">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-sm text-foreground">{log.action}</p>
                                                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                                                            log.status === 'Success' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' :
                                                            log.status === 'Error' ? 'bg-red-500/20 text-red-700 dark:text-red-300' :
                                                            'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                                                        }`}>
                                                            {log.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">{log.user}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">{log.details}</p>
                                                </div>
                                                <p className="text-xs text-muted-foreground whitespace-nowrap ml-4">{log.timestamp}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Config Tab */}
                    {activeTab === 'config' && (
                        <div className="space-y-6">
                            <div className="grid gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>System Settings</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                                            <div>
                                                <p className="font-medium text-sm text-foreground">Session Timeout</p>
                                                <p className="text-xs text-muted-foreground mt-1">Auto-logout duration in minutes</p>
                                            </div>
                                            <Input type="number" defaultValue="30" className="w-20" />
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                                            <div>
                                                <p className="font-medium text-sm text-foreground">Password Expiry</p>
                                                <p className="text-xs text-muted-foreground mt-1">Days before password reset required</p>
                                            </div>
                                            <Input type="number" defaultValue="90" className="w-20" />
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                                            <div>
                                                <p className="font-medium text-sm text-foreground">Login Attempts</p>
                                                <p className="text-xs text-muted-foreground mt-1">Max failed attempts before lockout</p>
                                            </div>
                                            <Input type="number" defaultValue="5" className="w-20" />
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                                            <div>
                                                <p className="font-medium text-sm text-foreground">Lockout Duration</p>
                                                <p className="text-xs text-muted-foreground mt-1">Minutes of lockout after max attempts</p>
                                            </div>
                                            <Input type="number" defaultValue="15" className="w-20" />
                                        </div>
                                        <Button className="w-full">
                                            <Save className="mr-2 h-4 w-4"/> Save Settings
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>System Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex justify-between p-3 bg-muted/50 rounded border border-border">
                                            <span className="text-sm text-muted-foreground">Version</span>
                                            <span className="text-sm font-medium text-foreground">1.0.0</span>
                                        </div>
                                        <div className="flex justify-between p-3 bg-muted/50 rounded border border-border">
                                            <span className="text-sm text-muted-foreground">Database</span>
                                            <span className="text-sm font-medium text-foreground">Connected</span>
                                        </div>
                                        <div className="flex justify-between p-3 bg-muted/50 rounded border border-border">
                                            <span className="text-sm text-muted-foreground">Users</span>
                                            <span className="text-sm font-medium text-foreground">{MOCK_USERS.length}</span>
                                        </div>
                                        <div className="flex justify-between p-3 bg-muted/50 rounded border border-border">
                                            <span className="text-sm text-muted-foreground">Backend Status</span>
                                            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Operational</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </RoleGuard>
    );
}
