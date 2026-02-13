import React, { useState, useEffect } from 'react';
import { UserRole } from './types';
import { DashboardLayout } from './components/layouts/DashboardLayout';
import { LoginPage } from './features/auth/pages/LoginPage';
import { Unauthorized } from './components/common/Unauthorized';
import { ThemeProvider } from './components/providers/ThemeProvider';

// Pages
import { Dashboard } from './features/dashboard/pages/Dashboard';
import { POS } from './features/pos/pages/POS';
import { Inventory } from './features/inventory/pages/Inventory';
import { HR } from './features/hr/pages/HR';
import { Procurement } from './features/procurement/pages/Procurement';
import { CRM } from './features/crm/pages/CRM';
import { Finance } from './features/finance/pages/Finance';

// Admin Pages
import { UserManagement } from './features/admin/pages/UserManagement';
import { RoleManagement } from './features/admin/pages/RoleManagement';
import { RolePermissionsEditor } from './features/admin/pages/RolePermissionsEditor';
import { SystemConfig } from './features/admin/pages/SystemConfig';
import { DatabaseAdmin } from './features/admin/pages/DatabaseAdmin';
import { Security } from './features/admin/pages/Security';

// --- Router Configuration & Permissions ---

const PERMISSIONS = {
  // General
  'dashboard': [UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.MANAGER, UserRole.CASHIER, UserRole.INVENTORY_CLERK],
  
  // Operations
  'pos': [UserRole.MANAGER, UserRole.CASHIER],
  'inventory': [UserRole.MANAGER, UserRole.INVENTORY_CLERK],
  'inventory-view': [UserRole.CASHIER], // For stock lookup
  'procurement': [UserRole.MANAGER, UserRole.INVENTORY_CLERK],
  
  // Management
  'hr': [UserRole.MANAGER],
  'crm': [UserRole.MANAGER, UserRole.CASHIER],
  'finance': [UserRole.MANAGER],
  
  // System Administration
  'admin-users': [UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN],
  'admin-roles': [UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN],
  'admin-roles-edit': [UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN], 
  'admin-security': [UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN],
  
  // Super Admin Only
  'admin-config': [UserRole.SUPER_ADMIN],
  'admin-db': [UserRole.SUPER_ADMIN],
};

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.MANAGER);
  const [activeView, setActiveView] = useState<string>('dashboard');

  // Handle Default Routes on Login/Role Change
  useEffect(() => {
    const baseView = activeView.split('|')[0];
    if (!isAllowed(baseView, currentRole)) {
        if (currentRole === UserRole.CASHIER) setActiveView('dashboard');
        else if (currentRole === UserRole.INVENTORY_CLERK) setActiveView('dashboard');
        else if (currentRole === UserRole.SUPER_ADMIN || currentRole === UserRole.SYSTEM_ADMIN) setActiveView('dashboard');
        else setActiveView('dashboard');
    }
  }, [currentRole]);

  const isAllowed = (view: string, role: UserRole): boolean => {
    const baseView = view.split('|')[0];
    const allowedRoles = PERMISSIONS[baseView as keyof typeof PERMISSIONS];
    return allowedRoles ? allowedRoles.includes(role) : false;
  };

  const handleLogin = (role?: UserRole) => {
    setIsLoggedIn(true);
    if (role) {
      setCurrentRole(role);
    }
  };

  const renderContent = () => {
    const baseView = activeView.split('|')[0];
    
    if (!isAllowed(baseView, currentRole)) {
      return <Unauthorized onBack={() => {
         setActiveView('dashboard');
      }} />;
    }

    switch (baseView) {
      case 'dashboard':
        return <Dashboard currentRole={currentRole} />;
      case 'pos':
        return <POS />;
      case 'inventory':
      case 'inventory-view':
        return <Inventory />;
      case 'hr':
        return <HR />;
      case 'procurement':
        return <Procurement />;
      case 'crm':
        return <CRM />;
      case 'finance':
        return <Finance />;
      case 'admin-users':
        return <UserManagement />;
      case 'admin-roles':
        return <RoleManagement onNavigate={setActiveView} />;
      case 'admin-roles-edit': {
        const roleName = activeView.split('|')[1] || 'Unknown';
        return <RolePermissionsEditor roleName={roleName} onBack={() => setActiveView('admin-roles')} />;
      }
      case 'admin-config':
        return <SystemConfig />;
      case 'admin-db':
        return <DatabaseAdmin />;
      case 'admin-security':
        return <Security />;
      default:
        return <Dashboard currentRole={currentRole} />;
    }
  };

  if (!isLoggedIn) {
    return (
      // Enforce light theme for the login page specifically, independent of user preference for the app
      <ThemeProvider defaultTheme="light" storageKey="tradematrix-auth-theme">
        <LoginPage onLogin={handleLogin} />
      </ThemeProvider>
    );
  }

  return (
    // Dashboard uses a persistent theme storage, defaulting to light
    <ThemeProvider defaultTheme="light" storageKey="tradematrix-theme">
      <DashboardLayout 
        currentRole={currentRole} 
        activeView={activeView} 
        onNavigate={setActiveView}
        onRoleChange={setCurrentRole}
        onLogout={() => setIsLoggedIn(false)}
      >
        {renderContent()}
      </DashboardLayout>
    </ThemeProvider>
  );
};

export default App;