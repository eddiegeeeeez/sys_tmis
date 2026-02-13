import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/Tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/Dialog';
import { Label } from '../../../components/ui/Label';
import { Select } from '../../../components/ui/Select';
import { Pagination } from '../../../components/ui/Pagination';
import { MOCK_SUPPLIERS, MOCK_PO } from '../../../lib/mockData';
import { Truck, PackagePlus, Plus, Phone, Mail, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { PurchaseOrder } from '../../../types';
import { UserSquare2 } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export const Procurement: React.FC = () => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof PurchaseOrder; direction: 'asc' | 'desc' } | null>(null);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

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

  const totalPages = Math.ceil(sortedPOs.length / ITEMS_PER_PAGE);
  const paginatedPOs = sortedPOs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const SortIcon = ({ column }: { column: keyof PurchaseOrder }) => {
    if (sortConfig?.key !== column) return <ArrowUpDown className="ml-2 h-4 w-4 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4 text-zinc-900 dark:text-zinc-50" />
      : <ArrowDown className="ml-2 h-4 w-4 text-zinc-900 dark:text-zinc-50" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Create Supplier Modal */}
      <Dialog open={isSupplierModalOpen} onOpenChange={setIsSupplierModalOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Register New Supplier</DialogTitle>
                  <DialogDescription>Add supplier details for procurement.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                      <Label>Company Name</Label>
                      <Input placeholder="e.g. Acme Corp" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                          <Label>Contact Person</Label>
                          <Input />
                      </div>
                      <div className="grid gap-2">
                          <Label>Phone Number</Label>
                          <Input />
                      </div>
                  </div>
                  <div className="grid gap-2">
                      <Label>Email</Label>
                      <Input type="email" />
                  </div>
                  <div className="grid gap-2">
                      <Label>Address</Label>
                      <Input />
                  </div>
              </div>
              <DialogFooter>
                  <Button variant="outline" onClick={() => setIsSupplierModalOpen(false)}>Cancel</Button>
                  <Button onClick={() => setIsSupplierModalOpen(false)}>Save Supplier</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      {/* Create PO Modal */}
      <Dialog open={isPOModalOpen} onOpenChange={setIsPOModalOpen}>
          <DialogContent className="max-w-xl">
              <DialogHeader>
                  <DialogTitle>Create Purchase Order</DialogTitle>
                  <DialogDescription>Initiate a new order to replenish stock.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                      <Label>Supplier</Label>
                      <Select>
                          <option>Select a supplier...</option>
                          <option>TechGizmos Inc.</option>
                          <option>Global Apparel Co.</option>
                      </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                          <Label>Order Date</Label>
                          <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                      </div>
                      <div className="grid gap-2">
                          <Label>Expected Delivery</Label>
                          <Input type="date" />
                      </div>
                  </div>
                  <div className="border rounded-md p-4 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 min-h-[100px] flex items-center justify-center text-zinc-400 text-sm">
                      Items list will go here (Product Selector)
                  </div>
              </div>
              <DialogFooter>
                  <Button variant="outline" onClick={() => setIsPOModalOpen(false)}>Cancel</Button>
                  <Button onClick={() => setIsPOModalOpen(false)}>Submit Order</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Procurement</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage suppliers and purchase orders.</p>
        </div>
      </div>

      <Tabs defaultValue="po" className="w-full">
        <div className="flex items-center justify-between mb-4">
             <TabsList>
                <TabsTrigger value="po">Purchase Orders</TabsTrigger>
                <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
             </TabsList>
             <div className="flex gap-2">
                 <Button onClick={() => setIsPOModalOpen(true)}>
                    <PackagePlus className="mr-2 h-4 w-4"/> Create Purchase Order
                 </Button>
             </div>
        </div>

        <TabsContent value="po" className="space-y-4">
            <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => handleSort('PONumber')}>
                                <div className="flex items-center">PO Number <SortIcon column="PONumber" /></div>
                            </TableHead>
                            <TableHead className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => handleSort('SupplierName')}>
                                <div className="flex items-center">Supplier <SortIcon column="SupplierName" /></div>
                            </TableHead>
                            <TableHead className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => handleSort('OrderDate')}>
                                <div className="flex items-center">Order Date <SortIcon column="OrderDate" /></div>
                            </TableHead>
                            <TableHead className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => handleSort('ExpectedDeliveryDate')}>
                                <div className="flex items-center">Expected Delivery <SortIcon column="ExpectedDeliveryDate" /></div>
                            </TableHead>
                            <TableHead className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => handleSort('TotalAmount')}>
                                <div className="flex items-center">Total Amount <SortIcon column="TotalAmount" /></div>
                            </TableHead>
                            <TableHead className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => handleSort('Status')}>
                                <div className="flex items-center">Status <SortIcon column="Status" /></div>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedPOs.map(po => (
                            <TableRow key={po.PurchaseOrderID} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                                <TableCell className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">{po.PONumber}</TableCell>
                                <TableCell className="text-zinc-700 dark:text-zinc-300">{po.SupplierName}</TableCell>
                                <TableCell className="text-zinc-700 dark:text-zinc-300">{po.OrderDate}</TableCell>
                                <TableCell className="text-zinc-700 dark:text-zinc-300">{po.ExpectedDeliveryDate}</TableCell>
                                <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">${po.TotalAmount.toFixed(2)}</TableCell>
                                <TableCell>
                                    <Badge variant={po.Status === 'Received' ? 'success' : 'warning'}>{po.Status}</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage} 
            />
        </TabsContent>

        <TabsContent value="suppliers">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                 <Card 
                    className="flex items-center justify-center border-dashed border-2 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer h-full min-h-[150px] border-zinc-200 dark:border-zinc-800"
                    onClick={() => setIsSupplierModalOpen(true)}
                 >
                    <div className="text-center">
                        <div className="h-10 w-10 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Plus className="h-6 w-6 text-zinc-500 dark:text-zinc-400" />
                        </div>
                        <p className="font-medium text-zinc-600 dark:text-zinc-400">Add New Supplier</p>
                    </div>
                </Card>
                {MOCK_SUPPLIERS.map(sup => (
                    <Card key={sup.SupplierID} className="border-zinc-200 dark:border-zinc-800">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{sup.SupplierName}</h4>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">{sup.SupplierID}</p>
                                </div>
                                <Truck className="h-5 w-5 text-zinc-400" />
                            </div>
                            <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
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