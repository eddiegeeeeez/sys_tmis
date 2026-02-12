"use client";

import React, { useState } from 'react';
import RoleGuard from "@/components/auth/role-guard";
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { useAdminNavigation } from '@/lib/hooks/useAdminNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QuickActionsCard } from '@/components/QuickActionsCard';
import { Search, Plus, Minus, CreditCard, Receipt, ShoppingBag, X, Barcode } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sku: string;
}

interface CartItem extends Product {
  quantity: number;
}

const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Wireless Headphones', category: 'Electronics', price: 129.99, stock: 45, sku: 'WH-001' },
  { id: '2', name: 'Cotton T-Shirt', category: 'Apparel', price: 24.50, stock: 120, sku: 'TS-002' },
  { id: '3', name: 'Smart Watch', category: 'Electronics', price: 199.00, stock: 30, sku: 'SW-003' },
  { id: '4', name: 'Running Shoes', category: 'Apparel', price: 89.95, stock: 60, sku: 'RS-004' },
  { id: '5', name: 'Bluetooth Speaker', category: 'Electronics', price: 59.99, stock: 85, sku: 'BS-005' },
  { id: '6', name: 'Denim Jeans', category: 'Apparel', price: 49.99, stock: 90, sku: 'DJ-006' },
  { id: '7', name: 'Leather Wallet', category: 'Accessories', price: 45.00, stock: 15, sku: 'LW-007' },
  { id: '8', name: 'Sunglasses', category: 'Accessories', price: 150.00, stock: 22, sku: 'SG-008' },
];

export default function CashierPage() {
  const { currentRole, handleLogout, handleNavigate } = useAdminNavigation();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const filteredProducts = MOCK_PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePayment = () => {
    // Mock payment processing
    alert(`Payment processed: ₱${total.toFixed(2)}`);
    setCart([]);
    setSearchTerm('');
  };

  return (
    <RoleGuard allowedRoles={["Cashier"]}>
      <DashboardLayout
        currentRole={currentRole}
        activeView="cashier"
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      >
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Point of Sale</h1>
            <p className="text-muted-foreground mt-1">Process transactions and manage checkout</p>
          </div>

          {/* Quick Actions */}
          <QuickActionsCard role={currentRole} onNavigate={handleNavigate} />

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Product Selection Area */}
            <div className="flex-1 flex flex-col gap-6">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products by name or SKU..."
                    className="pl-10 h-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline"><Barcode className="h-4 w-4 mr-2"/> Scan Item</Button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto max-h-[500px]">
                {filteredProducts.map(product => (
                  <Card 
                    key={product.id} 
                    onClick={() => addToCart(product)}
                    className="cursor-pointer group hover:ring-2 hover:ring-primary transition-all overflow-hidden"
                  >
                    <div className="aspect-square bg-muted w-full relative flex items-center justify-center">
                      <div className="text-muted-foreground">📦</div>
                      <div className="absolute top-2 right-2 bg-background/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                        {product.stock} left
                      </div>
                    </div>
                    <div className="p-3">
                      <h4 className="font-semibold text-sm truncate">{product.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1 mb-2">{product.sku}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm">₱{product.price.toFixed(2)}</span>
                        <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus className="h-3 w-3" />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Cart / Transaction Area */}
            <div className="w-full lg:w-[380px]">
              <Card className="flex flex-col h-full shadow-lg">
                <CardHeader className="bg-muted/50 border-b py-4">
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" /> Current Transaction
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-0">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4 p-6">
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                        <Receipt className="h-8 w-8 opacity-20" />
                      </div>
                      <p className="text-sm font-medium">No items added to cart</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {cart.map(item => (
                        <div key={item.id} className="flex items-center p-3 hover:bg-muted/50 transition-colors group">
                          <div className="flex-1 min-w-0 mr-3">
                            <h5 className="font-medium text-sm truncate">{item.name}</h5>
                            <p className="text-xs text-muted-foreground">₱{item.price.toFixed(2)}</p>
                          </div>
                          
                          <div className="flex items-center gap-2 bg-muted rounded-md p-1 border border-border">
                            <button 
                              onClick={() => updateQuantity(item.id, -1)} 
                              className="h-6 w-6 flex items-center justify-center rounded hover:bg-background text-muted-foreground transition-all"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-4 text-center text-sm font-medium tabular-nums">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, 1)} 
                              className="h-6 w-6 flex items-center justify-center rounded hover:bg-background text-muted-foreground transition-all"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          
                          <div className="text-right w-16 ml-2">
                            <div className="font-semibold text-sm">₱{(item.price * item.quantity).toFixed(2)}</div>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.id)} 
                            className="ml-2 p-1 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                
                <div className="p-4 bg-muted/50 border-t space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="font-medium">₱{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Tax (10%)</span>
                      <span className="font-medium">₱{tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-end pt-3 border-t border-border">
                      <span className="font-semibold">Total Due</span>
                      <span className="font-bold text-xl">₱{total.toFixed(2)}</span>
                    </div>
                  </div>
                  <Button 
                    size="lg" 
                    className="w-full" 
                    onClick={handlePayment} 
                    disabled={cart.length === 0}
                  >
                    <CreditCard className="mr-2 h-4 w-4" /> Pay Now
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
