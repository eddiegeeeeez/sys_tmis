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
import { Search, ArrowUpCircle, Filter, MoreHorizontal, Download, ArrowUpDown, ArrowUp, ArrowDown, X } from 'lucide-react';
import { Product } from '../../../types';

const INVENTORY_DATA: Product[] = [
    { id: '1', name: 'Wireless Headphones', category: 'Electronics', price: 129.99, stock: 45, sku: 'WH-001' },
    { id: '2', name: 'Cotton T-Shirt', category: 'Apparel', price: 24.50, stock: 12, sku: 'TS-002' },
    { id: '3', name: 'Smart Watch', category: 'Electronics', price: 199.00, stock: 3, sku: 'SW-003' },
    { id: '4', name: 'Running Shoes', category: 'Apparel', price: 89.95, stock: 60, sku: 'RS-004' },
    { id: '5', name: 'Bluetooth Speaker', category: 'Electronics', price: 59.99, stock: 85, sku: 'BS-005' },
    { id: '6', name: 'Denim Jeans', category: 'Apparel', price: 49.99, stock: 90, sku: 'DJ-006' },
    { id: '7', name: 'USB-C Cable', category: 'Electronics', price: 12.99, stock: 0, sku: 'CB-007' },
    { id: '8', name: 'Gaming Mouse', category: 'Electronics', price: 49.99, stock: 25, sku: 'GM-008' },
    { id: '9', name: 'Mechanical Keyboard', category: 'Electronics', price: 89.99, stock: 15, sku: 'MK-009' },
    { id: '10', name: 'Monitor 24"', category: 'Electronics', price: 149.99, stock: 8, sku: 'MN-010' },
    { id: '11', name: 'Office Chair', category: 'Furniture', price: 199.99, stock: 5, sku: 'OC-011' },
    { id: '12', name: 'Desk Lamp', category: 'Home', price: 29.99, stock: 30, sku: 'DL-012' },
];

const ITEMS_PER_PAGE = 10;

export const Inventory: React.FC = () => {
    const [filterTerm, setFilterTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [stockStatusFilter, setStockStatusFilter] = useState('All');
    const [isAddProductOpen, setIsAddProductOpen] = useState(false);

    const uniqueCategories = useMemo(() => {
        const categories = new Set(INVENTORY_DATA.map(item => item.category));
        return ['All', ...Array.from(categories)];
    }, []);

    const processedData = useMemo(() => {
        let data = [...INVENTORY_DATA];

        // Text Filter
        if (filterTerm) {
            const lowerTerm = filterTerm.toLowerCase();
            data = data.filter(item =>
                item.name.toLowerCase().includes(lowerTerm) ||
                item.sku.toLowerCase().includes(lowerTerm)
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
                if (stockStatusFilter === 'Low Stock') return item.stock > 0 && item.stock < 10;
                if (stockStatusFilter === 'In Stock') return item.stock >= 10;
                return true;
            });
        }

        return data;
    }, [filterTerm, categoryFilter, stockStatusFilter]);

    const renderStockBadge = (stock: number) => {
        if (stock === 0) {
            return <StatusDot variant="error">Out of Stock</StatusDot>;
        }
        if (stock < 10) {
            return <StatusDot variant="warning">Low Stock: {stock}</StatusDot>;
        }
        return <StatusDot variant="success">In Stock: {stock}</StatusDot>;
    };

    const handleSaveProduct = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Saving new product...");
        setIsAddProductOpen(false);
    };

    const clearFilters = () => {
        setFilterTerm('');
        setCategoryFilter('All');
        setStockStatusFilter('All');
    };

    const columns: ColumnDef<Product>[] = [
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
            accessorKey: "price",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="-ml-3 hover:bg-transparent text-xs font-semibold"
                    >
                        Price
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => <span className="text-zinc-900 dark:text-zinc-50">${(row.getValue("price") as number).toFixed(2)}</span>
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
            cell: ({ row }) => renderStockBadge(row.getValue("stock") as number)
        },
        {
            id: "actions",
            header: () => <div className="text-right text-xs font-semibold pr-2">Actions</div>,
            cell: ({ row }) => {
                return (
                    <div className="flex justify-end">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </div>
                );
            }
        }
    ];

    const hasActiveFilters = filterTerm !== '' || categoryFilter !== 'All' || stockStatusFilter !== 'All';

    return (
        <div className="space-y-6 pb-10">

            {/* Add Product Modal */}
            <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Add New Product</DialogTitle>
                        <DialogDescription>Enter product details to add to inventory.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveProduct} className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Product Name</Label>
                                <Input placeholder="e.g. Cotton T-Shirt" required />
                            </div>
                            <div className="grid gap-2">
                                <Label>SKU / Barcode</Label>
                                <Input placeholder="Scan or enter SKU" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Category</Label>
                                <Select>
                                    <option>Electronics</option>
                                    <option>Apparel</option>
                                    <option>Home & Living</option>
                                    <option>Accessories</option>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Unit of Measure</Label>
                                <Select>
                                    <option>Pieces (pcs)</option>
                                    <option>Box</option>
                                    <option>Kilogram (kg)</option>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <Label>Cost Price</Label>
                                <Input type="number" placeholder="0.00" />
                            </div>
                            <div className="grid gap-2">
                                <Label>Selling Price</Label>
                                <Input type="number" placeholder="0.00" required />
                            </div>
                            <div className="grid gap-2">
                                <Label>Initial Stock</Label>
                                <Input type="number" placeholder="0" required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Reorder Level</Label>
                                <Input type="number" placeholder="10" />
                            </div>
                            <div className="grid gap-2">
                                <Label>Supplier</Label>
                                <Select>
                                    <option>TechGizmos Inc.</option>
                                    <option>Global Apparel Co.</option>
                                    <option value="">No Supplier</option>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsAddProductOpen(false)}>Cancel</Button>
                            <Button type="submit">Save Product</Button>
                        </DialogFooter>
                    </form>
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
            <div className="overflow-hidden border border-zinc-200 shadow-sm dark:border-zinc-800 rounded-md">
                <DataTable columns={columns} data={processedData} />
            </div>
        </div>
    );
};