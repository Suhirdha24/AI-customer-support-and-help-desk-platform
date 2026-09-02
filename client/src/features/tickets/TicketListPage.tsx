import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { apiClient } from '../../api/client.js';
import { useAuthStore } from '../../store/useAuthStore.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { PriorityBadge } from '../../components/PriorityBadge.js';
import { SkeletonTable } from '../../components/SkeletonLoader.js';
import { EmptyState } from '../../components/EmptyState.js';
import { Ticket, Category, Pagination } from '../../types/index.js';
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const TicketListPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();


  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [priority, setPriority] = useState(searchParams.get('priority') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  // Fetch categories for filter dropdown
  useEffect(() => {
    apiClient.get('/admin/categories').then((res) => {
      if (res.data.success) setCategories(res.data.data);
    });
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      if (priority) params.set('priority', priority);
      if (categoryId) params.set('categoryId', categoryId);
      params.set('page', String(page));
      params.set('limit', '10');

      const res = await apiClient.get(`/tickets?${params.toString()}`);
      if (res.data?.success) {
        setTickets(Array.isArray(res.data.data) ? res.data.data : []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [page, status, priority, categoryId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTickets();
  };

  const getTicketDetailPath = (id: string) => {
    if (user?.role === 'ADMIN') return `/admin/tickets/${id}`;
    if (user?.role === 'AGENT') return `/agent/tickets/${id}`;
    return `/customer/tickets/${id}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {user?.role === 'CUSTOMER' ? 'My Support Tickets' : 'Ticket Helpdesk Queue'}
          </h2>
          <p className="text-sm text-slate-500">
            {user?.role === 'CUSTOMER'
              ? 'View, track, and reply to all your open and resolved requests.'
              : 'Enterprise multi-tier queue with AI triaging, classification, and assignment.'}
          </p>
        </div>

        {user?.role === 'CUSTOMER' && (
          <Link
            to="/customer/tickets/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Ticket</span>
          </Link>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-subtle flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets by subject, description, or #TKT-ID..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 transition-all"
          />
        </form>

        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Status filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="WAITING_FOR_CUSTOMER">Waiting for Customer</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
            <option value="REOPENED">Reopened</option>
          </select>

          {/* Priority filter */}
          <select
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          {/* Category filter */}
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ticket Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-subtle">
        {loading ? (
          <SkeletonTable rows={8} />
        ) : tickets.length === 0 ? (
          <EmptyState
            title="No tickets found"
            description="No support tickets matched your current search filters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Ticket ID</th>
                  {user?.role !== 'CUSTOMER' && <th className="py-3.5 px-6">Customer</th>}
                  <th className="py-3.5 px-6">Subject</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Priority</th>
                  <th className="py-3.5 px-6">Status</th>
                  {user?.role !== 'CUSTOMER' && <th className="py-3.5 px-6">Assignee</th>}
                  <th className="py-3.5 px-6 text-right">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => navigate(getTicketDetailPath(ticket.id))}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-6 font-mono text-xs font-bold text-indigo-600 whitespace-nowrap">
                      {ticket.ticketNumber}
                    </td>

                    {user?.role !== 'CUSTOMER' && (
                      <td className="py-4 px-6 whitespace-nowrap">
                        <p className="font-semibold text-slate-800 text-xs">{ticket.customerId?.name || 'Customer'}</p>
                        <p className="text-[11px] text-slate-400">{ticket.customerId?.email}</p>
                      </td>
                    )}

                    <td className="py-4 px-6 font-medium text-slate-800 max-w-xs truncate">
                      {ticket.subject}
                    </td>

                    <td className="py-4 px-6 text-slate-500 text-xs font-medium whitespace-nowrap">
                      {ticket.categoryId?.name || 'General'}
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <PriorityBadge priority={ticket.priority} />
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <StatusBadge status={ticket.status} />
                    </td>

                    {user?.role !== 'CUSTOMER' && (
                      <td className="py-4 px-6 whitespace-nowrap">
                        {ticket.assignedAgentId ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={
                                ticket.assignedAgentId.avatar ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(ticket.assignedAgentId.name)}&background=6366f1&color=fff`
                              }
                              alt={ticket.assignedAgentId.name}
                              className="w-6 h-6 rounded-full object-cover border"
                            />
                            <span className="text-xs text-slate-700 font-medium">
                              {ticket.assignedAgentId.name.split(' ')[0]}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Unassigned
                          </span>
                        )}
                      </td>
                    )}

                    <td className="py-4 px-6 text-right text-xs text-slate-400 font-medium whitespace-nowrap">
                      {new Date(ticket.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total tickets)
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPreviousPage}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={!pagination.hasNextPage}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
