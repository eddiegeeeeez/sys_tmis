import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserRole } from './types';
import { DashboardLayout } from './components/layouts/DashboardLayout';
import { LoginPage } from './features/auth/pages/LoginPage';
import { Unauthorized } from './components/common/Unauthorized';
import { ThemeProvider, useTheme } from './components/providers/ThemeProvider';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { PageTitle } from './components/common/PageTitle';
import api from './lib/axios';

// Pages
import { Dashboard } from './features/dashboard/pages/Dashboard';
import { POS } from './features/pos/pages/POS';
import { SalesHistory } from './features/pos/pages/SalesHistory';
import { Inventory } from './features/inventory/pages/Inventory';
import { HR } from './features/hr/pages/HR';
import { Procurement } from './features/procurement/pages/Procurement';
import CRM from './features/crm/pages/CRM';
import Finance from './features/finance/pages/Finance';

// Admin Pages
import { UserManagement } from './features/admin/pages/UserManagement';
import { RoleManagement } from './features/admin/pages/RoleManagement';
import { RolePermissionsEditor } from './features/admin/pages/RolePermissionsEditor';
import { DatabaseAdmin } from './features/admin/pages/DatabaseAdmin';
import { Security } from './features/admin/pages/Security';
import { Archive } from './features/admin/pages/Archive';

// Inner component that lives inside ThemeProvider so it can access useTheme()
const AppContent: React.FC = () => {
  const { setTheme } = useTheme();

  // Initialize state from localStorage for instantaneous session restoration
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!localStorage.getItem('token'));
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        return userData.role || UserRole.MANAGER;
      } catch (e) {
        return UserRole.MANAGER;
      }
    }
    return UserRole.MANAGER;
  });
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  React.useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token) {
        try {
          // Verify token and get profile from real backend using standardized api client
          const response = await api.get('/auth/profile');

          if (response.status === 200) {
            const data = response.data;
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
          console.error("Auth check failed:", error);
          if ((error as any).response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsLoggedIn(false);
          } else if (savedUser) {
            try {
              const userData = JSON.parse(savedUser);
              setIsLoggedIn(true);
              setCurrentRole(userData.role || UserRole.MANAGER);
            } catch (e) {
              setIsLoggedIn(false);
            }
          } else {
            setIsLoggedIn(false);
          }
        }
      } else {
        setIsLoggedIn(false);
      }
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
    setIsLoggingOut(true);
    // Add a small delay for smoother transition
    setTimeout(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Reset theme to light so the login page always appears in light mode
      setTheme('light');
      setIsLoggedIn(false);
      setIsLoggingOut(false);
    }, 800);
  };

  return (
    <ErrorBoundary>
      <Router>
        <PageTitle />
        {isLoggingOut && (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm transition-all duration-300">
            <div className="flex flex-col items-center space-y-4">
              <div className="h-10 w-10 border-4 border-zinc-200 border-t-brand-600 rounded-full animate-spin dark:border-zinc-800 dark:border-t-brand-500" />
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Signing out safely...</p>
            </div>
          </div>
        )}
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
                  allowedRoles={[UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.CASHIER, UserRole.INVENTORY_CLERK]}
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

              <Route path="sales" element={
                <ProtectedRoute
                  isLoggedIn={isLoggedIn}
                  currentRole={currentRole}
                  allowedRoles={[UserRole.SUPER_ADMIN, UserRole.MANAGER]}
                >
                  <SalesHistory currentRole={currentRole} />
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
                  <CRM currentRole={currentRole} />
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

              {/* Super Admin Specific Routes */}
              <Route path="admin/db" element={
                <ProtectedRoute
                  isLoggedIn={isLoggedIn}
                  currentRole={currentRole}
                  allowedRoles={[UserRole.SUPER_ADMIN]}
                >
                  <DatabaseAdmin />
                </ProtectedRoute>
              } />

              {/* Shared or Role-Specific Admin Management Routes */}
              <Route path="admin/users" element={
                <ProtectedRoute
                  isLoggedIn={isLoggedIn}
                  currentRole={currentRole}
                  allowedRoles={[UserRole.SUPER_ADMIN]}
                >
                  <UserManagement />
                </ProtectedRoute>
              } />

              <Route path="admin/roles" element={
                <ProtectedRoute
                  isLoggedIn={isLoggedIn}
                  currentRole={currentRole}
                  allowedRoles={[UserRole.SUPER_ADMIN]}
                >
                  <RoleManagement />
                </ProtectedRoute>
              } />

              <Route path="admin/roles/edit/:roleName" element={
                <ProtectedRoute
                  isLoggedIn={isLoggedIn}
                  currentRole={currentRole}
                  allowedRoles={[UserRole.SUPER_ADMIN]}
                >
                  <RolePermissionsEditor />
                </ProtectedRoute>
              } />

              <Route path="admin/security" element={
                <ProtectedRoute
                  isLoggedIn={isLoggedIn}
                  currentRole={currentRole}
                  allowedRoles={[UserRole.SUPER_ADMIN]}
                >
                  <Security />
                </ProtectedRoute>
              } />

              <Route path="admin/archive" element={
                <ProtectedRoute
                  isLoggedIn={isLoggedIn}
                  currentRole={currentRole}
                  allowedRoles={[UserRole.SUPER_ADMIN]}
                >
                  <Archive />
                </ProtectedRoute>
              } />



              <Route path="unauthorized" element={<Unauthorized onBack={() => { }} />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </ErrorBoundary>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="tradematrix-theme">
      <AppContent />
    </ThemeProvider>
  );
};
export default App;