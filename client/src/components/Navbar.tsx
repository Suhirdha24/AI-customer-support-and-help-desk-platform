import React, { useState, useEffect } from 'react';
import { Menu, Bell, Check } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore.js';
import { apiClient } from '../api/client.js';
import { NotificationItem } from '../types/index.js';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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
    } catch {
      // ignore
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Mobile Toggle & breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span>OmniSupport</span>
          <span>/</span>
          <span className="text-slate-800 capitalize">{user?.role?.toLowerCase()} Portal</span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* System Health Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>AI Engine Active</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-elevated border border-slate-100 overflow-hidden z-50 animate-scale-in">
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">No notifications yet</div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3.5 transition-colors ${
                        notif.isRead ? 'bg-white' : 'bg-indigo-50/40'
                      }`}
                    >
                      <p className="text-xs font-bold text-slate-800 mb-0.5">{notif.title}</p>
                      <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <img
            src={
              user?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user?.name || 'User'
              )}&background=6366f1&color=fff`
            }
            alt={user?.name}
            className="w-8 h-8 rounded-full border border-slate-200 object-cover"
          />
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight">{user?.name}</p>
            <p className="text-[11px] text-slate-500 font-medium">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
