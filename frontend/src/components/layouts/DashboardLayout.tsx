import React, { useState } from 'react';
import { Sidebar, getNavItems } from './Sidebar';
import { UserRole } from '../../types';
import { Menu, CircuitBoard, LogOut, Sun, Moon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Separator } from '../ui/Separator';
import { useTheme } from '../providers/ThemeProvider';
import { Link, Outlet, useLocation } from 'react-router-dom';
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
          <nav className="space-y-4 flex-1 overflow-y-auto">
            {getNavItems(currentRole).map((group, groupIdx) => (
              <div key={groupIdx}>
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">{group.section}</h3>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname.substring(1) === item.id ||
                      location.pathname.substring(1).startsWith(item.id + '/');
                    return (
                      <Link
                        key={item.id}
                        to={'/' + item.id}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium transition-colors no-underline',
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        )}
                      >
                        <Icon size={20} className={isActive ? 'text-primary' : ''} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
};