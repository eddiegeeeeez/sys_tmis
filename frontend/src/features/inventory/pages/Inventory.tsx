import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { StatusDot } from '../../../components/ui/StatusDot';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../../../components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/Dialog';
import { Label } from '../../../components/ui/Label';
import { Select } from '../../../components/ui/Select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../components/ui/DropdownMenu';
import { inventoryService, Product as ApiProduct, StockMovement, StockMovementSummary } from '../services/inventoryService';
import { procurementService, Supplier } from '../../procurement/services/procurementService';
import { Loader2, Search, ArrowUpCircle, MoreHorizontal, Download, ArrowUpDown, X, Pencil, Upload, Trash2, PackagePlus, History } from 'lucide-react';
import { Product } from '../../../types';

export const Inventory: React.FC = () => {
    const [products, setProducts] = useState<ApiProduct[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [filterTerm, setFilterTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [stockStatusFilter, setStockStatusFilter] = useState('All');
    const [isAddProductOpen, setIsAddProductOpen] = useState(false);
    const [isEditProductOpen, setIsEditProductOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ApiProduct | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [editError, setEditError] = useState<string | null>(null);

    // Stock Movement State
    const [isMovementOpen, setIsMovementOpen] = useState(false);
    const [movementProduct, setMovementProduct] = useState<ApiProduct | null>(null);
    const [movementType, setMovementType] = useState<'STOCK_IN' | 'WASTE' | 'ADJUSTMENT'>('STOCK_IN');
    const [movementQty, setMovementQty] = useState(1);
    const [movementNotes, setMovementNotes] = useState('');
    const [movementRef, setMovementRef] = useState('');
    const [movementError, setMovementError] = useState<string | null>(null);

    // Stock History State
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [historyProduct, setHistoryProduct] = useState<ApiProduct | null>(null);
    const [historyMovements, setHistoryMovements] = useState<StockMovement[]>([]);
    const [historySummary, setHistorySummary] = useState<StockMovementSummary | null>(null);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);

    // Form State
    const [newProduct, setNewProduct] = useState({
        name: '',
        sku: '',
        barcode: '',
        category: 'Electronics',
        unitOfMeasure: 'pcs',
        costPrice: 0,
        sellingPrice: 0,
        initialStock: 0,
        reorderLevel: 10,
        supplierId: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [productsRes, suppliersRes] = await Promise.all([
                inventoryService.getProducts(),
                procurementService.getSuppliers()
            ]);

            if (productsRes.data.success) {
                setProducts(productsRes.data.data);
            }
            if (suppliersRes.data.success) {
                setSuppliers(suppliersRes.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch inventory data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const uniqueCategories = useMemo(() => {
        const categories = new Set(products.map(item => item.category));
        return ['All', ...Array.from(categories)];
    }, [products]);

    const processedData = useMemo(() => {
        let data = [...products];

        // Text Filter
        if (filterTerm) {
            const lowerTerm = filterTerm.toLowerCase();
            data = data.filter(item =>
                item.name.toLowerCase().includes(lowerTerm) ||
                item.sku.toLowerCase().includes(lowerTerm) ||
                (item.barcode && item.barcode.toLowerCase().includes(lowerTerm))
            );
        }

        // Category Filter
        if (categoryFilter !== 'All') {
            data = data.filter(item => item.category === categoryFilter);
        }

        // Stock Status Filter
        if (stockStatusFilter !== 'All') {
            data = data.filter(item => {
                if (stockStatusFilter === 'Out of Stock') return item.stock === 0;
                if (stockStatusFilter === 'Low Stock') return item.stock > 0 && item.stock < item.reorderLevel;
                if (stockStatusFilter === 'In Stock') return item.stock >= item.reorderLevel;
                return true;
            });
        }

        return data;
    }, [filterTerm, categoryFilter, stockStatusFilter]);

    const renderStockBadge = (item: ApiProduct) => {
        if (item.stock === 0) {
            return <StatusDot variant="error">Out of Stock</StatusDot>;
        }
        if (item.stock < item.reorderLevel) {
            return <StatusDot variant="warning">Low Stock: {item.stock}</StatusDot>;
        }
        return <StatusDot variant="success">In Stock: {item.stock}</StatusDot>;
    };

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaveError(null);
        setIsSaving(true);
        try {
            const res = await inventoryService.createProduct({
                ...newProduct,
                supplierId: newProduct.supplierId ? parseInt(newProduct.supplierId) : null
            });
            if (res.data.success) {
                setIsAddProductOpen(false);
                fetchData();
                setNewProduct({
                    name: '', sku: '', barcode: '', category: 'Electronics', unitOfMeasure: 'pcs',
                    costPrice: 0, sellingPrice: 0, initialStock: 0, reorderLevel: 10, supplierId: ''
                });
            } else {
                setSaveError(res.data.message || 'Failed to save product. Please check the form and try again.');
            }
        } catch (error: any) {
            const msg = error?.response?.data?.message || error?.message || 'An error occurred. Please try again.';
            setSaveError(msg);
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;
        setEditError(null);
        setIsSaving(true);
        try {
            const res = await inventoryService.updateProduct(editingProduct.id, {
                name: editingProduct.name,
                sku: editingProduct.sku,
                category: editingProduct.category,
                unitOfMeasure: editingProduct.unitOfMeasure,
                costPrice: editingProduct.costPrice,
                sellingPrice: editingProduct.sellingPrice,
                initialStock: editingProduct.stock,
                reorderLevel: editingProduct.reorderLevel,
                supplierId: editingProduct.supplierId ?? null
            });
            if (res.data.success) {
                setIsEditProductOpen(false);
                fetchData();
            } else {
                setEditError(res.data.message || 'Failed to update product.');
            }
        } catch (error: any) {
            const msg = error?.response?.data?.message || error?.message || 'An error occurred. Please try again.';
            setEditError(msg);
        } finally {
            setIsSaving(false);
        }
    };

    const clearFilters = () => {
        setFilterTerm('');
        setCategoryFilter('All');
        setStockStatusFilter('All');
    };

    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const handleImageUpload = async (productId: number, file: File) => {
        setIsUploadingImage(true);
        try {
            const res = await inventoryService.uploadProductImage(productId, file);
            if (res.data.success) {
                setEditingProduct(prev => prev ? { ...prev, imageUrl: res.data.data.imageUrl } : prev);
                fetchData();
            }
        } catch (error: any) {
            setEditError(error?.response?.data?.message || 'Failed to upload image');
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleImageDelete = async (productId: number) => {
        setIsUploadingImage(true);
        try {
            const res = await inventoryService.deleteProductImage(productId);
            if (res.data.success) {
                setEditingProduct(prev => prev ? { ...prev, imageUrl: undefined } : prev);
                fetchData();
            }
        } catch (error: any) {
            setEditError(error?.response?.data?.message || 'Failed to remove image');
        } finally {
            setIsUploadingImage(false);
        }
    };

    const openMovementDialog = (product: ApiProduct) => {
        setMovementProduct(product);
        setMovementType('STOCK_IN');
        setMovementQty(1);
        setMovementNotes('');
        setMovementRef('');
        setMovementError(null);
        setIsMovementOpen(true);
    };

    const handleRecordMovement = async () => {
        if (!movementProduct) return;
        setMovementError(null);
        setIsSaving(true);
        try {
            const res = await inventoryService.recordStockMovement(movementProduct.id, {
                productId: movementProduct.id,
                movementType,
                quantity: movementQty,
                reference: movementRef || undefined,
                notes: movementNotes || undefined,
            });
            if (res.data.success) {
                setIsMovementOpen(false);
                fetchData();
            } else {
                setMovementError(res.data.message || 'Failed to record movement.');
            }
        } catch (error: any) {
            setMovementError(error?.response?.data?.message || 'An error occurred.');
        } finally {
            setIsSaving(false);
        }
    };

    const openHistoryDialog = async (product: ApiProduct) => {
        setHistoryProduct(product);
        setIsHistoryOpen(true);
        setIsHistoryLoading(true);
        try {
            const [movRes, sumRes] = await Promise.all([
                inventoryService.getProductMovements(product.id, { pageSize: 50 }),
                inventoryService.getProductStockSummary(product.id),
            ]);
            if (movRes.data.success) setHistoryMovements(movRes.data.data);
            if (sumRes.data.success) setHistorySummary(sumRes.data.data);
        } catch {
            setHistoryMovements([]);
            setHistorySummary(null);
        } finally {
            setIsHistoryLoading(false);
        }
    };

    const columns = useMemo<ColumnDef<ApiProduct>[]>(() => [
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="-ml-3 hover:bg-transparent text-xs font-semibold"
                    >
                        Product Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => <span className="font-medium text-zinc-900 dark:text-zinc-50">{row.getValue("name")}</span>
        },
        {
            accessorKey: "sku",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="-ml-3 hover:bg-transparent text-xs font-semibold"
                    >
                        SKU
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => <span className="text-zinc-500 font-mono text-xs dark:text-zinc-400">{row.getValue("sku")}</span>
        },
        {
            accessorKey: "category",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="-ml-3 hover:bg-transparent text-xs font-semibold"
                    >
                        Category
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => <Badge variant="secondary" className="font-normal">{row.getValue("category")}</Badge>
        },
        {
            accessorKey: "sellingPrice",
            header: ({ column }) => (
                <div className="text-right">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="hover:bg-transparent text-xs font-semibold"
                    >
                        Selling Price
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => <div className="text-right text-zinc-900 dark:text-zinc-50 font-medium font-mono">₱{(row.getValue("sellingPrice") as number).toFixed(2)}</div>
        },
        {
            accessorKey: "stock",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="-ml-3 hover:bg-transparent text-xs font-semibold"
                    >
                        Stock Status
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => renderStockBadge(row.original)
        },
        {
            id: "actions",
            header: () => <div className="text-right text-xs font-semibold pr-2">Actions</div>,
            cell: ({ row }) => (
                <div className="flex justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px] bg-white dark:bg-zinc-900 dark:border-zinc-800">
                            <DropdownMenuItem onClick={() => { setEditingProduct(row.original); setIsEditProductOpen(true); }}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit Product
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openMovementDialog(row.original)}>
                                <PackagePlus className="mr-2 h-4 w-4" /> Stock Movement
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openHistoryDialog(row.original)}>
                                <History className="mr-2 h-4 w-4" /> Movement History
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ], []);

    const hasActiveFilters = filterTerm !== '' || categoryFilter !== 'All' || stockStatusFilter !== 'All';

    return (
        <div className="space-y-6 pb-10">

            {/* Add Product Modal */}
            <Dialog open={isAddProductOpen} onOpenChange={open => { setIsAddProductOpen(open); if (!open) setSaveError(null); }}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Add New Product</DialogTitle>
                        <DialogDescription>Enter product details to add to inventory.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveProduct} className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Product Name</Label>
                                <Input
                                    placeholder="e.g. Cotton T-Shirt"
                                    required
                                    value={newProduct.name}
                                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>SKU <span className="text-zinc-400 font-normal">(auto-generated if blank)</span></Label>
                                <Input
                                    placeholder="Leave blank for auto-SKU"
                                    value={newProduct.sku}
                                    onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Barcode <span className="text-zinc-400 font-normal">(optional)</span></Label>
                            <Input
                                placeholder="Scan or enter barcode"
                                value={newProduct.barcode}
                                onChange={e => setNewProduct({ ...newProduct, barcode: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Category</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300"
                                    value={newProduct.category}
                                    onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                >
                                    <option>Electronics</option>
                                    <option>Apparel</option>
                                    <option>Home & Living</option>
                                    <option>Accessories</option>
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Unit of Measure</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300"
                                    value={newProduct.unitOfMeasure}
                                    onChange={e => setNewProduct({ ...newProduct, unitOfMeasure: e.target.value })}
                                >
                                    <option value="pcs">Pieces (pcs)</option>
                                    <option value="box">Box</option>
                                    <option value="kg">Kilogram (kg)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <Label>Cost Price</Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    value={newProduct.costPrice || ''}
                                    onChange={e => setNewProduct({ ...newProduct, costPrice: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Selling Price</Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    required
                                    value={newProduct.sellingPrice || ''}
                                    onChange={e => setNewProduct({ ...newProduct, sellingPrice: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Initial Stock</Label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    min="0"
                                    required
                                    value={newProduct.initialStock}
                                    onChange={e => setNewProduct({ ...newProduct, initialStock: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Reorder Level</Label>
                                <Input
                                    type="number"
                                    placeholder="10"
                                    min="0"
                                    value={newProduct.reorderLevel}
                                    onChange={e => setNewProduct({ ...newProduct, reorderLevel: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Supplier</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300"
                                    value={newProduct.supplierId}
                                    onChange={e => setNewProduct({ ...newProduct, supplierId: e.target.value })}
                                >
                                    <option value="">No Supplier</option>
                                    {suppliers.map(s => (
                                        <option key={s.id} value={s.id}>{s.companyName}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <DialogFooter>
                            {saveError && (
                                <p className="text-sm text-red-500 mr-auto">{saveError}</p>
                            )}
                            <Button type="button" variant="outline" onClick={() => setIsAddProductOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Save Product
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Product Modal */}
            <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Edit Product</DialogTitle>
                        <DialogDescription>Update product details.</DialogDescription>
                    </DialogHeader>
                    {editingProduct && (
                        <form onSubmit={handleUpdateProduct} className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Product Name</Label>
                                    <Input required value={editingProduct.name} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>SKU</Label>
                                    <Input value={editingProduct.sku} readOnly className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500" />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Barcode <span className="text-zinc-400 font-normal">(optional)</span></Label>
                                <Input value={editingProduct.barcode ?? ''} onChange={e => setEditingProduct({ ...editingProduct, barcode: e.target.value || undefined })} placeholder="Scan or enter barcode" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Category</Label>
                                    <select className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300"
                                        value={editingProduct.category} onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}>
                                        <option>Electronics</option>
                                        <option>Apparel</option>
                                        <option>Home &amp; Living</option>
                                        <option>Accessories</option>
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Unit of Measure</Label>
                                    <select className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300"
                                        value={editingProduct.unitOfMeasure} onChange={e => setEditingProduct({ ...editingProduct, unitOfMeasure: e.target.value })}>
                                        <option value="pcs">Pieces (pcs)</option>
                                        <option value="box">Box</option>
                                        <option value="kg">Kilogram (kg)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="grid gap-2">
                                    <Label>Cost Price</Label>
                                    <Input type="number" placeholder="0.00" min="0" step="0.01" value={editingProduct.costPrice || ''} onChange={e => setEditingProduct({ ...editingProduct, costPrice: parseFloat(e.target.value) || 0 })} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Selling Price</Label>
                                    <Input type="number" placeholder="0.00" min="0" step="0.01" required value={editingProduct.sellingPrice || ''} onChange={e => setEditingProduct({ ...editingProduct, sellingPrice: parseFloat(e.target.value) || 0 })} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Reorder Level</Label>
                                    <Input type="number" placeholder="10" min="0" value={editingProduct.reorderLevel} onChange={e => setEditingProduct({ ...editingProduct, reorderLevel: parseInt(e.target.value) || 0 })} />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Supplier</Label>
                                <select className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300"
                                    value={editingProduct.supplierId ?? ''} onChange={e => setEditingProduct({ ...editingProduct, supplierId: e.target.value ? parseInt(e.target.value) : undefined })}>
                                    <option value="">No Supplier</option>
                                    {suppliers.map(s => (
                                        <option key={s.id} value={s.id}>{s.companyName}</option>
                                    ))}
                                </select>
                            </div>
                            {/* Product Image */}
                            <div className="grid gap-2">
                                <Label>Product Image</Label>
                                {editingProduct.imageUrl ? (
                                    <div className="flex items-center gap-4">
                                        <img src={editingProduct.imageUrl} alt={editingProduct.name} className="h-20 w-20 object-cover rounded-md border border-zinc-200 dark:border-zinc-700" />
                                        <div className="flex gap-2">
                                            <Button type="button" variant="outline" size="sm" disabled={isUploadingImage}
                                                onClick={() => document.getElementById('edit-product-image')?.click()}>
                                                <Upload className="mr-1 h-3 w-3" /> Replace
                                            </Button>
                                            <Button type="button" variant="outline" size="sm" disabled={isUploadingImage}
                                                onClick={() => handleImageDelete(editingProduct.id)}>
                                                <Trash2 className="mr-1 h-3 w-3" /> Remove
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <Button type="button" variant="outline" size="sm" disabled={isUploadingImage}
                                        onClick={() => document.getElementById('edit-product-image')?.click()}>
                                        {isUploadingImage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                        Upload Image
                                    </Button>
                                )}
                                <input id="edit-product-image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleImageUpload(editingProduct.id, file);
                                        e.target.value = '';
                                    }}
                                />
                            </div>
                            <DialogFooter>
                                {editError && (
                                    <p className="text-sm text-red-500 mr-auto">{editError}</p>
                                )}
                                <Button type="button" variant="outline" onClick={() => setIsEditProductOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Inventory</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage stock levels and view product details.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none"><Download className="mr-2 h-4 w-4" /> Export</Button>
                    <Button size="sm" className="flex-1 sm:flex-none" onClick={() => setIsAddProductOpen(true)}>
                        <ArrowUpCircle className="mr-2 h-4 w-4" /> Add Product
                    </Button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-zinc-900 p-1 rounded-lg">
                <div className="relative flex-1 max-w-sm w-full">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                    <Input
                        placeholder="Search inventory by name, SKU..."
                        className="pl-10 bg-white dark:bg-zinc-900"
                        value={filterTerm}
                        onChange={(e) => setFilterTerm(e.target.value)}
                    />
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <Select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full sm:w-[180px]"
                    >
                        {uniqueCategories.map(cat => (
                            <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                        ))}
                    </Select>
                    <Select
                        value={stockStatusFilter}
                        onChange={(e) => setStockStatusFilter(e.target.value)}
                        className="w-full sm:w-[180px]"
                    >
                        <option value="All">All Statuses</option>
                        <option value="In Stock">In Stock (10+)</option>
                        <option value="Low Stock">Low Stock (&lt;10)</option>
                        <option value="Out of Stock">Out of Stock (0)</option>
                    </Select>
                    {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
                            <X className="mr-2 h-3.5 w-3.5" /> Clear
                        </Button>
                    )}
                </div>
            </div>

            {/* Unified Data Table View */}
            {isLoading ? (
                <div className="h-[400px] flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
                </div>
            ) : (
                <DataTable columns={columns} data={processedData} />
            )}

            {/* Stock Movement Modal */}
            <Dialog open={isMovementOpen} onOpenChange={open => { setIsMovementOpen(open); if (!open) setMovementError(null); }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Record Stock Movement</DialogTitle>
                        <DialogDescription>{movementProduct?.name} — Current Stock: {movementProduct?.stock}</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Movement Type</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300"
                                value={movementType}
                                onChange={e => setMovementType(e.target.value as any)}
                            >
                                <option value="STOCK_IN">Stock In (add stock)</option>
                                <option value="WASTE">Waste / Damage (remove stock)</option>
                                <option value="ADJUSTMENT">Adjustment (+ or -)</option>
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Quantity</Label>
                            <Input type="number" min={1} value={movementQty} onChange={e => setMovementQty(parseInt(e.target.value) || 1)} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Reference <span className="text-zinc-400 font-normal">(optional)</span></Label>
                            <Input placeholder="e.g. PO number, receipt #" value={movementRef} onChange={e => setMovementRef(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Notes <span className="text-zinc-400 font-normal">(optional)</span></Label>
                            <Input placeholder="Reason for movement" value={movementNotes} onChange={e => setMovementNotes(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        {movementError && <p className="text-sm text-red-500 mr-auto">{movementError}</p>}
                        <Button variant="outline" onClick={() => setIsMovementOpen(false)}>Cancel</Button>
                        <Button onClick={handleRecordMovement} disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PackagePlus className="mr-2 h-4 w-4" />}
                            Record Movement
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Stock Movement History Modal */}
            <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Movement History</DialogTitle>
                        <DialogDescription>{historyProduct?.name} ({historyProduct?.sku})</DialogDescription>
                    </DialogHeader>
                    {isHistoryLoading ? (
                        <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
                    ) : (
                        <div className="space-y-4 py-2">
                            {historySummary && (
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                                    <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-center">
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Stock In</p>
                                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">+{historySummary.totalStockIn}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center">
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Sales</p>
                                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">-{historySummary.totalSales}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-center">
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Waste</p>
                                        <p className="text-lg font-bold text-red-600 dark:text-red-400">-{historySummary.totalWaste}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-center">
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Adjusted</p>
                                        <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{historySummary.totalAdjustments >= 0 ? '+' : ''}{historySummary.totalAdjustments}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-center">
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Current</p>
                                        <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{historySummary.currentStock}</p>
                                    </div>
                                </div>
                            )}
                            {historyMovements.length === 0 ? (
                                <p className="text-center text-zinc-400 py-4">No movement records found.</p>
                            ) : (
                                <div className="border rounded-md overflow-hidden dark:border-zinc-800">
                                    <table className="w-full text-sm">
                                        <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                                            <tr>
                                                <th className="px-3 py-2 text-left font-medium text-zinc-600 dark:text-zinc-400">Date</th>
                                                <th className="px-3 py-2 text-left font-medium text-zinc-600 dark:text-zinc-400">Type</th>
                                                <th className="px-3 py-2 text-right font-medium text-zinc-600 dark:text-zinc-400">Qty</th>
                                                <th className="px-3 py-2 text-left font-medium text-zinc-600 dark:text-zinc-400">Reference</th>
                                                <th className="px-3 py-2 text-left font-medium text-zinc-600 dark:text-zinc-400">By</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                            {historyMovements.map(m => (
                                                <tr key={m.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                                                    <td className="px-3 py-2 text-zinc-600 dark:text-zinc-300">{new Date(m.createdAt).toLocaleString()}</td>
                                                    <td className="px-3 py-2">
                                                        <Badge variant={
                                                            m.movementType === 'STOCK_IN' || m.movementType === 'VOID_RESTORE' ? 'success' :
                                                            m.movementType === 'SALE' ? 'secondary' :
                                                            m.movementType === 'WASTE' ? 'destructive' : 'warning'
                                                        } className="text-xs">
                                                            {m.movementType.replace('_', ' ')}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-3 py-2 text-right font-mono font-medium">
                                                        {['STOCK_IN', 'VOID_RESTORE', 'ADJUSTMENT'].includes(m.movementType) ? '+' : '-'}{m.quantity}
                                                    </td>
                                                    <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400 text-xs">{m.reference || '—'}</td>
                                                    <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400 text-xs">{m.recordedBy}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};