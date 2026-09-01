import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client.js';
import { toast } from '../../store/useToastStore.js';
import { SkeletonTable } from '../../components/SkeletonLoader.js';
import { User, UserRole } from '../../types/index.js';
import { Search, Ban, Check } from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`);
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const res = await apiClient.patch(`/admin/users/${userId}/role`, { role: newRole });
      if (res.data.success) {
        toast.success(`User role updated to ${newRole}`);
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to update user role');
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await apiClient.patch(`/admin/users/${userId}/status`, { isActive: !currentStatus });
      if (res.data.success) {
        toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'}`);
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isActive: !currentStatus } : u)));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-rose-600">User Administration</span>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
          User Directory & Access Controls
        </h2>
        <p className="text-sm text-slate-500">
          Manage system users, customer accounts, and enforce role-based access privileges.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-subtle">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user name or email..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-subtle">
        {loading ? (
          <SkeletonTable rows={6} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-6">Email Address</th>
                  <th className="py-3.5 px-6">Assigned Role</th>
                  <th className="py-3.5 px-6">Account Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            u.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=6366f1&color=fff`
                          }
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <span className="font-semibold text-slate-900 text-xs">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">{u.email}</td>
                    <td className="py-4 px-6">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="CUSTOMER">Customer</option>
                        <option value="AGENT">Support Agent</option>
                        <option value="ADMIN">Administrator</option>
                      </select>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                          u.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {u.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleStatusToggle(u.id, u.isActive)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                          u.isActive
                            ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                            : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {u.isActive ? <Ban className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                        <span>{u.isActive ? 'Deactivate' : 'Activate'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
