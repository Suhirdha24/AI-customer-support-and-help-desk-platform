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
  Leaf,
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

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
              <Leaf className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight text-slate-900 flex items-center gap-1.5">
                NexusDesk
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Eco
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">Sustainable Helpdesk</p>
            </div>
          </div>
        </div>

        {/* Current Role Banner */}
        <div className="px-5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Portal Mode</span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isAdmin
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : isAgent
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {user?.role}
          </span>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          {/* Group 1: CORE / LIVE WORKSPACE */}
          <div>
            <div className="flex items-center justify-between px-3 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span>{isCustomer ? 'My Workspace' : 'Live Operations'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="space-y-1">
              <NavLink
                to={isAdmin ? '/admin/dashboard' : isAgent ? '/agent/dashboard' : '/customer/dashboard'}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <LayoutDashboard className="w-4 h-4 text-slate-500 shrink-0" />
                <span>{isCustomer ? 'Dashboard Overview' : 'Live Dashboard'}</span>
              </NavLink>

              <NavLink
                to={isAdmin ? '/admin/tickets' : isAgent ? '/agent/tickets' : '/customer/tickets'}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <TicketIcon className="w-4 h-4 text-slate-500 shrink-0" />
                <span>{isAdmin ? 'All Inquiries' : isAgent ? 'Tickets Queue' : 'My Support Tickets'}</span>
              </NavLink>

              {isCustomer && (
                <NavLink
                  to="/customer/tickets/create"
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <PlusCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Submit New Ticket</span>
                </NavLink>
              )}
            </div>
          </div>

          {/* Group 2: SUPPORT PERFORMANCE (The user's inspired view) */}
          <div>
            <div className="flex items-center justify-between px-3 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span>Performance & Analytics</span>
            </div>
            <div className="space-y-1">
              <NavLink
                to={isCustomer ? '/customer/performance' : '/performance'}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-bold shadow-subtle border border-emerald-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <BarChart3 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Performance Overview</span>
                <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                  Featured
                </span>
              </NavLink>

              {(isAdmin || isAgent) && (
                <NavLink
                  to="/admin/agents"
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Users className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Agent Workloads</span>
                </NavLink>
              )}
            </div>
          </div>

          {/* Group 3: KNOWLEDGE & HELP CENTER */}
          <div>
            <div className="flex items-center justify-between px-3 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span>Knowledge Base</span>
            </div>
            <div className="space-y-1">
              <NavLink
                to={isAdmin ? '/admin/knowledge-base' : '/customer/knowledge-base'}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <BookOpen className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Help Center & Articles</span>
              </NavLink>

              {isAdmin && (
                <NavLink
                  to="/admin/categories"
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Layers className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Ticket Categories</span>
                </NavLink>
              )}
            </div>
          </div>

          {/* Group 4: ADMIN CONTROLS & AI */}
          {isAdmin && (
            <div>
              <div className="flex items-center justify-between px-3 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <span>Platform Administration</span>
              </div>
              <div className="space-y-1">
                <NavLink
                  to="/admin/users"
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Users className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Users Directory</span>
                </NavLink>

                <NavLink
                  to="/admin/teams"
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Briefcase className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Support Teams</span>
                </NavLink>

                <NavLink
                  to="/admin/ai-usage"
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Bot className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>AI Telemetry & Copilot</span>
                </NavLink>

                <NavLink
                  to="/admin/audit-logs"
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Compliance Audit Trail</span>
                </NavLink>
              </div>
            </div>
          )}
        </div>

        {/* Eco Badge & User Card Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/70 space-y-3">
          {/* Carbon Conscious Pill */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80 shadow-subtle text-[11px]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-600 font-medium">Eco Footprint</span>
            </div>
            <span className="font-mono font-bold text-emerald-700">0.02g CO₂e</span>
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
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-400 capitalize">{user?.role?.toLowerCase()}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
