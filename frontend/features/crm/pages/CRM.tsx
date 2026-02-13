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
import { Avatar, AvatarFallback } from '../../../components/ui/Avatar';
import { MOCK_CUSTOMERS } from '../../../lib/mockData';
import { UserSquare2, Star, Plus, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Customer } from '../../../types';

const ITEMS_PER_PAGE = 10;

export const CRM: React.FC = () => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof Customer; direction: 'asc' | 'desc' } | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (key: keyof Customer) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedCustomers = useMemo(() => {
    let data = [...MOCK_CUSTOMERS];
    if (sortConfig) {
      data.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [sortConfig]);

  const totalPages = Math.ceil(sortedCustomers.length / ITEMS_PER_PAGE);
  const paginatedCustomers = sortedCustomers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const SortIcon = ({ column }: { column: keyof Customer }) => {
    if (sortConfig?.key !== column) return <ArrowUpDown className="ml-2 h-4 w-4 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4 text-zinc-900 dark:text-zinc-50" />
      : <ArrowDown className="ml-2 h-4 w-4 text-zinc-900 dark:text-zinc-50" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Add Customer Modal */}
      <Dialog open={isCustomerModalOpen} onOpenChange={setIsCustomerModalOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Add New Customer</DialogTitle>
                  <DialogDescription>Create a customer profile for loyalty tracking.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                      <Label>Customer Name</Label>
                      <Input placeholder="Full Name or Company Name" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                          <Label>Type</Label>
                          <Select>
                              <option>Retail</option>
                              <option>Wholesale</option>
                              <option>Corporate</option>
                          </Select>
                      </div>
                      <div className="grid gap-2">
                          <Label>Contact Number</Label>
                          <Input placeholder="+1 234..." />
                      </div>
                  </div>
                  <div className="grid gap-2">
                      <Label>Email Address</Label>
                      <Input type="email" />
                  </div>
                   <div className="grid gap-2">
                      <Label>Address</Label>
                      <Input />
                  </div>
              </div>
              <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCustomerModalOpen(false)}>Cancel</Button>
                  <Button onClick={() => setIsCustomerModalOpen(false)}>Create Profile</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Customers (CRM)</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage customer profiles and loyalty points.</p>
        </div>
        <Button onClick={() => setIsCustomerModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4"/> Add Customer
        </Button>
      </div>

      <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => handleSort('CustomerID')}>
                        <div className="flex items-center">Customer ID <SortIcon column="CustomerID" /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => handleSort('CustomerName')}>
                        <div className="flex items-center">Name <SortIcon column="CustomerName" /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => handleSort('CustomerType')}>
                        <div className="flex items-center">Type <SortIcon column="CustomerType" /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => handleSort('ContactNumber')}>
                        <div className="flex items-center">Contact <SortIcon column="ContactNumber" /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => handleSort('LoyaltyPoints')}>
                        <div className="flex items-center">Loyalty Points <SortIcon column="LoyaltyPoints" /></div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {paginatedCustomers.map(cust => (
                    <TableRow key={cust.CustomerID} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                        <TableCell className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{cust.CustomerID}</TableCell>
                        <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback><UserSquare2 className="h-4 w-4 text-zinc-500" /></AvatarFallback>
                                </Avatar>
                                {cust.CustomerName}
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant="secondary">{cust.CustomerType}</Badge>
                        </TableCell>
                        <TableCell className="text-zinc-700 dark:text-zinc-300">{cust.ContactNumber}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-500">
                                <Star className="h-3 w-3 fill-current" /> {cust.LoyaltyPoints}
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="sm">Edit</Button>
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