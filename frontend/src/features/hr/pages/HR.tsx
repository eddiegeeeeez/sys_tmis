import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { StatusDot } from '../../../components/ui/StatusDot';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/Tabs';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../../../components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/Dialog';
import { Label } from '../../../components/ui/Label';
import { Select } from '../../../components/ui/Select';
import { Avatar, AvatarFallback } from '../../../components/ui/Avatar';
import { MOCK_EMPLOYEES, MOCK_PAYROLL, MOCK_ATTENDANCE } from '../../../lib/mockData';
import { Users, Banknote, Clock, Plus, MoreHorizontal, FileText, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Employee, PayrollRecord, Attendance } from '../../../types';

const ITEMS_PER_PAGE = 10;

const EmployeesTab = () => {
    const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);

    const columns: ColumnDef<Employee>[] = [
        {
            accessorKey: "EmployeeID",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    ID <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{row.getValue("EmployeeID")}</span>
        },
        {
            accessorKey: "FirstName",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Name <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const emp = row.original;
                return (
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>{emp.FirstName[0]}{emp.LastName[0]}</AvatarFallback>
                        </Avatar>
                        <span>{emp.FirstName} {emp.LastName}</span>
                    </div>
                );
            }
        },
        {
            accessorKey: "Position",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Position <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="text-zinc-700 dark:text-zinc-300">{row.getValue("Position")}</span>
        },
        {
            accessorKey: "Department",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Department <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="text-zinc-700 dark:text-zinc-300">{row.getValue("Department")}</span>
        },
        {
            accessorKey: "EmploymentStatus",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Status <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <StatusDot variant="neutral">{row.getValue("EmploymentStatus")}</StatusDot>
        },
        {
            id: "actions",
            header: () => <div className="text-right text-xs font-semibold pr-2">Actions</div>,
            cell: () => (
                <div className="flex justify-end">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    const handleSaveEmployee = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Saving Employee");
        setIsAddEmployeeOpen(false);
    }

    return (
        <div className="space-y-4">
            {/* Add Employee Modal */}
            <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Add New Employee</DialogTitle>
                        <DialogDescription>Create a new employee record in the system.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveEmployee} className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>First Name</Label>
                                <Input required />
                            </div>
                            <div className="grid gap-2">
                                <Label>Last Name</Label>
                                <Input required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Email</Label>
                                <Input type="email" required />
                            </div>
                            <div className="grid gap-2">
                                <Label>Phone Number</Label>
                                <Input />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Department</Label>
                                <Select>
                                    <option>Operations</option>
                                    <option>Sales</option>
                                    <option>Warehouse</option>
                                    <option>HR</option>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Position</Label>
                                <Input placeholder="e.g. Cashier" />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <Label>Employment</Label>
                                <Select>
                                    <option>Full-time</option>
                                    <option>Part-time</option>
                                    <option>Contract</option>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Basic Salary</Label>
                                <Input type="number" placeholder="0.00" />
                            </div>
                            <div className="grid gap-2">
                                <Label>Hire Date</Label>
                                <Input type="date" />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsAddEmployeeOpen(false)}>Cancel</Button>
                            <Button type="submit">Create Record</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium tracking-tight text-zinc-900 dark:text-zinc-50">Employee Directory</h3>
                <Button size="sm" onClick={() => setIsAddEmployeeOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Add Employee
                </Button>
            </div>
            <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                <DataTable columns={columns} data={MOCK_EMPLOYEES} />
            </div>
        </div>
    );
};

