import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { StatusDot } from '../../../components/ui/StatusDot';
import { Input } from '../../../components/ui/Input';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../../../components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/Dialog';
import { Label } from '../../../components/ui/Label';
import { Select } from '../../../components/ui/Select';
import { Avatar, AvatarFallback } from '../../../components/ui/Avatar';
import { MOCK_CUSTOMERS } from '../../../lib/mockData';
import { UserSquare2, Star, Plus, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Customer } from '../../../types';

const ITEMS_PER_PAGE = 10;

export const CRM: React.FC = () => {
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

    const columns: ColumnDef<Customer>[] = [
        {
            accessorKey: "CustomerID",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Customer ID <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{row.getValue("CustomerID")}</span>
        },
        {
            accessorKey: "CustomerName",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Name <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback><UserSquare2 className="h-4 w-4 text-zinc-500" /></AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{row.getValue("CustomerName")}</span>
                </div>
            )
        },
        {
            accessorKey: "CustomerType",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Type <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <StatusDot variant="info">{row.getValue("CustomerType")}</StatusDot>
        },
        {
            accessorKey: "ContactNumber",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Contact <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="text-zinc-700 dark:text-zinc-300">{row.getValue("ContactNumber")}</span>
        },
        {
            accessorKey: "LoyaltyPoints",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Loyalty Points <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-500">
                    <Star className="h-3 w-3 fill-current" /> {row.getValue("LoyaltyPoints")}
                </div>
            )
        },
        {
            id: "actions",
            header: () => <div className="text-right text-xs font-semibold pr-2">Actions</div>,
            cell: () => (
                <div className="flex justify-end">
                    <Button variant="ghost" size="sm">Edit</Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
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
                    <Plus className="mr-2 h-4 w-4" /> Add Customer
                </Button>
            </div>

            <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                <DataTable columns={columns} data={MOCK_CUSTOMERS} />
            </div>
        </div>
    );
};