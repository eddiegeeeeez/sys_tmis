import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/Dialog';
import { Label } from '../../../components/ui/Label';
import { Select } from '../../../components/ui/Select';
import { Search, Plus, Minus, CreditCard, Receipt, Barcode, ShoppingBag, X, Banknote } from 'lucide-react';
import { Product, CartItem } from '../../../types';

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

export const POS: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [amountTendered, setAmountTendered] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');

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
    console.log("Processing Payment:", {
        method: paymentMethod,
        total: total,
        tendered: amountTendered,
        items: cart
    });
    // Reset state
    setCart([]);
    setAmountTendered('');
    setIsPaymentModalOpen(false);
    alert("Transaction Completed Successfully!");
  };

  const change = amountTendered ? (parseFloat(amountTendered) - total) : 0;

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500">
      
      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Process Payment</DialogTitle>
                <DialogDescription>Complete the transaction for the current customer.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-100 dark:border-zinc-700 text-center">
                        <div className="text-sm text-zinc-500 dark:text-zinc-400">Total Due</div>
                        <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">${total.toFixed(2)}</div>
                     </div>
                     <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800/50 text-center">
                        <div className="text-sm text-emerald-600 dark:text-emerald-400">Change Due</div>
                        <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">${Math.max(0, change).toFixed(2)}</div>
                     </div>
                </div>

                <div className="grid gap-2">
                    <Label>Payment Method</Label>
                    <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                        <option value="Cash">Cash</option>
                        <option value="Card">Credit/Debit Card</option>
                        <option value="E-Wallet">E-Wallet (GCash/Maya)</option>
                    </Select>
                </div>

                <div className="grid gap-2">
                    <Label>Amount Tendered</Label>
                    <div className="relative">
                        <Banknote className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                        <Input 
                            className="pl-10 text-lg font-medium" 
                            type="number" 
                            placeholder="0.00"
                            value={amountTendered}
                            onChange={(e) => setAmountTendered(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>Cancel</Button>
                <Button 
                    onClick={handlePayment} 
                    disabled={!amountTendered || parseFloat(amountTendered) < total}
                    className="w-full sm:w-auto"
                >
                    <Receipt className="mr-2 h-4 w-4"/> Complete Transaction
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Selection Area */}
      <div className="flex-1 flex flex-col gap-6 min-h-0">
        <div className="flex gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <Input
                    placeholder="Search products by name or SKU..."
                    className="pl-10 h-10 bg-white dark:bg-zinc-900"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Button variant="outline" className="bg-white dark:bg-zinc-900"><Barcode className="h-4 w-4 mr-2"/> Scan Item</Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-1 pb-2">
          {filteredProducts.map(product => (
            <Card 
                key={product.id} 
                onClick={() => addToCart(product)}
                className="cursor-pointer group hover:ring-2 hover:ring-zinc-900 dark:hover:ring-zinc-600 transition-all border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900"
            >
              <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 w-full relative">
                <img 
                    src={`https://picsum.photos/300/300?random=${product.id}`} 
                    alt={product.name} 
                    className="h-full w-full object-cover mix-blend-multiply dark:mix-blend-normal opacity-80 group-hover:opacity-100 transition-opacity" 
                />
                <div className="absolute top-2 right-2 bg-white/90 dark:bg-black/80 backdrop-blur text-[10px] font-bold px-2 py-1 rounded-full text-zinc-900 dark:text-white shadow-sm">
                    {product.stock} left
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate leading-none">{product.name}</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-3">{product.sku}</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">${product.price.toFixed(2)}</span>
                  <div className="h-6 w-6 rounded-full bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Cart / Transaction Area */}
      <div className="w-full lg:w-[400px] flex flex-col h-full">
        <Card className="flex flex-col h-full shadow-lg border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
            <CardHeader className="bg-zinc-50/50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 py-4">
            <CardTitle className="flex items-center gap-2 text-lg">
                <ShoppingBag className="h-5 w-5" /> Current Transaction
            </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-4 p-8">
                        <div className="h-16 w-16 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
                             <Receipt className="h-8 w-8 opacity-20 dark:opacity-40" />
                        </div>
                        <p className="text-sm font-medium">No items added to cart</p>
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {cart.map(item => (
                        <div key={item.id} className="flex items-center p-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors group">
                            <div className="flex-1 min-w-0 mr-4">
                                <h5 className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">{item.name}</h5>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">${item.price.toFixed(2)}</p>
                            </div>
                            
                            <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800 rounded-md p-1 border border-zinc-100 dark:border-zinc-700">
                                <button 
                                    onClick={() => updateQuantity(item.id, -1)} 
                                    className="h-6 w-6 flex items-center justify-center rounded hover:bg-white dark:hover:bg-zinc-700 hover:shadow-sm text-zinc-600 dark:text-zinc-300 transition-all"
                                >
                                    <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-4 text-center text-sm font-medium tabular-nums dark:text-zinc-100">{item.quantity}</span>
                                <button 
                                    onClick={() => updateQuantity(item.id, 1)} 
                                    className="h-6 w-6 flex items-center justify-center rounded hover:bg-white dark:hover:bg-zinc-700 hover:shadow-sm text-zinc-600 dark:text-zinc-300 transition-all"
                                >
                                    <Plus className="h-3 w-3" />
                                </button>
                            </div>
                            
                            <div className="text-right w-20 ml-2">
                                <div className="font-semibold text-sm dark:text-zinc-100">${(item.price * item.quantity).toFixed(2)}</div>
                            </div>
                             <button onClick={() => removeFromCart(item.id)} className="ml-2 p-2 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                    </div>
                )}
            </CardContent>
            
            <div className="p-6 bg-zinc-50/80 dark:bg-zinc-900/90 border-t border-zinc-200 dark:border-zinc-800 space-y-4 backdrop-blur-sm">
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                        <span>Subtotal</span>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                        <span>Tax (10%)</span>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-end pt-3 border-t border-zinc-200 dark:border-zinc-700">
                        <span className="font-semibold text-base text-zinc-900 dark:text-zinc-50">Total Due</span>
                        <span className="font-bold text-2xl text-zinc-900 dark:text-zinc-50 tracking-tight">${total.toFixed(2)}</span>
                    </div>
                </div>
                <Button 
                    size="lg" 
                    className="w-full text-base shadow-zinc-900/10" 
                    disabled={cart.length === 0}
                    onClick={() => setIsPaymentModalOpen(true)}
                >
                    <CreditCard className="mr-2 h-4 w-4" /> Pay Now
                </Button>
            </div>
        </Card>
      </div>
    </div>
  );
};