const PayrollTab = () => {
    const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);

    const columns: ColumnDef<PayrollRecord>[] = [
        {
            accessorKey: "PayrollID",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Payroll ID <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{row.getValue("PayrollID")}</span>
        },
        {
            accessorKey: "EmployeeName",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Employee <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="font-medium text-zinc-900 dark:text-zinc-100">{row.getValue("EmployeeName")}</span>
        },
        {
            accessorKey: "BasicSalary",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Basic Salary <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="text-zinc-900 dark:text-zinc-100">${(row.getValue("BasicSalary") as number).toFixed(2)}</span>
        },
        {
            accessorKey: "TotalDeductions",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Deductions <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="text-red-600 dark:text-red-400">-${(row.getValue("TotalDeductions") as number).toFixed(2)}</span>
        },
        {
            accessorKey: "NetPay",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Net Pay <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="font-bold text-emerald-700 dark:text-emerald-400">${(row.getValue("NetPay") as number).toFixed(2)}</span>
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
                return <StatusDot variant={status === 'Paid' ? 'success' : 'warning'}>{status}</StatusDot>;
            }
        },
        {
            id: "actions",
            header: () => <div className="text-right text-xs font-semibold pr-2">Payslip</div>,
            cell: () => (
                <div className="flex justify-end">
                    <Button variant="outline" size="icon" className="h-8 w-8"><FileText className="h-4 w-4" /></Button>
                </div>
            )
        }
    ];

    const handleRunPayroll = () => {
        console.log("Running Payroll");
        setIsPayrollModalOpen(false);
    }

    return (
        <div className="space-y-4">
            {/* Run Payroll Modal */}
            <Dialog open={isPayrollModalOpen} onOpenChange={setIsPayrollModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Run Payroll Processing</DialogTitle>
                        <DialogDescription>Calculate deductions, allowances, and net pay for the selected period.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Pay Period Start</Label>
                            <Input type="date" />
                        </div>
                        <div className="grid gap-2">
                            <Label>Pay Period End</Label>
                            <Input type="date" />
                        </div>
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded text-sm text-zinc-600 dark:text-zinc-400">
                            <p>This will generate payroll records for all active full-time and contract employees. Drafts will be created for review.</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPayrollModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleRunPayroll}>Generate Payroll</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium tracking-tight text-zinc-900 dark:text-zinc-50">Payroll Processing</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Period: Oct 1 - Oct 15, 2023</p>
                </div>
                <Button size="sm" onClick={() => setIsPayrollModalOpen(true)}>
                    <Banknote className="h-4 w-4 mr-2" /> Run Payroll
                </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Payout</CardTitle>
                        <Banknote className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">$3,200.00</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Pending Approvals</CardTitle>
                        <Clock className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600 dark:text-amber-500">1</div>
                    </CardContent>
                </Card>
            </div>
            <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                <DataTable columns={columns} data={MOCK_PAYROLL} />
            </div>
        </div>
    );
};

const AttendanceTab = () => {
    const columns: ColumnDef<Attendance>[] = [
        {
            accessorKey: "EmployeeName",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Employee <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="font-medium text-zinc-900 dark:text-zinc-100">{row.getValue("EmployeeName")}</span>
        },
        {
            accessorKey: "Date",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Date <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="text-zinc-700 dark:text-zinc-300">{row.getValue("Date")}</span>
        },
        {
            accessorKey: "TimeIn",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Time In <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="text-emerald-600 dark:text-emerald-400">{row.getValue("TimeIn")}</span>
        },
        {
            accessorKey: "TimeOut",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Time Out <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="text-zinc-500 dark:text-zinc-400">{row.getValue("TimeOut")}</span>
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
                return <StatusDot variant={status === 'Present' ? 'success' : status === 'Late' ? 'warning' : 'neutral'}>{status}</StatusDot>;
            }
        }
    ];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium tracking-tight text-zinc-900 dark:text-zinc-50">Daily Attendance Log</h3>
                <div className="text-sm text-zinc-500 bg-white dark:bg-zinc-900 border dark:border-zinc-800 px-3 py-1 rounded">Date: Today</div>
            </div>
            <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                <DataTable columns={columns} data={MOCK_ATTENDANCE} />
            </div>
        </div>
    );
};

export const HR: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">HR & Payroll</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage workforce, compensation, and time tracking.</p>
                </div>
            </div>

            <Tabs defaultValue="employees" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="employees">Employees</TabsTrigger>
                    <TabsTrigger value="payroll">Payroll</TabsTrigger>
                    <TabsTrigger value="attendance">Attendance</TabsTrigger>
                </TabsList>
                <TabsContent value="employees">
                    <EmployeesTab />
                </TabsContent>
                <TabsContent value="payroll">
                    <PayrollTab />
                </TabsContent>
                <TabsContent value="attendance">
                    <AttendanceTab />
                </TabsContent>
            </Tabs>
        </div>
    );
};