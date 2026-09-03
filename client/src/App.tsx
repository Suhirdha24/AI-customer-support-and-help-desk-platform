import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore.js';
import { AppLayout } from './layouts/AppLayout.js';
import { ToastContainer } from './components/ToastContainer.js';

// Auth Pages (Immediate load)
import { LoginPage } from './features/auth/LoginPage.js';
import { RegisterPage } from './features/auth/RegisterPage.js';

// Lazy Loaded Dashboard Pages
const CustomerDashboard = lazy(() => import('./features/dashboard/CustomerDashboard.js').then((m) => ({ default: m.CustomerDashboard })));
const AgentDashboard = lazy(() => import('./features/dashboard/AgentDashboard.js').then((m) => ({ default: m.AgentDashboard })));
const AdminDashboard = lazy(() => import('./features/dashboard/AdminDashboard.js').then((m) => ({ default: m.AdminDashboard })));
const SupportPerformanceOverview = lazy(() => import('./features/dashboard/SupportPerformanceOverview.js').then((m) => ({ default: m.SupportPerformanceOverview })));

// Lazy Loaded Ticket Pages
const TicketListPage = lazy(() => import('./features/tickets/TicketListPage.js').then((m) => ({ default: m.TicketListPage })));
const CreateTicketPage = lazy(() => import('./features/tickets/CreateTicketPage.js').then((m) => ({ default: m.CreateTicketPage })));
const TicketDetailPage = lazy(() => import('./features/tickets/TicketDetailPage.js').then((m) => ({ default: m.TicketDetailPage })));

// Lazy Loaded Knowledge Base
const KnowledgeBasePage = lazy(() => import('./features/knowledge-base/KnowledgeBasePage.js').then((m) => ({ default: m.KnowledgeBasePage })));

// Lazy Loaded Admin Management
const UserManagementPage = lazy(() => import('./features/admin/UserManagementPage.js').then((m) => ({ default: m.UserManagementPage })));
const CategoryManagementPage = lazy(() => import('./features/admin/CategoryManagementPage.js').then((m) => ({ default: m.CategoryManagementPage })));
const TeamManagementPage = lazy(() => import('./features/admin/TeamManagementPage.js').then((m) => ({ default: m.TeamManagementPage })));
const AuditLogsPage = lazy(() => import('./features/admin/AuditLogsPage.js').then((m) => ({ default: m.AuditLogsPage })));
const AIUsageLogsPage = lazy(() => import('./features/admin/AIUsageLogsPage.js').then((m) => ({ default: m.AIUsageLogsPage })));

const PageFallback: React.FC = () => (
  <div className="flex items-center justify-center p-12 min-h-[300px]">
    <div className="flex flex-col items-center gap-2 text-slate-400">
      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-medium">Loading view...</span>
    </div>
  </div>
);

export const App: React.FC = () => {
  const { user, isAuthenticated, fetchMe } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, []);

  const getDefaultRedirect = () => {
    if (!isAuthenticated || !user) return '/login';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'AGENT') return '/agent/dashboard';
    return '/customer/dashboard';
  };

  return (
    <>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Root redirect based on role */}
          <Route path="/" element={<Navigate to={getDefaultRedirect()} replace />} />

          {/* Customer Routes */}
          <Route element={<AppLayout allowedRoles={['CUSTOMER']} />}>
            <Route path="/customer/dashboard" element={<CustomerDashboard />} />
            <Route path="/customer/performance" element={<SupportPerformanceOverview />} />
            <Route path="/customer/tickets" element={<TicketListPage />} />
            <Route path="/customer/tickets/create" element={<CreateTicketPage />} />
            <Route path="/customer/tickets/:id" element={<TicketDetailPage />} />
            <Route path="/customer/knowledge-base" element={<KnowledgeBasePage />} />
          </Route>

          {/* Agent Routes */}
          <Route element={<AppLayout allowedRoles={['AGENT', 'ADMIN']} />}>
            <Route path="/agent/dashboard" element={<AgentDashboard />} />
            <Route path="/agent/performance" element={<SupportPerformanceOverview />} />
            <Route path="/performance" element={<SupportPerformanceOverview />} />
            <Route path="/agent/tickets" element={<TicketListPage />} />
            <Route path="/agent/tickets/:id" element={<TicketDetailPage />} />
            <Route path="/agent/knowledge-base" element={<KnowledgeBasePage />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<AppLayout allowedRoles={['ADMIN']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/performance" element={<SupportPerformanceOverview />} />
            <Route path="/admin/tickets" element={<TicketListPage />} />
            <Route path="/admin/tickets/:id" element={<TicketDetailPage />} />
            <Route path="/admin/users" element={<UserManagementPage />} />
            <Route path="/admin/agents" element={<AdminDashboard />} />
            <Route path="/admin/teams" element={<TeamManagementPage />} />
            <Route path="/admin/categories" element={<CategoryManagementPage />} />
            <Route path="/admin/knowledge-base" element={<KnowledgeBasePage />} />
            <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
            <Route path="/admin/ai-usage" element={<AIUsageLogsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to={getDefaultRedirect()} replace />} />
        </Routes>
      </Suspense>
      <ToastContainer />
    </>
  );
};
