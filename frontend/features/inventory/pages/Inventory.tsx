import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/Dialog';
import { Label } from '../../../components/ui/Label';
import { Select } from '../../../components/ui/Select';
import { Pagination } from '../../../components/ui/Pagination';
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
  const [sortConfig, setSortConfig] = useState<{ key: keyof Product; direction: 'asc' | 'desc' } | null>(null);
  const [filterTerm, setFilterTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockStatusFilter, setStockStatusFilter] = useState('All');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterTerm, categoryFilter, stockStatusFilter]);

  const handleSort = (key: keyof Product) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

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

    // Sort
    if (sortConfig) {
      data.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [sortConfig, filterTerm, categoryFilter, stockStatusFilter]);

  const totalPages = Math.ceil(processedData.length / ITEMS_PER_PAGE);
  const paginatedData = processedData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const SortIcon = ({ column }: { column: keyof Product }) => {
    if (sortConfig?.key !== column) return <ArrowUpDown className="ml-2 h-4 w-4 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4 text-zinc-900 dark:text-zinc-50" />
      : <ArrowDown className="ml-2 h-4 w-4 text-zinc-900 dark:text-zinc-50" />;
  };

  const renderStockBadge = (stock: number) => {
      if (stock === 0) {
          return <Badge variant="destructive" className="bg-red-50 text-red-700 hover:bg-red-100 border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/50">Out of Stock</Badge>;
      }
      if (stock < 10) {
          return <Badge variant="warning" className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-900/50">Low Stock: {stock}</Badge>;
      }
      return <Badge variant="success" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-900/50">In Stock: {stock}</Badge>;
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

  const hasActiveFilters = filterTerm !== '' || categoryFilter !== 'All' || stockStatusFilter !== 'All';

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
       
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
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none"><Download className="mr-2 h-4 w-4"/> Export</Button>
            <Button size="sm" className="flex-1 sm:flex-none" onClick={() => setIsAddProductOpen(true)}>
                <ArrowUpCircle className="mr-2 h-4 w-4"/> Add Product
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
                     <X className="mr-2 h-3.5 w-3.5"/> Clear
                 </Button>
             )}
          </div>
      </div>

      {/* Desktop/Tablet Table View */}
      <Card className="hidden md:block overflow-hidden border-zinc-200 shadow-sm dark:border-zinc-800">
        <CardContent className="p-0">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-zinc-500 uppercase bg-zinc-50/50 border-b border-zinc-100 dark:bg-zinc-800/50 dark:border-zinc-800 dark:text-zinc-400">
                        <tr>
                            <th className="px-6 py-4 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 group select-none transition-colors" onClick={() => handleSort('name')}>
                                <div className="flex items-center">Product Name <SortIcon column="name" /></div>
                            </th>
                            <th className="px-6 py-4 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 group select-none transition-colors" onClick={() => handleSort('sku')}>
                                <div className="flex items-center">SKU <SortIcon column="sku" /></div>
                            </th>
                            <th className="px-6 py-4 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 group select-none transition-colors" onClick={() => handleSort('category')}>
                                <div className="flex items-center">Category <SortIcon column="category" /></div>
                            </th>
                            <th className="px-6 py-4 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 group select-none transition-colors" onClick={() => handleSort('price')}>
                                <div className="flex items-center">Price <SortIcon column="price" /></div>
                            </th>
                            <th className="px-6 py-4 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 group select-none transition-colors" onClick={() => handleSort('stock')}>
                                <div className="flex items-center">Stock Status <SortIcon column="stock" /></div>
                            </th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {paginatedData.map((product) => (
                            <tr key={product.id} className="bg-white hover:bg-zinc-50/50 transition-colors dark:bg-zinc-900 dark:hover:bg-zinc-800/50">
                                <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">{product.name}</td>
                                <td className="px-6 py-4 text-zinc-500 font-mono text-xs dark:text-zinc-400">{product.sku}</td>
                                <td className="px-6 py-4">
                                    <Badge variant="secondary" className="font-normal">{product.category}</Badge>
                                </td>
                                <td className="px-6 py-4 text-zinc-900 dark:text-zinc-50">${product.price.toFixed(2)}</td>
                                <td className="px-6 py-4">
                                    {renderStockBadge(product.stock)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {processedData.length === 0 && (
                    <div className="p-8 text-center text-zinc-500 dark:text-zinc-400">
                        No products found matching your filters.
                    </div>
                )}
            </div>
            <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage} 
            />
        </CardContent>
      </Card>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {paginatedData.map((product) => (
            <Card key={product.id} className="border-zinc-200 dark:border-zinc-800">
                <CardContent className="p-4 space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{product.name}</h3>
                            <p className="text-xs text-zinc-500 font-mono mt-1 dark:text-zinc-400">{product.sku}</p>
                        </div>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 -mr-2">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500 dark:text-zinc-400">Category</span>
                        <Badge variant="secondary" className="font-normal">{product.category}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500 dark:text-zinc-400">Price</span>
                        <span className="font-medium text-zinc-900 dark:text-zinc-50">${product.price.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm pt-2 border-t border-zinc-100 dark:border-zinc-800">
                        <span className="text-zinc-500 dark:text-zinc-400">Status</span>
                        {renderStockBadge(product.stock)}
                    </div>
                </CardContent>
            </Card>
        ))}
         {processedData.length === 0 && (
            <div className="p-8 text-center text-zinc-500 bg-white rounded-lg border border-dashed border-zinc-300 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-400">
                No products found.
            </div>
        )}
        <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
        />
      </div>
    </div>
  );
};