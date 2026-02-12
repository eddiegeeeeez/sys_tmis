"use client";

import React from 'react';
import RoleGuard from "@/components/auth/role-guard";
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { useAdminNavigation } from '@/lib/hooks/useAdminNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuickActionsCard } from '@/components/QuickActionsCard';
import { DollarSign, Package, ShoppingCart, TrendingUp, AlertCircle, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const salesData = [
  { name: 'Mon', sales: 4000, orders: 24 },
  { name: 'Tue', sales: 3000, orders: 13 },
  { name: 'Wed', sales: 2000, orders: 9 },
  { name: 'Thu', sales: 2780, orders: 39 },
  { name: 'Fri', sales: 1890, orders: 28 },
  { name: 'Sat', sales: 2390, orders: 35 },
  { name: 'Sun', sales: 3490, orders: 23 },
];

const categoryData = [
  { name: 'Electronics', value: 400 },
  { name: 'Apparel', value: 300 },
  { name: 'Home', value: 300 },
  { name: 'Accessories', value: 150 },
];

const inventoryAlerts = [
  { id: 1, product: 'USB-C Cable', stock: 0, sku: 'CB-007', status: 'Out of Stock' },
  { id: 2, product: 'Smart Watch', stock: 3, sku: 'SW-003', status: 'Low Stock' },
  { id: 3, product: 'Wireless Headphones', stock: 5, sku: 'WH-001', status: 'Low Stock' },
];

const COLORS = ['#18181b', '#52525b', '#a1a1aa', '#e4e4e7'];

export default function ManagerPage() {
  const { currentRole, handleLogout, handleNavigate } = useAdminNavigation();

  const stats = [
    { title: "Total Revenue", value: "₱45,231.89", icon: DollarSign, trend: "+20.1% from last month" },
    { title: "Total Orders", value: "+12,234", icon: ShoppingCart, trend: "+19% from last month" },
    { title: "Active Products", value: "+2,350", icon: Package, trend: "+180 new items" },
    { title: "Daily Avg Revenue", value: "₱6,461.70", icon: TrendingUp, trend: "Calculated from weekly data" },
  ];

  return (
    <RoleGuard allowedRoles={["Manager"]}>
      <DashboardLayout
        currentRole={currentRole}
        activeView="manager"
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      >
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Store Operations Dashboard</h1>
            <p className="text-muted-foreground mt-1">Monitor store performance, inventory, and sales metrics.</p>
          </div>

          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions */}
          <QuickActionsCard role={currentRole} onNavigate={handleNavigate} />

          {/* Charts and Info */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-full lg:col-span-4">
              <CardHeader>
                <CardTitle>Weekly Sales</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#a1a1aa" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#a1a1aa" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#white', border: '1px solid #e4e4e7', borderRadius: '8px' }}
                      formatter={(value) => `₱${value}`}
                    />
                    <Bar dataKey="sales" fill="#18181b" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-full lg:col-span-3">
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Inventory Alerts and Staff */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-base">Inventory Alerts</CardTitle>
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inventoryAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{alert.product}</p>
                        <p className="text-xs text-muted-foreground">{alert.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{alert.stock}</p>
                        <p className={`text-xs font-medium ${
                          alert.status === 'Out of Stock' 
                            ? 'text-red-600' 
                            : 'text-amber-600'
                        }`}>
                          {alert.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Store Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                  <span className="text-sm text-muted-foreground">Operating Hours</span>
                  <span className="text-sm font-medium">9:00 AM - 10:00 PM</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                  <span className="text-sm text-muted-foreground">Active Staff</span>
                  <span className="text-sm font-medium">12 / 24</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                  <span className="text-sm text-muted-foreground">Store Status</span>
                  <span className="text-sm font-medium text-emerald-600">Open</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                  <span className="text-sm text-muted-foreground">Transactions Today</span>
                  <span className="text-sm font-medium">487</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
