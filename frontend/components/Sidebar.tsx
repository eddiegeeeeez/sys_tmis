import React from 'react';
import { UserRole } from '../types';
import { 
  LayoutDashboard, ShoppingCart, Package, Users, LogOut, 
  CircuitBoard, Shield, Settings, Database, Lock, 
  Briefcase, Truck, Wallet, UserSquare2
} from 'lucide-react';

interface SidebarProps {
  currentRole: UserRole;
  activeView: string;
  onNavigate: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRole, activeView, onNavigate }) => {
  
  const getNavItems = () => {
    // Common items for Manager/Admins
    const adminItems = [
      { section: 'Main', items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ]},
      { section: 'Operations', items: [
        { id: 'pos', label: 'Point of Sale', icon: ShoppingCart },
        { id: 'inventory', label: 'Inventory Management', icon: Package },
        { id: 'procurement', label: 'Procurement (PO)', icon: Truck },
      ]},
      { section: 'Administration', items: [
        { id: 'hr', label: 'HR & Payroll', icon: Briefcase },
        { id: 'crm', label: 'Customers (CRM)', icon: UserSquare2 },
        { id: 'finance', label: 'Finance & Expenses', icon: Wallet },
      ]},
    ];

    const superAdminExtras = [
      { section: 'System', items: [
        { id: 'admin-users', label: 'User Management', icon: Users },
        { id: 'admin-roles', label: 'Role Management', icon: Shield },
        { id: 'admin-db', label: 'Database Admin', icon: Database },
        { id: 'admin-config', label: 'System Config', icon: Settings },
        { id: 'admin-security', label: 'Audit Logs', icon: Lock },
      ]}
    ];

    switch (currentRole) {
      case UserRole.SUPER_ADMIN:
      case UserRole.SYSTEM_ADMIN:
        return [...adminItems, ...superAdminExtras];
      
      case UserRole.MANAGER:
        return adminItems; // Managers see most business logic but not system internals

      case UserRole.CASHIER:
        return [
          { section: 'Sales', items: [
            { id: 'pos', label: 'Point of Sale', icon: ShoppingCart },
            { id: 'crm', label: 'Customers', icon: UserSquare2 },
          ]},
          { section: 'Lookup', items: [
            { id: 'inventory-view', label: 'Stock Lookup', icon: Package },
          ]}
        ];

      case UserRole.INVENTORY_CLERK:
        return [
          { section: 'Inventory', items: [
            { id: 'inventory', label: 'Stock Management', icon: Package },
            { id: 'procurement', label: 'Suppliers & PO', icon: Truck },
          ]}
        ];

      default:
        return [];
    }
  };

  const navGroups = getNavItems();

  return (
    <div className="w-64 bg-zinc-950 text-zinc-50 flex flex-col h-full hidden md:flex border-r border-zinc-800 shrink-0 transition-all duration-300">
      <div className="p-6 flex items-center gap-3 border-b border-zinc-800/50">
        <div className="w-8 h-8 bg-zinc-50 text-zinc-950 rounded-lg flex items-center justify-center font-bold shadow-lg shadow-zinc-900/20">
          <CircuitBoard size={18} />
        </div>
        <div className="flex flex-col">
            <h1 className="font-bold text-base tracking-tight leading-none">TradeMatrix</h1>
            <span className="text-[10px] text-zinc-500 font-medium tracking-wider uppercase mt-1">Enterprise MIS</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 overflow-y-auto">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="mb-6">
            <h3 className="px-3 mb-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{group.section}</h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id || (activeView.startsWith(item.id + '-'));
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 text-sm font-medium ${
                      isActive 
                        ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700' 
                        : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-800/50 mt-auto">
        <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-zinc-900 border border-zinc-800/50">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-300 ring-2 ring-zinc-950">
                {currentRole.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate text-zinc-200">Current User</p>
                <p className="text-xs text-zinc-500 truncate">{currentRole}</p>
            </div>
            <LogOut size={16} className="text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors" />
        </div>
      </div>
    </div>
  );
};