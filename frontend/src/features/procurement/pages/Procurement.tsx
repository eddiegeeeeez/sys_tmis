import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusDot } from '../../../components/ui/StatusDot';

import { Input } from '../../../components/ui/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/Tabs';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../../../components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/Dialog';
import { Label } from '../../../components/ui/Label';
import { procurementService, Supplier as ApiSupplier, PurchaseOrder as ApiPO } from '../services/procurementService';
import { Loader2, Truck, PackagePlus, Plus, Phone, Mail, ArrowUpDown, UserSquare2, PackageCheck, X } from 'lucide-react';
import { inventoryService, Product } from '../../inventory/services/inventoryService';
import { UserRole } from '../../../types';

interface ProcurementProps {
    currentRole?: string;
}

export const Procurement: React.FC<ProcurementProps> = ({ currentRole }) => {
    const canManageSuppliers = currentRole === UserRole.MANAGER || currentRole === UserRole.INVENTORY_CLERK;
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

    const fetchData = useCallback(async () => {
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
            toast.error('Failed to load procurement data.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSaveSupplier = async () => {
        setIsSaving(true);
        try {
            const res = await procurementService.createSupplier(newSupplier);
            if (res.data.success) {
                setIsSupplierModalOpen(false);
                fetchData();
                toast.success('Supplier registered successfully.');
                setNewSupplier({ companyName: '', contactPerson: '', contactNumber: '', email: '', address: '' });
            }
        } catch (error) {
            console.error("Error saving supplier", error);
            toast.error('Failed to save supplier.');
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
                toast.success('Supplier updated successfully.');
            }
        } catch (error) {
            console.error("Error updating supplier", error);
            toast.error('Failed to update supplier.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreatePO = async () => {
        setIsSaving(true);
        try {
            const res = await procurementService.createPurchaseOrder({
                supplierId: parseInt(newPO.supplierId),
                expectedDeliveryDate: newPO.expectedDeliveryDate,
                items: poItems.map(({ productId, quantity, unitCost }) => ({ productId, quantity, unitCost }))
            });
            if (res.data.success) {
                setIsPOModalOpen(false);
                fetchData();
                toast.success('Purchase order created successfully.');
                setNewPO({ supplierId: '', expectedDeliveryDate: '', items: [] });
                setPoItems([]);
                setNewPOItem({ productId: '', quantity: '1', unitCost: '' });
            }
        } catch (error) {
            console.error("Error creating PO", error);
            toast.error('Failed to create purchase order.');
        } finally {
            setIsSaving(false);
        }
    };

    const [isReceiving, setIsReceiving] = useState(false);
    const [activeTab, setActiveTab] = useState('po');
    const [pendingReceivePO, setPendingReceivePO] = useState<ApiPO | null>(null);

    const [products, setProducts] = useState<Product[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [newPOItem, setNewPOItem] = useState({ productId: '', quantity: '1', unitCost: '' });
    const [poItems, setPoItems] = useState<{ productId: number; productName: string; quantity: number; unitCost: number }[]>([]);

    useEffect(() => {
        if (!isPOModalOpen) return;
        setIsLoadingProducts(true);
        inventoryService.getProducts()
            .then(res => { if (res.data.success) setProducts(res.data.data); })
            .catch(() => {})
            .finally(() => setIsLoadingProducts(false));
    }, [isPOModalOpen]);

    const handleAddPOItem = () => {
        const product = products.find(p => p.id === parseInt(newPOItem.productId));
        if (!product || !newPOItem.quantity || !newPOItem.unitCost) return;
        setPoItems(prev => [...prev, {
            productId: product.id,
            productName: product.name,
            quantity: parseInt(newPOItem.quantity),
            unitCost: parseFloat(newPOItem.unitCost)
        }]);
        setNewPOItem({ productId: '', quantity: '1', unitCost: '' });
    };

    const handleReceivePO = useCallback(async (poId: number) => {
        setIsReceiving(true);
        setPendingReceivePO(null);
        try {
            const res = await procurementService.receivePurchaseOrder(poId);
            if (res.data.success) {
                toast.success('Purchase order marked as received. Stock updated.');
                fetchData();
            }
        } catch (error: any) {
            const msg = error?.response?.data?.message || 'Failed to receive PO';
            toast.error(msg);
        } finally {
            setIsReceiving(false);
        }
    }, [fetchData]);

    const columns: ColumnDef<ApiPO>[] = useMemo(() => [
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
                        <Button size="sm" variant="outline" disabled={isReceiving} onClick={() => setPendingReceivePO(po)}>
                            <PackageCheck className="mr-1 h-3 w-3" />
                            Receive
                        </Button>
                    </div>
                );
            }
        }
    ], [isReceiving, handleReceivePO]);

    return (
        <div className="space-y-6">
            {/* Receive PO Confirmation Modal */}
            <Dialog open={!!pendingReceivePO} onOpenChange={open => !open && setPendingReceivePO(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <PackageCheck className="h-5 w-5 text-emerald-600" />
                            Confirm Receipt
                        </DialogTitle>
                        <DialogDescription className="pt-1">
                            Mark <span className="font-semibold text-zinc-900 dark:text-zinc-100">{pendingReceivePO?.poNumber}</span> from <span className="font-semibold text-zinc-900 dark:text-zinc-100">{pendingReceivePO?.supplierName}</span> as received?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="rounded-md border border-emerald-100 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-900/20 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-300">
                        This will mark the order as received and update stock levels for all items in this purchase order.
                    </div>
                    <DialogFooter className="mt-2">
                        <Button variant="outline" onClick={() => setPendingReceivePO(null)}>Cancel</Button>
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            disabled={isReceiving}
                            onClick={() => pendingReceivePO && handleReceivePO(pendingReceivePO.id)}
                        >
                            {isReceiving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PackageCheck className="mr-2 h-4 w-4" />}
                            Confirm Receipt
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
            <Dialog open={isPOModalOpen} onOpenChange={open => { setIsPOModalOpen(open); if (!open) { setPoItems([]); setNewPOItem({ productId: '', quantity: '1', unitCost: '' }); } }}>
                <DialogContent className="max-w-2xl">
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
                        <div className="grid gap-3">
                            <Label className="text-sm font-semibold">Order Items</Label>
                            <div className="flex gap-2 items-end">
                                <div className="flex-1">
                                    <select
                                        className="flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300"
                                        value={newPOItem.productId}
                                        disabled={isLoadingProducts}
                                        onChange={e => {
                                            const prod = products.find(p => p.id === parseInt(e.target.value));
                                            setNewPOItem({ ...newPOItem, productId: e.target.value, unitCost: prod ? prod.costPrice.toFixed(2) : '' });
                                        }}
                                    >
                                        <option value="">{isLoadingProducts ? 'Loading products...' : 'Select product...'}</option>
                                        {products
                                            .filter(p => !poItems.some(i => i.productId === p.id))
                                            .map(p => (
                                                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                                            ))}
                                    </select>
                                </div>
                                <div className="w-20">
                                    <Input
                                        type="number" min="1" placeholder="Qty"
                                        value={newPOItem.quantity}
                                        onChange={e => setNewPOItem({ ...newPOItem, quantity: e.target.value })}
                                    />
                                </div>
                                <div className="w-28">
                                    <Input
                                        type="number" min="0" step="0.01" placeholder="Unit Cost"
                                        value={newPOItem.unitCost}
                                        onChange={e => setNewPOItem({ ...newPOItem, unitCost: e.target.value })}
                                    />
                                </div>
                                <Button
                                    type="button" size="sm" variant="outline"
                                    disabled={!newPOItem.productId || !newPOItem.quantity || !newPOItem.unitCost}
                                    onClick={handleAddPOItem}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>

                            {poItems.length > 0 ? (
                                <div className="rounded-md border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                                    <div className="max-h-48 overflow-y-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-zinc-50 dark:bg-zinc-800 sticky top-0">
                                                <tr>
                                                    <th className="text-left px-3 py-2 text-xs font-medium text-zinc-500">Product</th>
                                                    <th className="text-right px-3 py-2 text-xs font-medium text-zinc-500">Qty</th>
                                                    <th className="text-right px-3 py-2 text-xs font-medium text-zinc-500">Unit Cost</th>
                                                    <th className="text-right px-3 py-2 text-xs font-medium text-zinc-500">Subtotal</th>
                                                    <th className="w-8"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                                {poItems.map((item, idx) => (
                                                    <tr key={idx} className="bg-white dark:bg-zinc-900">
                                                        <td className="px-3 py-2 text-zinc-700 dark:text-zinc-300 max-w-[160px] truncate">{item.productName}</td>
                                                        <td className="px-3 py-2 text-right text-zinc-700 dark:text-zinc-300">{item.quantity}</td>
                                                        <td className="px-3 py-2 text-right font-mono text-zinc-700 dark:text-zinc-300">₱{item.unitCost.toFixed(2)}</td>
                                                        <td className="px-3 py-2 text-right font-mono font-medium text-zinc-900 dark:text-zinc-100">₱{(item.quantity * item.unitCost).toFixed(2)}</td>
                                                        <td className="px-2 py-2 text-center">
                                                            <button
                                                                onClick={() => setPoItems(prev => prev.filter((_, i) => i !== idx))}
                                                                className="text-zinc-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <X className="h-3.5 w-3.5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 flex justify-end items-center gap-3">
                                        <span className="text-xs font-medium text-zinc-500">Order Total</span>
                                        <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                                            ₱{poItems.reduce((sum, i) => sum + i.quantity * i.unitCost, 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="border rounded-md border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-6 text-center text-sm text-zinc-400">
                                    No items added yet. Select a product above to get started.
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setIsPOModalOpen(false); setPoItems([]); setNewPOItem({ productId: '', quantity: '1', unitCost: '' }); }}>Cancel</Button>
                        <Button onClick={handleCreatePO} disabled={isSaving || !newPO.supplierId || poItems.length === 0}>
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

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex items-center justify-between mb-4">
                    <TabsList>
                        <TabsTrigger value="po">Purchase Orders</TabsTrigger>
                        <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
                    </TabsList>
                    <div className="flex gap-2">
                        {activeTab === 'suppliers' ? (
                            canManageSuppliers && (
                                <Button onClick={() => setIsSupplierModalOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Supplier
                                </Button>
                            )
                        ) : (
                            <Button onClick={() => setIsPOModalOpen(true)}>
                                <PackagePlus className="mr-2 h-4 w-4" /> Create Purchase Order
                            </Button>
                        )}
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