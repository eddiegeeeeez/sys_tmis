import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../../../components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/Dialog';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { LayoutGrid, List, Plus, Shield, Users, Eye, Edit, Archive, ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal } from 'lucide-react';
import { Role } from '../../../types';
import { AuthConfirmationModal } from '../../../components/common/AuthConfirmationModal';
import { Skeleton } from '../../../components/ui/Skeleton';
import { StatusDot } from '../../../components/ui/StatusDot';
import { adminService } from '../services/adminService';
import { useSort } from '../../../hooks/useSort';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../../components/ui/DropdownMenu";

export const RoleManagement: React.FC = () => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
    const [viewingRole, setViewingRole] = useState<Role | null>(null);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserRole, setCurrentUserRole] = useState<string>(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                return JSON.parse(savedUser).role || '';
            } catch (e) {
                return '';
            }
        }
        return '';
    });

    const { items: sortedRoles, requestSort, sortConfig } = useSort(roles);

    // Create Role State
    const [newRoleName, setNewRoleName] = useState('');
    const [newRoleDesc, setNewRoleDesc] = useState('');
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    // Edit Role State
    const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<{ id: number; name: string; description: string, isSystemRole: boolean, permissions: string } | null>(null);
    const [editError, setEditError] = useState('');

    // Feature States

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const response = await adminService.getRoles();
            const rolesData = response.data.data || [];

            // Filter out SuperAdmin for non-SuperAdmins
            let filteredRoles = rolesData;
            if (currentUserRole !== 'SuperAdmin') {
                filteredRoles = filteredRoles.filter((r: Role) => r.name !== 'SuperAdmin');
            }

            setRoles(filteredRoles);
        } catch (error) {
            console.error('Error fetching roles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditPermissionsClick = (roleName: string) => {
        navigate(`/admin/roles/edit/${roleName}`);
    };

    const handleCreateRoleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsAuthModalOpen(true);
    };

    const handleAuthConfirm = async () => {
        try {
            if (newRoleName === 'SuperAdmin') {
                alert(`Cannot create another role named "${newRoleName}"`);
                return;
            }

            await adminService.createRole({
                name: newRoleName,
                description: newRoleDesc,
                permissions: '' // Default to empty, configure later
            });

            fetchRoles();
            setIsAuthModalOpen(false);
            setIsCreateRoleOpen(false);
            setNewRoleName('');
            setNewRoleDesc('');
        } catch (error) {
            console.error('Error creating role:', error);
        }
    };

    const handleUpdateRoleSubmit = async () => {
        if (!editingRole) return;
        setEditError('');
        try {
            await adminService.updateRole(editingRole.id, {
                name: editingRole.name,
                description: editingRole.description,
                permissions: editingRole.permissions
            });
            setIsEditRoleOpen(false);
            fetchRoles();
        } catch (error: any) {
            console.error('Error updating role:', error);
            setEditError(error.response?.data?.message || 'Failed to update role');
        }
    };

    // Archive/Restore logic
    const [archiveTarget, setArchiveTarget] = useState<Role | null>(null);
    const [isArchiveAuthOpen, setIsArchiveAuthOpen] = useState(false);

    const handleArchiveClick = (role: Role) => {
        setArchiveTarget(role);
        setIsArchiveAuthOpen(true);
    };

    const handleArchiveConfirm = async () => {
        if (!archiveTarget) return;
        try {
            await adminService.archiveRole(archiveTarget.id);
            fetchRoles();
        } catch (error) {
            console.error('Error archiving role:', error);
        } finally {
            setIsArchiveAuthOpen(false);
            setArchiveTarget(null);
        }
    };

    const handleRestoreRole = async (role: Role) => {
        try {
            await adminService.restoreRole(role.id);
            fetchRoles();
        } catch (error) {
            console.error('Error restoring role:', error);
        }
    };

    const getPermissionsArray = (permissionsStr: string | undefined) => {
        if (!permissionsStr) return [];
        return permissionsStr.split(',').filter(p => p.length > 0);
    };

    const getSortIcon = (key: string) => {
        if (sortConfig.key !== key) return <ArrowUpDown className="ml-2 h-4 w-4" />;
        if (sortConfig.order === 'asc') return <ArrowUp className="ml-2 h-4 w-4" />;
        return <ArrowDown className="ml-2 h-4 w-4" />;
    };

    const columns: ColumnDef<Role>[] = [
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="-ml-3 hover:bg-transparent text-xs font-semibold"
                    >
                        Role Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const role = row.original;
                return (
                    <div className="flex items-center gap-2 mt-1">
                        <Shield className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{role.name}</span>
                        {role.isSystemRole && <Badge variant="outline" className="ml-2 font-normal bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-700 dark:text-zinc-400">System</Badge>}
                        {role.isArchived && <Badge variant="secondary" className="ml-2 font-normal bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500">Archived</Badge>}
                    </div>
                );
            }
        },
        {
            accessorKey: "description",
            header: () => <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Description</div>,
            cell: ({ row }) => <span className="line-clamp-2 mt-1 text-zinc-500 dark:text-zinc-400">{row.getValue("description")}</span>
        },
        {
            id: "status",
            accessorFn: (row) => row.isArchived ? 'Archived' : 'Active',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="-ml-3 hover:bg-transparent text-xs font-semibold"
                    >
                        Status
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const role = row.original;
                return (
                    <StatusDot variant={role.isArchived ? 'neutral' : 'success'}>
                        {role.isArchived ? 'Archived' : 'Active'}
                    </StatusDot>
                );
            }
        },
        {
            id: "actions",
            header: () => <div className="text-right text-xs font-semibold pr-2">Actions</div>,
            cell: ({ row }) => {
                const role = row.original;
                return (
                    <div className="flex justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[180px] bg-white dark:bg-zinc-900 dark:border-zinc-800">
                                <DropdownMenuItem onClick={() => setViewingRole(role)} className="cursor-pointer">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setEditingRole(role as any); setIsEditRoleOpen(true); }} className="cursor-pointer">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditPermissionsClick(role.name)} className="cursor-pointer">
                                    <Shield className="h-4 w-4 mr-2" />
                                    Edit Permissions
                                </DropdownMenuItem>
                                {!role.isSystemRole && (
                                    role.isArchived ? (
                                        <DropdownMenuItem onClick={() => handleRestoreRole(role)} className="cursor-pointer text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Restore Role
                                        </DropdownMenuItem>
                                    ) : (
                                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleArchiveClick(role); }} className="cursor-pointer text-amber-600 hover:text-amber-700 dark:text-amber-500">
                                            <Archive className="h-4 w-4 mr-2" />
                                            Archive Role
                                        </DropdownMenuItem>
                                    )
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            }
        }
    ];

    const renderSkeleton = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <Skeleton className="h-7 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="flex gap-3">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-10 w-40" />
                </div>
            </div>

            {viewMode === 'grid' ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <CardHeader className="pb-3">
                                <Skeleton className="h-6 w-32 mb-2" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-3 w-24" />
                                    <div className="flex gap-1">
                                        <Skeleton className="h-5 w-16" />
                                        <Skeleton className="h-5 w-16" />
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                    <Skeleton className="h-8 w-full" />
                                    <Skeleton className="h-8 w-full" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                    <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
                        <Skeleton className="h-5 w-full" />
                    </div>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="p-4 border-b border-zinc-100 dark:border-zinc-800 last:border-0 flex items-center gap-4">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-5 flex-1" />
                            <Skeleton className="h-5 w-20" />
                            <Skeleton className="h-8 w-48 ml-auto" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    if (loading) {
        return renderSkeleton();
    }

    return (
        <div className="space-y-6 relative">


            {/* Auth Confirmation Modal for Create Role */}
            <AuthConfirmationModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onConfirm={handleAuthConfirm}
                actionDescription={`You are about to create a new system role: "${newRoleName}". This will allow you to assign permissions to users under this role.`}
            />

            {/* Create Role Modal */}
            <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
                <DialogContent className="bg-white dark:bg-zinc-900 dark:border-zinc-800">
                    <DialogHeader>
                        <DialogTitle className="text-zinc-900 dark:text-zinc-50">Create New Role</DialogTitle>
                        <DialogDescription className="text-zinc-500 dark:text-zinc-400">Define a new role to assign to system users.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateRoleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-zinc-900 dark:text-zinc-200">Role Name</Label>
                            <Input
                                placeholder="e.g. Regional Manager"
                                required
                                value={newRoleName}
                                onChange={(e) => setNewRoleName(e.target.value)}
                                className="dark:bg-zinc-950 dark:border-zinc-800"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-900 dark:text-zinc-200">Description</Label>
                            <Input
                                placeholder="Brief description of responsibilities"
                                required
                                value={newRoleDesc}
                                onChange={(e) => setNewRoleDesc(e.target.value)}
                                className="dark:bg-zinc-950 dark:border-zinc-800"
                            />
                        </div>
                        <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-md text-sm text-zinc-500 dark:bg-zinc-800/50 dark:border-zinc-800 dark:text-zinc-400">
                            <p className="flex items-center gap-2"><Shield className="h-4 w-4" /> Permissions can be configured after creation.</p>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateRoleOpen(false)}>Cancel</Button>
                            <Button type="submit">Create Role</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Role Modal */}
            <Dialog open={isEditRoleOpen} onOpenChange={setIsEditRoleOpen}>
                <DialogContent className="bg-white dark:bg-zinc-900 dark:border-zinc-800">
                    <DialogHeader>
                        <DialogTitle className="text-zinc-900 dark:text-zinc-50">Edit Role Details</DialogTitle>
                        <DialogDescription className="text-zinc-500 dark:text-zinc-400">Modify the basic properties of this role.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {editError && (
                            <div className="p-2 text-sm text-red-500 bg-red-50 rounded border border-red-200">{editError}</div>
                        )}
                        <div className="space-y-2">
                            <Label className="text-zinc-900 dark:text-zinc-200">Role Name</Label>
                            <Input
                                placeholder="e.g. Regional Manager"
                                required
                                disabled={editingRole?.isSystemRole}
                                value={editingRole?.name || ''}
                                onChange={(e) => setEditingRole(editingRole ? { ...editingRole, name: e.target.value } : null)}
                                className="dark:bg-zinc-950 dark:border-zinc-800"
                            />
                            {editingRole?.isSystemRole && (
                                <p className="text-xs text-amber-600 dark:text-amber-500">System role names cannot be modified.</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-900 dark:text-zinc-200">Description</Label>
                            <Input
                                placeholder="Brief description of responsibilities"
                                required
                                value={editingRole?.description || ''}
                                onChange={(e) => setEditingRole(editingRole ? { ...editingRole, description: e.target.value } : null)}
                                className="dark:bg-zinc-950 dark:border-zinc-800"
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditRoleOpen(false)}>Cancel</Button>
                            <Button onClick={handleUpdateRoleSubmit}>Save Changes</Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* View Details Modal */}
            <Dialog open={!!viewingRole} onOpenChange={(open) => !open && setViewingRole(null)}>
                <DialogContent className="bg-white dark:bg-zinc-900 dark:border-zinc-800">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                            <Shield className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                            {viewingRole?.name}
                        </DialogTitle>
                        <DialogDescription className="text-zinc-500 dark:text-zinc-400">Role Details and Usage</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider">Status</Label>
                                <div className="font-medium text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                    <Badge variant="success">Active</Badge>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider">Type</Label>
                                <div className="flex items-center gap-2 font-medium text-sm text-zinc-900 dark:text-zinc-200">
                                    {viewingRole?.isSystemRole ? 'System Role' : 'Custom Role'}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider">Description</Label>
                            <p className="text-sm text-zinc-700 bg-zinc-50 p-3 rounded-md border border-zinc-100 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-300">
                                {viewingRole?.description}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider">Configured Permissions</Label>
                            <div className="flex flex-wrap gap-1.5 p-3 bg-zinc-50 rounded-md border border-zinc-100 max-h-[150px] overflow-y-auto dark:bg-zinc-950 dark:border-zinc-800">
                                {viewingRole && getPermissionsArray(viewingRole.permissions).length > 0 ? (
                                    getPermissionsArray(viewingRole.permissions).map((p: string) => (
                                        <Badge key={p} variant="secondary" className="text-xs font-normal border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
                                            {p.replace(/_/g, ' ')}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-sm text-zinc-400 italic">No permissions configured</span>
                                )}
                            </div>
                        </div>

                        <div className="pt-2">
                            <Button className="w-full" variant="outline" onClick={() => {
                                const roleName = viewingRole?.name;
                                setViewingRole(null);
                                if (roleName) handleEditPermissionsClick(roleName);
                            }}>
                                <Edit className="h-4 w-4 mr-2" /> Edit Permissions
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">Role & Permission Management</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Define access levels and create new user roles.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-md border border-zinc-200 dark:border-zinc-800">
                        <span className="text-xs text-zinc-500 px-2">Sort:</span>
                        <Button variant="ghost" size="sm" onClick={() => requestSort('name')} className="h-7 text-xs px-2">
                            Name {getSortIcon('name')}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => requestSort('isSystemRole')} className="h-7 text-xs px-2">
                            Type {getSortIcon('isSystemRole')}
                        </Button>
                    </div>
                    <div className="flex bg-zinc-100 p-1 rounded-md border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-sm ${viewMode === 'grid' ? 'bg-white shadow-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
                            title="Grid View"
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-sm ${viewMode === 'list' ? 'bg-white shadow-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
                            title="List View"
                        >
                            <List className="h-4 w-4" />
                        </button>
                    </div>
                    <Button className="flex-1 sm:flex-none" onClick={() => setIsCreateRoleOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Create New Role
                    </Button>
                </div>
            </div>

            {viewMode === 'grid' ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {sortedRoles.map((role) => {
                        const permissions = getPermissionsArray(role.permissions);
                        return (
                            <Card key={role.id} className="flex flex-col hover:border-zinc-300 dark:hover:border-zinc-700 group bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex justify-between items-start text-zinc-900 dark:text-zinc-50 gap-2">
                                        <span className="truncate pt-1">{role.name}</span>
                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                            <div className="flex items-center gap-1">
                                                {role.isSystemRole && <Badge variant="outline" className="font-normal bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-700 dark:text-zinc-400">System</Badge>}
                                                {role.isArchived && <Badge variant="secondary" className="font-normal bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500">Archived</Badge>}
                                                <div className="flex items-center gap-0.5 ml-1">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-[180px] bg-white dark:bg-zinc-900 dark:border-zinc-800">
                                                            <DropdownMenuItem onClick={() => setViewingRole(role)} className="cursor-pointer text-xs">
                                                                <Eye className="h-4 w-4 mr-2" /> View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => { setEditingRole(role as any); setIsEditRoleOpen(true); }} className="cursor-pointer text-xs">
                                                                <Edit className="h-4 w-4 mr-2" /> Edit Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleEditPermissionsClick(role.name)} className="cursor-pointer text-xs">
                                                                <Shield className="h-4 w-4 mr-2" /> Edit Permissions
                                                            </DropdownMenuItem>
                                                            {!role.isSystemRole && (
                                                                role.isArchived ? (
                                                                    <DropdownMenuItem onClick={() => handleRestoreRole(role)} className="cursor-pointer text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
                                                                        <Plus className="h-4 w-4 mr-2" /> Restore Role
                                                                    </DropdownMenuItem>
                                                                ) : (
                                                                    <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleArchiveClick(role); }} className="cursor-pointer text-xs text-amber-600 hover:text-amber-700 dark:text-amber-500">
                                                                        <Archive className="h-4 w-4 mr-2" /> Archive Role
                                                                    </DropdownMenuItem>
                                                                )
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        </div>
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2 min-h-[40px] text-zinc-500 dark:text-zinc-400 pt-2">{role.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="mt-auto pt-0">
                                    <div className="mb-4 space-y-2">
                                        <Label className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-semibold">Permissions Preview</Label>
                                        <div className="flex flex-wrap gap-1">
                                            {permissions.length > 0 ? permissions.slice(0, 4).map(p => (
                                                <Badge key={p} variant="secondary" className="text-[10px] px-1.5 py-0.5 h-auto font-normal bg-zinc-50 border-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400">
                                                    {p.replace(/_/g, ' ')}
                                                </Badge>
                                            )) : <span className="text-[10px] text-zinc-400">None</span>}
                                            {permissions.length > 4 && (
                                                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 flex items-center px-1">+{permissions.length - 4} more</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                        <Button variant="ghost" size="sm" className="w-full text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200" onClick={() => setViewingRole(role)}>
                                            <Eye className="h-3.5 w-3.5 mr-2" /> Details
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full text-xs hover:bg-zinc-900 hover:text-zinc-50 hover:border-zinc-900 dark:hover:bg-zinc-50 dark:hover:text-zinc-900 dark:hover:border-zinc-50"
                                            onClick={() => handleEditPermissionsClick(role.name)}
                                        >
                                            <Shield className="h-3.5 w-3.5 mr-2" /> Edit Permissions
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            ) : (
                <div className="overflow-hidden">
                    <DataTable columns={columns} data={sortedRoles} />
                </div>
            )}

            <AuthConfirmationModal
                isOpen={isArchiveAuthOpen}
                onClose={() => { setIsArchiveAuthOpen(false); setArchiveTarget(null); }}
                onConfirm={handleArchiveConfirm}
                actionDescription={`You are about to archive the role "${archiveTarget?.name}". Users assigned to this role may lose access.`}
            />
        </div>
    );
};