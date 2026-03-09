import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { DataTable } from '../../../components/ui/data-table';
import { StatusDot } from '../../../components/ui/StatusDot';
import { Alert, AlertDescription } from '../../../components/ui/Alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/Tabs';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Wallet, Receipt, MoreHorizontal, ArrowUpDown, Loader2, Pencil, CheckCircle2, AlertCircle, Trash2, TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../components/ui/DropdownMenu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/Dialog';
import { Label } from '../../../components/ui/Label';
import { financeService, Expense as ApiExpense, Budget, CreateBudget, BudgetSummary, ExpenseSummary } from '../services/financeService';

const Finance = () => {
    const [expenses, setExpenses] = useState<ApiExpense[]>([]);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<ApiExpense | null>(null);
    const [addFeedback, setAddFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [editFeedback, setEditFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [isViewReceiptOpen, setIsViewReceiptOpen] = useState(false);
    const [viewingExpense, setViewingExpense] = useState<ApiExpense | null>(null);
    const [newExpense, setNewExpense] = useState<Partial<ApiExpense>>({
        expenseCategory: '',
        description: '',
        amount: 0,
        expenseDate: new Date().toISOString().split('T')[0],
        status: 'Paid'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [expensesRes, summaryRes] = await Promise.all([
                financeService.getExpenses(),
                financeService.getSummary(new Date().getMonth() + 1, new Date().getFullYear())
            ]);

            if (expensesRes.success && expensesRes.data) {
                setExpenses(expensesRes.data);
            }
            if (summaryRes.success && summaryRes.data !== undefined) {
                setTotalExpenses(summaryRes.data);
            }
        } catch (error) {
            console.error("Failed to load finance data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddFeedback(null);
        try {
            const response = await financeService.createExpense(newExpense);
            if (response.success) {
                setAddFeedback({ type: 'success', message: 'Expense recorded successfully.' });
                setTimeout(() => {
                    setIsAddOpen(false);
                    setAddFeedback(null);
                    setNewExpense({
                        expenseCategory: '',
                        description: '',
                        amount: 0,
                        expenseDate: new Date().toISOString().split('T')[0],
                        status: 'Paid'
                    });
                    loadData();
                }, 800);
            }
        } catch (error) {
            setAddFeedback({ type: 'error', message: 'Failed to record expense.' });
        }
    };

    const handleUpdateExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingExpense) return;
        setEditFeedback(null);
        try {
            const response = await financeService.updateExpense(editingExpense.id, editingExpense);
            if (response.success) {
                setEditFeedback({ type: 'success', message: 'Expense updated successfully.' });
                setTimeout(() => {
                    setIsEditOpen(false);
                    setEditFeedback(null);
                    loadData();
                }, 800);
            } else {
                setEditFeedback({ type: 'error', message: response.message || 'Failed to update expense.' });
            }
        } catch (error) {
            setEditFeedback({ type: 'error', message: 'Failed to update expense.' });
        }
    };

    const columns = useMemo<ColumnDef<ApiExpense>[]>(() => [
        {
            accessorKey: "expenseDate",
            header: ({ column }) => (
                <Button variant="ghost" className="-ml-3 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Date <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="text-zinc-500">{new Date(row.getValue("expenseDate")).toLocaleDateString()}</span>
        },
        {
            accessorKey: "expenseCategory",
            header: "Category",
            cell: ({ row }) => <span className="font-medium">{row.getValue("expenseCategory")}</span>
        },
        {
            accessorKey: "description",
            header: "Description",
            cell: ({ row }) => <span className="text-zinc-500 truncate max-w-[200px]">{row.getValue("description")}</span>
        },
        {
            accessorKey: "amount",
            header: () => <div className="text-right text-xs font-semibold text-zinc-500 dark:text-zinc-400">Amount</div>,
            cell: ({ row }) => <div className="text-right font-mono font-bold">₱{parseFloat(row.getValue("amount")).toFixed(2)}</div>
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                return <StatusDot variant={status === 'Paid' ? 'success' : 'warning'}>{status}</StatusDot>;
            }
        },
        {
            id: "actions",
            header: () => <div className="text-right text-xs font-semibold pr-2">Actions</div>,
            cell: ({ row }) => (
                <div className="flex justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px] bg-white dark:bg-zinc-900 dark:border-zinc-800">
                            <DropdownMenuItem onClick={() => { setEditingExpense(row.original); setIsEditOpen(true); }}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit Expense
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setViewingExpense(row.original); setIsViewReceiptOpen(true); }}>
                                <Receipt className="mr-2 h-4 w-4" /> View Receipt
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ], []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Financial Management</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Track expenses, budgets, and monitor financial health.</p>
                </div>
            </div>

            <Tabs defaultValue="expenses" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-md">
                    <TabsTrigger value="expenses">Expenses</TabsTrigger>
                    <TabsTrigger value="budget">Budget</TabsTrigger>
                    <TabsTrigger value="analysis">Analysis</TabsTrigger>
                </TabsList>

                <TabsContent value="expenses">
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 flex-1">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
                                        <Wallet className="h-4 w-4 text-zinc-500" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">₱{totalExpenses.toFixed(2)}</div>
                                        <p className="text-xs text-zinc-500 mt-1">Total for {new Date().toLocaleString('default', { month: 'long' })}</p>
                                    </CardContent>
                                </Card>
                            </div>
                            <Button onClick={() => setIsAddOpen(true)} className="ml-4">
                                <Plus className="h-4 w-4 mr-2" /> Record Expense
                            </Button>
                        </div>

            {/* View Receipt Modal */}
            <Dialog open={isViewReceiptOpen} onOpenChange={setIsViewReceiptOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Receipt className="h-4 w-4" /> Expense Receipt</DialogTitle>
                        <DialogDescription>Record of the selected expense entry.</DialogDescription>
                    </DialogHeader>
                    {viewingExpense && (
                        <div className="space-y-3 py-4 text-sm">
                            <div className="flex justify-between"><span className="text-zinc-500">Date</span><span>{new Date(viewingExpense.expenseDate).toLocaleDateString()}</span></div>
                            <div className="flex justify-between"><span className="text-zinc-500">Category</span><span className="font-medium">{viewingExpense.expenseCategory}</span></div>
                            <div className="flex justify-between"><span className="text-zinc-500">Description</span><span className="text-right max-w-[180px]">{viewingExpense.description}</span></div>
                            <div className="border-t pt-3 flex justify-between font-bold"><span>Amount</span><span className="text-emerald-600">₱{parseFloat(String(viewingExpense.amount)).toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="text-zinc-500">Status</span><span>{viewingExpense.status}</span></div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsViewReceiptOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Record New Expense</DialogTitle>
                        <DialogDescription>Add a new expense entry to the ledger.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateExpense} className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label>Category</Label>
                            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={newExpense.expenseCategory} onChange={e => setNewExpense({ ...newExpense, expenseCategory: e.target.value })}>
                                <option value="">Select Category</option>
                                <option value="Utilities">Utilities</option>
                                <option value="Rent">Rent</option>
                                <option value="Payroll">Payroll</option>
                                <option value="Inventory">Inventory</option>
                                <option value="Office Supplies">Office Supplies</option>
                                <option value="Maintenance">Maintenance</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Description</Label>
                            <Input required value={newExpense.description} onChange={e => setNewExpense({ ...newExpense, description: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Amount</Label>
                                <Input type="number" step="0.01" required value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) })} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Date</Label>
                                <Input type="date" required value={newExpense.expenseDate} onChange={e => setNewExpense({ ...newExpense, expenseDate: e.target.value })} />
                            </div>
                        </div>
                        <DialogFooter>
                            {addFeedback && (
                                <Alert variant={addFeedback.type === 'success' ? 'success' : 'destructive'} className="mr-auto py-2">
                                    {addFeedback.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                    <AlertDescription>{addFeedback.message}</AlertDescription>
                                </Alert>
                            )}
                            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                            <Button type="submit">Complete Record</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Expense</DialogTitle>
                        <DialogDescription>Update the expense record.</DialogDescription>
                    </DialogHeader>
                    {editingExpense && (
                        <form onSubmit={handleUpdateExpense} className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label>Category</Label>
                                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={editingExpense.expenseCategory} onChange={e => setEditingExpense({ ...editingExpense, expenseCategory: e.target.value })}>
                                    <option value="Utilities">Utilities</option>
                                    <option value="Rent">Rent</option>
                                    <option value="Payroll">Payroll</option>
                                    <option value="Inventory">Inventory</option>
                                    <option value="Office Supplies">Office Supplies</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Description</Label>
                                <Input required value={editingExpense.description} onChange={e => setEditingExpense({ ...editingExpense, description: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Amount</Label>
                                    <Input type="number" step="0.01" required value={editingExpense.amount} onChange={e => setEditingExpense({ ...editingExpense, amount: parseFloat(e.target.value) })} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Date</Label>
                                    <Input type="date" required value={editingExpense.expenseDate?.split('T')[0]} onChange={e => setEditingExpense({ ...editingExpense, expenseDate: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Status</Label>
                                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={editingExpense.status} onChange={e => setEditingExpense({ ...editingExpense, status: e.target.value })}>
                                    <option value="Paid">Paid</option>
                                    <option value="Pending">Pending</option>
                                </select>
                            </div>
                            <DialogFooter>
                                {editFeedback && (
                                    <Alert variant={editFeedback.type === 'success' ? 'success' : 'destructive'} className="mr-auto py-2">
                                        {editFeedback.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                        <AlertDescription>{editFeedback.message}</AlertDescription>
                                    </Alert>
                                )}
                                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                                <Button type="submit">Save Changes</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            <div className="relative">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-zinc-950/50 z-10 rounded-md">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}
                <DataTable columns={columns} data={expenses} />
            </div>
                    </div>
                </TabsContent>

                <TabsContent value="budget">
                    <BudgetTab />
                </TabsContent>

                <TabsContent value="analysis">
                    <AnalysisTab />
                </TabsContent>
            </Tabs>
        </div>
    );
};

// --- Budget Tab ---
const EXPENSE_CATEGORIES = ['Utilities', 'Rent', 'Payroll', 'Inventory', 'Office Supplies', 'Maintenance', 'Marketing', 'Other'];

const BudgetTab = () => {
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [bva, setBva] = useState<BudgetSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [newBudget, setNewBudget] = useState<CreateBudget>({ category: '', allocatedAmount: 0, month, year });

    const load = async () => {
        setLoading(true);
        try {
            const [budgetsRes, bvaRes] = await Promise.all([
                financeService.getBudgets(month, year),
                financeService.getBudgetVsActual(month, year),
            ]);
            if (budgetsRes.success && budgetsRes.data) setBudgets(budgetsRes.data);
            if (bvaRes.success && bvaRes.data) setBva(bvaRes.data);
        } catch (e) { console.error('Budget load error:', e); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [month, year]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setFeedback(null);
        try {
            const res = await financeService.createBudget({ ...newBudget, month, year });
            if (res.success) {
                setFeedback({ type: 'success', message: 'Budget created.' });
                setTimeout(() => { setIsAddOpen(false); setFeedback(null); setNewBudget({ category: '', allocatedAmount: 0, month, year }); load(); }, 600);
            } else {
                setFeedback({ type: 'error', message: res.message || 'Failed to create budget.' });
            }
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Failed to create budget.';
            setFeedback({ type: 'error', message: msg });
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBudget) return;
        setFeedback(null);
        try {
            const res = await financeService.updateBudget(editingBudget.id, {
                category: editingBudget.category,
                allocatedAmount: editingBudget.allocatedAmount,
                month: editingBudget.month,
                year: editingBudget.year,
                notes: editingBudget.notes,
            });
            if (res.success) {
                setFeedback({ type: 'success', message: 'Budget updated.' });
                setTimeout(() => { setIsEditOpen(false); setFeedback(null); load(); }, 600);
            } else {
                setFeedback({ type: 'error', message: res.message || 'Failed to update.' });
            }
        } catch (err: any) {
            setFeedback({ type: 'error', message: err?.response?.data?.message || 'Failed to update budget.' });
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this budget allocation?')) return;
        try {
            await financeService.deleteBudget(id);
            load();
        } catch (e) { console.error('Delete error:', e); }
    };

    const fmt = (v: number) => `₱${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end gap-4">
                <div className="grid gap-1.5">
                    <Label className="text-xs">Month</Label>
                    <select className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                        value={month} onChange={e => setMonth(Number(e.target.value))}>
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>{new Date(2026, i).toLocaleString('default', { month: 'long' })}</option>
                        ))}
                    </select>
                </div>
                <div className="grid gap-1.5">
                    <Label className="text-xs">Year</Label>
                    <Input type="number" className="w-24 h-9" value={year} onChange={e => setYear(Number(e.target.value))} />
                </div>
                <Button onClick={() => { setNewBudget({ category: '', allocatedAmount: 0, month, year }); setIsAddOpen(true); }} size="sm">
                    <Plus className="h-4 w-4 mr-1" /> Add Budget
                </Button>
            </div>

            {bva && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Allocated</CardTitle>
                            <Target className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{fmt(bva.totalAllocated)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Actual Spend</CardTitle>
                            <DollarSign className="h-4 w-4 text-zinc-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{fmt(bva.totalActual)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Variance</CardTitle>
                            {bva.totalVariance >= 0 ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${bva.totalVariance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{fmt(bva.totalVariance)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Over Budget</CardTitle>
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${bva.overBudgetCount > 0 ? 'text-red-600' : ''}`}>{bva.overBudgetCount}</div>
                            <p className="text-xs text-muted-foreground mt-1">{bva.underBudgetCount} under budget</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {bva && bva.items.length > 0 && (
                <Card>
                    <CardHeader><CardTitle>Budget vs Actual</CardTitle></CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="py-2 pr-4 font-medium text-muted-foreground">Category</th>
                                        <th className="py-2 pr-4 font-medium text-muted-foreground text-right">Allocated</th>
                                        <th className="py-2 pr-4 font-medium text-muted-foreground text-right">Actual</th>
                                        <th className="py-2 pr-4 font-medium text-muted-foreground text-right">Variance</th>
                                        <th className="py-2 font-medium text-muted-foreground">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bva.items.map((item, i) => (
                                        <tr key={i} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                            <td className="py-2.5 pr-4 font-medium">{item.category}</td>
                                            <td className="py-2.5 pr-4 text-right font-mono">{fmt(item.allocatedAmount)}</td>
                                            <td className="py-2.5 pr-4 text-right font-mono">{fmt(item.actualAmount)}</td>
                                            <td className={`py-2.5 pr-4 text-right font-mono ${item.varianceAmount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {fmt(item.varianceAmount)} ({item.variancePercent.toFixed(0)}%)
                                            </td>
                                            <td className="py-2.5">
                                                <StatusDot variant={item.status === 'Over Budget' ? 'error' : item.status === 'On Track' ? 'warning' : 'success'}>
                                                    {item.status}
                                                </StatusDot>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {loading && (
                <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            )}

            {!loading && budgets.length > 0 && (
                <Card>
                    <CardHeader><CardTitle>Budget Allocations</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {budgets.map(b => (
                                <div key={b.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div>
                                        <p className="font-medium">{b.category}</p>
                                        <p className="text-xs text-muted-foreground">{b.notes || 'No notes'}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono font-bold">{fmt(b.allocatedAmount)}</span>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingBudget(b); setIsEditOpen(true); }}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => handleDelete(b.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {!loading && budgets.length === 0 && (
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        <p>No budgets set for {new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}.</p>
                        <p className="text-sm mt-1">Click "Add Budget" to get started.</p>
                    </CardContent>
                </Card>
            )}

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Budget Allocation</DialogTitle>
                        <DialogDescription>Set a budget for a specific category.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label>Category</Label>
                            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={newBudget.category} onChange={e => setNewBudget({ ...newBudget, category: e.target.value })} required>
                                <option value="">Select Category</option>
                                {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Allocated Amount</Label>
                            <Input type="number" step="0.01" required value={newBudget.allocatedAmount || ''} onChange={e => setNewBudget({ ...newBudget, allocatedAmount: parseFloat(e.target.value) || 0 })} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Notes</Label>
                            <Input value={newBudget.notes || ''} onChange={e => setNewBudget({ ...newBudget, notes: e.target.value })} placeholder="Optional notes" />
                        </div>
                        <DialogFooter>
                            {feedback && (
                                <Alert variant={feedback.type === 'success' ? 'success' : 'destructive'} className="mr-auto py-2">
                                    {feedback.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                    <AlertDescription>{feedback.message}</AlertDescription>
                                </Alert>
                            )}
                            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                            <Button type="submit">Create</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Budget</DialogTitle>
                        <DialogDescription>Update the budget allocation.</DialogDescription>
                    </DialogHeader>
                    {editingBudget && (
                        <form onSubmit={handleUpdate} className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label>Category</Label>
                                <Input value={editingBudget.category} disabled className="bg-muted" />
                            </div>
                            <div className="grid gap-2">
                                <Label>Allocated Amount</Label>
                                <Input type="number" step="0.01" required value={editingBudget.allocatedAmount}
                                    onChange={e => setEditingBudget({ ...editingBudget, allocatedAmount: parseFloat(e.target.value) || 0 })} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Notes</Label>
                                <Input value={editingBudget.notes || ''} onChange={e => setEditingBudget({ ...editingBudget, notes: e.target.value })} />
                            </div>
                            <DialogFooter>
                                {feedback && (
                                    <Alert variant={feedback.type === 'success' ? 'success' : 'destructive'} className="mr-auto py-2">
                                        {feedback.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                        <AlertDescription>{feedback.message}</AlertDescription>
                                    </Alert>
                                )}
                                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                                <Button type="submit">Save Changes</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

// --- Analysis Tab (Expense Summary by Category) ---
const AnalysisTab = () => {
    const [summary, setSummary] = useState<ExpenseSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await financeService.getExpenseSummary();
                if (res.success && res.data) setSummary(res.data);
            } catch (e) { console.error('Expense summary error:', e); }
            finally { setLoading(false); }
        })();
    }, []);

    if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

    const fmt = (v: number) => `₱${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const total = summary.reduce((s, x) => s + x.totalAmount, 0);

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                        <DollarSign className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{fmt(total)}</div>
                        <p className="text-xs text-muted-foreground mt-1">All time</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Categories</CardTitle>
                        <Wallet className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">With expenses</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                        <Receipt className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.reduce((s, x) => s + x.count, 0)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Expense entries</p>
                    </CardContent>
                </Card>
            </div>

            {summary.length > 0 ? (
                <Card>
                    <CardHeader><CardTitle>Expenses by Category</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {summary.map((item, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">{item.category}</span>
                                        <span className="text-sm font-mono">{fmt(item.totalAmount)} ({item.percentageOfTotal.toFixed(1)}%)</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${item.percentageOfTotal}%` }} />
                                    </div>
                                    <p className="text-xs text-muted-foreground">{item.count} record{item.count !== 1 ? 's' : ''}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">No expense data to analyze.</CardContent>
                </Card>
            )}
        </div>
    );
};

export default Finance;