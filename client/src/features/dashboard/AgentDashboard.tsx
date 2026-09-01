import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client.js';
import { useAuthStore } from '../../store/useAuthStore.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { PriorityBadge } from '../../components/PriorityBadge.js';
import { SkeletonCard, SkeletonTable } from '../../components/SkeletonLoader.js';
import { EmptyState } from '../../components/EmptyState.js';
import { toast } from '../../store/useToastStore.js';
import { Ticket } from '../../types/index.js';
import { Inbox, Flame, UserCheck, CheckCircle2, Hand, Clock, ArrowRight } from 'lucide-react';

export const AgentDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'my' | 'unassigned' | 'urgent'>('my');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashRes, ticketsRes] = await Promise.all([
        apiClient.get('/dashboard/agent'),
        apiClient.get(`/tickets?${activeTab === 'unassigned' ? 'unassigned=true' : activeTab === 'urgent' ? 'priority=URGENT' : `assignedAgentId=${user?.id}`}&limit=10`),
      ]);

      if (dashRes.data.success) {
        setMetrics(dashRes.data.data);
      }
      if (ticketsRes.data.success) {
        setTickets(ticketsRes.data.data);
      }
    } catch (error) {
      console.error('Failed to load agent dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  const handleClaimTicket = async (e: React.MouseEvent, ticketId: string) => {
    e.stopPropagation();
    try {
      const res = await apiClient.post(`/tickets/${ticketId}/claim`);
      if (res.data.success) {
        toast.success('Ticket claimed successfully!');
        fetchDashboardData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to claim ticket.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Support Operations</span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Support Agent Workspace
          </h2>
          <p className="text-sm text-slate-500">
            Monitor and resolve active support inquiries, review AI suggestions, and collaborate via internal notes.
          </p>
        </div>

        <button
          onClick={() => navigate('/agent/tickets')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors shrink-0"
        >
          <span>Full Ticket Queue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Metrics Row */}
      {loading && !metrics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div
            onClick={() => setActiveTab('my')}
            className={`cursor-pointer bg-white border rounded-2xl p-5 shadow-subtle transition-all ${
              activeTab === 'my' ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">My Assigned</p>
            <div className="flex items-center justify-between mt-1">
              <h3 className="text-2xl font-extrabold text-slate-900">{metrics?.myAssignedTickets || 0}</h3>
              <UserCheck className="w-5 h-5 text-indigo-500" />
            </div>
          </div>

          <div
            onClick={() => setActiveTab('unassigned')}
            className={`cursor-pointer bg-white border rounded-2xl p-5 shadow-subtle transition-all ${
              activeTab === 'unassigned' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Unassigned Pool</p>
            <div className="flex items-center justify-between mt-1">
              <h3 className="text-2xl font-extrabold text-slate-900">{metrics?.unassignedTickets || 0}</h3>
              <Inbox className="w-5 h-5 text-amber-500" />
            </div>
          </div>

          <div
            onClick={() => setActiveTab('urgent')}
            className={`cursor-pointer bg-white border rounded-2xl p-5 shadow-subtle transition-all ${
              activeTab === 'urgent' ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-red-600">Urgent Tickets</p>
            <div className="flex items-center justify-between mt-1">
              <h3 className="text-2xl font-extrabold text-red-600">{metrics?.urgentTickets || 0}</h3>
              <Flame className="w-5 h-5 text-red-500" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle">
            <p className="text-xs font-semibold uppercase tracking-wider text-purple-600">Waiting on Customer</p>
            <div className="flex items-center justify-between mt-1">
              <h3 className="text-2xl font-extrabold text-slate-900">{metrics?.waitingCustomerTickets || 0}</h3>
              <Clock className="w-5 h-5 text-purple-500" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Resolved Today</p>
            <div className="flex items-center justify-between mt-1">
              <h3 className="text-2xl font-extrabold text-emerald-600">{metrics?.resolvedToday || 0}</h3>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs and Actionable Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-subtle">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('my')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'my'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              My Queue
            </button>
            <button
              onClick={() => setActiveTab('unassigned')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'unassigned'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Unassigned Pool
            </button>
            <button
              onClick={() => setActiveTab('urgent')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'urgent'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Urgent Priority
            </button>
          </div>

          <span className="text-xs font-medium text-slate-400">
            Showing {tickets.length} tickets
          </span>
        </div>

        {loading ? (
          <SkeletonTable rows={5} />
        ) : tickets.length === 0 ? (
          <EmptyState
            title="No tickets in this queue"
            description="All tickets matching this filter have been handled or assigned."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Ticket ID</th>
                  <th className="py-3.5 px-6">Customer</th>
                  <th className="py-3.5 px-6">Subject</th>
                  <th className="py-3.5 px-6">Priority</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">AI Confidence</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => navigate(`/agent/tickets/${ticket.id}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-6 font-mono text-xs font-bold text-indigo-600">
                      {ticket.ticketNumber}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-800 text-xs">{ticket.customerId?.name || 'Customer'}</p>
                      <p className="text-[11px] text-slate-400">{ticket.customerId?.email}</p>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-800 max-w-xs truncate">
                      {ticket.subject}
                    </td>
                    <td className="py-4 px-6">
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="py-4 px-6">
                      {ticket.aiAnalysisId ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          {Math.round(ticket.aiAnalysisId.confidence * 100)}%
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Processing...</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {!ticket.assignedAgentId ? (
                        <button
                          onClick={(e) => handleClaimTicket(e, ticket.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
                        >
                          <Hand className="w-3.5 h-3.5" />
                          <span>Claim</span>
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                          Open →
                        </span>
                      )}
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
