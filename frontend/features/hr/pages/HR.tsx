import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/Tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/Dialog';
import { Label } from '../../../components/ui/Label';
import { Select } from '../../../components/ui/Select';
import { Pagination } from '../../../components/ui/Pagination';
import { Avatar, AvatarFallback } from '../../../components/ui/Avatar';
import { MOCK_EMPLOYEES, MOCK_PAYROLL, MOCK_ATTENDANCE } from '../../../lib/mockData';
import { Users, Banknote, Clock, Plus, MoreHorizontal, FileText, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Employee, PayrollRecord, Attendance } from '../../../types';

const ITEMS_PER_PAGE = 10;

const EmployeesTab = () => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof Employee; direction: 'asc' | 'desc' } | null>(null);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (key: keyof Employee) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedEmployees = useMemo(() => {
    let data = [...MOCK_EMPLOYEES];
    if (sortConfig) {
      data.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [sortConfig]);

  const totalPages = Math.ceil(sortedEmployees.length / ITEMS_PER_PAGE);
  const paginatedEmployees = sortedEmployees.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const SortIcon = ({ column }: { column: keyof Employee }) => {
    if (sortConfig?.key !== column) return <ArrowUpDown className="ml-2 h-4 w-4 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4 text-zinc-900 dark:text-zinc-50" />
      : <ArrowDown className="ml-2 h-4 w-4 text-zinc-900 dark:text-zinc-50" />;
  };

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
            <Plus className="h-4 w-4 mr-2"/> Add Employee
        </Button>
        </div>
        <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[100px] cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => handleSort('EmployeeID')}>
                    <div className="flex items-center">ID <SortIcon column="EmployeeID" /></div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => handleSort('FirstName')}>
                    <div className="flex items-center">Name <SortIcon column="FirstName" /></div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => handleSort('Position')}>
                    <div className="flex items-center">Position <SortIcon column="Position" /></div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => handleSort('Department')}>
                    <div className="flex items-center">Department <SortIcon column="Department" /></div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => handleSort('EmploymentStatus')}>
                    <div className="flex items-center">Status <SortIcon column="EmploymentStatus" /></div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {paginatedEmployees.map((emp) => (
                <TableRow key={emp.EmployeeID} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <TableCell className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{emp.EmployeeID}</TableCell>
                    <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">
                        <div className="flex items-center gap-2">
                             <Avatar className="h-8 w-8">
                                <AvatarFallback>{emp.FirstName[0]}{emp.LastName[0]}</AvatarFallback>
                             </Avatar>
                             {emp.FirstName} {emp.LastName}
                        </div>
                    </TableCell>
                    <TableCell className="text-zinc-700 dark:text-zinc-300">{emp.Position}</TableCell>
                    <TableCell className="text-zinc-700 dark:text-zinc-300">{emp.Department}</TableCell>
                    <TableCell><Badge variant="neutral">{emp.EmploymentStatus}</Badge></TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"><MoreHorizontal className="h-4 w-4"/></Button>
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

const PayrollTab = () => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof PayrollRecord; direction: 'asc' | 'desc' } | null>(null);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (key: keyof PayrollRecord) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedPayroll = useMemo(() => {
    let data = [...MOCK_PAYROLL];
    if (sortConfig) {
      data.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [sortConfig]);

  const totalPages = Math.ceil(sortedPayroll.length / ITEMS_PER_PAGE);
  const paginatedPayroll = sortedPayroll.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const SortIcon = ({ column }: { column: keyof PayrollRecord }) => {
    if (sortConfig?.key !== column) return <ArrowUpDown className="ml-2 h-4 w-4 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4 text-zinc-900 dark:text-zinc-50" />
      : <ArrowDown className="ml-2 h-4 w-4 text-zinc-900 dark:text-zinc-50" />;
  };

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
            <Banknote className="h-4 w-4 mr-2"/> Run Payroll
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
        <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => handleSort('PayrollID')}>
                    <div className="flex items-center">Payroll ID <SortIcon column="PayrollID" /></div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => handleSort('EmployeeName')}>
                    <div className="flex items-center">Employee <SortIcon column="EmployeeName" /></div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => handleSort('BasicSalary')}>
                    <div className="flex items-center">Basic Salary <SortIcon column="BasicSalary" /></div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => handleSort('TotalDeductions')}>
                    <div className="flex items-center">Deductions <SortIcon column="TotalDeductions" /></div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => handleSort('NetPay')}>
                    <div className="flex items-center">Net Pay <SortIcon column="NetPay" /></div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => handleSort('Status')}>
                    <div className="flex items-center">Status <SortIcon column="Status" /></div>
                </TableHead>
                <TableHead className="text-right">Payslip</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {paginatedPayroll.map((pay) => (
                <TableRow key={pay.PayrollID} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <TableCell className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{pay.PayrollID}</TableCell>
                    <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">{pay.EmployeeName}</TableCell>
                    <TableCell className="text-zinc-900 dark:text-zinc-100">${pay.BasicSalary.toFixed(2)}</TableCell>
                    <TableCell className="text-red-600 dark:text-red-400">-${pay.TotalDeductions.toFixed(2)}</TableCell>
                    <TableCell className="font-bold text-emerald-700 dark:text-emerald-400">${pay.NetPay.toFixed(2)}</TableCell>
                    <TableCell>
                        <Badge variant={pay.Status === 'Paid' ? 'success' : 'warning'}>{pay.Status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                    <Button variant="outline" size="icon" className="h-8 w-8"><FileText className="h-4 w-4"/></Button>
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

const AttendanceTab = () => {
    const [sortConfig, setSortConfig] = useState<{ key: keyof Attendance; direction: 'asc' | 'desc' } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const handleSort = (key: keyof Attendance) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
        direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedAttendance = useMemo(() => {
        let data = [...MOCK_ATTENDANCE];
        if (sortConfig) {
        data.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
            if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        }
        return data;
    }, [sortConfig]);

    const totalPages = Math.ceil(sortedAttendance.length / ITEMS_PER_PAGE);
    const paginatedAttendance = sortedAttendance.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const SortIcon = ({ column }: { column: keyof Attendance }) => {
        if (sortConfig?.key !== column) return <ArrowUpDown className="ml-2 h-4 w-4 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />;
        return sortConfig.direction === 'asc' 
        ? <ArrowUp className="ml-2 h-4 w-4 text-zinc-900 dark:text-zinc-50" />
        : <ArrowDown className="ml-2 h-4 w-4 text-zinc-900 dark:text-zinc-50" />;
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium tracking-tight text-zinc-900 dark:text-zinc-50">Daily Attendance Log</h3>
                <div className="text-sm text-zinc-500 bg-white dark:bg-zinc-900 border dark:border-zinc-800 px-3 py-1 rounded">Date: Today</div>
            </div>
            <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => handleSort('EmployeeName')}>
                        <div className="flex items-center">Employee <SortIcon column="EmployeeName" /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => handleSort('Date')}>
                        <div className="flex items-center">Date <SortIcon column="Date" /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => handleSort('TimeIn')}>
                        <div className="flex items-center">Time In <SortIcon column="TimeIn" /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => handleSort('TimeOut')}>
                        <div className="flex items-center">Time Out <SortIcon column="TimeOut" /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => handleSort('Status')}>
                        <div className="flex items-center">Status <SortIcon column="Status" /></div>
                    </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedAttendance.map((att) => (
                    <TableRow key={att.AttendanceID} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                        <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">{att.EmployeeName}</TableCell>
                        <TableCell className="text-zinc-700 dark:text-zinc-300">{att.Date}</TableCell>
                        <TableCell className="text-emerald-600 dark:text-emerald-400">{att.TimeIn}</TableCell>
                        <TableCell className="text-zinc-500 dark:text-zinc-400">{att.TimeOut}</TableCell>
                        <TableCell>
                            <Badge variant={att.Status === 'Present' ? 'success' : att.Status === 'Late' ? 'warning' : 'neutral'}>
                                {att.Status}
                            </Badge>
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

export const HR: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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