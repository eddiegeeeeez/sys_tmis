import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { DataTable } from '../../../components/ui/data-table';
import { StatusDot } from '../../../components/ui/StatusDot';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Search, MoreHorizontal, UserPlus, Mail, Phone, MapPin, ArrowUpDown, Loader2, Pencil } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../components/ui/DropdownMenu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/Dialog';
import { Label } from '../../../components/ui/Label';
import { customerService, Customer as ApiCustomer } from '../services/customerService';
import { UserRole } from '../../../types';

interface CRMProps {
    currentRole?: string;
}

const CRM = ({ currentRole }: CRMProps) => {
    const [customers, setCustomers] = useState<ApiCustomer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<ApiCustomer | null>(null);
    const [editSuccess, setEditSuccess] = useState(false);
    const canEdit = currentRole === UserRole.SUPER_ADMIN || currentRole === UserRole.MANAGER || currentRole === UserRole.CASHIER;
    const [newCustomer, setNewCustomer] = useState<Partial<ApiCustomer>>({
        customerName: '',
        customerType: 'Retail',
        email: '',
        contactNumber: '',
        address: ''
    });

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        setIsLoading(true);
        try {
            const response = await customerService.getCustomers();
            if (response.success && response.data) {
                setCustomers(response.data);
            }
        } catch (error) {
            console.error("Failed to load customers", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await customerService.createCustomer(newCustomer);
            if (response.success) {
                alert("Customer created successfully");
                setIsAddOpen(false);
                setNewCustomer({
                    customerName: '',
                    customerType: 'Retail',
                    email: '',
                    contactNumber: '',
                    address: ''
                });
                loadCustomers();
            }
        } catch (error) {
            alert("Failed to create customer");
        }
    };

    const handleUpdateCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCustomer) return;
        try {
            const response = await customerService.updateCustomer(editingCustomer.id, editingCustomer);
            if (response.success) {
                setEditSuccess(true);
                setTimeout(() => {
                    setIsEditOpen(false);
                    setEditSuccess(false);
                    loadCustomers();
                }, 800);
            } else {
                alert(response.message || 'Failed to update customer');
            }
        } catch (error) {
            alert("Failed to update customer");
        }
    };

    const columns = useMemo<ColumnDef<ApiCustomer>[]>(() => [
        {
            accessorKey: "id",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    ID <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{row.getValue("id")}</span>
        },
        {
            accessorKey: "customerName",
            header: ({ column }) => (
                <Button variant="ghost" className="-ml-3 h-8 data-[state=open]:bg-accent" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Customer Name <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="font-medium text-zinc-900 dark:text-zinc-100">{row.getValue("customerName")}</span>
        },
        {
            accessorKey: "customerType",
            header: "Type",
            cell: ({ row }) => {
                const type = row.getValue("customerType") as string;
                const variant = type === 'Corporate' ? 'info' : type === 'Wholesale' ? 'warning' : 'neutral';
                return <StatusDot variant={variant}>{type}</StatusDot>;
            }
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => <span className="text-zinc-500">{row.getValue("email") || '-'}</span>
        },
        {
            accessorKey: "contactNumber",
            header: "Contact",
            cell: ({ row }) => <span className="text-zinc-500">{row.getValue("contactNumber") || '-'}</span>
        },
        {
            accessorKey: "loyaltyPoints",
            header: "Loyalty Points",
            cell: ({ row }) => <span className="font-mono">{row.getValue("loyaltyPoints")}</span>
        },
        {
            id: "actions",
            cell: ({ row }) => canEdit ? (
                <div className="flex justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px] bg-white dark:bg-zinc-900 dark:border-zinc-800">
                            <DropdownMenuItem onClick={() => { setEditingCustomer(row.original); setIsEditOpen(true); }}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit Customer
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ) : null
        }
    ], [canEdit]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Customer Relations</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage your customer records and loyalty programs.</p>
                </div>
                <Button onClick={() => setIsAddOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" /> Add Customer
                </Button>
            </div>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Customer</DialogTitle>
                        <DialogDescription>Enter customer details to create a new profile.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateCustomer} className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label>Full Name / Company Name</Label>
                            <Input required value={newCustomer.customerName} onChange={e => setNewCustomer({ ...newCustomer, customerName: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Customer Type</Label>
                                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={newCustomer.customerType} onChange={e => setNewCustomer({ ...newCustomer, customerType: e.target.value })}>
                                    <option value="Retail">Retail</option>
                                    <option value="Wholesale">Wholesale</option>
                                    <option value="Corporate">Corporate</option>
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Email</Label>
                                <Input type="email" value={newCustomer.email} onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Contact Number</Label>
                            <Input value={newCustomer.contactNumber} onChange={e => setNewCustomer({ ...newCustomer, contactNumber: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Address</Label>
                            <Input value={newCustomer.address} onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                            <Button type="submit">Save Customer</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Customer</DialogTitle>
                        <DialogDescription>Update customer information.</DialogDescription>
                    </DialogHeader>
                    {editingCustomer && (
                        <form onSubmit={handleUpdateCustomer} className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label>Full Name / Company Name</Label>
                                <Input required value={editingCustomer.customerName} onChange={e => setEditingCustomer({ ...editingCustomer, customerName: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Customer Type</Label>
                                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={editingCustomer.customerType} onChange={e => setEditingCustomer({ ...editingCustomer, customerType: e.target.value })}>
                                        <option value="Retail">Retail</option>
                                        <option value="Wholesale">Wholesale</option>
                                        <option value="Corporate">Corporate</option>
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Email</Label>
                                    <Input type="email" value={editingCustomer.email || ''} onChange={e => setEditingCustomer({ ...editingCustomer, email: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Contact Number</Label>
                                <Input value={editingCustomer.contactNumber || ''} onChange={e => setEditingCustomer({ ...editingCustomer, contactNumber: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Address</Label>
                                <Input value={editingCustomer.address || ''} onChange={e => setEditingCustomer({ ...editingCustomer, address: e.target.value })} />
                            </div>
                            <DialogFooter>                        {editSuccess ? (
                            <p className="text-sm text-green-600 font-medium mr-auto">✓ Customer updated successfully</p>
                        ) : null}                                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                                <Button type="submit">Save Changes</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            <div className="relative">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-zinc-950/50 z-10 rounded-md">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}
                <DataTable columns={columns} data={customers} />
            </div>
        </div>
    );
};

export default CRM;