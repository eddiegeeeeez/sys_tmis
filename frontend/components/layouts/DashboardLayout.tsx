import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { UserRole } from '../../types';
import { Menu, CircuitBoard, LogOut, Sun, Moon } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTheme } from '../providers/ThemeProvider';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentRole: UserRole;
  activeView: string;
  onNavigate: (view: string) => void;
  onRoleChange: (role: UserRole) => void;
  onLogout: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  currentRole, 
  activeView, 
  onNavigate,
  onRoleChange,
  onLogout
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleNavigate = (view: string) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 font-sans overflow-hidden transition-colors duration-300">
      {/* Sidebar Navigation */}
      <Sidebar 
        currentRole={currentRole} 
        activeView={activeView} 
        onNavigate={handleNavigate} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6 z-10 shrink-0 sticky top-0 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 md:hidden text-brand-600 dark:text-brand-500">
                <CircuitBoard className="h-6 w-6" />
                <span className="font-semibold text-zinc-900 dark:text-white leading-none">TradeMatrix</span>
            </div>
            {/* Breadcrumb-like title for desktop */}
            <div className="hidden md:flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
               <span className="font-medium text-zinc-900 dark:text-zinc-100">TradeMatrix</span>
               <span className="text-zinc-300 dark:text-zinc-700">/</span>
               <span>{currentRole}</span>
               <span className="text-zinc-300 dark:text-zinc-700">/</span>
               <span className="capitalize text-brand-600 dark:text-brand-400">{activeView.replace('admin-', '').replace('-', ' ')}</span>
            </div>
          </div>

          {/* User Controls */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-zinc-500 hover:text-brand-600 dark:text-zinc-400 dark:hover:text-brand-400">
               {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700 mx-2"></div>
            <Button variant="ghost" size="sm" onClick={onLogout} title="Logout" className="text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400">
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-zinc-50 dark:bg-zinc-950">
          <div className="max-w-7xl mx-auto">
             {children}
          </div>
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
         <div className="absolute inset-0 z-50 bg-zinc-950/95 dark:bg-black/95 md:hidden flex flex-col p-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center mb-10 text-zinc-50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-600 rounded-md text-white">
                       <CircuitBoard size={20} /> 
                    </div>
                    <span className="font-bold text-xl tracking-tight">TradeMatrix</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-zinc-400 hover:text-white">✕</button>
            </div>
            <nav className="space-y-4">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Switch Role</p>
                {Object.values(UserRole).map((role) => (
                  <button 
                    key={role}
                    onClick={() => { onRoleChange(role); setIsMobileMenuOpen(false); }} 
                    className={`w-full text-left p-4 rounded-lg border transition-all ${currentRole === role ? 'bg-zinc-100 text-brand-700 border-brand-200' : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white'}`}
                  >
                    {role} View
                  </button>
                ))}
            </nav>
         </div>
      )}
    </div>
  );
};