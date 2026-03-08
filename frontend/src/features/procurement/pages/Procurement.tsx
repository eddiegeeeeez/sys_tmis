import React, { useState, useMemo, useEffect } from 'react';
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
import { procurementService, Supplier as ApiSupplier, PurchaseOrder as ApiPO } from '../services/procurementService';
import { Loader2, Truck, PackagePlus, Plus, Phone, Mail, ArrowUpDown, ArrowUp, ArrowDown, UserSquare2, PackageCheck } from 'lucide-react';
import { PurchaseOrder, UserRole } from '../../../types';

const ITEMS_PER_PAGE = 10;

interface ProcurementProps {
    currentRole?: string;
}

export const Procurement: React.FC<ProcurementProps> = ({ currentRole }) => {
    const canManageSuppliers = currentRole === UserRole.MANAGER;
    const [suppliers, setSuppliers] = useState<ApiSupplier[]>([]);
    const [purchaseOrders, setPurchaseOrders] = useState<ApiPO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
    const [isPOModalOpen, setIsPOModalOpen] = useState(false);
    const [isEditSupplierOpen, setIsEditSupplierOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<ApiSupplier | null>(null);

    // Form States
    const [newSupplier, setNewSupplier] = useState({
        companyName: '',
        contactPerson: '',
        contactNumber: '',
        email: '',
        address: ''
    });

    const [newPO, setNewPO] = useState({
        supplierId: '',
        expectedDeliveryDate: '',
        items: [] // Simplified for now
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [supRes, poRes] = await Promise.all([
                procurementService.getSuppliers(),
                procurementService.getPurchaseOrders()
            ]);
            if (supRes.data.success) setSuppliers(supRes.data.data);
            if (poRes.data.success) setPurchaseOrders(poRes.data.data);
        } catch (error) {
            console.error("Failed to fetch procurement data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveSupplier = async () => {
        setIsSaving(true);
        try {
            const res = await procurementService.createSupplier(newSupplier);
            if (res.data.success) {
                setIsSupplierModalOpen(false);
                fetchData();
                setNewSupplier({ companyName: '', contactPerson: '', contactNumber: '', email: '', address: '' });
            }
        } catch (error) {
            console.error("Error saving supplier", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateSupplier = async () => {
        if (!editingSupplier) return;
        setIsSaving(true);
        try {
            const res = await procurementService.updateSupplier(editingSupplier.id, editingSupplier);
            if (res.data.success) {
                setIsEditSupplierOpen(false);
                fetchData();
            }
        } catch (error) {
            console.error("Error updating supplier", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreatePO = async () => {
        setIsSaving(true);
        try {
            // In a real scenario, we'd add items. For now, creating a basic PO.
            const res = await procurementService.createPurchaseOrder({
                ...newPO,
                supplierId: parseInt(newPO.supplierId),
                items: []
            });
            if (res.data.success) {
                setIsPOModalOpen(false);
                fetchData();
                setNewPO({ supplierId: '', expectedDeliveryDate: '', items: [] });
            }
        } catch (error) {
            console.error("Error creating PO", error);
        } finally {
            setIsSaving(false);
        }
    };

    const [isReceiving, setIsReceiving] = useState(false);

    const handleReceivePO = async (poId: number) => {
        setIsReceiving(true);
        try {
            const res = await procurementService.receivePurchaseOrder(poId);
            if (res.data.success) {
                fetchData();
            }
        } catch (error: any) {
            const msg = error?.response?.data?.message || 'Failed to receive PO';
            alert(msg);
        } finally {
            setIsReceiving(false);
        }
    };

    const columns: ColumnDef<ApiPO>[] = [
        {
            accessorKey: "poNumber",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    PO Number <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">{row.getValue("poNumber")}</span>
        },
        {
            accessorKey: "supplierName",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Supplier <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="text-zinc-700 dark:text-zinc-300">{row.getValue("supplierName") || "N/A"}</span>
        },
        {
            accessorKey: "orderDate",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Order Date <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="text-zinc-700 dark:text-zinc-300">{new Date(row.getValue("orderDate")).toLocaleDateString()}</span>
        },
        {
            accessorKey: "expectedDeliveryDate",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Expected Delivery <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="text-zinc-700 dark:text-zinc-300">{row.getValue("expectedDeliveryDate") ? new Date(row.getValue("expectedDeliveryDate")).toLocaleDateString() : 'N/A'}</span>
        },
        {
            accessorKey: "totalAmount",
            header: ({ column }) => (
                <div className="text-right">
                    <Button variant="ghost" className="hover:bg-transparent text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Total Amount <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => <div className="text-right font-mono font-medium text-zinc-900 dark:text-zinc-100">₱{(row.getValue("totalAmount") as number).toFixed(2)}</div>
        },
        {
            accessorKey: "status",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Status <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                return <StatusDot variant={status === 'Received' ? 'success' : 'warning'}>{status}</StatusDot>;
            }
        },
        {
            id: "actions",
            header: () => <div className="text-right text-xs font-semibold pr-2">Actions</div>,
            cell: ({ row }) => {
                const po = row.original;
                if (po.status === 'Received') {
                    return (
                        <div className="text-right text-xs text-zinc-400 dark:text-zinc-500 pr-2">
                            {po.receivedDate ? new Date(po.receivedDate).toLocaleDateString() : ''}{po.receivedBy ? ` by ${po.receivedBy}` : ''}
                        </div>
                    );
                }
                return (
                    <div className="flex justify-end pr-2">
                        <Button size="sm" variant="outline" disabled={isReceiving} onClick={() => handleReceivePO(po.id)}>
                            {isReceiving ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <PackageCheck className="mr-1 h-3 w-3" />}
                            Receive
                        </Button>
                    </div>
                );
            }
        }
    ];

    return (
        <div className="space-y-6">
            {/* Edit Supplier Modal */}
            <Dialog open={isEditSupplierOpen} onOpenChange={setIsEditSupplierOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Supplier</DialogTitle>
                        <DialogDescription>Update supplier details.</DialogDescription>
                    </DialogHeader>
                    {editingSupplier && (
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Company Name</Label>
                                <Input value={editingSupplier.companyName} onChange={e => setEditingSupplier({ ...editingSupplier, companyName: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Contact Person</Label>
                                    <Input value={editingSupplier.contactPerson} onChange={e => setEditingSupplier({ ...editingSupplier, contactPerson: e.target.value })} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Phone Number</Label>
                                    <Input value={editingSupplier.contactNumber} onChange={e => setEditingSupplier({ ...editingSupplier, contactNumber: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Email</Label>
                                <Input type="email" value={editingSupplier.email} onChange={e => setEditingSupplier({ ...editingSupplier, email: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Address</Label>
                                <Input value={editingSupplier.address} onChange={e => setEditingSupplier({ ...editingSupplier, address: e.target.value })} />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditSupplierOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdateSupplier} disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
                            <Input
                                placeholder="e.g. Acme Corp"
                                value={newSupplier.companyName}
                                onChange={e => setNewSupplier({ ...newSupplier, companyName: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Contact Person</Label>
                                <Input
                                    value={newSupplier.contactPerson}
                                    onChange={e => setNewSupplier({ ...newSupplier, contactPerson: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Phone Number</Label>
                                <Input
                                    value={newSupplier.contactNumber}
                                    onChange={e => setNewSupplier({ ...newSupplier, contactNumber: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={newSupplier.email}
                                onChange={e => setNewSupplier({ ...newSupplier, email: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Address</Label>
                            <Input
                                value={newSupplier.address}
                                onChange={e => setNewSupplier({ ...newSupplier, address: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSupplierModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveSupplier} disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Save Supplier
                        </Button>
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
                            <select
                                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300"
                                value={newPO.supplierId}
                                onChange={e => setNewPO({ ...newPO, supplierId: e.target.value })}
                            >
                                <option value="">Select a supplier...</option>
                                {suppliers.map(s => (
                                    <option key={s.id} value={s.id}>{s.companyName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Order Date</Label>
                                <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} readOnly />
                            </div>
                            <div className="grid gap-2">
                                <Label>Expected Delivery</Label>
                                <Input
                                    type="date"
                                    value={newPO.expectedDeliveryDate}
                                    onChange={e => setNewPO({ ...newPO, expectedDeliveryDate: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="border rounded-md p-4 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 min-h-[100px] flex items-center justify-center text-zinc-400 text-sm">
                            Basic PO Creation (Add Items in full implementation)
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPOModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreatePO} disabled={isSaving || !newPO.supplierId}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Submit Order
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Procurement</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                        {canManageSuppliers ? 'Manage suppliers and purchase orders.' : 'View suppliers and manage purchase orders.'}
                    </p>
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
                    {isLoading ? (
                        <div className="h-[300px] flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
                        </div>
                    ) : (
                        <DataTable columns={columns} data={purchaseOrders} />
                    )}
                </TabsContent>

                <TabsContent value="suppliers">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {canManageSuppliers && (
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
                        )}
                        {suppliers.map(sup => (
                            <Card key={sup.id} className="border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 line-clamp-1">{sup.companyName}</h4>
                                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono mt-0.5 uppercase tracking-wider">SUP-{sup.id.toString().padStart(4, '0')}</p>
                                        </div>
                                        <div className="h-8 w-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
                                            <Truck className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                                        </div>
                                    </div>
                                    <div className="space-y-2.5 text-sm text-zinc-600 dark:text-zinc-300">
                                        <div className="flex items-center gap-2.5">
                                            <div className="h-5 w-5 rounded bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
                                                <UserSquare2 className="h-3 w-3 text-brand-600 dark:text-brand-400" />
                                            </div>
                                            <span className="truncate">{sup.contactPerson}</span>
                                        </div>
                                        <div className="flex items-center gap-2.5">
                                            <div className="h-5 w-5 rounded bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                                                <Phone className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <span className="truncate">{sup.contactNumber}</span>
                                        </div>
                                        <div className="flex items-center gap-2.5">
                                            <div className="h-5 w-5 rounded bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                                                <Mail className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <span className="truncate">{sup.email}</span>
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        {canManageSuppliers && (
                                        <Button variant="outline" size="sm" className="w-full border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => { setEditingSupplier(sup); setIsEditSupplierOpen(true); }}>Edit Supplier</Button>
                                        )}
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