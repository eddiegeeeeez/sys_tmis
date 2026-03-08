import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { ArrowLeft, Save, AlertTriangle, LayoutGrid, List } from 'lucide-react';
import { ALL_PERMISSIONS } from '../../../types';
import { AuthConfirmationModal } from '../../../components/common/AuthConfirmationModal';
import { Skeleton } from '../../../components/ui/Skeleton';
import { adminService } from '../services/adminService';

export const RolePermissionsEditor: React.FC = () => {
    const { roleName } = useParams<{ roleName: string }>();
    const navigate = useNavigate();
    const onBack = () => navigate('/admin/roles');

    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isLoading, setIsLoading] = useState(true);
    const [roleId, setRoleId] = useState<number | null>(null);

    useEffect(() => {
        fetchRolePermissions();
    }, [roleName]);

    const fetchRolePermissions = async () => {
        setIsLoading(true);
        try {
            // We need to find the role by name first since the prop is roleName
            const rolesRes = await adminService.getRoles();
            const role = rolesRes.data.data.find(r => r.name === roleName);

            if (role) {
                setRoleId(role.id as unknown as number);
                const permissions = role.permissions ? role.permissions.split(',').filter(p => p.length > 0) : [];
                setSelectedPermissions(permissions);
            }
        } catch (error) {
            console.error('Failed to fetch role permissions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const togglePermission = (permission: string) => {
        setSelectedPermissions(prev =>
            prev.includes(permission)
                ? prev.filter(p => p !== permission)
                : [...prev, permission]
        );
    };

    const handleSaveAttempt = () => {
        setIsAuthModalOpen(true);
    };

    const handleConfirmSave = async () => {
        if (!roleId) return;
        setIsAuthModalOpen(false);
        try {
            await adminService.updateRole(roleId, {
                name: roleName,
                description: '', // Keep original description if possible (need to fetch it)
                permissions: selectedPermissions.join(',')
            });
            onBack();
        } catch (error) {
            console.error('Failed to save permissions:', error);
        }
    };

    const renderSkeleton = () => (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-md" />
                <div className="space-y-2">
                    <Skeleton className="h-7 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
            </div>
            <Skeleton className="h-20 w-full rounded-lg" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <Skeleton key={i} className="h-20 w-full rounded-lg" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    if (isLoading) {
        return renderSkeleton();
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={onBack}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">Edit Role Permissions: {roleName}</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Configure strict access controls for this role.</p>
                    </div>
                </div>

                <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-md border border-zinc-200 dark:border-zinc-800 self-start sm:self-auto">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded-sm transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
                        title="Grid View"
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-sm transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
                        title="List View"
                    >
                        <List className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-900/50 rounded-lg flex items-start gap-3 text-amber-800 dark:text-amber-200 text-sm shadow-sm">
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                    <span className="font-semibold block mb-1">Security Warning</span>
                    Changes to role permissions may affect currently logged-in users immediately or upon their next session refresh. Please proceed with caution and ensure you have authorization to modify these access control lists.
                </div>
            </div>

            <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-base text-zinc-900 dark:text-zinc-50">Permission Set</CardTitle>
                    <CardDescription className="text-zinc-500 dark:text-zinc-400">Select the capabilities granted to users with the <strong>{roleName}</strong> role.</CardDescription>
                </CardHeader>
                <CardContent>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {ALL_PERMISSIONS.map((permission) => (
                                <label
                                    key={permission}
                                    className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-all duration-200 ${selectedPermissions.includes(permission)
                                        ? 'bg-zinc-900 border-zinc-900 text-zinc-50 shadow-md transform scale-[1.01] dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-900'
                                        : 'bg-white border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-800 dark:hover:bg-zinc-900'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        className={`mt-1 h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 accent-zinc-900 dark:accent-zinc-100 ${selectedPermissions.includes(permission) ? 'dark:bg-zinc-900 dark:border-zinc-900' : ''}`}
                                        checked={selectedPermissions.includes(permission)}
                                        onChange={() => togglePermission(permission)}
                                    />
                                    <div className="flex flex-col">
                                        <span className={`text-sm font-semibold capitalize leading-none ${selectedPermissions.includes(permission) ? 'text-zinc-50 dark:text-zinc-900' : 'text-zinc-900 dark:text-zinc-200'}`}>
                                            {permission.replace(/_/g, ' ')}
                                        </span>
                                        <span className={`text-xs mt-1 leading-normal ${selectedPermissions.includes(permission) ? 'text-zinc-400 dark:text-zinc-600' : 'text-zinc-500 dark:text-zinc-400'}`}>
                                            Allow access to {permission.split('_').join(' ')} features.
                                        </span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    ) : (
                        <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden divide-y divide-zinc-200 dark:divide-zinc-800">
                            {ALL_PERMISSIONS.map((permission) => (
                                <label
                                    key={permission}
                                    className={`flex items-center space-x-4 p-4 cursor-pointer transition-colors ${selectedPermissions.includes(permission)
                                        ? 'bg-zinc-50 dark:bg-zinc-800/50'
                                        : 'bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 accent-zinc-900 dark:border-zinc-600 dark:bg-zinc-800"
                                        checked={selectedPermissions.includes(permission)}
                                        onChange={() => togglePermission(permission)}
                                    />
                                    <div className="flex flex-1 items-center justify-between">
                                        <span className={`text-sm font-semibold capitalize ${selectedPermissions.includes(permission) ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                            {permission.replace(/_/g, ' ')}
                                        </span>
                                        <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:inline-block">
                                            Allow access to {permission.split('_').join(' ')} features.
                                        </span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <Button variant="ghost" onClick={onBack}>Cancel</Button>
                <Button onClick={handleSaveAttempt} className="min-w-[150px] shadow-lg shadow-zinc-900/20">
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
            </div>

            <AuthConfirmationModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onConfirm={handleConfirmSave}
                actionDescription={`You are about to update the permission set for the role "${roleName}". This involves modifying core access control lists.`}
            />
        </div>
    );
};