import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/Dialog';
import { Label } from '../../../components/ui/Label';
import {
  Search, Plus, Minus, Receipt, ShoppingBag, X, Banknote,
  Loader2, CheckCircle2, AlertTriangle, Package, CreditCard,
  Smartphone, Trash2, ChevronRight, LayoutGrid, List, ArrowLeft, ScanBarcode
} from 'lucide-react';
import { Product, CartItem } from '../../../types';
import { fetchProducts, createTransaction, TransactionResult } from '../services/posService';
import { inventoryService } from '../../inventory/services/inventoryService';
import { cn } from '../../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { AuthConfirmationModal } from '../../../components/common/AuthConfirmationModal';
import { LoadingScreen } from '../../../components/common/LoadingScreen';

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
  const navigate = useNavigate();

  // ── Data state ────────────────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

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

  // ── Void item auth state ────────────────────────────────────────────────
  const [voidAuthOpen, setVoidAuthOpen] = useState(false);
  const [pendingVoidId, setPendingVoidId] = useState<string | null>(null);
  const [voidAllOpen, setVoidAllOpen] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const barcodeRef = useRef<HTMLInputElement>(null);
  const [barcodeInput, setBarcodeInput] = useState('');

  // ── Load products on mount ─────────────────────────────────────────────
  const loadProducts = useCallback(() => {
    setProductsLoading(true);
    fetchProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setProductsLoading(false));
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

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
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || (p.barcode && p.barcode.toLowerCase().includes(q));
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

  const handleBarcodeScan = useCallback(async (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;
    // Try local match first (SKU or barcode field)
    const product = products.find(p =>
      p.sku.toLowerCase() === trimmed.toLowerCase() ||
      (p.barcode && p.barcode.toLowerCase() === trimmed.toLowerCase())
    );
    if (product) {
      addToCart(product);
    } else {
      // Fallback: try backend lookup to get product by barcode/SKU
      try {
        const res = await inventoryService.lookupProduct(trimmed);
        if (res.data.success && res.data.data) {
          const p = res.data.data;
          const mapped: Product = {
            id: String(p.id), name: p.name, category: p.category,
            price: p.sellingPrice, stock: p.stock, sku: p.sku,
            barcode: p.barcode, reorderLevel: p.reorderLevel ?? 0,
            unitOfMeasure: p.unitOfMeasure ?? 'pcs', image: p.imageUrl ?? undefined,
          };
          if (mapped.stock > 0) addToCart(mapped);
          else alert(`Product "${mapped.name}" is out of stock.`);
        } else {
          alert(`No product found for: ${trimmed}`);
        }
      } catch {
        alert(`No product found for: ${trimmed}`);
      }
    }
    setBarcodeInput('');
  }, [products, addToCart]);

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

  const requestVoidItem = useCallback((id: string) => {
    setPendingVoidId(id);
    setVoidAuthOpen(true);
  }, []);

  const handleVoidConfirmed = useCallback(() => {
    if (pendingVoidId) {
      removeFromCart(pendingVoidId);
      setPendingVoidId(null);
    }
    setVoidAuthOpen(false);
  }, [pendingVoidId, removeFromCart]);

  const requestClearCart = useCallback(() => {
    if (cart.length === 0) return;
    setVoidAllOpen(true);
  }, [cart.length]);

  const handleClearCartConfirmed = useCallback(() => {
    setCart([]);
    setVoidAllOpen(false);
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  // ── Totals (Philippine 12% VAT-inclusive pricing) ───────────────────────
  const subtotal    = useMemo(() => cart.reduce((s, i) => s + i.price * i.quantity, 0), [cart]);
  const vatableSales = useMemo(() => Math.round(subtotal / 1.12 * 100) / 100, [subtotal]);
  const vatAmount   = useMemo(() => Math.round((subtotal - vatableSales) * 100) / 100, [subtotal, vatableSales]);
  const total       = subtotal; // VAT-inclusive: total equals subtotal
  const totalItems  = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);

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

  // ── Category counts ──────────────────────────────────────────────────────
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { [ALL_CAT]: products.length };
    products.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });
    return counts;
  }, [products]);

  // ── Show branded loading screen on initial POS load (after ALL hooks) ────
  if (productsLoading) {
    return <LoadingScreen message="Loading POS terminal..." subMessage="Fetching product catalog" />;
  }

  return (
    <div className="flex flex-col h-full p-4 md:p-6">
      {/* ── POS Header bar ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-1 pb-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="text-xs gap-1.5 text-zinc-500" aria-label="Go back to dashboard">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Button>
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Point of Sale</span>
        </div>
        <span className="text-xs text-zinc-400 tabular-nums hidden sm:block">
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} available
        </span>
      </div>

      {/* ── Main split layout ─────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">

        {/* ── LEFT: Product catalog ──────────────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-3 min-h-0 min-w-0">

          {/* Search + barcode + view toggle */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 pointer-events-none" />
              <Input
                ref={searchRef}
                placeholder="Search products… (F2)"
                className="pl-9 h-10 bg-white dark:bg-zinc-900 text-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                aria-label="Search products by name, SKU, or category"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600" aria-label="Clear search">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="relative w-48 shrink-0">
              <ScanBarcode className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 pointer-events-none" />
              <Input
                ref={barcodeRef}
                placeholder="Scan barcode"
                className="pl-9 h-10 bg-white dark:bg-zinc-900 text-sm font-mono"
                value={barcodeInput}
                onChange={e => setBarcodeInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleBarcodeScan(barcodeInput); } }}
                aria-label="Scan or type barcode / SKU"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 bg-white dark:bg-zinc-900 shrink-0"
              onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')}
              aria-label={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
            </Button>
          </div>

          {/* Category tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none shrink-0" role="tablist" aria-label="Filter by category">
            {categories.map(cat => (
              <button
                key={cat}
                role="tab"
                aria-selected={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border flex items-center gap-1.5',
                  activeCategory === cat
                    ? 'bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 border-transparent'
                    : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
                )}
              >
                {cat}
                <span className={cn(
                  'text-[10px] tabular-nums',
                  activeCategory === cat ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-400'
                )}>
                  {categoryCounts[cat] ?? 0}
                </span>
              </button>
            ))}
          </div>

          {/* Product grid / list */}
          <div className="flex-1 overflow-y-auto min-h-0" role="tabpanel">
            {productsLoading ? (
              <div className="h-full flex items-center justify-center text-zinc-400 gap-2">
                <Loader2 className="h-5 w-5 animate-spin" /> Loading products…
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-400 gap-3">
                <Package className="h-12 w-12 opacity-15" />
                <div className="text-center">
                  <p className="text-sm font-medium">No products found</p>
                  <p className="text-xs mt-1">Try a different search or category</p>
                </div>
                {(searchTerm || activeCategory !== ALL_CAT) && (
                  <Button variant="outline" size="sm" onClick={() => { setSearchTerm(''); setActiveCategory(ALL_CAT); }}>
                    Clear filters
                  </Button>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 pb-2 pr-1">
                {filteredProducts.map(product => {
                  const inCart = cartQtyMap[product.id] ?? 0;
                  const lowStock = product.stock > 0 && product.stock <= product.reorderLevel;
                  const outOfStock = product.stock === 0;
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => addToCart(product)}
                      disabled={outOfStock}
                      aria-label={`Add ${product.name} to cart, ₱${product.price.toFixed(2)}${outOfStock ? ', out of stock' : ''}`}
                      className={cn(
                        'relative group rounded-xl border text-left overflow-hidden transition-all select-none w-full',
                        outOfStock
                          ? 'opacity-50 cursor-not-allowed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                          : 'cursor-pointer hover:shadow-md hover:border-zinc-400 dark:hover:border-zinc-500 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 active:scale-[0.98]'
                      )}
                    >
                      {/* In-cart badge */}
                      {inCart > 0 && (
                        <div className="absolute top-2 left-2 z-10 h-6 w-6 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold flex items-center justify-center shadow-md ring-2 ring-white dark:ring-zinc-900">
                          {inCart}
                        </div>
                      )}

                      {/* Stock badge */}
                      <div className={cn(
                        'absolute top-2 right-2 z-10 text-[10px] font-bold px-2 py-0.5 rounded-full',
                        outOfStock ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'
                          : lowStock ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                          : 'bg-white/90 dark:bg-black/70 text-zinc-500 dark:text-zinc-400'
                      )}>
                        {outOfStock ? 'Out of stock' : lowStock ? `${product.stock} left` : `${product.stock}`}
                      </div>

                      {/* Product image — 1:1 square aspect for compact scanning */}
                      <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                        {product.image ? (
                          <img src={product.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                        ) : (
                          <Package className="h-10 w-10 text-zinc-300 dark:text-zinc-600 group-hover:scale-105 transition-transform duration-200" />
                        )}
                      </div>

                      {/* Product info */}
                      <div className="p-3 space-y-1">
                        <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 leading-tight line-clamp-2 min-h-[2.5rem]">{product.name}</h4>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-base text-zinc-900 dark:text-zinc-50 tabular-nums">₱{product.price.toFixed(2)}</span>
                          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">{product.sku}</span>
                        </div>
                      </div>

                      {/* Add overlay on hover */}
                      {!outOfStock && (
                        <div className="absolute inset-x-0 bottom-0 h-9 bg-gradient-to-t from-zinc-900/80 to-transparent flex items-end justify-center pb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <span className="text-xs font-semibold text-white flex items-center gap-1">
                            <Plus className="h-3 w-3" /> Add to cart
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              /* ── List view ──────────────────────────────────────────────── */
              <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
                {filteredProducts.map(product => {
                  const inCart = cartQtyMap[product.id] ?? 0;
                  const outOfStock = product.stock === 0;
                  const lowStock = product.stock > 0 && product.stock <= product.reorderLevel;
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => addToCart(product)}
                      disabled={outOfStock}
                      aria-label={`Add ${product.name} to cart, ₱${product.price.toFixed(2)}`}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 transition-colors text-left w-full',
                        outOfStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/60 active:bg-zinc-100'
                      )}
                    >
                      <div className="h-11 w-11 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                        {product.image ? (
                          <img src={product.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Package className="h-5 w-5 text-zinc-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{product.name}</p>
                        <p className="text-xs text-zinc-400 font-mono">{product.sku} · {product.category}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tabular-nums">₱{product.price.toFixed(2)}</p>
                        <p className={cn('text-xs', outOfStock ? 'text-red-500' : lowStock ? 'text-amber-500' : 'text-zinc-400')}>
                          {outOfStock ? 'Out of stock' : `${product.stock} in stock`}
                        </p>
                      </div>
                      {inCart > 0 && (
                        <div className="h-6 w-6 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[11px] font-bold flex items-center justify-center shrink-0">
                          {inCart}
                        </div>
                      )}
                      {!outOfStock && <ChevronRight className="h-4 w-4 text-zinc-300 dark:text-zinc-600 shrink-0" />}
                    </button>
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
                  Current Order
                  {totalItems > 0 && (
                    <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[11px] font-bold px-1.5">
                      {totalItems}
                    </span>
                  )}
                </CardTitle>
                {cart.length > 0 && (
                  <button onClick={requestClearCart} className="text-xs text-zinc-400 hover:text-red-500 flex items-center gap-1 transition-colors" aria-label="Clear all items from cart">
                    <Trash2 className="h-3.5 w-3.5" /> Clear
                  </button>
                )}
              </div>
            </CardHeader>

            {/* Cart items */}
            <CardContent className="flex-1 overflow-y-auto p-0 min-h-0">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-400 gap-3 p-8">
                  <div className="h-16 w-16 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
                    <ShoppingBag className="h-7 w-7 opacity-25" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-zinc-500">No items yet</p>
                    <p className="text-xs text-zinc-400 mt-1">Tap a product or scan a barcode to begin</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {cart.map(item => {
                    const atMax = item.quantity >= item.stock;
                    return (
                      <div key={item.id} className="flex items-start gap-3 px-4 py-3 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors group">
                        {/* Product image */}
                        <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5 overflow-hidden">
                          {item.image ? (
                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Package className="h-4 w-4 text-zinc-400" />
                          )}
                        </div>
                        {/* Name + unit price */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-tight truncate">{item.name}</p>
                          <p className="text-xs text-zinc-400 mt-0.5">₱{item.price.toFixed(2)} / {item.unitOfMeasure}</p>
                          {atMax && (
                            <p className="text-[10px] text-amber-500 flex items-center gap-1 mt-0.5">
                              <AlertTriangle className="h-3 w-3" /> Max stock
                            </p>
                          )}
                        </div>
                        {/* Qty stepper — 36px touch targets per Fitts's Law */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => item.quantity === 1 ? requestVoidItem(item.id) : setQuantity(item.id, item.quantity - 1)}
                            className="h-8 w-8 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-zinc-500 active:scale-95"
                            aria-label={item.quantity === 1 ? `Remove ${item.name} from cart` : `Decrease ${item.name} quantity`}
                          >
                            {item.quantity === 1 ? <X className="h-3.5 w-3.5 text-red-400" /> : <Minus className="h-3.5 w-3.5" />}
                          </button>
                          <input
                            type="number"
                            min={1}
                            max={item.stock}
                            value={item.quantity}
                            onChange={e => setQuantity(item.id, parseInt(e.target.value) || 1)}
                            className="w-10 text-center text-sm font-bold tabular-nums border border-zinc-200 dark:border-zinc-700 rounded-lg py-1.5 bg-transparent dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                            aria-label={`${item.name} quantity`}
                          />
                          <button
                            onClick={() => setQuantity(item.id, item.quantity + 1)}
                            disabled={atMax}
                            className="h-8 w-8 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                            aria-label={`Increase ${item.name} quantity`}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {/* Line total */}
                        <div className="text-right shrink-0 w-[4.5rem]">
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
                  <span>VATable Sales</span>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300 tabular-nums">₱{vatableSales.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                  <span>VAT (12%)</span>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300 tabular-nums">₱{vatAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-baseline pt-2.5 border-t border-zinc-200 dark:border-zinc-700">
                  <span className="font-bold text-base text-zinc-900 dark:text-zinc-50">Total</span>
                  <span className="font-bold text-2xl text-zinc-900 dark:text-zinc-50 tabular-nums tracking-tight">₱{total.toFixed(2)}</span>
                </div>
              </div>
              <Button
                size="lg"
                className="w-full font-semibold text-base gap-2 h-12"
                disabled={cart.length === 0}
                onClick={openPayModal}
                aria-label={`Charge customer ₱${total.toFixed(2)}`}
              >
                <Banknote className="h-5 w-5" />
                Charge · ₱{total.toFixed(2)}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* ── Payment modal ─────────────────────────────────────────────────── */}
      <Dialog open={payModalOpen} onOpenChange={v => { if (!isProcessing) setPayModalOpen(v); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Receipt className="h-5 w-5" /> Process Payment
            </DialogTitle>
            <DialogDescription>
              {totalItems} item{totalItems !== 1 ? 's' : ''} · Select payment method and confirm
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
                          ? 'border-zinc-900 dark:border-zinc-50 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 shadow-sm'
                          : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                      )}
                      aria-pressed={paymentMethod === m.value}
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
                    aria-label="Amount tendered"
                  />
                </div>
                {/* Quick-tender buttons */}
                <div className="flex gap-1.5 flex-wrap">
                  <button
                    onClick={() => setAmountTendered(total.toFixed(2))}
                    className="px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:border-zinc-400 font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
                  >
                    Exact
                  </button>
                  {QUICK_AMOUNTS.filter(a => a >= total).slice(0, 5).map(a => (
                    <button
                      key={a}
                      onClick={() => setAmountTendered(String(a))}
                      className="px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:border-zinc-400 font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
                    >
                      ₱{a.toLocaleString()}
                    </button>
                  ))}
                </div>
                {tender > 0 && tender < total && (
                  <p className="text-xs text-red-500 flex items-center gap-1" role="alert">
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
                <span>VATable Sales · VAT (12%)</span>
                <span className="tabular-nums">₱{vatableSales.toFixed(2)} · ₱{vatAmount.toFixed(2)}</span>
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
                <div className="flex justify-between text-zinc-500"><span>VATable Sales</span><span className="tabular-nums">₱{(successTx.subtotal / 1.12).toFixed(2)}</span></div>
                <div className="flex justify-between text-zinc-500"><span>VAT (12%)</span><span className="tabular-nums">₱{successTx.taxAmount.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-base pt-2 border-t border-zinc-200 dark:border-zinc-700">
                  <span>Total Paid</span>
                  <span className="tabular-nums text-emerald-600">₱{successTx.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Tendered ({successTx.paymentMethod})</span>
                  <span className="tabular-nums">₱{successTx.amountTendered.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Change</span>
                  <span className="tabular-nums text-emerald-600">₱{successTx.change.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button className="w-full h-11 font-semibold text-base" onClick={() => setReceiptOpen(false)}>
              New Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Void item auth modal ──────────────────────────────────────────── */}
      <AuthConfirmationModal
        isOpen={voidAuthOpen}
        onClose={() => { setVoidAuthOpen(false); setPendingVoidId(null); }}
        onConfirm={handleVoidConfirmed}
        actionDescription="Removing an item from the cart requires manager authorization. Please enter your password to continue."
      />

      {/* ── Clear all cart auth modal ─────────────────────────────────────── */}
      <AuthConfirmationModal
        isOpen={voidAllOpen}
        onClose={() => setVoidAllOpen(false)}
        onConfirm={handleClearCartConfirmed}
        actionDescription="Clearing the entire cart requires manager authorization. Please enter your password to continue."
      />
    </div>
  );
};