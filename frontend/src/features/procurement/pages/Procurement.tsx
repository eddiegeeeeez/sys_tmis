import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { StatusDot } from '../../../components/ui/StatusDot';
import { Input } from '../../../components/ui/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/Tabs';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../../../components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/Dialog';
import { Label } from '../../../components/ui/Label';
import { Select } from '../../../components/ui/Select';
import { MOCK_SUPPLIERS, MOCK_PO } from '../../../lib/mockData';
import { Truck, PackagePlus, Plus, Phone, Mail, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { PurchaseOrder } from '../../../types';
import { UserSquare2 } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export const Procurement: React.FC = () => {
    const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
    const [isPOModalOpen, setIsPOModalOpen] = useState(false);

    const columns: ColumnDef<PurchaseOrder>[] = [
        {
            accessorKey: "PONumber",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    PO Number <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">{row.getValue("PONumber")}</span>
        },
        {
            accessorKey: "SupplierName",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Supplier <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="text-zinc-700 dark:text-zinc-300">{row.getValue("SupplierName")}</span>
        },
        {
            accessorKey: "OrderDate",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Order Date <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="text-zinc-700 dark:text-zinc-300">{row.getValue("OrderDate")}</span>
        },
        {
            accessorKey: "ExpectedDeliveryDate",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Expected Delivery <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="text-zinc-700 dark:text-zinc-300">{row.getValue("ExpectedDeliveryDate")}</span>
        },
        {
            accessorKey: "TotalAmount",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Total Amount <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="font-medium text-zinc-900 dark:text-zinc-100">${(row.getValue("TotalAmount") as number).toFixed(2)}</span>
        },
        {
            accessorKey: "Status",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Status <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const status = row.getValue("Status") as string;
                return <StatusDot variant={status === 'Received' ? 'success' : 'warning'}>{status}</StatusDot>;
            }
        }
    ];

    return (
        <div className="space-y-6">
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
                            <PackagePlus className="mr-2 h-4 w-4" /> Create Purchase Order
                        </Button>
                    </div>
                </div>

                <TabsContent value="po" className="space-y-4">
                    <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                        <DataTable columns={columns} data={MOCK_PO} />
                    </div>
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