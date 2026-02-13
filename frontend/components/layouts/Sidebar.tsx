import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserRole } from '../../types';
import {
  LayoutDashboard, ShoppingCart, Package, Users, LogOut,
  CircuitBoard, Shield, Settings, Database, Lock,
  Briefcase, Truck, Wallet, UserSquare2
} from 'lucide-react';

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
            ]
          }
        ];

      case UserRole.SYSTEM_ADMIN:
        return [
          {
            section: 'Administration', items: [
              { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
              { id: 'admin/users', label: 'User Management', icon: Users },
              { id: 'admin/roles', label: 'Role Management', icon: Shield },
              { id: 'admin/security', label: 'Audit Logs', icon: Lock },
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
    <div className="w-64 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col h-full hidden md:flex border-r border-zinc-200 dark:border-zinc-800 shrink-0 transition-colors duration-300">
      <div className="p-6 flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="relative w-8 h-8 flex items-center justify-center">
          {/* Logo Icon utilizing brand colors */}
          <div className="absolute inset-0 bg-brand-600 rounded-lg opacity-20 blur-sm"></div>
          <div className="relative bg-brand-600 text-white p-1.5 rounded-lg shadow-lg shadow-brand-600/30 dark:shadow-brand-900/50">
            <CircuitBoard size={20} className="text-white" />
          </div>
          {/* Brand Dots */}
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent-cyan rounded-full border-2 border-white dark:border-zinc-950"></div>
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-accent-orange rounded-full border-2 border-white dark:border-zinc-950"></div>
        </div>
        <div className="flex flex-col">
          <h1 className="font-bold text-base tracking-tight leading-none text-zinc-900 dark:text-white">
            Trade<span className="text-brand-600 dark:text-brand-400">Matrix</span>
          </h1>
          <span className="text-[10px] text-zinc-500 font-medium tracking-wider uppercase mt-1">
            Enterprise <span className="text-accent-orange">MIS</span>
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 overflow-y-auto">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="mb-6">
            <h3 className="px-3 mb-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{group.section}</h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id ||
                  (activeView.startsWith(item.id + '/'));

                return (
                  <button
                    key={item.id}
                    onClick={() => navigate('/' + item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 text-sm font-medium ${isActive
                        ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-sm dark:bg-brand-900/20 dark:text-brand-400 dark:border-brand-800/50'
                        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200'
                      }`}
                  >
                    <Icon size={18} className={isActive ? 'text-brand-600 dark:text-brand-400' : ''} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 mt-auto">
        <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-zinc-50 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
          <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-600 dark:text-zinc-300 ring-2 ring-white dark:ring-zinc-950">
            {currentRole.charAt(0)}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate text-zinc-900 dark:text-zinc-200">Current User</p>
            <p className="text-xs text-zinc-500 truncate">{currentRole}</p>
          </div>
        </div>
      </div>
    </div>
  );
};