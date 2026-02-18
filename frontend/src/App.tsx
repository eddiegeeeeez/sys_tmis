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
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token) {
        // If it's a demo token (starts with demo_), restore from localStorage immediately
        if (token.startsWith('demo_') && savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            setIsLoggedIn(true);
            setCurrentRole(userData.role || UserRole.MANAGER);
            setIsLoading(false);
            return;
          } catch (e) {
            console.error("Failed to parse saved user", e);
          }
        }

        try {
          // Verify token and get profile from real backend
          const response = await fetch('/api/auth/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.ok) {
            const data = await response.json();
            setIsLoggedIn(true);
            setCurrentRole(data.role || UserRole.MANAGER);

            // Sync localStorage user data
            localStorage.setItem('user', JSON.stringify({
              name: data.name,
              role: data.role,
              email: data.email
            }));
          } else {
            // Token invalid or expired
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsLoggedIn(false);
          }
        } catch (error) {
          console.error("Auth check failed", error);
          // If offline but we have a saved user, maybe maintain session? 
          // For now, let's stick to cleaning up on error.
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsLoggedIn(false);
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogin = (role?: UserRole) => {
    setIsLoggedIn(true);
    if (role) {
      setCurrentRole(role);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

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
                <RolePermissionsEditor />
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