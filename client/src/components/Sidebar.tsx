import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore.js';
import {
  LayoutDashboard,
  Ticket as TicketIcon,
  PlusCircle,
  BookOpen,
  Users,
  Briefcase,
  Layers,
  Bot,
  FileText,
  LogOut,
  Headphones,
  BarChart3,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'ADMIN';
  const isAgent = user?.role === 'AGENT';
  const isCustomer = user?.role === 'CUSTOMER';

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
      isActive
        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-xs'
        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
    }`;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-600/20">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                NexusDesk
              </h1>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Customer Support</p>
            </div>
          </div>
        </div>

        {/* Current Role Banner */}
        <div className="px-5 py-2.5 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Portal Mode</span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isAdmin
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                : isAgent
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900'
                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'
            }`}
          >
            {user?.role}
          </span>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          {/* Group 1: CORE / LIVE WORKSPACE */}
          <div>
            <div className="flex items-center justify-between px-3 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <span>{isCustomer ? 'My Workspace' : 'Live Operations'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="space-y-1">
              <NavLink
                to={isAdmin ? '/admin/dashboard' : isAgent ? '/agent/dashboard' : '/customer/dashboard'}
                onClick={onCloseMobile}
                className={navLinkClass}
              >
                <LayoutDashboard className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                <span>{isCustomer ? 'Dashboard Overview' : 'Live Dashboard'}</span>
              </NavLink>

              <NavLink
                to={isAdmin ? '/admin/tickets' : isAgent ? '/agent/tickets' : '/customer/tickets'}
                onClick={onCloseMobile}
                className={navLinkClass}
              >
                <TicketIcon className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                <span>{isAdmin ? 'All Inquiries' : isAgent ? 'Tickets Queue' : 'My Support Tickets'}</span>
              </NavLink>

              {isCustomer && (
                <NavLink
                  to="/customer/tickets/create"
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`
                  }
                >
                  <PlusCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Submit New Ticket</span>
                </NavLink>
              )}
            </div>
          </div>

          {/* Group 2: SUPPORT PERFORMANCE */}
          <div>
            <div className="flex items-center justify-between px-3 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <span>Performance & Analytics</span>
            </div>
            <div className="space-y-1">
              <NavLink
                to={isCustomer ? '/customer/performance' : '/performance'}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold shadow-subtle border border-emerald-200/80 dark:border-emerald-800'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`
                }
              >
                <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Performance Overview</span>
                <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                  Featured
                </span>
              </NavLink>

              {(isAdmin || isAgent) && (
                <NavLink
                  to={isAdmin ? '/admin/performance' : '/agent/performance'}
                  onClick={onCloseMobile}
                  className={navLinkClass}
                >
                  <Users className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                  <span>Agent Workloads</span>
                </NavLink>
              )}
            </div>
          </div>

          {/* Group 3: KNOWLEDGE & HELP CENTER */}
          <div>
            <div className="flex items-center justify-between px-3 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <span>Knowledge Base</span>
            </div>
            <div className="space-y-1">
              <NavLink
                to={isAdmin ? '/admin/knowledge-base' : isAgent ? '/agent/knowledge-base' : '/customer/knowledge-base'}
                onClick={onCloseMobile}
                className={navLinkClass}
              >
                <BookOpen className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                <span>Help Center & Articles</span>
              </NavLink>

              {isAdmin && (
                <NavLink
                  to="/admin/categories"
                  onClick={onCloseMobile}
                  className={navLinkClass}
                >
                  <Layers className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                  <span>Ticket Categories</span>
                </NavLink>
              )}
            </div>
          </div>

          {/* Group 4: ADMIN CONTROLS & AI */}
          {isAdmin && (
            <div>
              <div className="flex items-center justify-between px-3 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <span>Platform Administration</span>
              </div>
              <div className="space-y-1">
                <NavLink
                  to="/admin/users"
                  onClick={onCloseMobile}
                  className={navLinkClass}
                >
                  <Users className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                  <span>Users Directory</span>
                </NavLink>

                <NavLink
                  to="/admin/teams"
                  onClick={onCloseMobile}
                  className={navLinkClass}
                >
                  <Briefcase className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                  <span>Support Teams</span>
                </NavLink>

                <NavLink
                  to="/admin/ai-usage"
                  onClick={onCloseMobile}
                  className={navLinkClass}
                >
                  <Bot className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                  <span>AI Telemetry & Copilot</span>
                </NavLink>

                <NavLink
                  to="/admin/audit-logs"
                  onClick={onCloseMobile}
                  className={navLinkClass}
                >
                  <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                  <span>Compliance Audit Trail</span>
                </NavLink>
              </div>
            </div>
          )}
        </div>

        {/* System Status & User Card Footer */}
        <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 space-y-3">
          {/* Operational Status Pill */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-subtle text-[11px]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">System Status</span>
            </div>
            <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">Operational</span>
          </div>

          {/* User profile */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={
                  user?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user?.name || 'User'
                  )}&background=10b981&color=fff`
                }
                alt={user?.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">{user?.role?.toLowerCase()}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              aria-label="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
