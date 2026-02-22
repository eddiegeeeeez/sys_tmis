import React, { useState, useEffect } from 'react';
import { getDashboardSummary, DashboardSummary, emptyDashboard } from '../services/dashboardService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { StatusDot } from '../../../components/ui/StatusDot';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import {
  DollarSign, Package, Users, TrendingUp, Activity, Server,
  ShieldAlert, Database, AlertCircle, ShoppingCart,
  ClipboardList, ArrowRight, Truck, CheckCircle2
} from 'lucide-react';
import { UserRole } from '../../../types';

// --- Types ---
interface DashboardProps {
  currentRole: UserRole;
}

// Static chart data (no matching backend metric available)
const serverLoadData = [
  { time: '00:00', load: 12 }, { time: '04:00', load: 15 },
  { time: '08:00', load: 45 }, { time: '12:00', load: 78 },
  { time: '16:00', load: 60 }, { time: '20:00', load: 30 },
];

const CHART_COLORS = ['#2563eb', '#0ea5e9', '#f59e0b', '#64748b'];

// --- Sub-Components for Role-Based Views ---

/**
 * Super Admin View
 * Focus: System Infrastructure, DB, Global Security
 */
const SuperAdminDashboard = ({ data }: { data: DashboardSummary }) => (
  <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-l-4 border-l-emerald-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">System Status</CardTitle>
          <Activity className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Operational</div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Uptime: 99.99% (30 days)</p>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Active Users</CardTitle>
          <Users className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{data.totalUsers}</div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Registered accounts</p>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-l-zinc-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Database Load</CardTitle>
          <Database className="h-4 w-4 text-zinc-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">42%</div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">1,240 Queries / min</p>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-l-amber-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Security Alerts</CardTitle>
          <ShieldAlert className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${data.securityAlerts > 0 ? 'text-amber-600' : 'text-zinc-900 dark:text-zinc-50'}`}>{data.securityAlerts}</div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Failed login attempts (24h)</p>
        </CardContent>
      </Card>
    </div>

    <div className="grid gap-6 md:grid-cols-2">
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle>Infrastructure Load (24h)</CardTitle>
          <CardDescription>Overall CPU usage across clusters.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={serverLoadData}>
              <defs>
                <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', backgroundColor: '#18181b', color: '#fff', border: 'none' }} />
              <Area type="monotone" dataKey="load" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorLoad)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle>Recent Critical Events</CardTitle>
          <CardDescription>Latest high-level audit log entries.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(data.recentEvents.length > 0 ? data.recentEvents : [
              { event: 'No recent events recorded', time: '', status: 'info' },
            ]).map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <StatusDot variant={item.status as any} />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{item.event}</span>
                </div>
                <span className="text-xs text-zinc-400 font-mono">{item.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);



/**
 * Manager View
 * Focus: Financials, Sales Performance, Staffing
 */
const ManagerDashboard = ({ data }: { data: DashboardSummary }) => (
  <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Monthly Expenses</CardTitle>
          <DollarSign className="h-4 w-4 text-zinc-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">${data.monthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Total expenses this month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Active Products</CardTitle>
          <Package className="h-4 w-4 text-zinc-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{data.totalProducts.toLocaleString()}</div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Total SKUs in inventory</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Pending Orders</CardTitle>
          <TrendingUp className="h-4 w-4 text-zinc-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{data.pendingPurchaseOrders}</div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Purchase orders awaiting delivery</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Active Employees</CardTitle>
          <Users className="h-4 w-4 text-zinc-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{data.activeEmployees}</div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{data.presentToday} present today</p>
        </CardContent>
      </Card>
    </div>

    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
      <Card className="col-span-4 border-zinc-200 dark:border-zinc-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Weekly Expenses</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data.weeklyExpenses}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#52525b" opacity={0.2} />
              <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
              <Tooltip
                cursor={{ fill: '#27272a', opacity: 0.4 }}
                contentStyle={{ backgroundColor: '#18181b', borderRadius: '8px', border: 'none', color: '#fff' }}
              />
              <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="col-span-3 border-zinc-200 dark:border-zinc-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Expenses by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.expensesByCategory.length > 0 ? data.expensesByCategory : [{ name: 'No Data', value: 1 }]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {(data.expensesByCategory.length > 0 ? data.expensesByCategory : [{ name: 'No Data', value: 1 }]).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#18181b', borderRadius: '8px', border: 'none', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-4 mt-4 px-4">
            {data.expensesByCategory.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}></div>
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{entry.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

/**
 * Cashier View
 * Focus: Personal Sales, Quick Actions, Register Status
 */
const CashierDashboard = ({ data }: { data: DashboardSummary }) => (
  <div className="space-y-6">
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1 space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-zinc-900 text-zinc-50 border-zinc-800 dark:bg-zinc-950 dark:border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-zinc-400 font-medium">Revenue (Today)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-50">${data.todayRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <p className="text-xs text-zinc-400 mt-1">{data.todayTransactionCount} transaction{data.todayTransactionCount !== 1 ? 's' : ''}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Items Sold</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{data.todayItemsSold}</div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Units today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Register Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></div>
                Online
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">POS System Active</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions (Today)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(data.recentTransactions.length > 0 ? data.recentTransactions : []).map((tx, i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-zinc-100 rounded-lg hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-500">
                      <ShoppingCart className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200">{tx.transactionNumber}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{tx.time} • {tx.itemCount} item{tx.itemCount !== 1 ? 's' : ''} • {tx.paymentMethod}</p>
                    </div>
                  </div>
                  <span className="font-bold text-zinc-900 dark:text-zinc-50">${tx.totalAmount.toFixed(2)}</span>
                </div>
              ))}
              {data.recentTransactions.length === 0 && (
                <p className="text-sm text-zinc-400 text-center py-4">No transactions yet today.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="w-full md:w-80 space-y-4">
        <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100 dark:from-indigo-950 dark:to-zinc-900 dark:border-indigo-900">
          <CardHeader>
            <CardTitle className="text-indigo-900 dark:text-indigo-200">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white justify-between">
              New Sale <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="w-full justify-start border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-900/50">
              Check Price
            </Button>
            <Button variant="outline" className="w-full justify-start border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-900/50">
              Customer Lookup
            </Button>
            <Button variant="outline" className="w-full justify-start border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-900/50">
              Refund / Return
            </Button>
          </CardContent>
        </Card>

        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-sm dark:bg-amber-900/20 dark:border-amber-900/50 dark:text-amber-200">
          <p className="font-semibold mb-1 flex items-center gap-2"><AlertCircle className="h-4 w-4" /> Store Notice</p>
          <p>Holiday sale starts tomorrow. Please ensure promotional flyers are visible at the counter.</p>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Inventory Clerk View
 * Focus: Stock Levels, Shipments, POs
 */
const InventoryDashboard = ({ data }: { data: DashboardSummary }) => (
  <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="border-l-4 border-l-red-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">Low Stock Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${data.lowStockCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{data.lowStockCount}</div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Items below reorder level</p>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">Pending Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{data.pendingPurchaseOrders}</div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Active purchase orders</p>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-l-emerald-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">Total SKUs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{data.totalProducts.toLocaleString()}</div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Products tracked</p>
        </CardContent>
      </Card>
    </div>

    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Low Stock Items</CardTitle>
          <Button variant="outline" size="sm" className="text-xs">View All</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(data.lowStockItems.length > 0 ? data.lowStockItems : [
              { name: 'All items are well-stocked', stock: 0, status: 'Out of Stock' },
            ]).map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg bg-zinc-50 dark:bg-zinc-800/50 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <AlertCircle className={`h-5 w-5 ${item.status === 'Out of Stock' ? 'text-red-500' : 'text-amber-500'}`} />
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200">{item.name}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{item.stock} units remaining</p>
                  </div>
                </div>
                <StatusDot variant={item.status === 'Out of Stock' ? 'error' : item.status === 'Critical' ? 'error' : 'warning'}>
                  {item.status}
                </StatusDot>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Incoming Purchase Orders</CardTitle>
          <Truck className="h-5 w-5 text-zinc-400" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(data.pendingPOs.length > 0 ? data.pendingPOs : [
              { id: '—', supplier: 'No pending purchase orders', status: 'Pending', eta: '—' },
            ]).map((po, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-zinc-900 dark:text-zinc-200">{po.supplier}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{po.id} • ETA: {po.eta}</p>
                </div>
                <StatusDot variant="info">{po.status}</StatusDot>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 gap-3">
            <Button className="w-full" variant="secondary"><ClipboardList className="mr-2 h-4 w-4" /> Stock Count</Button>
            <Button className="w-full" variant="outline"><CheckCircle2 className="mr-2 h-4 w-4" /> Receive Goods</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

// --- Main Dashboard Component ---

export const Dashboard: React.FC<DashboardProps> = ({ currentRole }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<DashboardSummary>(emptyDashboard);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const summary = await getDashboardSummary();
        if (!cancelled) setData(summary);
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [currentRole]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-9 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
          <Skeleton className="h-9 w-[180px]" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  // Determine Dashboard Content based on Role
  const renderDashboardContent = () => {
    switch (currentRole) {
      case UserRole.SUPER_ADMIN:
        return <SuperAdminDashboard data={data} />;
      case UserRole.CASHIER:
        return <CashierDashboard data={data} />;
      case UserRole.INVENTORY_CLERK:
        return <InventoryDashboard data={data} />;
      case UserRole.MANAGER:
      default:
        return <ManagerDashboard data={data} />;
    }
  };

  const getWelcomeMessage = () => {
    switch (currentRole) {
      case UserRole.SUPER_ADMIN:
        return "System Overview & Health";
      case UserRole.CASHIER:
        return "Register & Sales Terminal";
      case UserRole.INVENTORY_CLERK:
        return "Inventory & Procurement Operations";
      default:
        return "Business Performance Overview";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{getWelcomeMessage()}</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Welcome back, {currentRole}. Here is your customized dashboard.</p>
        </div>
        <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 px-3 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
          System Online
        </div>
      </div>

      {renderDashboardContent()}
    </div>
  );
};