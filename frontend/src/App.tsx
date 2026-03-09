import React, { useState, Suspense } from 'react';
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
import { LoadingScreen } from './components/common/LoadingScreen';

// Pages — lazy-loaded so each route becomes its own JS chunk
const Dashboard             = React.lazy(() => import('./features/dashboard/pages/Dashboard').then(m => ({ default: m.Dashboard })));
const POS                   = React.lazy(() => import('./features/pos/pages/POS').then(m => ({ default: m.POS })));
const SalesHistory          = React.lazy(() => import('./features/pos/pages/SalesHistory').then(m => ({ default: m.SalesHistory })));
const Inventory             = React.lazy(() => import('./features/inventory/pages/Inventory').then(m => ({ default: m.Inventory })));
const HR                    = React.lazy(() => import('./features/hr/pages/HR').then(m => ({ default: m.HR })));
const Procurement           = React.lazy(() => import('./features/procurement/pages/Procurement').then(m => ({ default: m.Procurement })));
const CRM                   = React.lazy(() => import('./features/crm/pages/CRM'));
const Finance               = React.lazy(() => import('./features/finance/pages/Finance'));
const Reports               = React.lazy(() => import('./features/reports/pages/Reports'));

// Admin Pages — lazy-loaded (SuperAdmin-only routes)
const UserManagement        = React.lazy(() => import('./features/admin/pages/UserManagement').then(m => ({ default: m.UserManagement })));
const RoleManagement        = React.lazy(() => import('./features/admin/pages/RoleManagement').then(m => ({ default: m.RoleManagement })));
const RolePermissionsEditor = React.lazy(() => import('./features/admin/pages/RolePermissionsEditor').then(m => ({ default: m.RolePermissionsEditor })));
const DatabaseAdmin         = React.lazy(() => import('./features/admin/pages/DatabaseAdmin').then(m => ({ default: m.DatabaseAdmin })));
const Security              = React.lazy(() => import('./features/admin/pages/Security').then(m => ({ default: m.Security })));
const Archive               = React.lazy(() => import('./features/admin/pages/Archive').then(m => ({ default: m.Archive })));

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
  const [isLoginTransition, setIsLoginTransition] = useState(false);

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
    setIsLoginTransition(true);
    setIsLoggedIn(true);
    if (role) {
      setCurrentRole(role);
    }
    setTimeout(() => setIsLoginTransition(false), 700);
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
        {isLoginTransition && (
          <LoadingScreen message="Welcome back!" subMessage="Preparing your workspace..." />
        )}
        {isLoggingOut && (
          <LoadingScreen message="Signing out safely..." />
        )}
        <Suspense fallback={<LoadingScreen message="Loading..." />}>
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
                  allowedRoles={[UserRole.MANAGER]}
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
                  <Inventory currentRole={currentRole} />
                </ProtectedRoute>
              } />

              <Route path="procurement" element={
                <ProtectedRoute
                  isLoggedIn={isLoggedIn}
                  currentRole={currentRole}
                  allowedRoles={[UserRole.MANAGER, UserRole.INVENTORY_CLERK]}
                >
                  <Procurement currentRole={currentRole} />
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

              <Route path="reports" element={
                <ProtectedRoute
                  isLoggedIn={isLoggedIn}
                  currentRole={currentRole}
                  allowedRoles={[UserRole.SUPER_ADMIN, UserRole.MANAGER]}
                >
                  <Reports />
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
        </Suspense>
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