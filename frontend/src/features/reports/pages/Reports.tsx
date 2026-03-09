import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/Tabs';
import { Badge } from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Skeleton';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import {
    DollarSign, Package, Users, Truck, TrendingUp, TrendingDown,
    AlertTriangle, Loader2
} from 'lucide-react';
import {
    reportService,
    SalesReport, InventoryValuation, HRSummary, ProcurementSummary
} from '../services/reportService';

const CHART_COLORS = ['#2563eb', '#0ea5e9', '#f59e0b', '#64748b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

const formatCurrency = (v: number) => `₱${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const getDefaultDates = () => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const to = now.toISOString().split('T')[0];
    return { from, to };
};

// --- Sales Tab ---
const SalesTab = () => {
    const defaults = getDefaultDates();
    const [from, setFrom] = useState(defaults.from);
    const [to, setTo] = useState(defaults.to);
    const [data, setData] = useState<SalesReport | null>(null);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const res = await reportService.getSalesReport(from, to);
            if (res.success && res.data) setData(res.data);
        } catch (e) { console.error('Sales report error:', e); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    if (!data) return <p className="text-center text-muted-foreground py-8">No data available.</p>;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end gap-4">
                <div className="grid gap-1.5">
                    <Label className="text-xs">From</Label>
                    <Input type="date" value={from} onChange={e => setFrom(e.target.value)} className="w-40" />
                </div>
                <div className="grid gap-1.5">
                    <Label className="text-xs">To</Label>
                    <Input type="date" value={to} onChange={e => setTo(e.target.value)} className="w-40" />
                </div>
                <Button onClick={load} size="sm">Apply</Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground mt-1">{data.transactionCount} transactions</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(data.netRevenue)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Tax: {formatCurrency(data.totalTax)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
                        <Package className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.itemsSold.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">Avg order: {formatCurrency(data.averageOrderValue)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Voided</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.voidedCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">{formatCurrency(data.voidedAmount)} lost</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader><CardTitle>Daily Revenue</CardTitle></CardHeader>
                    <CardContent>
                        {data.dailyBreakdown.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={data.dailyBreakdown}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#52525b" opacity={0.2} />
                                    <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false}
                                        tickFormatter={v => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                                    <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `₱${v}`} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', backgroundColor: '#18181b', border: 'none' }}
                                        labelStyle={{ color: '#e4e4e7' }} itemStyle={{ color: '#e4e4e7' }}
                                        formatter={(v: number) => [formatCurrency(v), 'Revenue']}
                                        labelFormatter={v => new Date(v).toLocaleDateString()} />
                                    <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <p className="text-center text-sm text-muted-foreground py-8">No daily data.</p>}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Payment Methods</CardTitle></CardHeader>
                    <CardContent>
                        {data.paymentMethodBreakdown.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie data={data.paymentMethodBreakdown} dataKey="amount" nameKey="method"
                                            cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={4}>
                                            {data.paymentMethodBreakdown.map((_, i) => (
                                                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={0} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '8px', backgroundColor: '#18181b', border: 'none' }}
                                            labelStyle={{ color: '#e4e4e7' }} itemStyle={{ color: '#e4e4e7' }}
                                            formatter={(v: number) => formatCurrency(v)} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="grid grid-cols-2 gap-3 mt-2 px-2">
                                    {data.paymentMethodBreakdown.map((pm, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                                            <span className="text-sm text-muted-foreground">{pm.method} ({pm.count})</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : <p className="text-center text-sm text-muted-foreground py-8">No payment data.</p>}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

// --- Inventory Tab ---
const InventoryTab = () => {
    const [data, setData] = useState<InventoryValuation | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await reportService.getInventoryValuation();
                if (res.success && res.data) setData(res.data);
            } catch (e) { console.error('Inventory valuation error:', e); }
            finally { setLoading(false); }
        })();
    }, []);

    if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    if (!data) return <p className="text-center text-muted-foreground py-8">No data available.</p>;

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Cost Value</CardTitle>
                        <DollarSign className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(data.totalCostValue)}</div>
                        <p className="text-xs text-muted-foreground mt-1">{data.totalSKUs} total SKUs</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Retail Value</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(data.totalRetailValue)}</div>
                        <p className="text-xs text-muted-foreground mt-1">At selling prices</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Potential Profit</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">{formatCurrency(data.potentialProfit)}</div>
                        <p className="text-xs text-muted-foreground mt-1">If all stock sold</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Stock Alerts</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.outOfStockCount + data.lowStockCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">{data.outOfStockCount} out, {data.lowStockCount} low</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Valuation by Category</CardTitle></CardHeader>
                <CardContent>
                    {data.categoryBreakdown.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="py-2 pr-4 font-medium text-muted-foreground">Category</th>
                                        <th className="py-2 pr-4 font-medium text-muted-foreground text-right">SKUs</th>
                                        <th className="py-2 pr-4 font-medium text-muted-foreground text-right">Cost Value</th>
                                        <th className="py-2 pr-4 font-medium text-muted-foreground text-right">Retail Value</th>
                                        <th className="py-2 font-medium text-muted-foreground text-right">Margin</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.categoryBreakdown.map((cat, i) => (
                                        <tr key={i} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                            <td className="py-2.5 pr-4 font-medium">{cat.category}</td>
                                            <td className="py-2.5 pr-4 text-right">{cat.skuCount}</td>
                                            <td className="py-2.5 pr-4 text-right font-mono">{formatCurrency(cat.costValue)}</td>
                                            <td className="py-2.5 pr-4 text-right font-mono">{formatCurrency(cat.retailValue)}</td>
                                            <td className="py-2.5 text-right font-mono text-emerald-600">
                                                {cat.costValue > 0 ? `${(((cat.retailValue - cat.costValue) / cat.costValue) * 100).toFixed(1)}%` : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : <p className="text-center text-sm text-muted-foreground py-8">No categories found.</p>}
                </CardContent>
            </Card>
        </div>
    );
};

// --- HR Tab ---
const HRTab = () => {
    const defaults = getDefaultDates();
    const [from, setFrom] = useState(defaults.from);
    const [to, setTo] = useState(defaults.to);
    const [data, setData] = useState<HRSummary | null>(null);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const res = await reportService.getHRSummary(from, to);
            if (res.success && res.data) setData(res.data);
        } catch (e) { console.error('HR summary error:', e); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    if (!data) return <p className="text-center text-muted-foreground py-8">No data available.</p>;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end gap-4">
                <div className="grid gap-1.5">
                    <Label className="text-xs">From</Label>
                    <Input type="date" value={from} onChange={e => setFrom(e.target.value)} className="w-40" />
                </div>
                <div className="grid gap-1.5">
                    <Label className="text-xs">To</Label>
                    <Input type="date" value={to} onChange={e => setTo(e.target.value)} className="w-40" />
                </div>
                <Button onClick={load} size="sm">Apply</Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.totalEmployees}</div>
                        <p className="text-xs text-muted-foreground mt-1">{data.activeCount} active</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Departments</CardTitle>
                        <Package className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.departmentCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">Active departments</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.attendanceRate.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground mt-1">In selected period</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Net Payroll</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(data.totalPayrollNet)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Deductions: {formatCurrency(data.totalDeductions)}</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Department Breakdown</CardTitle></CardHeader>
                <CardContent>
                    {data.departmentBreakdown.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2">
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={data.departmentBreakdown} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#52525b" opacity={0.2} />
                                    <XAxis type="number" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis dataKey="department" type="category" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} width={100} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', backgroundColor: '#18181b', border: 'none' }}
                                        labelStyle={{ color: '#e4e4e7' }} itemStyle={{ color: '#e4e4e7' }} />
                                    <Bar dataKey="headcount" fill="#3b82f6" radius={[0, 4, 4, 0]} maxBarSize={30} name="Headcount" />
                                </BarChart>
                            </ResponsiveContainer>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="py-2 pr-4 font-medium text-muted-foreground">Department</th>
                                            <th className="py-2 pr-4 font-medium text-muted-foreground text-right">Head</th>
                                            <th className="py-2 font-medium text-muted-foreground text-right">Payroll Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.departmentBreakdown.map((dept, i) => (
                                            <tr key={i} className="border-b last:border-0">
                                                <td className="py-2 pr-4 font-medium">{dept.department}</td>
                                                <td className="py-2 pr-4 text-right">{dept.headcount}</td>
                                                <td className="py-2 text-right font-mono">{formatCurrency(dept.payrollCost)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : <p className="text-center text-sm text-muted-foreground py-8">No department data.</p>}
                </CardContent>
            </Card>
        </div>
    );
};

// --- Procurement Tab ---
const ProcurementTab = () => {
    const defaults = getDefaultDates();
    const [from, setFrom] = useState(defaults.from);
    const [to, setTo] = useState(defaults.to);
    const [data, setData] = useState<ProcurementSummary | null>(null);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const res = await reportService.getProcurementSummary(from, to);
            if (res.success && res.data) setData(res.data);
        } catch (e) { console.error('Procurement summary error:', e); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    if (!data) return <p className="text-center text-muted-foreground py-8">No data available.</p>;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end gap-4">
                <div className="grid gap-1.5">
                    <Label className="text-xs">From</Label>
                    <Input type="date" value={from} onChange={e => setFrom(e.target.value)} className="w-40" />
                </div>
                <div className="grid gap-1.5">
                    <Label className="text-xs">To</Label>
                    <Input type="date" value={to} onChange={e => setTo(e.target.value)} className="w-40" />
                </div>
                <Button onClick={load} size="sm">Apply</Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total POs</CardTitle>
                        <Truck className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.totalPOs}</div>
                        <p className="text-xs text-muted-foreground mt-1">{data.pendingCount} pending</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Received</CardTitle>
                        <Package className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.receivedCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">Completed POs</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
                        <DollarSign className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(data.totalSpend)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Procurement cost</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Suppliers</CardTitle>
                        <Users className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.supplierBreakdown.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Active suppliers</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Supplier Breakdown</CardTitle></CardHeader>
                <CardContent>
                    {data.supplierBreakdown.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="py-2 pr-4 font-medium text-muted-foreground">Supplier</th>
                                        <th className="py-2 pr-4 font-medium text-muted-foreground text-right">PO Count</th>
                                        <th className="py-2 font-medium text-muted-foreground text-right">Total Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.supplierBreakdown.map((s, i) => (
                                        <tr key={i} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                            <td className="py-2.5 pr-4 font-medium">{s.supplierName}</td>
                                            <td className="py-2.5 pr-4 text-right">{s.poCount}</td>
                                            <td className="py-2.5 text-right font-mono">{formatCurrency(s.totalAmount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : <p className="text-center text-sm text-muted-foreground py-8">No supplier data.</p>}
                </CardContent>
            </Card>
        </div>
    );
};

// --- Main Reports Page ---
const Reports = () => {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Reports</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Departmental reports and analytics across all modules.</p>
            </div>

            <Tabs defaultValue="sales" className="w-full">
                <TabsList className="grid w-full grid-cols-4 max-w-lg">
                    <TabsTrigger value="sales">Sales</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory</TabsTrigger>
                    <TabsTrigger value="hr">HR</TabsTrigger>
                    <TabsTrigger value="procurement">Procurement</TabsTrigger>
                </TabsList>
                <TabsContent value="sales"><SalesTab /></TabsContent>
                <TabsContent value="inventory"><InventoryTab /></TabsContent>
                <TabsContent value="hr"><HRTab /></TabsContent>
                <TabsContent value="procurement"><ProcurementTab /></TabsContent>
            </Tabs>
        </div>
    );
};

export default Reports;
