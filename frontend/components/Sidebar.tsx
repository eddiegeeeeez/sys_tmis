import React from 'react';
import { UserRole } from '@/types';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { getRoleNavItems } from '@/lib/roleConfig';

interface SidebarProps {
    currentRole: UserRole;
    activeView: string;
    onNavigate: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRole, activeView, onNavigate }) => {
    const navItems = getRoleNavItems(currentRole);

    return (
        <div className="w-64 bg-sidebar text-sidebar-foreground flex flex-col h-full hidden md:flex border-r border-sidebar-border shrink-0 transition-all duration-300">
            <div className="p-6 flex items-center gap-3 border-b border-sidebar-border">
                <div className="w-10 h-10 flex items-center justify-center">
                    <Logo width={40} height={40} />
                </div>
                <div className="flex flex-col">
                    <h1 className="font-bold text-base tracking-tight leading-none text-sidebar-foreground">TradeMatrix</h1>
                    <span className="text-[10px] text-sidebar-foreground/60 font-medium tracking-wider uppercase mt-1">Enterprise MIS</span>
                </div>
            </div>

            <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 text-sm font-medium",
                                isActive
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm ring-1 ring-sidebar-ring"
                                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                            )}
                        >
                            <Icon size={18} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-sidebar-border">
                <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-sidebar-accent/50 border border-sidebar-border">
                    <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-xs font-semibold text-sidebar-primary-foreground ring-2 ring-sidebar">
                        {currentRole.charAt(0)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate text-sidebar-foreground">Current User</p>
                        <p className="text-xs text-sidebar-foreground/60 truncate">{currentRole}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent">
                        <LogOut size={16} />
                    </Button>
                </div>
            </div>
        </div>
    );
};
