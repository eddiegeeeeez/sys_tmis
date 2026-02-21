import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserRole } from '../../types';
import {
  LayoutDashboard, ShoppingCart, Package, Users, LogOut,
  CircuitBoard, Shield, Settings, Database, Lock,
  Briefcase, Truck, Wallet, UserSquare2, ArchiveRestore
} from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/Avatar';
import { cn } from '../../lib/utils';

interface SidebarProps {
  currentRole: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRole }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeView = location.pathname.substring(1); // remove leading slash

  const getNavItems = () => {
    switch (currentRole) {
      case UserRole.SUPER_ADMIN:
        return [
          {
            section: 'System Core', items: [
              { id: 'dashboard', label: 'System Overview', icon: LayoutDashboard },
              { id: 'admin/config', label: 'System Config', icon: Settings },
              { id: 'admin/db', label: 'Database Admin', icon: Database },
            ]
          },
          {
            section: 'Access Control', items: [
              { id: 'admin/users', label: 'User Management', icon: Users },
              { id: 'admin/roles', label: 'Role Management', icon: Shield },
              { id: 'admin/security', label: 'Audit Logs', icon: Lock },
              { id: 'admin/archive', label: 'Archive', icon: ArchiveRestore },
            ]
          }
        ];

      case UserRole.SYSTEM_ADMIN:
        return [
          {
            section: 'Administration', items: [
              { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
              { id: 'system/users', label: 'User Management', icon: Users },
              { id: 'system/roles', label: 'Role Management', icon: Shield },
              { id: 'system/security', label: 'Audit Logs', icon: Lock },
              { id: 'system/archive', label: 'Archive', icon: ArchiveRestore },
            ]
          }
        ];

      case UserRole.MANAGER:
        return [
          {
            section: 'Overview', items: [
              { id: 'dashboard', label: 'Business Dashboard', icon: LayoutDashboard },
            ]
          },
          {
            section: 'Operations', items: [
              { id: 'pos', label: 'Point of Sale', icon: ShoppingCart },
              { id: 'inventory', label: 'Inventory', icon: Package },
              { id: 'procurement', label: 'Procurement', icon: Truck },
            ]
          },
          {
            section: 'Management', items: [
              { id: 'hr', label: 'HR & Payroll', icon: Briefcase },
              { id: 'crm', label: 'Customers', icon: UserSquare2 },
              { id: 'finance', label: 'Finance', icon: Wallet },
            ]
          },
        ];

      case UserRole.CASHIER:
        return [
          {
            section: 'Front Desk', items: [
              { id: 'pos', label: 'Point of Sale', icon: ShoppingCart },
              { id: 'crm', label: 'Customers', icon: UserSquare2 },
            ]
          },
          {
            section: 'Lookup', items: [
              { id: 'inventory', label: 'Stock Lookup', icon: Package }, // mapped to inventory route but maybe restricted view
            ]
          }
        ];

      case UserRole.INVENTORY_CLERK:
        return [
          {
            section: 'Warehouse', items: [
              { id: 'inventory', label: 'Stock Management', icon: Package },
              { id: 'procurement', label: 'Suppliers & PO', icon: Truck },
            ]
          }
        ];

      default:
        return [];
    }
  };

  const navGroups = getNavItems();

  return (
    <div className="w-64 bg-card text-card-foreground flex flex-col h-full hidden md:flex border-r shrink-0">
      <div className="p-6 flex items-center justify-center gap-3 border-b">
        {/* Light Mode Logo */}
        <img
          src="/logo-full-black.png"
          alt="TradeMatrix MIS"
          className="w-full h-auto object-contain block dark:hidden px-2"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const parent = e.currentTarget.parentElement;
            if (parent) {
              const textDiv = parent.querySelector('.hidden.flex-col');
              if (textDiv) textDiv.classList.remove('hidden');
            }
          }}
        />
        {/* Dark Mode Logo */}
        <img
          src="/logo-full.png"
          alt="TradeMatrix MIS"
          className="w-full h-auto object-contain hidden dark:block px-2"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const parent = e.currentTarget.parentElement;
            if (parent) {
              const textDiv = parent.querySelector('.hidden.flex-col');
              if (textDiv) textDiv.classList.remove('hidden');
            }
          }}
        />
        <div className="hidden flex flex-col text-center">
          <h1 className="font-bold text-base tracking-tight leading-none">
            Trade<span className="text-primary">Matrix</span>
          </h1>
          <span className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase mt-1">
            Enterprise <span className="text-orange-500">MIS</span>
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 overflow-y-auto">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="mb-6">
            <h3 className="px-3 mb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{group.section}</h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id ||
                  (activeView.startsWith(item.id + '/'));

                return (
                  <button
                    key={item.id}
                    onClick={() => navigate('/' + item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon size={18} className={isActive ? 'text-primary' : ''} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t mt-auto">
        <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-muted/50 border">
          <Avatar className="h-8 w-8 ring-2 ring-background">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs uppercase">
              {currentRole.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden text-left">
            <p className="text-sm font-medium truncate">Current User</p>
            <p className="text-xs text-muted-foreground truncate">{currentRole}</p>
          </div>
        </div>
      </div>
    </div>
  );
};