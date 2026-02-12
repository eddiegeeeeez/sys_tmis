"use client";

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { UserRole } from '@/types';
import { Menu, CircuitBoard, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
    children: React.ReactNode;
    currentRole: UserRole;
    activeView: string;
    onNavigate: (view: string) => void;
    onLogout: () => void;
}

const NAV_ITEMS: Record<UserRole, { id: string; label: string }[]> = {
    [UserRole.SUPER_ADMIN]: [
        { id: 'dashboard', label: 'Overview' },
        { id: 'admin-users', label: 'User Management' },
        { id: 'admin-roles', label: 'Role Management' },
        { id: 'admin-config', label: 'System Config' },
        { id: 'admin-db', label: 'Database Admin' },
        { id: 'admin-security', label: 'Security & Logs' },
    ],
    [UserRole.SYSTEM_ADMIN]: [
        { id: 'dashboard', label: 'Overview' },
        { id: 'admin-users', label: 'User Management' },
        { id: 'admin-roles', label: 'Role Management' },
        { id: 'admin-config', label: 'System Config' },
        { id: 'admin-db', label: 'Database Admin' },
        { id: 'admin-security', label: 'Security & Logs' },
    ],
    [UserRole.MANAGER]: [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'inventory', label: 'Inventory' },
        { id: 'pos', label: 'Point of Sale' },
    ],
    [UserRole.CASHIER]: [
        { id: 'pos', label: 'Point of Sale' },
        { id: 'inventory-view', label: 'Stock Lookup' },
    ],
    [UserRole.INVENTORY_CLERK]: [
        { id: 'inventory', label: 'Inventory' },
    ],
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
    children,
    currentRole,
    activeView,
    onNavigate,
    onLogout,
}) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const mobileNavItems = NAV_ITEMS[currentRole] ?? [];

    const handleNavigate = (view: string) => {
        onNavigate(view);
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
            <Sidebar
                currentRole={currentRole}
                activeView={activeView}
                onNavigate={handleNavigate}
            />

            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <header className="h-16 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 z-10 shrink-0 sticky top-0">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden text-muted-foreground hover:bg-accent"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <Menu className="w-5 h-5" />
                        </Button>
                        <div className="flex flex-col md:hidden">
                            <span className="font-semibold text-foreground leading-none">TradeMatrix</span>
                        </div>
                        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">TradeMatrix</span>
                            <span className="text-muted-foreground/60">/</span>
                            <span>{currentRole}</span>
                            <span className="text-muted-foreground/60">/</span>
                            <span className="capitalize">{activeView.replace('admin-', '').replace('-', ' ')}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <Button variant="ghost" size="sm" onClick={onLogout} title="Logout">
                            <LogOut className="w-4 h-4" />
                        </Button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            {isMobileMenuOpen && (
                <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur md:hidden flex flex-col p-6 animate-in fade-in duration-200 border border-border">
                    <div className="flex justify-between items-center mb-10 text-foreground">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-muted rounded-md text-foreground">
                                <CircuitBoard size={20} />
                            </div>
                            <span className="font-bold text-xl tracking-tight">TradeMatrix</span>
                        </div>
                        <button type="button" onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-muted-foreground hover:text-foreground">✕</button>
                    </div>
                    <nav className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Menu</p>
                        {mobileNavItems.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => handleNavigate(item.id)}
                                className={cn(
                                    "w-full text-left p-4 rounded-lg border transition-all",
                                    activeView === item.id ? 'bg-accent text-accent-foreground border-border' : 'bg-muted text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground'
                                )}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>
            )}
        </div>
    );
};
