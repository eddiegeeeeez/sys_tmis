import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { UserRole } from '../../types';
import { Menu, CircuitBoard, LogOut, Sun, Moon } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTheme } from '../providers/ThemeProvider';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

interface DashboardLayoutProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onLogout: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentRole,
  onRoleChange,
  onLogout
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const activeView = location.pathname.substring(1); // remove leading slash

  const handleRoleChange = (role: UserRole) => {
    onRoleChange(role);
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
              <img src="/logo-icon.png" alt="TradeMatrix" className="h-8 w-8" />
              <span className="font-semibold text-zinc-900 dark:text-white leading-none">TradeMatrix</span>
            </div>
            {/* Breadcrumb-like title for desktop */}
            <div className="hidden md:flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <span className="font-medium text-zinc-900 dark:text-zinc-100">TradeMatrix</span>
              <span className="text-zinc-300 dark:text-zinc-700">/</span>
              <span>{currentRole}</span>
              <span className="text-zinc-300 dark:text-zinc-700">/</span>
              <span className="capitalize text-brand-600 dark:text-brand-400">{activeView.replace('admin/', '').replace('/', ' ')}</span>
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
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="absolute inset-0 z-50 bg-zinc-950/95 dark:bg-black/95 md:hidden flex flex-col p-6 animate-in fade-in duration-200">
          <div className="flex justify-between items-center mb-10 text-zinc-50">
            <div className="flex items-center gap-3">
              <img src="/logo-icon.png" alt="TradeMatrix" className="h-10 w-10" />
              <span className="font-bold text-xl tracking-tight">TradeMatrix</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-zinc-400 hover:text-white">✕</button>
          </div>
          <nav className="space-y-4">
            {/* Navigation items could go here if needed, currently empty as sidebar handles main nav */}
          </nav>
        </div>
      )}
    </div>
  );
};