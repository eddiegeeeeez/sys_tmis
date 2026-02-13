import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { MOCK_SUPPLIERS, MOCK_PO } from '../lib/mockData';
import { Truck, PackagePlus, Plus, Phone, Mail, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { PurchaseOrder } from '../types';
import { UserSquare2 } from 'lucide-react';

export const Procurement: React.FC = () => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof PurchaseOrder; direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: keyof PurchaseOrder) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedPOs = useMemo(() => {
    let data = [...MOCK_PO];
    if (sortConfig) {
      data.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [sortConfig]);

  const SortIcon = ({ column }: { column: keyof PurchaseOrder }) => {
    if (sortConfig?.key !== column) return <ArrowUpDown className="ml-2 h-4 w-4 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4 text-zinc-900" />
      : <ArrowDown className="ml-2 h-4 w-4 text-zinc-900" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Procurement</h2>
            <p className="text-zinc-500 mt-1">Manage suppliers and purchase orders.</p>
        </div>
      </div>

      <Tabs defaultValue="po" className="w-full">
        <div className="flex items-center justify-between mb-4">
             <TabsList>
                <TabsTrigger value="po">Purchase Orders</TabsTrigger>
                <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
             </TabsList>
             <div className="flex gap-2">
                 <Button><PackagePlus className="mr-2 h-4 w-4"/> Create Purchase Order</Button>
             </div>
        </div>

        <TabsContent value="po" className="space-y-4">
            <div className="rounded-md border border-zinc-200 bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="cursor-pointer hover:bg-zinc-50" onClick={() => handleSort('PONumber')}>
                                <div className="flex items-center">PO Number <SortIcon column="PONumber" /></div>
                            </TableHead>
                            <TableHead className="cursor-pointer hover:bg-zinc-50" onClick={() => handleSort('SupplierName')}>
                                <div className="flex items-center">Supplier <SortIcon column="SupplierName" /></div>
                            </TableHead>
                            <TableHead className="cursor-pointer hover:bg-zinc-50" onClick={() => handleSort('OrderDate')}>
                                <div className="flex items-center">Order Date <SortIcon column="OrderDate" /></div>
                            </TableHead>
                            <TableHead className="cursor-pointer hover:bg-zinc-50" onClick={() => handleSort('ExpectedDeliveryDate')}>
                                <div className="flex items-center">Expected Delivery <SortIcon column="ExpectedDeliveryDate" /></div>
                            </TableHead>
                            <TableHead className="cursor-pointer hover:bg-zinc-50" onClick={() => handleSort('TotalAmount')}>
                                <div className="flex items-center">Total Amount <SortIcon column="TotalAmount" /></div>
                            </TableHead>
                            <TableHead className="cursor-pointer hover:bg-zinc-50" onClick={() => handleSort('Status')}>
                                <div className="flex items-center">Status <SortIcon column="Status" /></div>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedPOs.map(po => (
                            <TableRow key={po.PurchaseOrderID}>
                                <TableCell className="font-mono text-xs font-semibold">{po.PONumber}</TableCell>
                                <TableCell>{po.SupplierName}</TableCell>
                                <TableCell>{po.OrderDate}</TableCell>
                                <TableCell>{po.ExpectedDeliveryDate}</TableCell>
                                <TableCell className="font-medium">${po.TotalAmount.toFixed(2)}</TableCell>
                                <TableCell>
                                    <Badge variant={po.Status === 'Received' ? 'success' : 'warning'}>{po.Status}</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </TabsContent>

        <TabsContent value="suppliers">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                 <Card className="flex items-center justify-center border-dashed border-2 bg-zinc-50/50 hover:bg-zinc-50 cursor-pointer h-full min-h-[150px]">
                    <div className="text-center">
                        <div className="h-10 w-10 bg-zinc-200 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Plus className="h-6 w-6 text-zinc-500" />
                        </div>
                        <p className="font-medium text-zinc-600">Add New Supplier</p>
                    </div>
                </Card>
                {MOCK_SUPPLIERS.map(sup => (
                    <Card key={sup.SupplierID}>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4 className="font-bold text-lg text-zinc-900">{sup.SupplierName}</h4>
                                    <p className="text-xs text-zinc-500 font-mono">{sup.SupplierID}</p>
                                </div>
                                <Truck className="h-5 w-5 text-zinc-400" />
                            </div>
                            <div className="space-y-2 text-sm text-zinc-600">
                                <div className="flex items-center gap-2">
                                    <UserSquare2 className="h-4 w-4" /> {sup.ContactPerson}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" /> {sup.ContactNumber}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" /> {sup.Email}
                                </div>
                            </div>
                            <div className="pt-2">
                                <Button variant="outline" size="sm" className="w-full">View Details</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};