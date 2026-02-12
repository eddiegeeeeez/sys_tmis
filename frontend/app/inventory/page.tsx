"use client";

import React, { useState, useMemo } from 'react';
import RoleGuard from "@/components/auth/role-guard";
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { useAdminNavigation } from '@/lib/hooks/useAdminNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowUpCircle, Filter, MoreHorizontal, Download, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Edit2, Trash2, Check, AlertTriangle, AlertCircle } from 'lucide-react';
import { Product } from '@/types';

const INVENTORY_DATA: Product[] = [
  { id: '1', name: 'Wireless Headphones', category: 'Electronics', price: 129.99, stock: 45, sku: 'WH-001' },
  { id: '2', name: 'Cotton T-Shirt', category: 'Apparel', price: 24.50, stock: 12, sku: 'TS-002' },
  { id: '3', name: 'Smart Watch', category: 'Electronics', price: 199.00, stock: 3, sku: 'SW-003' },
  { id: '4', name: 'Running Shoes', category: 'Apparel', price: 89.95, stock: 60, sku: 'RS-004' },
  { id: '5', name: 'Bluetooth Speaker', category: 'Electronics', price: 59.99, stock: 85, sku: 'BS-005' },
  { id: '6', name: 'Denim Jeans', category: 'Apparel', price: 49.99, stock: 90, sku: 'DJ-006' },
  { id: '7', name: 'USB-C Cable', category: 'Electronics', price: 12.99, stock: 0, sku: 'CB-007' },
];

export default function InventoryPage() {
  const { currentRole, handleLogout, handleNavigate } = useAdminNavigation();
  const [sortConfig, setSortConfig] = useState<{ key: keyof Product; direction: 'asc' | 'desc' } | null>(null);
  const [filterTerm, setFilterTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
        const aVal = a[sortConfig.key as keyof Product] ?? '';
        const bVal = b[sortConfig.key as keyof Product] ?? '';
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [sortConfig, filterTerm]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedData.slice(startIndex, startIndex + itemsPerPage);
  }, [processedData, currentPage]);

  const SortIcon = ({ column }: { column: keyof Product }) => {
    if (sortConfig?.key !== column) return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === 'asc'
      ? <ArrowUp className="ml-2 h-4 w-4 text-foreground" />
      : <ArrowDown className="ml-2 h-4 w-4 text-foreground" />;
  };

  const renderStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge className="bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30">Out of Stock</Badge>;
    }
    if (stock < 10) {
      return <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">Low Stock: {stock}</Badge>;
    }
    return <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">In Stock: {stock}</Badge>;
  };

  return (
    <RoleGuard allowedRoles={["InventoryClerk", "Manager"]}>
      <DashboardLayout
        currentRole={currentRole}
        activeView="inventory"
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      >
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Inventory</h2>
              <p className="text-muted-foreground mt-1">Manage stock levels and view product details.</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none"><Download className="mr-2 h-4 w-4"/> Export</Button>
              <Button size="sm" className="flex-1 sm:flex-none"><ArrowUpCircle className="mr-2 h-4 w-4"/> Add Product</Button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-1 rounded-lg border border-border">
            <div className="relative flex-1 max-w-sm w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory by name, SKU..."
                className="pl-10"
                value={filterTerm}
                onChange={(e) => setFilterTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" className="w-full sm:w-auto"><Filter className="mr-2 h-3.5 w-3.5"/> Filter</Button>
            </div>
          </div>

          {/* Product List */}
          <div className="space-y-3">
            <div className="px-1">
              <h4 className="text-sm font-semibold text-foreground">Product Inventory</h4>
              <p className="text-xs text-muted-foreground mt-0.5">All products with stock levels and pricing</p>
            </div>
            
            <Card className="border-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-muted/80 border-b border-border">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-foreground cursor-pointer hover:bg-muted select-none transition-colors" onClick={() => handleSort('name')}>
                          <div className="flex items-center gap-1">Name<SortIcon column="name" /></div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-foreground cursor-pointer hover:bg-muted select-none transition-colors" onClick={() => handleSort('sku')}>
                          <div className="flex items-center gap-1">SKU<SortIcon column="sku" /></div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-foreground cursor-pointer hover:bg-muted select-none transition-colors" onClick={() => handleSort('category')}>
                          <div className="flex items-center gap-1">Category<SortIcon column="category" /></div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-foreground cursor-pointer hover:bg-muted select-none transition-colors" onClick={() => handleSort('price')}>
                          <div className="flex items-center gap-1">Price<SortIcon column="price" /></div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-foreground cursor-pointer hover:bg-muted select-none transition-colors" onClick={() => handleSort('stock')}>
                          <div className="flex items-center gap-1">Stock<SortIcon column="stock" /></div>
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {paginatedData.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">{item.name}</td>
                        <td className="px-6 py-4 text-muted-foreground">{item.sku}</td>
                        <td className="px-6 py-4 text-muted-foreground">{item.category}</td>
                        <td className="px-6 py-4 font-medium text-foreground">₱{item.price.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          {renderStockBadge(item.stock)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            </Card>
            
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-1">
                <p className="text-xs text-muted-foreground">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, processedData.length)} of {processedData.length} results
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="h-8 w-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
