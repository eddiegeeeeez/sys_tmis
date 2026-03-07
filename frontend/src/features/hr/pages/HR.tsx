import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { DataTable } from '../../../components/ui/data-table';
import { StatusDot } from '../../../components/ui/StatusDot';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/Tabs';
import { ColumnDef } from '@tanstack/react-table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/Dialog';
import { Label } from '../../../components/ui/Label';
import { Select } from '../../../components/ui/Select';
import { Avatar, AvatarFallback } from '../../../components/ui/Avatar';
import { hrService, Employee as ApiEmployee, Attendance as ApiAttendance, PayrollRecord as ApiPayroll } from '../services/hrService';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../components/ui/DropdownMenu';
import { Loader2, Users, Banknote, Clock, Plus, MoreHorizontal, FileText, ArrowUpDown, Pencil } from 'lucide-react';

const EmployeesTab = () => {
    const [employees, setEmployees] = useState<ApiEmployee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
    const [isEditEmployeeOpen, setIsEditEmployeeOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<ApiEmployee | null>(null);
    const [newEmployee, setNewEmployee] = useState<Partial<ApiEmployee>>({
        firstName: '',
        lastName: '',
        email: '',
        department: 'Operations',
        position: '',
        employmentStatus: 'Full-time',
        basicSalary: 0
    });

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = async () => {
        setIsLoading(true);
        try {
            const response = await hrService.getEmployees();
            if (response.success && response.data) {
                setEmployees(response.data);
            }
        } catch (error) {
            console.error("Failed to load employees", error);
        } finally {
            setIsLoading(false);
        }
    };

    const columns = useMemo<ColumnDef<ApiEmployee>[]>(() => [
        {
            accessorKey: "id",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    ID <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{row.getValue("id")}</span>
        },
        {
            accessorKey: "firstName",
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
                            <AvatarFallback>{emp.firstName[0]}{emp.lastName[0]}</AvatarFallback>
                        </Avatar>
                        <span>{emp.firstName} {emp.lastName}</span>
                    </div>
                );
            }
        },
        {
            accessorKey: "position",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Position <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="text-zinc-700 dark:text-zinc-300">{row.getValue("position")}</span>
        },
        {
            accessorKey: "department",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Department <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="text-zinc-700 dark:text-zinc-300">{row.getValue("department")}</span>
        },
        {
            accessorKey: "employmentStatus",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Status <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const status = row.getValue("employmentStatus") as string;
                const variant = status === 'Full-time' ? 'success' : status === 'Part-time' ? 'info' : 'warning';
                return <StatusDot variant={variant}>{status}</StatusDot>;
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
                            <DropdownMenuItem onClick={() => { setEditingEmployee(row.original); setIsEditEmployeeOpen(true); }}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit Employee
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ], []);

    const handleSaveEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await hrService.createEmployee(newEmployee);
            if (response.success) {
                alert("Employee added successfully");
                setIsAddEmployeeOpen(false);
                loadEmployees();
            }
        } catch (error) {
            console.error("Failed to add employee", error);
            alert("Failed to add employee");
        }
    }

    const handleUpdateEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingEmployee) return;
        try {
            const response = await hrService.updateEmployee(editingEmployee.id, editingEmployee);
            if (response.success) {
                setIsEditEmployeeOpen(false);
                loadEmployees();
            }
        } catch (error) {
            console.error("Failed to update employee", error);
            alert("Failed to update employee");
        }
    };

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
                                <Input required value={newEmployee.firstName} onChange={e => setNewEmployee({ ...newEmployee, firstName: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Last Name</Label>
                                <Input required value={newEmployee.lastName} onChange={e => setNewEmployee({ ...newEmployee, lastName: e.target.value })} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Email</Label>
                                <Input type="email" required value={newEmployee.email} onChange={e => setNewEmployee({ ...newEmployee, email: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Phone Number</Label>
                                <Input value={newEmployee.contactNumber} onChange={e => setNewEmployee({ ...newEmployee, contactNumber: e.target.value })} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Department</Label>
                                <Select value={newEmployee.department} onChange={e => setNewEmployee({ ...newEmployee, department: e.target.value })}>
                                    <option value="Operations">Operations</option>
                                    <option value="Sales">Sales</option>
                                    <option value="Warehouse">Warehouse</option>
                                    <option value="HR">HR</option>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Position</Label>
                                <Input placeholder="e.g. Cashier" value={newEmployee.position} onChange={e => setNewEmployee({ ...newEmployee, position: e.target.value })} />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <Label>Employment</Label>
                                <Select value={newEmployee.employmentStatus} onChange={e => setNewEmployee({ ...newEmployee, employmentStatus: e.target.value })}>
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Contract">Contract</option>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Basic Salary</Label>
                                <Input type="number" placeholder="0.00" value={newEmployee.basicSalary} onChange={e => setNewEmployee({ ...newEmployee, basicSalary: parseFloat(e.target.value) })} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Hire Date</Label>
                                <Input type="date" value={newEmployee.hireDate?.split('T')[0]} onChange={e => setNewEmployee({ ...newEmployee, hireDate: e.target.value })} />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsAddEmployeeOpen(false)}>Cancel</Button>
                            <Button type="submit">Create Record</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Employee Modal */}
            <Dialog open={isEditEmployeeOpen} onOpenChange={setIsEditEmployeeOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Edit Employee</DialogTitle>
                        <DialogDescription>Update employee information.</DialogDescription>
                    </DialogHeader>
                    {editingEmployee && (
                        <form onSubmit={handleUpdateEmployee} className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>First Name</Label>
                                    <Input required value={editingEmployee.firstName} onChange={e => setEditingEmployee({ ...editingEmployee, firstName: e.target.value })} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Last Name</Label>
                                    <Input required value={editingEmployee.lastName} onChange={e => setEditingEmployee({ ...editingEmployee, lastName: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Email</Label>
                                    <Input type="email" required value={editingEmployee.email} onChange={e => setEditingEmployee({ ...editingEmployee, email: e.target.value })} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Phone Number</Label>
                                    <Input value={editingEmployee.contactNumber || ''} onChange={e => setEditingEmployee({ ...editingEmployee, contactNumber: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Department</Label>
                                    <Select value={editingEmployee.department} onChange={e => setEditingEmployee({ ...editingEmployee, department: e.target.value })}>
                                        <option value="Operations">Operations</option>
                                        <option value="Sales">Sales</option>
                                        <option value="Warehouse">Warehouse</option>
                                        <option value="HR">HR</option>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Position</Label>
                                    <Input value={editingEmployee.position} onChange={e => setEditingEmployee({ ...editingEmployee, position: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="grid gap-2">
                                    <Label>Employment</Label>
                                    <Select value={editingEmployee.employmentStatus} onChange={e => setEditingEmployee({ ...editingEmployee, employmentStatus: e.target.value })}>
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Contract">Contract</option>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Basic Salary</Label>
                                    <Input type="number" value={editingEmployee.basicSalary} onChange={e => setEditingEmployee({ ...editingEmployee, basicSalary: parseFloat(e.target.value) })} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Hire Date</Label>
                                    <Input type="date" value={editingEmployee.hireDate?.split('T')[0]} onChange={e => setEditingEmployee({ ...editingEmployee, hireDate: e.target.value })} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsEditEmployeeOpen(false)}>Cancel</Button>
                                <Button type="submit">Save Changes</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium tracking-tight text-zinc-900 dark:text-zinc-50">Employee Directory</h3>
                <Button size="sm" onClick={() => setIsAddEmployeeOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Add Employee
                </Button>
            </div>
            <div className="relative">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-zinc-950/50 z-10 rounded-md">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : null}
                <DataTable columns={columns} data={employees} />
            </div>
        </div>
    );
};

const PayrollTab = () => {
    const [payrollRecords, setPayrollRecords] = useState<ApiPayroll[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
    const [isViewPayslipOpen, setIsViewPayslipOpen] = useState(false);
    const [viewingPayroll, setViewingPayroll] = useState<ApiPayroll | null>(null);
    const [payPeriodStart, setPayPeriodStart] = useState('');
    const [payPeriodEnd, setPayPeriodEnd] = useState('');
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        loadPayroll();
    }, []);

    const loadPayroll = async () => {
        setIsLoading(true);
        try {
            const response = await hrService.getPayrollRecords();
            if (response.success && response.data) {
                setPayrollRecords(response.data);
            }
        } catch (error) {
            console.error("Failed to load payroll records", error);
        } finally {
            setIsLoading(false);
        }
    };

    const columns = useMemo<ColumnDef<ApiPayroll>[]>(() => [
        {
            accessorKey: "id",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Payroll ID <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{row.getValue("id")}</span>
        },
        {
            accessorKey: "employeeName",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Employee <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="font-medium text-zinc-900 dark:text-zinc-100">{row.getValue("employeeName")}</span>
        },
        {
            accessorKey: "basicSalary",
            header: ({ column }) => (
                <div className="text-right">
                    <Button variant="ghost" className="hover:bg-transparent text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Basic Salary <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => <div className="text-right font-mono text-zinc-900 dark:text-zinc-100">₱{(row.getValue("basicSalary") as number).toFixed(2)}</div>
        },
        {
            accessorKey: "totalDeductions",
            header: ({ column }) => (
                <div className="text-right">
                    <Button variant="ghost" className="hover:bg-transparent text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Deductions <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => <div className="text-right font-mono text-red-600 dark:text-red-400">-₱{(row.getValue("totalDeductions") as number).toFixed(2)}</div>
        },
        {
            accessorKey: "netPay",
            header: ({ column }) => (
                <div className="text-right">
                    <Button variant="ghost" className="hover:bg-transparent text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Net Pay <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => <div className="text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">₱{(row.getValue("netPay") as number).toFixed(2)}</div>
        },
        {
            accessorKey: "status",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Status <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                return <StatusDot variant={status === 'Paid' ? 'success' : 'warning'}>{status}</StatusDot>;
            }
        },
        {
            id: "actions",
            header: () => <div className="text-right text-xs font-semibold pr-2">Payslip</div>,
            cell: ({ row }) => (
                <div className="flex justify-end">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => { setViewingPayroll(row.original); setIsViewPayslipOpen(true); }}>
                        <FileText className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ], []);

    const handleRunPayroll = async () => {
        if (!payPeriodStart || !payPeriodEnd) return;
        setIsRunning(true);
        try {
            await hrService.runPayroll({ payPeriodStart, payPeriodEnd });
            setIsPayrollModalOpen(false);
            setPayPeriodStart('');
            setPayPeriodEnd('');
            await loadPayroll();
        } catch (error) {
            console.error("Failed to run payroll", error);
        } finally {
            setIsRunning(false);
        }
    };

    const totalPayout = payrollRecords.reduce((sum, r) => sum + r.netPay, 0);
    const pendingCount = payrollRecords.filter(r => r.status === 'Pending').length;

    return (
        <div className="space-y-4">
            {/* View Payslip Modal */}
            <Dialog open={isViewPayslipOpen} onOpenChange={setIsViewPayslipOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Payslip</DialogTitle>
                        <DialogDescription>Payroll record details for the selected employee.</DialogDescription>
                    </DialogHeader>
                    {viewingPayroll && (
                        <div className="space-y-3 py-4 text-sm">
                            <div className="flex justify-between"><span className="text-zinc-500">Payroll ID</span><span className="font-mono">{viewingPayroll.id}</span></div>
                            <div className="flex justify-between"><span className="text-zinc-500">Employee</span><span className="font-medium">{viewingPayroll.employeeName}</span></div>
                            <div className="flex justify-between"><span className="text-zinc-500">Pay Period</span><span>{viewingPayroll.payPeriodStart?.split('T')[0]} – {viewingPayroll.payPeriodEnd?.split('T')[0]}</span></div>
                            <div className="border-t pt-3 flex justify-between"><span className="text-zinc-500">Basic Salary</span><span>₱{viewingPayroll.basicSalary.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="text-zinc-500">Gross Pay</span><span>₱{viewingPayroll.grossPay.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="text-zinc-500">Total Deductions</span><span className="text-red-600">-₱{viewingPayroll.totalDeductions.toFixed(2)}</span></div>
                            <div className="border-t pt-3 flex justify-between font-bold"><span>Net Pay</span><span className="text-emerald-600">₱{viewingPayroll.netPay.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="text-zinc-500">Status</span><span>{viewingPayroll.status}</span></div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { if (viewingPayroll) { window.print(); } }}>Print Payslip</Button>
                        <Button variant="outline" onClick={() => setIsViewPayslipOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
                            <Input type="date" value={payPeriodStart} onChange={e => setPayPeriodStart(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Pay Period End</Label>
                            <Input type="date" value={payPeriodEnd} onChange={e => setPayPeriodEnd(e.target.value)} />
                        </div>
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded text-sm text-zinc-600 dark:text-zinc-400">
                            <p>This will generate payroll records for all active full-time and contract employees. Drafts will be created for review.</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPayrollModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleRunPayroll} disabled={isRunning || !payPeriodStart || !payPeriodEnd}>
                            {isRunning && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Generate Payroll
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium tracking-tight text-zinc-900 dark:text-zinc-50">Payroll Processing</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">All payroll records</p>
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
                        <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">₱{totalPayout.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Pending Approvals</CardTitle>
                        <Clock className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600 dark:text-amber-500">{pendingCount}</div>
                    </CardContent>
                </Card>
            </div>
            <div className="relative">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-zinc-950/50 z-10 rounded-md">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : null}
                <DataTable columns={columns} data={payrollRecords} />
            </div>
        </div>
    );
};

const AttendanceTab = () => {
    const [attendance, setAttendance] = useState<ApiAttendance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        loadAttendance();
    }, [selectedDate]);

    const loadAttendance = async () => {
        setIsLoading(true);
        try {
            const response = await hrService.getAttendance(selectedDate);
            if (response.success && response.data) {
                setAttendance(response.data);
            }
        } catch (error) {
            console.error("Failed to load attendance", error);
        } finally {
            setIsLoading(false);
        }
    };

    const columns = useMemo<ColumnDef<ApiAttendance>[]>(() => [
        {
            accessorKey: "employeeName",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Employee <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="font-medium text-zinc-900 dark:text-zinc-100">{row.getValue("employeeName")}</span>
        },
        {
            accessorKey: "date",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Date <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="text-zinc-700 dark:text-zinc-300">{(row.getValue("date") as string)?.split('T')[0]}</span>
        },
        {
            accessorKey: "timeIn",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Time In <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="text-emerald-600 dark:text-emerald-400">{row.getValue("timeIn") ?? '—'}</span>
        },
        {
            accessorKey: "timeOut",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Time Out <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="text-zinc-500 dark:text-zinc-400">{row.getValue("timeOut") ?? '—'}</span>
        },
        {
            accessorKey: "status",
            header: ({ column }) => (
                <Button variant="ghost" className="hover:bg-transparent -ml-3 text-xs font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Status <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                return <StatusDot variant={status === 'Present' ? 'success' : status === 'Late' ? 'warning' : 'neutral'}>{status}</StatusDot>;
            }
        }
    ], []);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium tracking-tight text-zinc-900 dark:text-zinc-50">Daily Attendance Log</h3>
                <Input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="w-auto"
                />
            </div>
            <div className="relative">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-zinc-950/50 z-10 rounded-md">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : null}
                <DataTable columns={columns} data={attendance} />
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