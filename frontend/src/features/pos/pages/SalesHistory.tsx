import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { StatusDot } from '../../../components/ui/StatusDot';
import { DataTable } from '../../../components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/Dialog';
import { Label } from '../../../components/ui/Label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../components/ui/DropdownMenu';
import {
    Receipt, MoreHorizontal, Loader2, ArrowUpDown,
    Ban, RefreshCw, TrendingUp, ShoppingBag, DollarSign, CalendarRange
} from 'lucide-react';
import { getAllTransactions, voidTransaction, TransactionResult } from '../services/posService';

interface SalesHistoryProps {
    currentRole?: string;
}

export const SalesHistory: React.FC<SalesHistoryProps> = ({ currentRole }) => {
    const [transactions, setTransactions] = useState<TransactionResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fromDate, setFromDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d.toISOString().split('T')[0];
    });
    const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);

    // Receipt modal
    const [viewingTx, setViewingTx] = useState<TransactionResult | null>(null);
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);

    // Void confirmation
    const [voidingTx, setVoidingTx] = useState<TransactionResult | null>(null);
    const [isVoidConfirmOpen, setIsVoidConfirmOpen] = useState(false);
    const [isVoiding, setIsVoiding] = useState(false);

    const canVoid = currentRole === 'SuperAdmin' || currentRole === 'Manager';

    const loadTransactions = useCallback(() => {
        setIsLoading(true);
        getAllTransactions({ from: fromDate, to: toDate })
            .then(setTransactions)
            .catch(() => setTransactions([]))
            .finally(() => setIsLoading(false));
    }, [fromDate, toDate]);

    useEffect(() => {
        loadTransactions();
    }, [loadTransactions]);

    const handleVoid = async () => {
        if (!voidingTx) return;
        setIsVoiding(true);
        try {
            await voidTransaction(voidingTx.id);
            setIsVoidConfirmOpen(false);
            setVoidingTx(null);
            loadTransactions();
        } catch (err: any) {
            alert(err?.response?.data?.message ?? 'Failed to void transaction.');
        } finally {
            setIsVoiding(false);
        }
    };

    // Summary metrics
    const stats = useMemo(() => {
        const completed = transactions.filter(t => t.status === 'Completed');
        return {
            totalSales: completed.reduce((s, t) => s + t.totalAmount, 0),
            txCount: completed.length,
            itemsSold: completed.reduce((s, t) => s + t.items.reduce((si, i) => si + i.quantity, 0), 0),
            avgOrder: completed.length ? completed.reduce((s, t) => s + t.totalAmount, 0) / completed.length : 0,
        };
    }, [transactions]);

    const columns = useMemo<ColumnDef<TransactionResult>[]>(() => [
        {
            accessorKey: 'transactionNumber',
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Ref # <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <span className="font-mono text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    {row.getValue('transactionNumber')}
                </span>
            ),
        },
        {
            accessorKey: 'transactionDate',
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Date / Time <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const d = new Date(row.getValue('transactionDate'));
                return (
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">
                        <p className="font-medium text-zinc-800 dark:text-zinc-200">{d.toLocaleDateString()}</p>
                        <p>{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                );
            },
        },
        {
            accessorKey: 'cashierName',
            header: 'Cashier',
            cell: ({ row }) => (
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                    {row.getValue('cashierName') ?? '—'}
                </span>
            ),
        },
        {
            id: 'itemCount',
            header: 'Items',
            cell: ({ row }) => {
                const count = row.original.items.reduce((s, i) => s + i.quantity, 0);
                return <span className="font-mono text-xs text-zinc-500">{count} item{count !== 1 ? 's' : ''}</span>;
            },
        },
        {
            accessorKey: 'subtotal',
            header: 'Subtotal',
            cell: ({ row }) => (
                <span className="font-mono text-sm text-zinc-600 dark:text-zinc-400">
                    ₱{(row.getValue('subtotal') as number).toFixed(2)}
                </span>
            ),
        },
        {
            accessorKey: 'taxAmount',
            header: 'Tax',
            cell: ({ row }) => (
                <span className="font-mono text-sm text-zinc-500">
                    ₱{(row.getValue('taxAmount') as number).toFixed(2)}
                </span>
            ),
        },
        {
            accessorKey: 'totalAmount',
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Total <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                    ₱{(row.getValue('totalAmount') as number).toFixed(2)}
                </span>
            ),
        },
        {
            accessorKey: 'paymentMethod',
            header: 'Payment',
            cell: ({ row }) => {
                const m = row.getValue('paymentMethod') as string;
                return (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {m}
                    </span>
                );
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const s = row.getValue('status') as string;
                return (
                    <StatusDot variant={s === 'Completed' ? 'success' : s === 'Voided' ? 'error' : 'warning'}>
                        {s}
                    </StatusDot>
                );
            },
        },
        {
            id: 'actions',
            header: () => <div className="text-right text-xs font-semibold pr-2">Actions</div>,
            cell: ({ row }) => {
                const tx = row.original;
                return (
                    <div className="flex justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Actions</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[170px] bg-white dark:bg-zinc-900 dark:border-zinc-800">
                                <DropdownMenuItem onClick={() => { setViewingTx(tx); setIsReceiptOpen(true); }}>
                                    <Receipt className="mr-2 h-4 w-4" /> View Receipt
                                </DropdownMenuItem>
                                {canVoid && tx.status === 'Completed' && (
                                    <DropdownMenuItem
                                        className="text-red-600 focus:text-red-600 dark:text-red-400"
                                        onClick={() => { setVoidingTx(tx); setIsVoidConfirmOpen(true); }}
                                    >
                                        <Ban className="mr-2 h-4 w-4" /> Void Transaction
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ], [canVoid]);

    return (
        <div className="space-y-6 pb-10">

            {/* Receipt Modal */}
            <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Receipt className="h-4 w-4" /> Transaction Receipt
                        </DialogTitle>
                        <DialogDescription>
                            {viewingTx?.transactionNumber}
                        </DialogDescription>
                    </DialogHeader>
                    {viewingTx && (
                        <div className="space-y-4 py-2 text-sm">
                            <div className="grid grid-cols-2 gap-2 text-xs text-zinc-500">
                                <div>
                                    <p className="font-medium text-zinc-700 dark:text-zinc-300">Date</p>
                                    <p>{new Date(viewingTx.transactionDate).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-zinc-700 dark:text-zinc-300">Cashier</p>
                                    <p>{viewingTx.cashierName ?? '—'}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-zinc-700 dark:text-zinc-300">Payment</p>
                                    <p>{viewingTx.paymentMethod}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-zinc-700 dark:text-zinc-300">Status</p>
                                    <p className={viewingTx.status === 'Voided' ? 'text-red-500' : 'text-emerald-600'}>
                                        {viewingTx.status}
                                    </p>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="border rounded-md overflow-hidden">
                                <table className="w-full text-xs">
                                    <thead className="bg-zinc-50 dark:bg-zinc-800">
                                        <tr>
                                            <th className="text-left px-3 py-2 font-semibold text-zinc-600 dark:text-zinc-400">Item</th>
                                            <th className="text-right px-3 py-2 font-semibold text-zinc-600 dark:text-zinc-400">Qty</th>
                                            <th className="text-right px-3 py-2 font-semibold text-zinc-600 dark:text-zinc-400">Price</th>
                                            <th className="text-right px-3 py-2 font-semibold text-zinc-600 dark:text-zinc-400">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                        {viewingTx.items.map((item, i) => (
                                            <tr key={i} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                                                <td className="px-3 py-2 text-zinc-800 dark:text-zinc-200">{item.productName}</td>
                                                <td className="px-3 py-2 text-right text-zinc-500">{item.quantity}</td>
                                                <td className="px-3 py-2 text-right font-mono text-zinc-500">₱{item.unitPrice.toFixed(2)}</td>
                                                <td className="px-3 py-2 text-right font-mono font-medium text-zinc-800 dark:text-zinc-200">₱{item.lineTotal.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals */}
                            <div className="space-y-1.5 text-xs">
                                <div className="flex justify-between text-zinc-500">
                                    <span>Subtotal</span>
                                    <span className="font-mono">₱{viewingTx.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-zinc-500">
                                    <span>Tax (10%)</span>
                                    <span className="font-mono">₱{viewingTx.taxAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-sm pt-2 border-t">
                                    <span>Total</span>
                                    <span className="font-mono text-emerald-600">₱{viewingTx.totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-zinc-500">
                                    <span>Amount Tendered</span>
                                    <span className="font-mono">₱{viewingTx.amountTendered.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-zinc-500">
                                    <span>Change</span>
                                    <span className="font-mono">₱{viewingTx.change.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsReceiptOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Void Confirmation Modal */}
            <Dialog open={isVoidConfirmOpen} onOpenChange={setIsVoidConfirmOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <Ban className="h-4 w-4" /> Void Transaction
                        </DialogTitle>
                        <DialogDescription>
                            This action is irreversible. The transaction will be marked as Voided and all product stock will be restored.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2 text-sm">
                        <p className="text-zinc-600 dark:text-zinc-400">
                            Are you sure you want to void{' '}
                            <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                                {voidingTx?.transactionNumber}
                            </span>
                            ?
                        </p>
                        <p className="mt-1 text-zinc-500">
                            Total: <strong>₱{voidingTx?.totalAmount.toFixed(2)}</strong>
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsVoidConfirmOpen(false)} disabled={isVoiding}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleVoid} disabled={isVoiding}>
                            {isVoiding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Ban className="mr-2 h-4 w-4" />}
                            {isVoiding ? 'Voiding...' : 'Confirm Void'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Sales History</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">View, export and manage completed transactions.</p>
                </div>
                <Button variant="outline" size="sm" onClick={loadTransactions} disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-zinc-200 dark:border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-zinc-400" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">₱{stats.totalSales.toFixed(2)}</p>
                        <p className="text-xs text-zinc-500 mt-1">Completed transactions only</p>
                    </CardContent>
                </Card>
                <Card className="border-zinc-200 dark:border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">Transactions</CardTitle>
                        <Receipt className="h-4 w-4 text-zinc-400" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{stats.txCount}</p>
                        <p className="text-xs text-zinc-500 mt-1">In selected period</p>
                    </CardContent>
                </Card>
                <Card className="border-zinc-200 dark:border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">Items Sold</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-zinc-400" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{stats.itemsSold}</p>
                        <p className="text-xs text-zinc-500 mt-1">Units across all orders</p>
                    </CardContent>
                </Card>
                <Card className="border-zinc-200 dark:border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">Avg. Order Value</CardTitle>
                        <TrendingUp className="h-4 w-4 text-zinc-400" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">₱{stats.avgOrder.toFixed(2)}</p>
                        <p className="text-xs text-zinc-500 mt-1">Per completed transaction</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-end gap-4 bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <div className="grid gap-1.5">
                    <Label className="text-xs text-zinc-500 flex items-center gap-1">
                        <CalendarRange className="h-3.5 w-3.5" /> From
                    </Label>
                    <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="h-9 text-sm w-40" />
                </div>
                <div className="grid gap-1.5">
                    <Label className="text-xs text-zinc-500">To</Label>
                    <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="h-9 text-sm w-40" />
                </div>
                <Button size="sm" onClick={loadTransactions} disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Apply
                </Button>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="h-64 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                </div>
            ) : (
                <DataTable columns={columns} data={transactions} />
            )}
        </div>
    );
};
