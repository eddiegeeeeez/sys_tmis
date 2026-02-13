import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { User, MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { MOCK_USERS } from '../../lib/mockData';
import { User as UserType } from '../../types';

export const UserManagement: React.FC = () => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof UserType; direction: 'asc' | 'desc' } | null>(null);

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
        // Handle undefined safely though mock data has them
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

  const SortIcon = ({ column }: { column: keyof UserType }) => {
    if (sortConfig?.key !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4 text-zinc-900" />
      : <ArrowDown className="ml-2 h-4 w-4 text-zinc-900" />
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-zinc-900">System Administrator Management</h3>
          <p className="text-sm text-zinc-500">Manage admin accounts, reset passwords, and monitor activity.</p>
        </div>
        <Button><User className="mr-2 h-4 w-4"/> Create System Admin</Button>
      </div>

      <div className="rounded-md border border-zinc-200 bg-white">
        <Table>
            <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-zinc-50" 
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">Name <SortIcon column="name" /></div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-zinc-50" 
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center">Email <SortIcon column="email" /></div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-zinc-50" 
                    onClick={() => handleSort('role')}
                  >
                    <div className="flex items-center">Role <SortIcon column="role" /></div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-zinc-50" 
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">Status <SortIcon column="status" /></div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {sortedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-zinc-900">{user.name}</TableCell>
                    <TableCell className="text-zinc-500">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'Active' ? 'success' : 'secondary'}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900">
                          <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
        </Table>
      </div>
    </div>
  );
};