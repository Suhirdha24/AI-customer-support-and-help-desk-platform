import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore.js';
import {
  LayoutDashboard,
  Ticket as TicketIcon,
  PlusCircle,
  BookOpen,
  Users,
  Shield,
  Briefcase,
  Layers,
  Bot,
  FileText,
  LogOut,
  Sparkles,
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

  const customerNav = [
    { label: 'Dashboard', to: '/customer/dashboard', icon: LayoutDashboard },
    { label: 'My Tickets', to: '/customer/tickets', icon: TicketIcon },
    { label: 'Create Ticket', to: '/customer/tickets/create', icon: PlusCircle },
    { label: 'Knowledge Base', to: '/customer/knowledge-base', icon: BookOpen },
  ];

  const agentNav = [
    { label: 'Agent Dashboard', to: '/agent/dashboard', icon: LayoutDashboard },
    { label: 'Ticket Queue', to: '/agent/tickets', icon: TicketIcon },
    { label: 'Knowledge Base', to: '/customer/knowledge-base', icon: BookOpen },
  ];

  const adminNav = [
    { label: 'Analytics Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'All Tickets', to: '/admin/tickets', icon: TicketIcon },
    { label: 'Users Directory', to: '/admin/users', icon: Users },
    { label: 'Agent Workloads', to: '/admin/agents', icon: Shield },
    { label: 'Support Teams', to: '/admin/teams', icon: Briefcase },
    { label: 'Ticket Categories', to: '/admin/categories', icon: Layers },
    { label: 'Knowledge Base', to: '/admin/knowledge-base', icon: BookOpen },
    { label: 'AI Telemetry', to: '/admin/ai-usage', icon: Bot },
    { label: 'Audit Trail', to: '/admin/audit-logs', icon: FileText },
  ];

  const navLinks =
    user?.role === 'ADMIN'
      ? adminNav
      : user?.role === 'AGENT'
      ? agentNav
      : customerNav;

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
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
              NexusDesk <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">AI</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Enterprise Helpdesk</p>
          </div>
        </div>

        {/* Role Pill Banner */}
        <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Role</span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                user?.role === 'ADMIN'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : user?.role === 'AGENT'
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {user?.role}
            </span>
          </div>
        </div>

        {/* Nav list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Info & Logout footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={
                user?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.name || 'User'
                )}&background=6366f1&color=fff`
              }
              alt={user?.name}
              className="w-9 h-9 rounded-full object-cover border border-slate-700"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};
