import React, { useState, useMemo } from 'react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
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
          return <Badge variant="destructive" className="bg-red-50 text-red-700 hover:bg-red-100 border-red-100">Out of Stock</Badge>;
      }
      if (stock < 10) {
          return <Badge variant="warning" className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100">Low Stock: {stock}</Badge>;
      }
      return <Badge variant="success" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100">In Stock: {stock}</Badge>;
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
                placeholder="Search inventory by name, SKU..."
                className="pl-10 bg-white"
                value={filterTerm}
                onChange={(e) => setFilterTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
             <Button variant="outline" size="sm" className="w-full sm:w-auto"><Filter className="mr-2 h-3.5 w-3.5"/> Filter</Button>
          </div>
      </div>

      {/* Desktop/Tablet Table View */}
      <Card className="hidden md:block overflow-hidden border-zinc-200 shadow-sm">
        <CardContent className="p-0">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-zinc-500 uppercase bg-zinc-50/50 border-b border-zinc-100">
                        <tr>
                            <th className="px-6 py-4 font-medium cursor-pointer hover:bg-zinc-100 group select-none transition-colors" onClick={() => handleSort('name')}>
                                <div className="flex items-center">Product Name <SortIcon column="name" /></div>
                            </th>
                            <th className="px-6 py-4 font-medium cursor-pointer hover:bg-zinc-100 group select-none transition-colors" onClick={() => handleSort('sku')}>
                                <div className="flex items-center">SKU <SortIcon column="sku" /></div>
                            </th>
                            <th className="px-6 py-4 font-medium cursor-pointer hover:bg-zinc-100 group select-none transition-colors" onClick={() => handleSort('category')}>
                                <div className="flex items-center">Category <SortIcon column="category" /></div>
                            </th>
                            <th className="px-6 py-4 font-medium cursor-pointer hover:bg-zinc-100 group select-none transition-colors" onClick={() => handleSort('price')}>
                                <div className="flex items-center">Price <SortIcon column="price" /></div>
                            </th>
                            <th className="px-6 py-4 font-medium cursor-pointer hover:bg-zinc-100 group select-none transition-colors" onClick={() => handleSort('stock')}>
                                <div className="flex items-center">Stock Status <SortIcon column="stock" /></div>
                            </th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {processedData.map((product) => (
                            <tr key={product.id} className="bg-white hover:bg-zinc-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-zinc-900">{product.name}</td>
                                <td className="px-6 py-4 text-zinc-500 font-mono text-xs">{product.sku}</td>
                                <td className="px-6 py-4">
                                    <Badge variant="secondary" className="font-normal">{product.category}</Badge>
                                </td>
                                <td className="px-6 py-4 text-zinc-900">${product.price.toFixed(2)}</td>
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
                    <div className="p-8 text-center text-zinc-500">
                        No products found matching your search.
                    </div>
                )}
            </div>
        </CardContent>
      </Card>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {processedData.map((product) => (
            <Card key={product.id} className="border-zinc-200">
                <CardContent className="p-4 space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold text-zinc-900">{product.name}</h3>
                            <p className="text-xs text-zinc-500 font-mono mt-1">{product.sku}</p>
                        </div>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 -mr-2">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500">Category</span>
                        <Badge variant="secondary" className="font-normal">{product.category}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500">Price</span>
                        <span className="font-medium text-zinc-900">${product.price.toFixed(2)}</span>
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