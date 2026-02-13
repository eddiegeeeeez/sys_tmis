import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Package, Users, TrendingUp } from 'lucide-react';

const salesData = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 2000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 2390 },
  { name: 'Sun', sales: 3490 },
];

const categoryData = [
  { name: 'Electronics', value: 400 },
  { name: 'Apparel', value: 300 },
  { name: 'Home', value: 300 },
  { name: 'Beauty', value: 200 },
];

// Modern, muted chart colors
const COLORS = ['#18181b', '#52525b', '#a1a1aa', '#e4e4e7'];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Dashboard</h2>
            <p className="text-zinc-500 mt-1">Overview of your store's key performance indicators.</p>
        </div>
        <div className="text-sm font-medium text-zinc-500 bg-white px-3 py-1 rounded-md border border-zinc-200 shadow-sm">
            Updated: Today, 10:42 AM
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-zinc-900">$45,231.89</div>
            <p className="text-xs text-emerald-600 font-medium flex items-center mt-1">
                +20.1% <span className="text-zinc-400 ml-1 font-normal">from last month</span>
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">Active Products</CardTitle>
            <Package className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-zinc-900">+2,350</div>
            <p className="text-xs text-zinc-500 mt-1">+180 new items added</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">Sales Count</CardTitle>
            <TrendingUp className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-zinc-900">+12,234</div>
            <p className="text-xs text-emerald-600 font-medium flex items-center mt-1">
                +19% <span className="text-zinc-400 ml-1 font-normal">from last month</span>
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">Active Staff</CardTitle>
            <Users className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-zinc-900">24</div>
            <p className="text-xs text-zinc-500 mt-1">Across 3 departments</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-zinc-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Weekly Sales</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                <XAxis 
                    dataKey="name" 
                    stroke="#71717a" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={10}
                />
                <YAxis 
                    stroke="#71717a" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `$${value}`} 
                />
                <Tooltip 
                   cursor={{fill: '#f4f4f5'}}
                   contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                   itemStyle={{ color: '#09090b', fontWeight: 600 }}
                />
                <Bar dataKey="sales" fill="#18181b" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3 border-zinc-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Category Distribution</CardTitle>
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
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e4e4e7' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-4 px-4">
               {categoryData.map((entry, index) => (
                 <div key={index} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                    <span className="text-sm font-medium text-zinc-600">{entry.name}</span>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};