import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client.js';
import { useAuthStore } from '../../store/useAuthStore.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { PriorityBadge } from '../../components/PriorityBadge.js';
import { SkeletonCard, SkeletonTable } from '../../components/SkeletonLoader.js';
import { EmptyState } from '../../components/EmptyState.js';
import { Ticket } from '../../types/index.js';
import { Plus, Ticket as TicketIcon, Clock, CheckCircle2, Search, ArrowRight, BookOpen } from 'lucide-react';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<any>(null);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashRes, ticketsRes] = await Promise.all([
          apiClient.get('/dashboard/customer'),
          apiClient.get('/tickets?limit=5'),
        ]);

        if (dashRes.data.success) {
          setMetrics(dashRes.data.data);
        }
        if (ticketsRes.data.success) {
          setRecentTickets(ticketsRes.data.data);
        }
      } catch (error) {
        console.error('Failed to load customer dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/customer/knowledge-base?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-card flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Customer Help Center</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Hello, {user?.name.split(' ')[0]} 👋
          </h2>
          <p className="text-sm text-indigo-200 mt-1 max-w-xl">
            Have a question or running into an issue? Search our instant knowledge base or submit a ticket to our support team.
          </p>
        </div>

        <Link
          to="/customer/tickets/create"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-indigo-900 font-bold text-sm shadow-md hover:bg-indigo-50 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Support Ticket</span>
        </Link>
      </div>

      {/* KB Search Hero */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <span>Instant Knowledge Base Search</span>
        </h3>
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help articles (e.g. 'webhook failure', 'billing refund', 'API keys')..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Metrics Row */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Tickets</p>
              <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{metrics?.totalTickets || 0}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <TicketIcon className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">Active / In Queue</p>
              <h3 className="text-2xl font-extrabold text-blue-600 mt-1">{metrics?.openTickets || 0}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-500">In Progress</p>
              <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{metrics?.inProgressTickets || 0}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500">Resolved</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{metrics?.resolvedTickets || 0}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Recent Tickets Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-subtle">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Your Recent Tickets</h3>
            <p className="text-xs text-slate-400 mt-0.5">Tickets you have submitted to the helpdesk</p>
          </div>
          <Link
            to="/customer/tickets"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <SkeletonTable rows={4} />
        ) : recentTickets.length === 0 ? (
          <EmptyState
            title="No tickets submitted yet"
            description="When you run into an issue or have an inquiry, create a support ticket to start receiving help."
            action={{
              label: 'Submit First Ticket',
              onClick: () => navigate('/customer/tickets/create'),
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Ticket ID</th>
                  <th className="py-3.5 px-6">Subject</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Priority</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {recentTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => navigate(`/customer/tickets/${ticket.id}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-6 font-mono text-xs font-bold text-indigo-600">
                      {ticket.ticketNumber}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800 max-w-xs truncate">
                      {ticket.subject}
                    </td>
                    <td className="py-4 px-6 text-slate-500 text-xs font-medium">
                      {ticket.categoryId?.name || 'General'}
                    </td>
                    <td className="py-4 px-6">
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="py-4 px-6 text-right text-xs text-slate-400 font-medium">
                      {new Date(ticket.updatedAt).toLocaleDateString()}
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
