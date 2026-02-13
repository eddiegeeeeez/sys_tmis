import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/Dialog';
import { Label } from '../../../components/ui/Label';
import { Select } from '../../../components/ui/Select';
import { Pagination } from '../../../components/ui/Pagination';
import { MOCK_EXPENSES } from '../../../lib/mockData';
import { Wallet, Plus, Receipt, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Expense } from '../../../types';

const ITEMS_PER_PAGE = 10;

export const Finance: React.FC = () => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof Expense; direction: 'asc' | 'desc' } | null>(null);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (key: keyof Expense) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedExpenses = useMemo(() => {
    let data = [...MOCK_EXPENSES];
    if (sortConfig) {
      data.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [sortConfig]);

  const totalPages = Math.ceil(sortedExpenses.length / ITEMS_PER_PAGE);
  const paginatedExpenses = sortedExpenses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const SortIcon = ({ column }: { column: keyof Expense }) => {
    if (sortConfig?.key !== column) return <ArrowUpDown className="ml-2 h-4 w-4 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4 text-zinc-900 dark:text-zinc-50" />
      : <ArrowDown className="ml-2 h-4 w-4 text-zinc-900 dark:text-zinc-50" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
            <Plus className="mr-2 h-4 w-4"/> Record Expense
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

      <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => handleSort('ExpenseDate')}>
                        <div className="flex items-center">Date <SortIcon column="ExpenseDate" /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => handleSort('ExpenseCategory')}>
                        <div className="flex items-center">Category <SortIcon column="ExpenseCategory" /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => handleSort('Description')}>
                        <div className="flex items-center">Description <SortIcon column="Description" /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => handleSort('Amount')}>
                        <div className="flex items-center">Amount <SortIcon column="Amount" /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => handleSort('Status')}>
                        <div className="flex items-center">Status <SortIcon column="Status" /></div>
                    </TableHead>
                    <TableHead className="text-right">Receipt</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {paginatedExpenses.map(exp => (
                    <TableRow key={exp.ExpenseID} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                        <TableCell className="text-zinc-500 dark:text-zinc-400">{exp.ExpenseDate}</TableCell>
                        <TableCell>
                            <Badge variant="outline" className="bg-zinc-100 dark:bg-zinc-800 font-normal">
                                {exp.ExpenseCategory}
                            </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">{exp.Description}</TableCell>
                        <TableCell className="font-bold text-zinc-900 dark:text-zinc-100">${exp.Amount.toFixed(2)}</TableCell>
                        <TableCell>
                            <Badge variant={exp.Status === 'Paid' ? 'success' : 'neutral'}>{exp.Status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8"><Receipt className="h-4 w-4"/></Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
        <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
        />
      </div>
    </div>
  );
};