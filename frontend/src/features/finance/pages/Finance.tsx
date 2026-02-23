import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { DataTable } from '../../../components/ui/data-table';
import { StatusDot } from '../../../components/ui/StatusDot';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Wallet, TrendingUp, Receipt, MoreHorizontal, ArrowUpDown, Loader2, Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/Dialog';
import { Label } from '../../../components/ui/Label';
import { financeService, Expense as ApiExpense } from '../services/financeService';

const Finance = () => {
    const [expenses, setExpenses] = useState<ApiExpense[]>([]);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<ApiExpense | null>(null);
    const [editSuccess, setEditSuccess] = useState(false);
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
        try {
            const response = await financeService.createExpense(newExpense);
            if (response.success) {
                alert("Expense recorded successfully");
                setIsAddOpen(false);
                setNewExpense({
                    expenseCategory: '',
                    description: '',
                    amount: 0,
                    expenseDate: new Date().toISOString().split('T')[0],
                    status: 'Paid'
                });
                loadData();
            }
        } catch (error) {
            alert("Failed to record expense");
        }
    };

    const handleUpdateExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingExpense) return;
        try {
            const response = await financeService.updateExpense(editingExpense.id, editingExpense);
            if (response.success) {
                setEditSuccess(true);
                setTimeout(() => {
                    setIsEditOpen(false);
                    setEditSuccess(false);
                    loadData();
                }, 800);
            } else {
                alert(response.message || 'Failed to update expense');
            }
        } catch (error) {
            alert("Failed to update expense");
        }
    };

    const columns: ColumnDef<ApiExpense>[] = [
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
            header: "Amount",
            cell: ({ row }) => <span className="font-mono font-bold">${parseFloat(row.getValue("amount")).toFixed(2)}</span>
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
            cell: ({ row }) => (
                <div className="flex justify-end">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => { setEditingExpense(row.original); setIsEditOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Financial Management</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Track expenses and monitor financial health.</p>
                </div>
                <Button onClick={() => setIsAddOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Record Expense
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
                        <Wallet className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
                        <p className="text-xs text-zinc-500 mt-1">Total for {new Date().toLocaleString('default', { month: 'long' })}</p>
                    </CardContent>
                </Card>
            </div>

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
                                {editSuccess ? (
                                    <p className="text-sm text-green-600 font-medium mr-auto">✓ Expense updated successfully</p>
                                ) : null}
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
    );
};

export default Finance;