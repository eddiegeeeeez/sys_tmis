import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
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

// --- Mock Data ---
const salesData = [
  { name: 'Mon', sales: 4000 }, { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 2000 }, { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 }, { name: 'Sat', sales: 2390 },
  { name: 'Sun', sales: 3490 },
];

const categoryData = [
  { name: 'Electronics', value: 400 }, { name: 'Apparel', value: 300 },
  { name: 'Home', value: 300 }, { name: 'Beauty', value: 200 },
];

const serverLoadData = [
    { time: '00:00', load: 12 }, { time: '04:00', load: 15 },
    { time: '08:00', load: 45 }, { time: '12:00', load: 78 },
    { time: '16:00', load: 60 }, { time: '20:00', load: 30 },
];

// Updated colors for better dark mode visibility (using brand-600, etc.)
const CHART_COLORS = ['#2563eb', '#0ea5e9', '#f59e0b', '#64748b'];

// --- Sub-Components for Role-Based Views ---

/**
 * Super Admin & System Admin View
 * Focus: System Health, Security, User Activity
 */
const AdminDashboard = () => (
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
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">24</div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">4 Admins, 20 Staff</p>
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
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">3</div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Failed login attempts (24h)</p>
        </CardContent>
      </Card>
    </div>

    <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader>
                <CardTitle>Server Load (24h)</CardTitle>
                <CardDescription>CPU usage across primary application cluster.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={serverLoadData}>
                        <defs>
                            <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="time" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ borderRadius: '8px', backgroundColor: '#18181b', color: '#fff', border: 'none' }} />
                        {/* Changed stroke color to Brand Blue #2563eb for visibility on dark mode */}
                        <Area type="monotone" dataKey="load" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorLoad)" />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader>
                <CardTitle>Recent System Events</CardTitle>
                <CardDescription>Latest audit log entries requiring attention.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[
                        { event: 'Database Backup Completed', time: '10 mins ago', status: 'success' },
                        { event: 'New Role Created: Regional Manager', time: '1 hour ago', status: 'info' },
                        { event: 'Multiple Failed Logins (IP: 192.168.x.x)', time: '2 hours ago', status: 'warning' },
                        { event: 'System Config Updated', time: 'Yesterday', status: 'info' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`h-2 w-2 rounded-full ${item.status === 'success' ? 'bg-emerald-500' : item.status === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />
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
const ManagerDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">$45,231.89</div>
            <p className="text-xs text-emerald-600 font-medium flex items-center mt-1">
                +20.1% <span className="text-zinc-400 ml-1 font-normal">from last month</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Active Products</CardTitle>
            <Package className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">+2,350</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">+180 new items added</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Sales Count</CardTitle>
            <TrendingUp className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">+12,234</div>
            <p className="text-xs text-emerald-600 font-medium flex items-center mt-1">
                +19% <span className="text-zinc-400 ml-1 font-normal">from last month</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Active Staff</CardTitle>
            <Users className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">24</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">All departments active</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-zinc-200 dark:border-zinc-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Weekly Revenue</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#52525b" opacity={0.2} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                   cursor={{fill: '#27272a', opacity: 0.4}}
                   contentStyle={{ backgroundColor: '#18181b', borderRadius: '8px', border: 'none', color: '#fff' }}
                />
                <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3 border-zinc-200 dark:border-zinc-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderRadius: '8px', border: 'none', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-4 px-4">
               {categoryData.map((entry, index) => (
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
const CashierDashboard = () => (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
             <div className="flex-1 space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="bg-zinc-900 text-zinc-50 border-zinc-800 dark:bg-zinc-950 dark:border-zinc-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-zinc-400 font-medium">My Sales (Today)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">$1,240.50</div>
                            <p className="text-xs text-zinc-400 mt-1">24 Transactions</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Items Sold</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">86</div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Units</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Register Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-emerald-600 flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></div>
                                Online
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Till ID: #004</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <div className="space-y-4">
                            {[
                                { id: 'TRX-998', time: '10:42 AM', amount: 120.50, items: 3 },
                                { id: 'TRX-997', time: '10:30 AM', amount: 45.00, items: 1 },
                                { id: 'TRX-996', time: '10:15 AM', amount: 210.99, items: 5 },
                            ].map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between p-3 border border-zinc-100 rounded-lg hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-500">
                                            <ShoppingCart className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200">{tx.id}</p>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400">{tx.time} • {tx.items} items</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-zinc-900 dark:text-zinc-50">${tx.amount.toFixed(2)}</span>
                                </div>
                            ))}
                         </div>
                         <Button variant="outline" className="w-full mt-4">View All Transactions</Button>
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
                     <p className="font-semibold mb-1 flex items-center gap-2"><AlertCircle className="h-4 w-4"/> Store Notice</p>
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
const InventoryDashboard = () => (
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-l-4 border-l-red-500">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">Low Stock Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-red-600">5</div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Items below reorder level</p>
                </CardContent>
            </Card>
            <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">Pending Deliveries</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">3</div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Expected today</p>
                </CardContent>
            </Card>
            <Card className="border-l-4 border-l-emerald-500">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">Total SKUs</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">2,350</div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">In 12 Categories</p>
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
                        {[
                            { name: 'USB-C Cable (1m)', stock: 0, status: 'Out of Stock' },
                            { name: 'Smart Watch Gen 2', stock: 3, status: 'Critical' },
                            { name: 'Office Chair (Black)', stock: 5, status: 'Low' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 border rounded-lg bg-zinc-50 dark:bg-zinc-800/50 dark:border-zinc-800">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className={`h-5 w-5 ${item.stock === 0 ? 'text-red-500' : 'text-amber-500'}`} />
                                    <div>
                                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200">{item.name}</p>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{item.stock} units remaining</p>
                                    </div>
                                </div>
                                <Badge variant={item.stock === 0 ? 'destructive' : 'warning'}>{item.status}</Badge>
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
                        {[
                            { id: 'PO-2023-001', supplier: 'TechGizmos Inc.', status: 'Shipped', eta: 'Today' },
                            { id: 'PO-2023-003', supplier: 'Global Apparel', status: 'Processing', eta: 'Oct 30' },
                        ].map((po, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-sm text-zinc-900 dark:text-zinc-200">{po.supplier}</p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{po.id} • ETA: {po.eta}</p>
                                </div>
                                <Badge variant="outline" className="bg-white dark:bg-zinc-900">{po.status}</Badge>
                            </div>
                        ))}
                     </div>
                     <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 gap-3">
                         <Button className="w-full" variant="secondary"><ClipboardList className="mr-2 h-4 w-4"/> Stock Count</Button>
                         <Button className="w-full" variant="outline"><CheckCircle2 className="mr-2 h-4 w-4"/> Receive Goods</Button>
                     </div>
                </CardContent>
            </Card>
        </div>
    </div>
);

// --- Main Dashboard Component ---

export const Dashboard: React.FC<DashboardProps> = ({ currentRole }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [currentRole]);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
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
          case UserRole.SYSTEM_ADMIN:
              return <AdminDashboard />;
          case UserRole.CASHIER:
              return <CashierDashboard />;
          case UserRole.INVENTORY_CLERK:
              return <InventoryDashboard />;
          case UserRole.MANAGER:
          default:
              return <ManagerDashboard />;
      }
  };

  const getWelcomeMessage = () => {
       switch (currentRole) {
          case UserRole.SUPER_ADMIN:
          case UserRole.SYSTEM_ADMIN:
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
    <div className="space-y-8 animate-in fade-in duration-500">
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