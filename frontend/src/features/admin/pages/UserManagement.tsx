import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/Dialog';
import { Label } from '../../../components/ui/Label';
import { User, ArrowUpDown, Search, Edit, Trash2, Archive, UserPlus } from 'lucide-react';
import { User as UserType, Role } from '../../../types';
import { Skeleton } from '../../../components/ui/Skeleton';
import { adminService } from '../services/adminService';
import { StatusDot } from '../../../components/ui/StatusDot';
import { AuthConfirmationModal } from '../../../components/common/AuthConfirmationModal';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../../../components/ui/data-table';

export const UserManagement: React.FC = () => {
  // 1. Core State
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<UserType[]>([]);
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

  // 2. Security & Search Filtering (Memoized)
  const filteredUsers = React.useMemo(() => {
    const term = searchTerm.toLowerCase();
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term);

      // Security Filter: SystemAdmin should not see SuperAdmin or other SystemAdmin users
      if (currentUserRole === 'SystemAdmin') {
        if (user.role === 'SuperAdmin' || user.role === 'SystemAdmin') {
          return false;
        }
      }

      return matchesSearch;
    });
  }, [users, searchTerm, currentUserRole]);

  // 3. Removed manual pagination & sorting hooks


  // 4. Feature States (Create/Edit/Delete)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: '',
    status: 'Active'
  });
  const [createError, setCreateError] = useState('');

  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [editError, setEditError] = useState('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [searchTerm]); // Re-fetch when search changes

  const fetchRoles = async () => {
    try {
      const response = await adminService.getRoles();
      const rolesData = response.data.data;

      // Filter roles based on current user role
      let filteredRoles = rolesData || [];
      if (currentUserRole === 'SystemAdmin') {
        filteredRoles = filteredRoles.filter((r: Role) => r.name === 'InventoryClerk' || r.name === 'Cashier');
      } else if (currentUserRole !== 'SuperAdmin') {
        // Fallback or other roles
        filteredRoles = [];
      }

      setRoles(filteredRoles);
      if (filteredRoles.length > 0 && !newUser.role) {
        setNewUser(prev => ({ ...prev, role: filteredRoles[0].name }));
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch maximum items to allow standard client-side pagination via DataTable
      const response = await adminService.getUsers(1, 1000, searchTerm);
      const paginatedData = response.data.data;

      setUsers(paginatedData?.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    setCreateError('');
    try {
      await adminService.createUser({
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.status === 'Active',
        password: 'TradeMatrix2024!' // Default password
      });

      setIsUserModalOpen(false);
      fetchUsers(); // Refresh list
      // Reset form
      setNewUser({
        name: '',
        email: '',
        role: roles.length > 0 ? roles[0].name : '',
        status: 'Active'
      });
    } catch (error: any) {
      console.error('Error creating user:', error);
      setCreateError(error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    setEditError('');
    try {
      await adminService.updateUser(editingUser.id, {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        isActive: editingUser.status === 'Active' || editingUser.isActive === true
      });
      setIsEditUserOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      setEditError(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await adminService.deleteUser(userToDelete.id);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      // Could set a global error state here if needed
    }
  };

  const handleArchiveUser = async (user: UserType) => {
    try {
      await adminService.archiveUser(user.id);
      fetchUsers();
    } catch (error) {
      console.error('Error archiving user:', error);
    }
  };

  const handleRestoreUser = async (user: UserType) => {
    try {
      await adminService.restoreUser(user.id);
      fetchUsers();
    } catch (error) {
      console.error('Error restoring user:', error);
    }
  };

  const columns: ColumnDef<UserType>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3 hover:bg-transparent text-xs font-semibold"
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <span className="font-medium text-zinc-900 dark:text-zinc-100">{row.getValue("name")}</span>
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3 hover:bg-transparent text-xs font-semibold"
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <span className="text-zinc-500 dark:text-zinc-400">{row.getValue("email")}</span>
    },
    {
      accessorKey: "role",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3 hover:bg-transparent text-xs font-semibold"
          >
            Role
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30">
          {row.getValue("role")}
        </span>
      ),
    },
    {
      id: "status",
      accessorFn: (row) => row.isArchived ? "Archived" : (row.status === 'Active' || row.isActive ? 'Active' : 'Inactive'),
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
        const user = row.original;
        const status = user.status || (user.isActive ? 'Active' : 'Inactive');
        return (
          <StatusDot variant={user.isArchived ? 'neutral' : ((status === 'Active' || user.isActive) ? 'success' : 'neutral')}>
            {user.isArchived ? 'Archived' : ((status === 'Active' || user.isActive) ? 'Active' : 'Inactive')}
          </StatusDot>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right text-xs font-semibold pr-2">Actions</div>,
      cell: ({ row }) => {
        const user = row.original;
        if (currentUserRole !== 'SuperAdmin' && (user.role === 'SuperAdmin' || user.role === 'SystemAdmin')) {
          return <div className="flex justify-end"><span className="text-xs text-zinc-400 italic px-2">Protected</span></div>;
        }
        return (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200" title="Edit User" onClick={() => { setEditingUser(user); setIsEditUserOpen(true); }}>
              <Edit className="h-4 w-4" />
            </Button>
            {user.isArchived ? (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" title="Restore User" onClick={() => handleRestoreUser(user)}>
                <UserPlus className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-amber-600 hover:bg-amber-50" title="Archive User" onClick={() => handleArchiveUser(user)}>
                <Archive className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-600 dark:hover:text-red-400" title="Delete User" onClick={() => { setUserToDelete(user); setIsDeleteModalOpen(true); }}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    }
  ];

  return (
    <div className="space-y-6">
      <AuthConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteUser}
        actionDescription={`Are you sure you want to permanently delete user "${userToDelete?.name}"? This action cannot be undone.`}
      />

      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create System User</DialogTitle>
            <DialogDescription>Add a new user and assign a role.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {createError && (
              <div className="p-2 text-sm text-red-500 bg-red-50 rounded border border-red-200">{createError}</div>
            )}
            <div className="grid gap-2">
              <Label>Full Name</Label>
              <Input
                placeholder="John Doe"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                placeholder="john@tradematrix.com"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Role</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.name}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300"
                  value={newUser.status}
                  onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Temporary Password</Label>
              <Input type="password" value="TradeMatrix2024!" readOnly className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400" />
              <p className="text-xs text-zinc-400">User will be prompted to change this on first login.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateUser}>Create Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit System User</DialogTitle>
            <DialogDescription>Modify user access and details.</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="grid gap-4 py-4">
              {editError && (
                <div className="p-2 text-sm text-red-500 bg-red-50 rounded border border-red-200">{editError}</div>
              )}
              <div className="grid gap-2">
                <Label>Full Name</Label>
                <Input
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Role</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300"
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  >
                    {roles.map(role => (
                      <option key={role.id} value={role.name}>{role.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300"
                    value={editingUser.status || (editingUser.isActive ? 'Active' : 'Inactive')}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as any, isActive: e.target.value === 'Active' })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">System Administrator Management</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage admin accounts, reset passwords, and monitor activity.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search users..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsUserModalOpen(true)}>
            <User className="mr-2 h-4 w-4" /> Create System User
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 flex flex-col flex-1 min-h-0">
          <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden flex flex-col flex-1">
            <div className="p-4 space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        </div>
      ) : (
        <DataTable columns={columns} data={filteredUsers} />
      )}
    </div>
  );
};