import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { StatusDot } from '../../../components/ui/StatusDot';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/Tabs';
import { adminService } from '../services/adminService';
import { User, Role } from '../../../types';
import { AlertCircle, ArchiveRestore, RefreshCw, UserSquare2, MoreHorizontal, Eye, Shield, User as UserIcon } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../../../components/ui/data-table';
import { Avatar, AvatarFallback } from '../../../components/ui/Avatar';
import { Skeleton } from '../../../components/ui/Skeleton';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../../components/ui/DropdownMenu";

export const Archive: React.FC = () => {
    const [archivedUsers, setArchivedUsers] = useState<User[]>([]);
    const [archivedRoles, setArchivedRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [userPage, setUserPage] = useState(1);
    const [userTotalPages, setUserTotalPages] = useState(1);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        loadData();
    }, [userPage]);

    const loadData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [usersRes, rolesRes] = await Promise.all([
                adminService.getUsers(1, 1000, '', '', true),
                adminService.getRoles(true)
            ]);

            if (usersRes.data.success) {
                setArchivedUsers(usersRes.data.data.data || []);
            }

            if (rolesRes.data.success) {
                setArchivedRoles(rolesRes.data.data);
            }
        } catch (err: any) {
            console.error('Failed to load archive data:', err);
            setError(err.response?.data?.message || 'Failed to load archived entities');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRestoreUser = async (id: string | number) => {
        if (!window.confirm('Are you sure you want to restore this user? They will regain their previous access.')) return;

        try {
            await adminService.restoreUser(id);
            loadData();
        } catch (err) {
            console.error('Failed to restore user:', err);
            alert('Failed to restore user.');
        }
    };

    const handleRestoreRole = async (id: string | number) => {
        if (!window.confirm('Are you sure you want to restore this role? Users assigned to it will regain its permissions.')) return;

        try {
            await adminService.restoreRole(id);
            loadData();
        } catch (err) {
            console.error('Failed to restore role:', err);
            alert('Failed to restore role.');
        }
    };

    const userColumns: ColumnDef<User>[] = [
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                            <UserSquare2 className="h-4 w-4" />
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">{row.original.name}</span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">{row.original.email}</span>
                    </div>
                </div>
            )
        },
        {
            accessorKey: "role",
            header: "Assigned Role",
            cell: ({ row }) => <Badge variant="outline" className="font-normal">{row.original.role}</Badge>
        },
        {
            accessorKey: "isArchived",
            header: "Status",
            cell: () => <StatusDot variant="neutral">Archived</StatusDot>
        },
        {
            id: "actions",
            header: () => <div className="text-right pr-2">Actions</div>,
            cell: ({ row }) => (
                <div className="flex justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px] bg-white dark:bg-zinc-900 dark:border-zinc-800">
                            <DropdownMenuItem onClick={() => handleRestoreUser(row.original.id!)} className="cursor-pointer text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
                                <ArchiveRestore className="mr-2 h-4 w-4" />
                                Restore User
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ];

    const roleColumns: ColumnDef<Role>[] = [
        {
            accessorKey: "name",
            header: "Role Name",
            cell: ({ row }) => <span className="font-medium text-zinc-900 dark:text-zinc-100">{row.getValue("name")}</span>
        },
        {
            accessorKey: "description",
            header: "Description",
            cell: ({ row }) => <span className="text-zinc-500 dark:text-zinc-400">{row.getValue("description")}</span>
        },
        {
            accessorKey: "isArchived",
            header: "Status",
            cell: () => <StatusDot variant="neutral">Archived</StatusDot>
        },
        {
            id: "actions",
            header: () => <div className="text-right pr-2">Actions</div>,
            cell: ({ row }) => (
                <div className="flex justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px] bg-white dark:bg-zinc-900 dark:border-zinc-800">
                            <DropdownMenuItem onClick={() => handleRestoreRole(row.original.id!)} className="cursor-pointer text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
                                <ArchiveRestore className="mr-2 h-4 w-4" />
                                Restore Role
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ];

    const renderSkeletons = () => (
        <Card className="border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-4 space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Archive</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage and restore archived users and roles.</p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-md border border-red-200 dark:border-red-800/30 flex items-start gap-3 text-sm">
                    <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                    <div>
                        <p className="font-medium">Error loading data</p>
                        <p className="mt-1">{error}</p>
                    </div>
                </div>
            )}

            <Tabs defaultValue="users" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="users">Archived Users</TabsTrigger>
                    <TabsTrigger value="roles">Archived Roles</TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="space-y-4">
                    {isLoading ? renderSkeletons() : (
                        <Card className="border-zinc-200 dark:border-zinc-800">
                            <CardContent className="p-0">
                                <DataTable columns={userColumns} data={archivedUsers} />
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="roles" className="space-y-4">
                    {isLoading ? renderSkeletons() : (
                        <Card className="border-zinc-200 dark:border-zinc-800">
                            <CardContent className="p-0">
                                <DataTable columns={roleColumns} data={archivedRoles} />
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};
