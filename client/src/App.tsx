import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore.js';
import { AppLayout } from './layouts/AppLayout.js';

// Auth Pages
import { LoginPage } from './features/auth/LoginPage.js';
import { RegisterPage } from './features/auth/RegisterPage.js';

// Dashboard Pages
import { CustomerDashboard } from './features/dashboard/CustomerDashboard.js';
import { AgentDashboard } from './features/dashboard/AgentDashboard.js';
import { AdminDashboard } from './features/dashboard/AdminDashboard.js';

// Ticket Pages
import { TicketListPage } from './features/tickets/TicketListPage.js';
import { CreateTicketPage } from './features/tickets/CreateTicketPage.js';
import { TicketDetailPage } from './features/tickets/TicketDetailPage.js';

// Knowledge Base
import { KnowledgeBasePage } from './features/knowledge-base/KnowledgeBasePage.js';

// Admin Management
import { UserManagementPage } from './features/admin/UserManagementPage.js';
import { CategoryManagementPage } from './features/admin/CategoryManagementPage.js';
import { TeamManagementPage } from './features/admin/TeamManagementPage.js';
import { AuditLogsPage } from './features/admin/AuditLogsPage.js';
import { AIUsageLogsPage } from './features/admin/AIUsageLogsPage.js';

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
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Root redirect based on role */}
      <Route path="/" element={<Navigate to={getDefaultRedirect()} replace />} />

      {/* Customer Routes */}
      <Route element={<AppLayout allowedRoles={['CUSTOMER']} />}>
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        <Route path="/customer/tickets" element={<TicketListPage />} />
        <Route path="/customer/tickets/create" element={<CreateTicketPage />} />
        <Route path="/customer/tickets/:id" element={<TicketDetailPage />} />
        <Route path="/customer/knowledge-base" element={<KnowledgeBasePage />} />
      </Route>

      {/* Agent Routes */}
      <Route element={<AppLayout allowedRoles={['AGENT', 'ADMIN']} />}>
        <Route path="/agent/dashboard" element={<AgentDashboard />} />
        <Route path="/agent/tickets" element={<TicketListPage />} />
        <Route path="/agent/tickets/:id" element={<TicketDetailPage />} />
        <Route path="/agent/knowledge-base" element={<KnowledgeBasePage />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<AppLayout allowedRoles={['ADMIN']} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
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
  );
};
