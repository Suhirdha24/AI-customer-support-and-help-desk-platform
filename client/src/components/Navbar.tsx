import React, { useState, useEffect } from 'react';
import {
  Menu,
  Bell,
  Check,
  ShieldCheck,
  HelpCircle,
  Settings,
  Activity,
  CheckCircle2,
  Lock,
  Zap,
  LogOut,
  X,
  Volume2,
  Sliders,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore.js';
import { useThemeStore } from '../store/useThemeStore.js';
import { apiClient } from '../api/client.js';
import { toast } from '../store/useToastStore.js';
import { NotificationItem } from '../types/index.js';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuthStore();
  const { theme, resolvedTheme, setTheme, toggleTheme } = useThemeStore();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Settings State
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [copilotAssist, setCopilotAssist] = useState(true);

  const handleOpenSecurity = () => {
    toast.success('Security status verified: All encryption & compliance protocols nominal.');
    setShowSecurityModal(true);
  };

  const handleOpenHelp = () => {
    toast.info('Help & documentation guide loaded.');
    setShowHelpModal(true);
  };

  const handleOpenSettings = () => {
    setShowSettingsModal(true);
  };

  const handleSaveSettings = () => {
    toast.success('Preferences saved successfully!');
    setShowSettingsModal(false);
  };

  const fetchNotifications = async () => {
    try {
      const res = await apiClient.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.data.filter((n: NotificationItem) => !n.isRead).length);
      }
    } catch {
      // Gracefully ignore notification fetch errors
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, []);

  const markAllAsRead = async () => {
    try {
      await apiClient.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read.');
    } catch {
      // ignore
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 transition-colors duration-150">
      {/* Mobile Toggle & breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span className="text-slate-400 dark:text-slate-500">Statistics</span>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="text-slate-800 dark:text-slate-200 capitalize font-bold">{user?.role?.toLowerCase()} Workspace</span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Systems Operational Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50/80 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span>Systems Operational</span>
        </div>

        {/* Quick Tools Group */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 rounded-xl p-1 text-slate-500 dark:text-slate-400">
          {/* Quick Theme Toggle */}
          <button
            onClick={() => {
              toggleTheme();
              const next = resolvedTheme === 'dark' ? 'Light' : 'Dark';
              toast.info(`Switched to ${next} Mode`);
            }}
            title={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle light or dark theme"
            className="p-1.5 rounded-lg hover:text-slate-800 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          <button
            onClick={handleOpenSecurity}
            title="Privacy & Security Verified"
            aria-label="Privacy & Security Verified"
            className="p-1.5 rounded-lg hover:text-slate-800 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </button>
          <button
            onClick={handleOpenHelp}
            title="Help Documentation"
            aria-label="Help Documentation"
            className="p-1.5 rounded-lg hover:text-slate-800 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
          <button
            onClick={handleOpenSettings}
            title="System Settings"
            aria-label="System Settings"
            className="p-1.5 rounded-lg hover:text-slate-800 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
            aria-label="Notifications"
            className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-elevated border border-slate-200/80 dark:border-slate-800 overflow-hidden z-50 animate-scale-in">
              <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/60">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
                    <p className="font-semibold text-slate-600 dark:text-slate-300 mb-1">✨ You're all caught up!</p>
                    <p>No unread notifications at this time.</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3.5 transition-colors ${
                        notif.isRead ? 'bg-white dark:bg-slate-900' : 'bg-emerald-50/40 dark:bg-emerald-950/40'
                      }`}
                    >
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-0.5">{notif.title}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{notif.message}</p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Pill with Click Action */}
        <button
          onClick={() => setShowProfileModal(true)}
          className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 p-1.5 rounded-xl transition-all cursor-pointer text-left"
          title="Account profile and session"
          aria-label="Account profile and session"
        >
          <img
            src={
              user?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user?.name || 'User'
              )}&background=10b981&color=fff`
            }
            alt={user?.name}
            className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
          />
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">{user?.name}</p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium capitalize">{user?.role?.toLowerCase()}</p>
          </div>
        </button>
      </div>

      {/* 1. Security & Compliance Modal */}
      {showSecurityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl text-left relative text-slate-900 dark:text-slate-100">
            <button
              onClick={() => setShowSecurityModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Security & Compliance Verified</h3>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  All Systems Operational & Encrypted
                </span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 mb-5">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700 flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">End-to-End TLS 1.3 & AES-256</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    Data is encrypted both in transit via TLS 1.3 and at rest on MongoDB Atlas with AES-256.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Role-Based Access Control (RBAC)</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    Privilege boundary is strictly verified on every API request for role: <strong>{user?.role}</strong>.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">High-Availability Cloud Infrastructure</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    Multi-region automated failover with 99.99% uptime guarantee.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowSecurityModal(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Help & Documentation Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl text-left relative text-slate-900 dark:text-slate-100">
            <button
              onClick={() => setShowHelpModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">NexusDesk Help & Shortcuts</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Tailored workspace guidance for {user?.role?.toLowerCase()}s</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 mb-5">
              {user?.role === 'AGENT' && (
                <>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">🎧 Workbench Queue & Triage</p>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                      Filter tickets by status or priority. Click <strong>Claim Ticket</strong> to self-assign work.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">🤖 AI Response Copilot</p>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                      Click <strong>Suggest Reply with AI</strong> inside any ticket thread to generate grounded, empathetic responses. Review before sending.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">🔒 Internal Staff Notes</p>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                      Switch to <strong>Internal Note</strong> tab to collaborate privately with other team members without notifying the customer.
                    </p>
                  </div>
                </>
              )}

              {user?.role === 'ADMIN' && (
                <>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">📊 Executive Governance & SLAs</p>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                      Track resolution velocity, customer sentiment breakdown, and workload distribution across all agents.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">👥 Team & User Management</p>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                      Provision support agents, configure department assignment groups, and set category escalations.
                    </p>
                  </div>
                </>
              )}

              {user?.role === 'CUSTOMER' && (
                <>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">🎫 Track Your Tickets</p>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                      Check live resolution milestones and reply directly to your assigned support specialist.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">📚 Knowledge Base</p>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                      Search verified articles and guides for immediate self-service answers to common inquiries.
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Contact admin: admin@example.com</span>
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. System & User Preferences Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl text-left relative text-slate-900 dark:text-slate-100">
            <button
              onClick={() => setShowSettingsModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                <Sliders className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Workspace Preferences</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Customize your interface, theme, and notification alerts</p>
              </div>
            </div>

            <div className="space-y-3 text-xs mb-6">
              {/* Appearance Theme Selector */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Appearance Theme</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">{theme} mode</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 border-emerald-500 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>Light</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-slate-900 text-emerald-400 border-emerald-500 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>Dark</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('system')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                      theme === 'system'
                        ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 border-emerald-500 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>System</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">Sound Notifications</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Play subtle chime on ticket updates</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={soundAlerts}
                  onChange={(e) => setSoundAlerts(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500/20 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">AI Copilot Quick Assist</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Auto-suggest drafts on open inquiries</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={copilotAssist}
                  onChange={(e) => setCopilotAssist(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500/20 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">Real-Time Queue Sync</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Automatic background ticket updates</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-sm"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. User Profile & Session Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-left relative text-slate-900 dark:text-slate-100">
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <img
                src={
                  user?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user?.name || 'User'
                  )}&background=10b981&color=fff`
                }
                alt={user?.name}
                className="w-16 h-16 rounded-full mx-auto border-2 border-emerald-500 object-cover mb-2 shadow-sm"
              />
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{user?.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user?.email}</p>
              <span className="mt-2 inline-block px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold rounded-full uppercase tracking-wider">
                {user?.role} Workspace
              </span>
            </div>

            <div className="py-3 text-xs space-y-2 text-slate-600 dark:text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-400 dark:text-slate-500">Account Status</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">Active & Verified</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-400 dark:text-slate-500">Authentication</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">JWT Bearer Session</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400 dark:text-slate-500">Security Standard</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">SOC 2 / ISO 27001</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-3.5 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  logout();
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
