import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Alert, AlertDescription } from '../../../components/ui/Alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/Dialog';
import { Label } from '../../../components/ui/Label';
import { ArrowUpDown, Search, Edit, Archive, UserPlus, MoreHorizontal, User, AlertCircle } from 'lucide-react';
import { User as UserType, Role, UserRole } from '../../../types';
import { Skeleton } from '../../../components/ui/Skeleton';
import { adminService } from '../services/adminService';
import { StatusDot } from '../../../components/ui/StatusDot';
import { AuthConfirmationModal } from '../../../components/common/AuthConfirmationModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/DropdownMenu";
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
    status: 'Active',
    password: 'TradeMatrix2024!' // Default password
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

      // Filter roles based on current user role, and exclude archived roles
      let filteredRoles = (rolesData || []).filter((r: Role) => !r.isArchived);
      if (currentUserRole !== 'SuperAdmin') {
        // Non-SuperAdmin users should not manage roles
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
        password: newUser.password
      });

      setIsUserModalOpen(false);
      toast.success('User created successfully.');
      fetchUsers(); // Refresh list
      // Reset form
      setNewUser({
        name: '',
        email: '',
        role: roles.length > 0 ? roles[0].name : '',
        status: 'Active',
        password: 'TradeMatrix2024!'
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
      toast.success('User updated successfully.');
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      setEditError(error.response?.data?.message || 'Failed to update user');
    }
  };

  // Archive/Restore logic
  const [archiveTarget, setArchiveTarget] = useState<UserType | null>(null);
  const [isArchiveAuthOpen, setIsArchiveAuthOpen] = useState(false);

  const handleArchiveClick = (user: UserType) => {
    setArchiveTarget(user);
    setIsArchiveAuthOpen(true);
  };

  const handleArchiveConfirm = async () => {
    if (!archiveTarget) return;
    try {
      await adminService.archiveUser(archiveTarget.id);
      toast.success(`${archiveTarget.name} has been archived.`);
      fetchUsers();
    } catch (error) {
      console.error('Error archiving user:', error);
      toast.error('Failed to archive user.');
    } finally {
      setIsArchiveAuthOpen(false);
      setArchiveTarget(null);
    }
  };

  const handleRestoreUser = async (user: UserType) => {
    try {
      await adminService.restoreUser(user.id);
      toast.success(`${user.name} has been restored.`);
      fetchUsers();
    } catch (error) {
      console.error('Error restoring user:', error);
      toast.error('Failed to restore user.');
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
        if (currentUserRole !== 'SuperAdmin' && user.role === 'SuperAdmin') {
          return <div className="flex justify-end"><span className="text-xs text-zinc-400 italic px-2">Protected</span></div>;
        }
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px] bg-white dark:bg-zinc-900 dark:border-zinc-800">
                <DropdownMenuItem onClick={() => { setEditingUser(user); setIsEditUserOpen(true); }} className="cursor-pointer">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                {user.isArchived ? (
                  <DropdownMenuItem onClick={() => handleRestoreUser(user)} className="cursor-pointer text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Restore
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleArchiveClick(user); }} className="cursor-pointer text-amber-600 hover:text-amber-700 dark:text-amber-500">
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    }
  ];

  return (
    <div className="space-y-6">

      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create System User</DialogTitle>
            <DialogDescription>Add a new user and assign a role.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {createError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{createError}</AlertDescription>
              </Alert>
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
                <Select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.name}>{role.name}</option>
                  ))}
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={newUser.status}
                  onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Temporary Password</Label>
              <Input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Enter temporary password"
                className="bg-white dark:bg-zinc-950"
              />
              <p className="text-xs text-zinc-400 font-mono mt-1">Default: TradeMatrix2024!</p>
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
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{editError}</AlertDescription>
                </Alert>
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
                  <Select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  >
                    {roles.map(role => (
                      <option key={role.id} value={role.name}>{role.name}</option>
                    ))}
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select
                    value={editingUser.status || (editingUser.isActive ? 'Active' : 'Inactive')}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as any, isActive: e.target.value === 'Active' })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </Select>
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
          <div className="rounded-md border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden flex flex-col flex-1">
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

      <AuthConfirmationModal
        isOpen={isArchiveAuthOpen}
        onClose={() => { setIsArchiveAuthOpen(false); setArchiveTarget(null); }}
        onConfirm={handleArchiveConfirm}
        actionDescription={`You are about to archive user "${archiveTarget?.name}". This will deactivate their account.`}
      />
    </div>
  );
};