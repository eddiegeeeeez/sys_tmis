import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Avatar, AvatarFallback } from '../components/ui/Avatar';
import { MOCK_CUSTOMERS } from '../lib/mockData';
import { UserSquare2, Star, Plus, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Customer } from '../types';

export const CRM: React.FC = () => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof Customer; direction: 'asc' | 'desc' } | null>(null);

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

  const SortIcon = ({ column }: { column: keyof Customer }) => {
    if (sortConfig?.key !== column) return <ArrowUpDown className="ml-2 h-4 w-4 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4 text-zinc-900" />
      : <ArrowDown className="ml-2 h-4 w-4 text-zinc-900" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Customers (CRM)</h2>
            <p className="text-zinc-500 mt-1">Manage customer profiles and loyalty points.</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4"/> Add Customer</Button>
      </div>

      <div className="rounded-md border border-zinc-200 bg-white">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="cursor-pointer hover:bg-zinc-50" onClick={() => handleSort('CustomerID')}>
                        <div className="flex items-center">Customer ID <SortIcon column="CustomerID" /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-zinc-50" onClick={() => handleSort('CustomerName')}>
                        <div className="flex items-center">Name <SortIcon column="CustomerName" /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-zinc-50" onClick={() => handleSort('CustomerType')}>
                        <div className="flex items-center">Type <SortIcon column="CustomerType" /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-zinc-50" onClick={() => handleSort('ContactNumber')}>
                        <div className="flex items-center">Contact <SortIcon column="ContactNumber" /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-zinc-50" onClick={() => handleSort('LoyaltyPoints')}>
                        <div className="flex items-center">Loyalty Points <SortIcon column="LoyaltyPoints" /></div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {sortedCustomers.map(cust => (
                    <TableRow key={cust.CustomerID}>
                        <TableCell className="font-mono text-xs">{cust.CustomerID}</TableCell>
                        <TableCell className="font-medium">
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
                        <TableCell>{cust.ContactNumber}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-1 font-semibold text-amber-600">
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
      </div>
    </div>
  );
};