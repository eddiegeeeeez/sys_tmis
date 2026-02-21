import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { StatusDot } from '../../../components/ui/StatusDot';
import { Input } from '../../../components/ui/Input';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../../../components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/Dialog';
import { Label } from '../../../components/ui/Label';
import { Select } from '../../../components/ui/Select';
import { MOCK_EXPENSES } from '../../../lib/mockData';
import { Wallet, Plus, Receipt, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Expense } from '../../../types';

const ITEMS_PER_PAGE = 10;

export const Finance: React.FC = () => {
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

    const columns: ColumnDef<Expense>[] = [
        {
            accessorKey: "ExpenseDate",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Date <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="text-zinc-500 dark:text-zinc-400">{row.getValue("ExpenseDate")}</span>
        },
        {
            accessorKey: "ExpenseCategory",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Category <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <Badge variant="outline" className="bg-zinc-100 dark:bg-zinc-800 font-normal">{row.getValue("ExpenseCategory")}</Badge>
        },
        {
            accessorKey: "Description",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Description <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="font-medium text-zinc-900 dark:text-zinc-100">{row.getValue("Description")}</span>
        },
        {
            accessorKey: "Amount",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Amount <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="font-bold text-zinc-900 dark:text-zinc-100">${(row.getValue("Amount") as number).toFixed(2)}</span>
        },
        {
            accessorKey: "Status",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Status <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const status = row.getValue("Status") as string;
                return <StatusDot variant={status === 'Paid' ? 'success' : 'neutral'}>{status}</StatusDot>;
            }
        },
        {
            id: "actions",
            header: () => <div className="text-right text-xs font-semibold pr-2">Receipt</div>,
            cell: () => (
                <div className="flex justify-end">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Receipt className="h-4 w-4" /></Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            {/* Record Expense Modal */}
            <Dialog open={isExpenseModalOpen} onOpenChange={setIsExpenseModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Record New Expense</DialogTitle>
                        <DialogDescription>Log operational expenses for financial tracking.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Date</Label>
                                <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Category</Label>
                                <Select>
                                    <option>Utilities</option>
                                    <option>Rent</option>
                                    <option>Office Supplies</option>
                                    <option>Maintenance</option>
                                    <option>Marketing</option>
                                </Select>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Description</Label>
                            <Input placeholder="e.g. October Electricity Bill" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Amount</Label>
                                <Input type="number" placeholder="0.00" />
                            </div>
                            <div className="grid gap-2">
                                <Label>Reference No.</Label>
                                <Input placeholder="Invoice/Receipt #" />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsExpenseModalOpen(false)}>Cancel</Button>
                        <Button onClick={() => setIsExpenseModalOpen(false)}>Save Record</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Finance & Expenses</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Track operational costs and expenses.</p>
                </div>
                <Button onClick={() => setIsExpenseModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Record Expense
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-zinc-900 text-zinc-50 dark:bg-zinc-800 dark:text-zinc-50">
                    <CardContent className="p-6">
                        <p className="text-zinc-400 text-sm font-medium">Total Expenses (Oct)</p>
                        <h3 className="text-3xl font-bold mt-2">$570.00</h3>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                <DataTable columns={columns} data={MOCK_EXPENSES} />
            </div>
        </div>
    );
};