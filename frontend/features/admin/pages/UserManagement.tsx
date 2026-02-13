import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/Dialog';
import { Label } from '../../../components/ui/Label';
import { Select } from '../../../components/ui/Select';
import { Pagination } from '../../../components/ui/Pagination';
import { User, MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { MOCK_USERS } from '../../../lib/mockData';
import { User as UserType } from '../../../types';

const ITEMS_PER_PAGE = 10;

export const UserManagement: React.FC = () => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof UserType; direction: 'asc' | 'desc' } | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (key: keyof UserType) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = useMemo(() => {
    let sortableItems = [...MOCK_USERS];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key] || '';
        const valB = b[sortConfig.key] || '';
        
        if (valA < valB) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [sortConfig]);

  const totalPages = Math.ceil(sortedUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = sortedUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const SortIcon = ({ column }: { column: keyof UserType }) => {
    if (sortConfig?.key !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4 text-zinc-900 dark:text-zinc-50" />
      : <ArrowDown className="ml-2 h-4 w-4 text-zinc-900 dark:text-zinc-50" />
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Create System User</DialogTitle>
                  <DialogDescription>Add a new user and assign a role.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                      <Label>Full Name</Label>
                      <Input placeholder="John Doe" />
                  </div>
                  <div className="grid gap-2">
                      <Label>Email Address</Label>
                      <Input type="email" placeholder="john@tradematrix.com" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                          <Label>Role</Label>
                          <Select>
                              <option>Super Admin</option>
                              <option>System Admin</option>
                              <option>Manager</option>
                              <option>Cashier</option>
                              <option>Inventory Clerk</option>
                          </Select>
                      </div>
                      <div className="grid gap-2">
                          <Label>Status</Label>
                           <Select>
                              <option>Active</option>
                              <option>Inactive</option>
                          </Select>
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
                  <Button onClick={() => setIsUserModalOpen(false)}>Create Account</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">System Administrator Management</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage admin accounts, reset passwords, and monitor activity.</p>
        </div>
        <Button onClick={() => setIsUserModalOpen(true)}>
            <User className="mr-2 h-4 w-4"/> Create System User
        </Button>
      </div>

      <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <Table>
            <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800" 
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">Name <SortIcon column="name" /></div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800" 
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center">Email <SortIcon column="email" /></div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800" 
                    onClick={() => handleSort('role')}
                  >
                    <div className="flex items-center">Role <SortIcon column="role" /></div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800" 
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">Status <SortIcon column="status" /></div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">{user.name}</TableCell>
                    <TableCell className="text-zinc-500 dark:text-zinc-400">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'Active' ? 'success' : 'neutral'}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200">
                          <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
        </Table>
        <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
        />
      </div>
    </div>
  );
};