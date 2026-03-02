import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/Dialog';
import { Label } from '../../../components/ui/Label';
import { Select } from '../../../components/ui/Select';
import {
  Search, Plus, Minus, Receipt, ShoppingBag, X, Banknote,
  Loader2, CheckCircle2, AlertTriangle, Package, CreditCard,
  Smartphone, Trash2, Tag, ChevronRight, RefreshCw, LayoutGrid, List
} from 'lucide-react';
import { Product, CartItem } from '../../../types';
import { fetchProducts, createTransaction, getMyTodayTransactions, TransactionResult } from '../services/posService';
import { cn } from '../../../lib/utils';

// ─── Quick-tender preset amounts ────────────────────────────────────────────
const QUICK_AMOUNTS = [20, 50, 100, 200, 500, 1000];

// ─── Payment method config ────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { value: 'Cash', label: 'Cash', icon: Banknote },
  { value: 'Card', label: 'Card / POS', icon: CreditCard },
  { value: 'GCash', label: 'GCash', icon: Smartphone },
  { value: 'PayMaya', label: 'PayMaya', icon: Smartphone },
];

// ─── Category tab list derived at render time ─────────────────────────────
const ALL_CAT = 'All';

export const POS: React.FC = () => {
  // ── Data state ────────────────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [recentTx, setRecentTx] = useState<TransactionResult[]>([]);
  const [txLoading, setTxLoading] = useState(false);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(ALL_CAT);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // ── Payment modal state ───────────────────────────────────────────────────
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountTendered, setAmountTendered] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // ── Success receipt state ─────────────────────────────────────────────────
  const [successTx, setSuccessTx] = useState<TransactionResult | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);

  // ── Load products & today's transactions on mount ─────────────────────────
  const loadProducts = useCallback(() => {
    setProductsLoading(true);
    fetchProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setProductsLoading(false));
  }, []);

  const loadRecentTx = useCallback(() => {
    setTxLoading(true);
    getMyTodayTransactions()
      .then(setRecentTx)
      .catch(() => setRecentTx([]))
      .finally(() => setTxLoading(false));
  }, []);

  useEffect(() => {
    loadProducts();
    loadRecentTx();
  }, [loadProducts, loadRecentTx]);

  // ── Keyboard shortcut: F2 focuses search, Escape clears ──────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F2') { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === 'Escape') setSearchTerm('');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ── Derived category list ─────────────────────────────────────────────────
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category))).sort();
    return [ALL_CAT, ...cats];
  }, [products]);

  // ── Filtered products ─────────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return products.filter(p => {
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      const matchCat = activeCategory === ALL_CAT || p.category === activeCategory;
      return matchSearch && matchCat;
    });
  }, [products, searchTerm, activeCategory]);

  // ── Cart helpers ──────────────────────────────────────────────────────────
  const addToCart = useCallback((product: Product) => {
    if (product.stock === 0) return;
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev; // enforce stock cap
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const setQuantity = useCallback((id: string, qty: number) => {
    setCart(prev => prev.map(i => {
      if (i.id !== id) return i;
      const capped = Math.min(qty, i.stock);
      return capped < 1 ? i : { ...i, quantity: capped };
    }));
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  // ── Totals ────────────────────────────────────────────────────────────────
  const subtotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.quantity, 0), [cart]);
  const tax      = useMemo(() => Math.round(subtotal * 0.10 * 100) / 100, [subtotal]);
  const total    = useMemo(() => Math.round((subtotal + tax) * 100) / 100, [subtotal, tax]);
  const totalItems = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);

  const tender  = parseFloat(amountTendered) || 0;
  const change  = Math.max(0, Math.round((tender - total) * 100) / 100);
  const isExact = paymentMethod !== 'Cash'; // non-cash: no tendering needed

  // ── Open pay modal ────────────────────────────────────────────────────────
  const openPayModal = () => {
    setAmountTendered('');
    setPaymentMethod('Cash');
    setPayModalOpen(true);
  };

  // ── Process transaction ───────────────────────────────────────────────────
  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const result = await createTransaction({
        paymentMethod,
        amountTendered: isExact ? total : tender,
        items: cart.map(i => ({ productId: parseInt(i.id), quantity: i.quantity })),
      });
      setSuccessTx(result);
      setCart([]);
      setAmountTendered('');
      setPayModalOpen(false);
      setReceiptOpen(true);
      loadProducts();
      loadRecentTx();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Transaction failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const canPay = cart.length > 0 && !isProcessing && (isExact || tender >= total);

  // ── Cart item quantity in-cart count (for badge overlay) ─────────────────
  const cartQtyMap = useMemo(() => {
    const map: Record<string, number> = {};
    cart.forEach(i => { map[i.id] = i.quantity; });
    return map;
  }, [cart]);

  // ── Today cashier running totals ──────────────────────────────────────────
  const todayStats = useMemo(() => {
    const completed = recentTx.filter(t => t.status === 'Completed');
    return {
      count: completed.length,
      revenue: completed.reduce((s, t) => s + t.totalAmount, 0),
    };
  }, [recentTx]);

  return (
    <div className="flex flex-col gap-0 h-full">
      {/* ── Top session bar ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-1 pb-3">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>Today: <span className="font-semibold text-zinc-900 dark:text-zinc-100">{todayStats.count} txns</span></span>
          </div>
          <div className="text-zinc-500 dark:text-zinc-400">
            Revenue: <span className="font-semibold text-zinc-900 dark:text-zinc-100">₱{todayStats.revenue.toFixed(2)}</span>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => { loadProducts(); loadRecentTx(); }} className="text-xs gap-1.5 text-zinc-500">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {/* ── Main split layout ─────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0" style={{ height: 'calc(100vh - 230px)' }}>

        {/* ── LEFT: Product catalog ──────────────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-3 min-h-0 min-w-0">

          {/* Search + view toggle */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 pointer-events-none" />
              <Input
                ref={searchRef}
                placeholder="Search name, SKU, category… (F2)"
                className="pl-9 h-10 bg-white dark:bg-zinc-900 text-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 bg-white dark:bg-zinc-900 shrink-0"
              onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')}
              title="Toggle view"
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
            </Button>
          </div>

          {/* Category tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none shrink-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border',
                  activeCategory === cat
                    ? 'bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 border-transparent'
                    : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product grid / list */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {productsLoading ? (
              <div className="h-full flex items-center justify-center text-zinc-400 gap-2">
                <Loader2 className="h-5 w-5 animate-spin" /> Loading products...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-400 gap-2">
                <Package className="h-10 w-10 opacity-20" />
                <p className="text-sm">No products found</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 pb-2 pr-1">
                {filteredProducts.map(product => {
                  const inCart = cartQtyMap[product.id] ?? 0;
                  const lowStock = product.stock > 0 && product.stock <= product.reorderLevel;
                  const outOfStock = product.stock === 0;
                  return (
                    <div
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className={cn(
                        'relative group rounded-xl border bg-white dark:bg-zinc-900 overflow-hidden transition-all select-none',
                        outOfStock
                          ? 'opacity-50 cursor-not-allowed border-zinc-200 dark:border-zinc-800'
                          : 'cursor-pointer hover:shadow-md hover:border-zinc-400 dark:hover:border-zinc-500 border-zinc-200 dark:border-zinc-800 active:scale-[0.98]'
                      )}
                    >
                      {/* In-cart badge */}
                      {inCart > 0 && (
                        <div className="absolute top-2 left-2 z-10 h-5 w-5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-bold flex items-center justify-center shadow">
                          {inCart}
                        </div>
                      )}
                      {/* Stock badge */}
                      <div className={cn(
                        'absolute top-2 right-2 z-10 text-[10px] font-bold px-2 py-0.5 rounded-full',
                        outOfStock ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'
                          : lowStock ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                          : 'bg-white/90 dark:bg-black/70 text-zinc-700 dark:text-zinc-200'
                      )}>
                        {outOfStock ? 'Out' : `${product.stock}`}
                      </div>
                      {/* Product image placeholder */}
                      <div className="aspect-[4/3] bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                        <Package className="h-10 w-10 text-zinc-300 dark:text-zinc-600 group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="p-3">
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-0.5 font-mono">{product.sku}</p>
                        <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 leading-tight line-clamp-2">{product.name}</h4>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-bold text-base text-zinc-900 dark:text-zinc-50">₱{product.price.toFixed(2)}</span>
                          {!outOfStock && (
                            <div className="h-6 w-6 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Plus className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* List view */
              <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 pb-1">
                {filteredProducts.map(product => {
                  const inCart = cartQtyMap[product.id] ?? 0;
                  const outOfStock = product.stock === 0;
                  const lowStock = product.stock > 0 && product.stock <= product.reorderLevel;
                  return (
                    <div
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className={cn(
                        'flex items-center gap-4 px-4 py-3 transition-colors',
                        outOfStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/60 active:bg-zinc-100'
                      )}
                    >
                      <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                        <Package className="h-5 w-5 text-zinc-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{product.name}</p>
                        <p className="text-xs text-zinc-400 font-mono">{product.sku} · {product.category}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">₱{product.price.toFixed(2)}</p>
                        <p className={cn('text-xs', outOfStock ? 'text-red-500' : lowStock ? 'text-amber-500' : 'text-zinc-400')}>
                          {outOfStock ? 'Out of stock' : `${product.stock} left`}
                        </p>
                      </div>
                      {inCart > 0 && (
                        <div className="h-5 w-5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {inCart}
                        </div>
                      )}
                      {!outOfStock && <ChevronRight className="h-4 w-4 text-zinc-300 dark:text-zinc-600 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Cart + totals ────────────────────────────────────────── */}
        <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 flex flex-col h-full">
          <Card className="flex flex-col h-full border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">

            {/* Cart header */}
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 py-3 px-4 bg-zinc-50/60 dark:bg-zinc-800/40 shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <ShoppingBag className="h-4 w-4" />
                  Order
                  {totalItems > 0 && (
                    <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[11px] font-bold px-1.5">
                      {totalItems}
                    </span>
                  )}
                </CardTitle>
                {cart.length > 0 && (
                  <button onClick={clearCart} className="text-xs text-zinc-400 hover:text-red-500 flex items-center gap-1 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" /> Clear
                  </button>
                )}
              </div>
            </CardHeader>

            {/* Cart items */}
            <CardContent className="flex-1 overflow-y-auto p-0 min-h-0">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-400 gap-3 p-8">
                  <div className="h-14 w-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 opacity-30" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Cart is empty</p>
                    <p className="text-xs text-zinc-400 mt-1">Click a product to add it</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {cart.map(item => {
                    const atMax = item.quantity >= item.stock;
                    return (
                      <div key={item.id} className="flex items-start gap-3 px-4 py-3 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors group">
                        {/* Item icon */}
                        <div className="h-9 w-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                          <Tag className="h-4 w-4 text-zinc-400" />
                        </div>
                        {/* Name + price */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-tight truncate">{item.name}</p>
                          <p className="text-xs text-zinc-400 mt-0.5">₱{item.price.toFixed(2)} / {item.unitOfMeasure}</p>
                          {atMax && (
                            <p className="text-[10px] text-amber-500 flex items-center gap-1 mt-0.5">
                              <AlertTriangle className="h-3 w-3" /> Max stock reached
                            </p>
                          )}
                        </div>
                        {/* Qty stepper */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => item.quantity === 1 ? removeFromCart(item.id) : setQuantity(item.id, item.quantity - 1)}
                            className="h-7 w-7 rounded-md border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-zinc-500"
                          >
                            {item.quantity === 1 ? <X className="h-3 w-3 text-red-400" /> : <Minus className="h-3 w-3" />}
                          </button>
                          <input
                            type="number"
                            min={1}
                            max={item.stock}
                            value={item.quantity}
                            onChange={e => setQuantity(item.id, parseInt(e.target.value) || 1)}
                            className="w-10 text-center text-sm font-bold tabular-nums border border-zinc-200 dark:border-zinc-700 rounded-md py-1 bg-transparent dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                          />
                          <button
                            onClick={() => setQuantity(item.id, item.quantity + 1)}
                            disabled={atMax}
                            className="h-7 w-7 rounded-md border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        {/* Line total */}
                        <div className="text-right shrink-0 w-16">
                          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                            ₱{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>

            {/* Totals + pay button */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3 shrink-0 bg-zinc-50/50 dark:bg-zinc-900/80">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                  <span>Subtotal</span>
                  <span className="font-medium text-zinc-800 dark:text-zinc-200 tabular-nums">₱{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                  <span>VAT (10%)</span>
                  <span className="font-medium text-zinc-800 dark:text-zinc-200 tabular-nums">₱{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-zinc-200 dark:border-zinc-700">
                  <span className="font-bold text-base text-zinc-900 dark:text-zinc-50">Total</span>
                  <span className="font-bold text-2xl text-zinc-900 dark:text-zinc-50 tabular-nums tracking-tight">₱{total.toFixed(2)}</span>
                </div>
              </div>
              <Button
                size="lg"
                className="w-full font-semibold text-base gap-2"
                disabled={cart.length === 0}
                onClick={openPayModal}
              >
                <Banknote className="h-4 w-4" />
                Charge Customer · ₱{total.toFixed(2)}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* ── Today's feed (bottom, collapsed) ─────────────────────────────── */}
      <div className="mt-4 shrink-0">
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <CardHeader className="py-3 px-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Receipt className="h-4 w-4" /> Today's Transactions
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={loadRecentTx} disabled={txLoading}>
              {txLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
              Refresh
            </Button>
          </CardHeader>
          <CardContent className="p-0 max-h-48 overflow-y-auto">
            {txLoading ? (
              <div className="flex items-center justify-center py-6 text-zinc-400 gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            ) : recentTx.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-zinc-400 gap-2">
                <Receipt className="h-6 w-6 opacity-20" />
                <p className="text-xs">No transactions yet</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {recentTx.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'h-7 w-7 rounded-full flex items-center justify-center shrink-0',
                        tx.status === 'Completed' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-zinc-100 dark:bg-zinc-800'
                      )}>
                        <CheckCircle2 className={cn('h-3.5 w-3.5', tx.status === 'Completed' ? 'text-emerald-500' : 'text-zinc-400')} />
                      </div>
                      <div>
                        <p className="text-xs font-bold font-mono text-zinc-900 dark:text-zinc-100">{tx.transactionNumber}</p>
                        <p className="text-[11px] text-zinc-400">
                          {new Date(tx.transactionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {tx.paymentMethod} · {tx.items.reduce((s, i) => s + i.quantity, 0)} items
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">₱{tx.totalAmount.toFixed(2)}</p>
                      <Badge variant={tx.status === 'Completed' ? 'success' : 'warning'} className="text-[10px] h-4 px-1.5">
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Payment modal ─────────────────────────────────────────────────── */}
      <Dialog open={payModalOpen} onOpenChange={v => { if (!isProcessing) setPayModalOpen(v); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" /> Process Payment
            </DialogTitle>
            <DialogDescription>
              {totalItems} item{totalItems !== 1 ? 's' : ''} · Select method and confirm
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Totals summary */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 p-4 bg-zinc-900 dark:bg-zinc-800 rounded-xl text-white text-center">
                <p className="text-xs text-zinc-400 mb-1">Total Due</p>
                <p className="text-3xl font-bold tabular-nums tracking-tight">₱{total.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-center border border-emerald-100 dark:border-emerald-800/40">
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Change</p>
                <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">₱{change.toFixed(2)}</p>
              </div>
            </div>

            {/* Payment method */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Payment Method</Label>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map(m => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.value}
                      onClick={() => setPaymentMethod(m.value)}
                      className={cn(
                        'flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all',
                        paymentMethod === m.value
                          ? 'border-zinc-900 dark:border-zinc-50 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900'
                          : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amount tendered (cash only) */}
            {paymentMethod === 'Cash' && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Amount Tendered</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-semibold text-sm pointer-events-none">₱</span>
                  <Input
                    type="number"
                    min={total}
                    step="0.01"
                    className="pl-7 text-xl font-bold h-12 tabular-nums"
                    placeholder={total.toFixed(2)}
                    value={amountTendered}
                    onChange={e => setAmountTendered(e.target.value)}
                    autoFocus
                  />
                </div>
                {/* Quick-tender buttons */}
                <div className="flex gap-1.5 flex-wrap">
                  <button
                    onClick={() => setAmountTendered(total.toFixed(2))}
                    className="px-2.5 py-1 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:border-zinc-400 font-medium text-zinc-700 dark:text-zinc-300 transition-colors"
                  >
                    Exact
                  </button>
                  {QUICK_AMOUNTS.filter(a => a >= total).slice(0, 5).map(a => (
                    <button
                      key={a}
                      onClick={() => setAmountTendered(String(a))}
                      className="px-2.5 py-1 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:border-zinc-400 font-medium text-zinc-700 dark:text-zinc-300 transition-colors"
                    >
                      ₱{a}
                    </button>
                  ))}
                </div>
                {tender > 0 && tender < total && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Short by ₱{(total - tender).toFixed(2)}
                  </p>
                )}
              </div>
            )}

            {/* Non-cash confirmation line */}
            {paymentMethod !== 'Cash' && (
              <div className="flex items-center gap-2 text-sm text-zinc-500 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 py-3 border border-zinc-200 dark:border-zinc-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                Confirm {paymentMethod} payment of <strong className="text-zinc-900 dark:text-zinc-100 ml-1">₱{total.toFixed(2)}</strong>
              </div>
            )}

            {/* Order summary */}
            <div className="border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-800/60 px-4 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-widest">Order Summary</div>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 max-h-36 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center px-4 py-2.5 text-sm">
                    <span className="text-zinc-700 dark:text-zinc-300 truncate flex-1 mr-2">{item.name} <span className="text-zinc-400">×{item.quantity}</span></span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums shrink-0">₱{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between px-4 py-2.5 text-xs border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500">
                <span>Subtotal · VAT</span>
                <span className="tabular-nums">₱{subtotal.toFixed(2)} · ₱{tax.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPayModalOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handlePayment} disabled={!canPay} className="min-w-36 gap-2">
              {isProcessing ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
              ) : (
                <><CheckCircle2 className="h-4 w-4" /> Confirm Payment</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Success receipt modal ─────────────────────────────────────────── */}
      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="flex flex-col items-center gap-3 pb-2">
              <div className="h-14 w-14 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
              <DialogTitle className="text-xl font-bold text-center">Payment Successful</DialogTitle>
              <DialogDescription className="text-center font-mono font-semibold text-zinc-600 dark:text-zinc-300">
                {successTx?.transactionNumber}
              </DialogDescription>
            </div>
          </DialogHeader>

          {successTx && (
            <div className="space-y-3">
              {/* Items */}
              <div className="border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden text-sm">
                <div className="bg-zinc-50 dark:bg-zinc-800/60 px-4 py-2 text-xs font-semibold text-zinc-500 uppercase">Items</div>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {successTx.items.map((item, i) => (
                    <div key={i} className="flex justify-between px-4 py-2.5">
                      <span className="text-zinc-700 dark:text-zinc-300">{item.productName} <span className="text-zinc-400">×{item.quantity}</span></span>
                      <span className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">₱{item.lineTotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-1.5 px-1 text-sm">
                <div className="flex justify-between text-zinc-500"><span>Subtotal</span><span className="tabular-nums">₱{successTx.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-zinc-500"><span>VAT (10%)</span><span className="tabular-nums">₱{successTx.taxAmount.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-base pt-2 border-t border-zinc-200 dark:border-zinc-700">
                  <span>Total Paid</span>
                  <span className="tabular-nums text-emerald-600">₱{successTx.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Tendered</span>
                  <span className="tabular-nums">₱{successTx.amountTendered.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Change</span>
                  <span className="tabular-nums text-emerald-600">₱{successTx.change.toFixed(2)}</span>
                </div>
              </div>

              {/* Method */}
              <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 py-3 text-sm">
                <span className="text-zinc-500">Payment</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{successTx.paymentMethod}</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button className="w-full" onClick={() => setReceiptOpen(false)}>
              New Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};