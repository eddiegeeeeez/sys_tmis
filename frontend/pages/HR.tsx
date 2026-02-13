import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Avatar, AvatarFallback } from '../components/ui/Avatar';
import { MOCK_EMPLOYEES, MOCK_PAYROLL, MOCK_ATTENDANCE } from '../lib/mockData';
import { Users, Banknote, Clock, Plus, MoreHorizontal, FileText, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Employee, PayrollRecord, Attendance } from '../types';

const EmployeesTab = () => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof Employee; direction: 'asc' | 'desc' } | null>(null);

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

  const SortIcon = ({ column }: { column: keyof Employee }) => {
    if (sortConfig?.key !== column) return <ArrowUpDown className="ml-2 h-4 w-4 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4 text-zinc-900" />
      : <ArrowDown className="ml-2 h-4 w-4 text-zinc-900" />;
  };

  return (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium tracking-tight">Employee Directory</h3>
        <Button size="sm"><Plus className="h-4 w-4 mr-2"/> Add Employee</Button>
        </div>
        <div className="rounded-md border border-zinc-200">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[100px] cursor-pointer hover:bg-zinc-50" onClick={() => handleSort('EmployeeID')}>
                    <div className="flex items-center">ID <SortIcon column="EmployeeID" /></div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-zinc-50" onClick={() => handleSort('FirstName')}>
                    <div className="flex items-center">Name <SortIcon column="FirstName" /></div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-zinc-50" onClick={() => handleSort('Position')}>
                    <div className="flex items-center">Position <SortIcon column="Position" /></div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-zinc-50" onClick={() => handleSort('Department')}>
                    <div className="flex items-center">Department <SortIcon column="Department" /></div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-zinc-50" onClick={() => handleSort('EmploymentStatus')}>
                    <div className="flex items-center">Status <SortIcon column="EmploymentStatus" /></div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {sortedEmployees.map((emp) => (
                <TableRow key={emp.EmployeeID}>
                    <TableCell className="font-mono text-xs">{emp.EmployeeID}</TableCell>
                    <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                             <Avatar className="h-8 w-8">
                                <AvatarFallback>{emp.FirstName[0]}{emp.LastName[0]}</AvatarFallback>
                             </Avatar>
                             {emp.FirstName} {emp.LastName}
                        </div>
                    </TableCell>
                    <TableCell>{emp.Position}</TableCell>
                    <TableCell>{emp.Department}</TableCell>
                    <TableCell><Badge variant="secondary">{emp.EmploymentStatus}</Badge></TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4"/></Button>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
    </div>
  );
};

const PayrollTab = () => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof PayrollRecord; direction: 'asc' | 'desc' } | null>(null);

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

  const SortIcon = ({ column }: { column: keyof PayrollRecord }) => {
    if (sortConfig?.key !== column) return <ArrowUpDown className="ml-2 h-4 w-4 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4 text-zinc-900" />
      : <ArrowDown className="ml-2 h-4 w-4 text-zinc-900" />;
  };

  return (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
        <div>
            <h3 className="text-lg font-medium tracking-tight">Payroll Processing</h3>
            <p className="text-sm text-zinc-500">Period: Oct 1 - Oct 15, 2023</p>
        </div>
        <Button size="sm"><Banknote className="h-4 w-4 mr-2"/> Run Payroll</Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Payout</CardTitle>
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">$3,200.00</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-amber-600">1</div>
                </CardContent>
            </Card>
        </div>
        <div className="rounded-md border border-zinc-200">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="cursor-pointer hover:bg-zinc-50" onClick={() => handleSort('PayrollID')}>
                    <div className="flex items-center">Payroll ID <SortIcon column="PayrollID" /></div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-zinc-50" onClick={() => handleSort('EmployeeName')}>
                    <div className="flex items-center">Employee <SortIcon column="EmployeeName" /></div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-zinc-50" onClick={() => handleSort('BasicSalary')}>
                    <div className="flex items-center">Basic Salary <SortIcon column="BasicSalary" /></div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-zinc-50" onClick={() => handleSort('TotalDeductions')}>
                    <div className="flex items-center">Deductions <SortIcon column="TotalDeductions" /></div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-zinc-50" onClick={() => handleSort('NetPay')}>
                    <div className="flex items-center">Net Pay <SortIcon column="NetPay" /></div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-zinc-50" onClick={() => handleSort('Status')}>
                    <div className="flex items-center">Status <SortIcon column="Status" /></div>
                </TableHead>
                <TableHead className="text-right">Payslip</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {sortedPayroll.map((pay) => (
                <TableRow key={pay.PayrollID}>
                    <TableCell className="font-mono text-xs">{pay.PayrollID}</TableCell>
                    <TableCell className="font-medium">{pay.EmployeeName}</TableCell>
                    <TableCell>${pay.BasicSalary.toFixed(2)}</TableCell>
                    <TableCell className="text-red-600">-${pay.TotalDeductions.toFixed(2)}</TableCell>
                    <TableCell className="font-bold text-emerald-700">${pay.NetPay.toFixed(2)}</TableCell>
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
        </div>
    </div>
  );
};

const AttendanceTab = () => {
    const [sortConfig, setSortConfig] = useState<{ key: keyof Attendance; direction: 'asc' | 'desc' } | null>(null);

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

    const SortIcon = ({ column }: { column: keyof Attendance }) => {
        if (sortConfig?.key !== column) return <ArrowUpDown className="ml-2 h-4 w-4 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />;
        return sortConfig.direction === 'asc' 
        ? <ArrowUp className="ml-2 h-4 w-4 text-zinc-900" />
        : <ArrowDown className="ml-2 h-4 w-4 text-zinc-900" />;
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium tracking-tight">Daily Attendance Log</h3>
                <div className="text-sm text-zinc-500 bg-white border px-3 py-1 rounded">Date: Today</div>
            </div>
            <div className="rounded-md border border-zinc-200">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="cursor-pointer hover:bg-zinc-50" onClick={() => handleSort('EmployeeName')}>
                        <div className="flex items-center">Employee <SortIcon column="EmployeeName" /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-zinc-50" onClick={() => handleSort('Date')}>
                        <div className="flex items-center">Date <SortIcon column="Date" /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-zinc-50" onClick={() => handleSort('TimeIn')}>
                        <div className="flex items-center">Time In <SortIcon column="TimeIn" /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-zinc-50" onClick={() => handleSort('TimeOut')}>
                        <div className="flex items-center">Time Out <SortIcon column="TimeOut" /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-zinc-50" onClick={() => handleSort('Status')}>
                        <div className="flex items-center">Status <SortIcon column="Status" /></div>
                    </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedAttendance.map((att) => (
                    <TableRow key={att.AttendanceID}>
                        <TableCell className="font-medium">{att.EmployeeName}</TableCell>
                        <TableCell>{att.Date}</TableCell>
                        <TableCell className="text-emerald-600">{att.TimeIn}</TableCell>
                        <TableCell className="text-zinc-500">{att.TimeOut}</TableCell>
                        <TableCell>
                            <Badge variant={att.Status === 'Present' ? 'success' : att.Status === 'Late' ? 'warning' : 'secondary'}>
                                {att.Status}
                            </Badge>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
        </div>
    );
};

export const HR: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900">HR & Payroll</h2>
            <p className="text-zinc-500 mt-1">Manage workforce, compensation, and time tracking.</p>
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