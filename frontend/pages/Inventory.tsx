import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Search, ArrowUpCircle, Filter, MoreHorizontal, Download, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Product } from '../types';

const INVENTORY_DATA: Product[] = [
  { id: '1', name: 'Wireless Headphones', category: 'Electronics', price: 129.99, stock: 45, sku: 'WH-001' },
  { id: '2', name: 'Cotton T-Shirt', category: 'Apparel', price: 24.50, stock: 12, sku: 'TS-002' },
  { id: '3', name: 'Smart Watch', category: 'Electronics', price: 199.00, stock: 3, sku: 'SW-003' },
  { id: '4', name: 'Running Shoes', category: 'Apparel', price: 89.95, stock: 60, sku: 'RS-004' },
  { id: '5', name: 'Bluetooth Speaker', category: 'Electronics', price: 59.99, stock: 85, sku: 'BS-005' },
  { id: '6', name: 'Denim Jeans', category: 'Apparel', price: 49.99, stock: 90, sku: 'DJ-006' },
  { id: '7', name: 'USB-C Cable', category: 'Electronics', price: 12.99, stock: 0, sku: 'CB-007' },
];

export const Inventory: React.FC = () => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof Product; direction: 'asc' | 'desc' } | null>(null);
  const [filterTerm, setFilterTerm] = useState('');

  const handleSort = (key: keyof Product) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const processedData = useMemo(() => {
    let data = [...INVENTORY_DATA];

    if (filterTerm) {
        const lowerTerm = filterTerm.toLowerCase();
        data = data.filter(item => 
            item.name.toLowerCase().includes(lowerTerm) || 
            item.sku.toLowerCase().includes(lowerTerm)
        );
    }

    if (sortConfig) {
      data.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [sortConfig, filterTerm]);

  const SortIcon = ({ column }: { column: keyof Product }) => {
    if (sortConfig?.key !== column) return <ArrowUpDown className="ml-2 h-4 w-4 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4 text-zinc-900" />
      : <ArrowDown className="ml-2 h-4 w-4 text-zinc-900" />;
  };

  const renderStockBadge = (stock: number) => {
      if (stock === 0) {
          return <Badge variant="destructive">Out of Stock</Badge>;
      }
      if (stock < 10) {
          return <Badge variant="warning">Low Stock: {stock}</Badge>;
      }
      return <Badge variant="success">In Stock: {stock}</Badge>;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Inventory</h2>
            <p className="text-zinc-500 mt-1">Manage stock levels and view product details.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none"><Download className="mr-2 h-4 w-4"/> Export</Button>
            <Button size="sm" className="flex-1 sm:flex-none"><ArrowUpCircle className="mr-2 h-4 w-4"/> Add Product</Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-1 rounded-lg">
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
                placeholder="Search inventory..."
                className="pl-10"
                value={filterTerm}
                onChange={(e) => setFilterTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
             <Button variant="outline" size="sm" className="w-full sm:w-auto"><Filter className="mr-2 h-3.5 w-3.5"/> Filter</Button>
          </div>
      </div>

      {/* Desktop/Tablet Table View */}
      <div className="hidden md:block rounded-md border border-zinc-200 bg-white">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="cursor-pointer hover:bg-zinc-50" onClick={() => handleSort('name')}>
                        <div className="flex items-center">Product Name <SortIcon column="name" /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-zinc-50" onClick={() => handleSort('sku')}>
                        <div className="flex items-center">SKU <SortIcon column="sku" /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-zinc-50" onClick={() => handleSort('category')}>
                        <div className="flex items-center">Category <SortIcon column="category" /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-zinc-50" onClick={() => handleSort('price')}>
                        <div className="flex items-center">Price <SortIcon column="price" /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-zinc-50" onClick={() => handleSort('stock')}>
                        <div className="flex items-center">Stock Status <SortIcon column="stock" /></div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {processedData.map((product) => (
                    <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="font-mono text-xs text-zinc-500">{product.sku}</TableCell>
                        <TableCell>
                            <Badge variant="secondary" className="font-normal">{product.category}</Badge>
                        </TableCell>
                        <TableCell>${product.price.toFixed(2)}</TableCell>
                        <TableCell>
                            {renderStockBadge(product.stock)}
                        </TableCell>
                        <TableCell className="text-right">
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
        {processedData.length === 0 && (
            <div className="p-8 text-center text-zinc-500">
                No products found matching your search.
            </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {processedData.map((product) => (
            <Card key={product.id}>
                <CardContent className="p-4 space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold">{product.name}</h3>
                            <p className="text-xs text-zinc-500 font-mono mt-1">{product.sku}</p>
                        </div>
                        <Button size="icon" variant="ghost" className="h-8 w-8 -mr-2">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500">Category</span>
                        <Badge variant="secondary" className="font-normal">{product.category}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500">Price</span>
                        <span className="font-medium">${product.price.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm pt-2 border-t border-zinc-100">
                        <span className="text-zinc-500">Status</span>
                        {renderStockBadge(product.stock)}
                    </div>
                </CardContent>
            </Card>
        ))}
         {processedData.length === 0 && (
            <div className="p-8 text-center text-zinc-500 bg-white rounded-lg border border-dashed border-zinc-300">
                No products found.
            </div>
        )}
      </div>
    </div>
  );
};