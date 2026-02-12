"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RoleGuard from "@/components/auth/role-guard";
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { useUser } from '@/components/contexts/UserContext';
import { useTheme } from '@/components/contexts/ThemeContext';
import { authService } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, ShoppingCart, Users, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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
  { name: 'Beauty', value: 200 },
];

const COLORS_LIGHT = ['#18181b', '#52525b', '#a1a1aa', '#e4e4e7'];
const COLORS_DARK = ['#a1a1aa', '#71717a', '#52525b', '#3f3f46'];

export default function DashboardPage() {
    const router = useRouter();
    const { currentRole, setCurrentRole } = useUser();
    const { resolvedTheme } = useTheme();
    const [activeView, setActiveView] = useState('dashboard');

    const handleLogout = () => {
        authService.logout();
        router.push('/login');
    };
    const isDark = resolvedTheme === 'dark';
    const chartStroke = isDark ? '#52525b' : '#e4e4e7';
    const chartAxisStroke = isDark ? '#71717a' : '#a1a1aa';
    const barFill = isDark ? '#71717a' : '#18181b';
    const pieColors = isDark ? COLORS_DARK : COLORS_LIGHT;

    const stats = [
        { title: "Total Revenue", value: "₱45,231.89", icon: DollarSign, trend: "+20.1% from last month" },
        { title: "Active Products", value: "+2350", icon: Package, trend: "+180 new items" },
        { title: "Total Orders", value: "+12,234", icon: ShoppingCart, trend: "+19% from last month" },
        { title: "Active Users", value: "+573", icon: Users, trend: "+201 since last hour" },
    ];

    return (
        <RoleGuard allowedRoles={["SuperAdmin", "SystemAdmin", "Manager", "Cashier", "InventoryClerk"]}>
        <DashboardLayout
            currentRole={currentRole}
            activeView={activeView}
            onNavigate={setActiveView}
            onLogout={handleLogout}
        >
            <div className="space-y-8 pb-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
                        <p className="text-muted-foreground mt-1">Overview of your store's key performance indicators.</p>
                    </div>
                    <div className="text-sm font-medium text-muted-foreground bg-card px-3 py-1 rounded-md border border-border shadow-sm">
                        Updated: Today, 10:42 AM
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={index} className="hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        {stat.title}
                                    </CardTitle>
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <p className="text-xs text-emerald-600 font-medium mt-1">
                                        {stat.trend}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Charts Section */}
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Sales Chart */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Sales Overview</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">Weekly sales performance</p>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={salesData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={chartStroke} />
                                    <XAxis dataKey="name" stroke={chartAxisStroke} style={{ fontSize: '12px' }} />
                                    <YAxis stroke={chartAxisStroke} style={{ fontSize: '12px' }} />
                                    <Tooltip />
                                    <Bar dataKey="sales" fill={barFill} radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Category Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Categories</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">Distribution by category</p>
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
                                        dataKey="value"
                                    >
                                        {categoryData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Activity Section */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Recent Transactions */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Recent Transactions</CardTitle>
                                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { id: 'TXN001', amount: '₱2,451.00', time: 'Just now', status: 'Completed' },
                                    { id: 'TXN002', amount: '₱1,230.50', time: '5 minutes ago', status: 'Completed' },
                                    { id: 'TXN003', amount: '₱892.30', time: '12 minutes ago', status: 'Pending' },
                                ].map((tx) => (
                                    <div key={tx.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                                        <div>
                                            <p className="font-medium text-foreground text-sm">{tx.id}</p>
                                            <p className="text-xs text-muted-foreground">{tx.time}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-foreground">{tx.amount}</p>
                                            <span className={`text-xs font-medium ${tx.status === 'Completed' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                                {tx.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Low Stock Alert */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Low Stock Items</CardTitle>
                                <AlertCircle className="h-4 w-4 text-amber-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { name: 'Smart Watch', stock: 3, status: 'Critical' },
                                    { name: 'USB-C Cable', stock: 0, status: 'Out of Stock' },
                                    { name: 'Cotton T-Shirt', stock: 12, status: 'Low' },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                                        <div>
                                            <p className="font-medium text-foreground text-sm">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">Stock: {item.stock}</p>
                                        </div>
                                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                                            item.status === 'Critical' ? 'bg-red-500/20 text-red-700 dark:text-red-300' :
                                            item.status === 'Out of Stock' ? 'bg-red-500/30 text-red-800 dark:text-red-200' :
                                            'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                                        }`}>
                                            {item.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
        </RoleGuard>
    );
}
