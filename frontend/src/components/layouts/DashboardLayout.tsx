import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { UserRole } from '../../types';
import { Menu, CircuitBoard, LogOut, Sun, Moon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Separator } from '../ui/Separator';
import { useTheme } from '../providers/ThemeProvider';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

import { LogoutConfirmation } from '../common/LogoutConfirmation';

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
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const activeView = location.pathname.substring(1); // remove leading slash
  const isPOS = location.pathname === '/pos';

  const handleRoleChange = (role: UserRole) => {
    onRoleChange(role);
    setIsMobileMenuOpen(false);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
      <LogoutConfirmation
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => {
          setIsLogoutModalOpen(false);
          onLogout();
        }}
      />

      {/* Sidebar Navigation */}
      {!isPOS && (
        <Sidebar
          currentRole={currentRole}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        {!isPOS && (
        <header className="h-16 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 z-10 shrink-0 sticky top-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2 md:hidden text-primary">
              <img src="/logo-icon.png" alt="TradeMatrix" className="h-8 w-8" />
              <span className="font-semibold text-foreground leading-none">TradeMatrix</span>
            </div>
            {/* Breadcrumb-like title for desktop */}
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">TradeMatrix</span>
              <span className="text-border">/</span>
              <span>{currentRole}</span>
              <span className="text-border">/</span>
              <span className="capitalize text-primary">{activeView.replace('admin/', '').replace('system/', '').replace('/', ' ')}</span>
            </div>
          </div>

          {/* User Controls */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Separator orientation="vertical" className="h-6 mx-2" />
            <Button variant="ghost" size="sm" onClick={() => setIsLogoutModalOpen(true)} title="Logout" className="hover:text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>
        )}

        {/* Scrollable Content */}
        <main className={cn("flex-1", isPOS ? "p-0 overflow-hidden" : "p-4 md:p-8 overflow-y-auto")}>
          <div className={cn(isPOS ? "h-full" : "max-w-7xl mx-auto")}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background/95 md:hidden flex flex-col p-6">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-3">
              <img src="/logo-icon.png" alt="TradeMatrix" className="h-10 w-10" />
              <span className="font-bold text-xl tracking-tight">TradeMatrix</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>✕</Button>
          </div>
          <nav className="space-y-4">
            {/* Mobile nav items */}
          </nav>
        </div>
      )}
    </div>
  );
};