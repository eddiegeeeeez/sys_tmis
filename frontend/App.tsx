import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserRole } from './types';
import { DashboardLayout } from './components/layouts/DashboardLayout';
import { LoginPage } from './features/auth/pages/LoginPage';
import { Unauthorized } from './components/common/Unauthorized';
import { ThemeProvider } from './components/providers/ThemeProvider';
import { ProtectedRoute } from './components/common/ProtectedRoute';

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

const App: React.FC = () => {
  // Simple auth state management - in a real app, use Context or Redux
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.MANAGER);

  const handleLogin = (role?: UserRole) => {
    setIsLoggedIn(true);
    if (role) {
      setCurrentRole(role);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="tradematrix-theme">
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            !isLoggedIn ? (
              <LoginPage onLogin={handleLogin} />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } />

          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute isLoggedIn={isLoggedIn} currentRole={currentRole}>
              <DashboardLayout
                currentRole={currentRole}
                onRoleChange={setCurrentRole}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />

            <Route path="dashboard" element={
              <ProtectedRoute
                isLoggedIn={isLoggedIn}
                currentRole={currentRole}
                allowedRoles={[UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.MANAGER, UserRole.CASHIER, UserRole.INVENTORY_CLERK]}
              >
                <Dashboard currentRole={currentRole} />
              </ProtectedRoute>
            } />

            <Route path="pos" element={
              <ProtectedRoute
                isLoggedIn={isLoggedIn}
                currentRole={currentRole}
                allowedRoles={[UserRole.MANAGER, UserRole.CASHIER]}
              >
                <POS />
              </ProtectedRoute>
            } />

            <Route path="inventory" element={
              <ProtectedRoute
                isLoggedIn={isLoggedIn}
                currentRole={currentRole}
                allowedRoles={[UserRole.MANAGER, UserRole.INVENTORY_CLERK, UserRole.CASHIER]}
              >
                <Inventory />
              </ProtectedRoute>
            } />

            <Route path="procurement" element={
              <ProtectedRoute
                isLoggedIn={isLoggedIn}
                currentRole={currentRole}
                allowedRoles={[UserRole.MANAGER, UserRole.INVENTORY_CLERK]}
              >
                <Procurement />
              </ProtectedRoute>
            } />

            <Route path="hr" element={
              <ProtectedRoute
                isLoggedIn={isLoggedIn}
                currentRole={currentRole}
                allowedRoles={[UserRole.MANAGER]}
              >
                <HR />
              </ProtectedRoute>
            } />

            <Route path="crm" element={
              <ProtectedRoute
                isLoggedIn={isLoggedIn}
                currentRole={currentRole}
                allowedRoles={[UserRole.MANAGER, UserRole.CASHIER]}
              >
                <CRM />
              </ProtectedRoute>
            } />

            <Route path="finance" element={
              <ProtectedRoute
                isLoggedIn={isLoggedIn}
                currentRole={currentRole}
                allowedRoles={[UserRole.MANAGER]}
              >
                <Finance />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="admin/users" element={
              <ProtectedRoute
                isLoggedIn={isLoggedIn}
                currentRole={currentRole}
                allowedRoles={[UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN]}
              >
                <UserManagement />
              </ProtectedRoute>
            } />

            <Route path="admin/roles" element={
              <ProtectedRoute
                isLoggedIn={isLoggedIn}
                currentRole={currentRole}
                allowedRoles={[UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN]}
              >
                {/* Navigate prop is now handled by Link in Sidebar, but component might still need update if it uses it internally */}
                <RoleManagement onNavigate={() => { }} />
              </ProtectedRoute>
            } />

            <Route path="admin/roles/edit/:roleName" element={
              <ProtectedRoute
                isLoggedIn={isLoggedIn}
                currentRole={currentRole}
                allowedRoles={[UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN]}
              >
                <RolePermissionsEditor roleName="User" onBack={() => { }} />
              </ProtectedRoute>
            } />

            <Route path="admin/config" element={
              <ProtectedRoute
                isLoggedIn={isLoggedIn}
                currentRole={currentRole}
                allowedRoles={[UserRole.SUPER_ADMIN]}
              >
                <SystemConfig />
              </ProtectedRoute>
            } />

            <Route path="admin/db" element={
              <ProtectedRoute
                isLoggedIn={isLoggedIn}
                currentRole={currentRole}
                allowedRoles={[UserRole.SUPER_ADMIN]}
              >
                <DatabaseAdmin />
              </ProtectedRoute>
            } />

            <Route path="admin/security" element={
              <ProtectedRoute
                isLoggedIn={isLoggedIn}
                currentRole={currentRole}
                allowedRoles={[UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN]}
              >
                <Security />
              </ProtectedRoute>
            } />

            <Route path="unauthorized" element={<Unauthorized onBack={() => { }} />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;