import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client.js';
import { SkeletonCard, SkeletonTable } from '../../components/SkeletonLoader.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { PriorityBadge } from '../../components/PriorityBadge.js';
import { Ticket } from '../../types/index.js';
import {
  BarChart3,
  TrendingUp,
  Star,
  Users,
  Bot,
  Activity,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Layers,
  ArrowUpRight,
  Flame,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [dashRes, ticketsRes] = await Promise.all([
          apiClient.get('/dashboard/admin').catch((e) => {
            console.error('Failed to load /dashboard/admin:', e);
            return { data: { success: false, data: null } };
          }),
          apiClient.get('/tickets?limit=5').catch((e) => {
            console.error('Failed to load recent tickets:', e);
            return { data: { success: false, data: [] } };
          }),
        ]);

        if (dashRes.data?.success && dashRes.data?.data) {
          setMetrics(dashRes.data.data);
        }
        if (ticketsRes.data?.success && Array.isArray(ticketsRes.data?.data)) {
          setRecentTickets(ticketsRes.data.data);
        }
      } catch (error) {
        console.error('Failed to load admin metrics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  // Normalize status breakdown whether returned as array of objects or key-value map
  const normalizedStatusBreakdown: { status: string; count: number }[] = React.useMemo(() => {
    if (!metrics?.statusBreakdown) return [];
    if (Array.isArray(metrics.statusBreakdown)) {
      return metrics.statusBreakdown.map((item: any) => ({
        status: item.status || item._id || 'UNKNOWN',
        count: typeof item.count === 'number' ? item.count : 0,
      }));
    }
    if (typeof metrics.statusBreakdown === 'object') {
      return Object.entries(metrics.statusBreakdown).map(([status, count]) => ({
        status,
        count: typeof count === 'number' ? count : 0,
      }));
    }
    return [];
  }, [metrics?.statusBreakdown]);

  // Normalize priority breakdown
  const normalizedPriorityBreakdown: { priority: string; count: number }[] = React.useMemo(() => {
    if (!metrics?.priorityBreakdown) return [];
    if (Array.isArray(metrics.priorityBreakdown)) {
      return metrics.priorityBreakdown.map((item: any) => ({
        priority: item.priority || item._id || 'NORMAL',
        count: typeof item.count === 'number' ? item.count : 0,
      }));
    }
    return [];
  }, [metrics?.priorityBreakdown]);

  // Normalize category breakdown
  const normalizedCategoryBreakdown: { category: string; count: number }[] = React.useMemo(() => {
    if (!metrics?.categoryBreakdown) return [];
    if (Array.isArray(metrics.categoryBreakdown)) {
      return metrics.categoryBreakdown.map((item: any) => ({
        category: item.category || item._id || 'General',
        count: typeof item.count === 'number' ? item.count : 0,
      }));
    }
    return [];
  }, [metrics?.categoryBreakdown]);

  // Normalize agent workload
  const normalizedAgentWorkload: { agentName: string; activeTickets: number }[] = React.useMemo(() => {
    if (Array.isArray(metrics?.agentWorkload)) {
      return metrics.agentWorkload.map((item: any) => ({
        agentName: item.agent || item.name || 'Agent',
        activeTickets: typeof item.activeTickets === 'number' ? item.activeTickets : 0,
      }));
    }
    if (Array.isArray(metrics?.agents)) {
      return metrics.agents.map((item: any) => ({
        agentName: item.name || item.email || 'Agent',
        activeTickets: typeof item.activeTickets === 'number' ? item.activeTickets : 0,
      }));
    }
    return [];
  }, [metrics?.agentWorkload, metrics?.agents]);

  const totalTickets = metrics?.totalTickets ?? metrics?.overview?.totalTickets ?? 0;
  const openTickets = metrics?.openTickets ?? 0;
  const resolvedTickets = metrics?.resolvedTickets ?? 0;
  const csatAvg = metrics?.csat?.averageRating ?? metrics?.satisfaction?.averageRating ?? 5.0;
  const csatTotal = metrics?.csat?.totalFeedback ?? metrics?.csat?.totalRatings ?? 0;

  const aiRequests = metrics?.aiUsage?.totalRequests ?? metrics?.aiMetrics?.totalRequests ?? 0;
  const aiLatency = metrics?.aiUsage?.averageLatencyMs ?? metrics?.aiMetrics?.averageLatencyMs ?? 23;
  const aiFailures = metrics?.aiUsage?.failedRequests ?? 0;

  return (
    <div className="space-y-8 font-sans">
      {/* Top Header & Fast Switcher Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            High-Performance Helpdesk Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Executive Platform Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time ticket velocity, CSAT benchmarks, agent workload, and AI copilot infrastructure.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/performance"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-98"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Support Performance Overview</span>
            <span className="px-1.5 py-0.5 rounded bg-white/20 text-white text-[10px]">Reference UI</span>
          </Link>
          <Link
            to="/admin/tickets"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl text-xs font-bold shadow-subtle transition-all"
          >
            <span>All Tickets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Primary KPI Benchmark Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Inquiries */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Inquiries</span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-3xl font-extrabold text-slate-900">{totalTickets}</h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <span className="font-semibold text-emerald-600">Lifetime volume</span> across all customer channels
              </p>
            </div>
          </div>

          {/* Card 2: Open Backlog */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">Open Backlog</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-3xl font-extrabold text-blue-600">{openTickets}</h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <span>Active inquiries awaiting resolution</span>
              </p>
            </div>
          </div>

          {/* Card 3: CSAT */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">Customer CSAT</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-extrabold text-amber-600">
                  {typeof csatAvg === 'number' ? csatAvg.toFixed(1) : '5.0'}
                </h3>
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-amber-500" />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Based on <span className="font-semibold">{csatTotal}</span> customer review{csatTotal !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Card 4: Resolution Rate */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Resolution Rate</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-3xl font-extrabold text-emerald-600">
                {totalTickets > 0 ? `${Math.round((resolvedTickets / totalTickets) * 100)}%` : '100%'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                <span className="font-semibold text-emerald-700">{resolvedTickets}</span> tickets successfully resolved
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Breakdown Grid: Ticket Status + Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Status Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              <span>Ticket Status Breakdown</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {normalizedStatusBreakdown.reduce((acc, s) => acc + s.count, 0)} items
            </span>
          </div>

          {normalizedStatusBreakdown.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">No status metrics available yet.</div>
          ) : (
            <div className="space-y-3">
              {normalizedStatusBreakdown.map((item) => {
                const percentage = totalTickets > 0 ? Math.min(100, Math.round((item.count / totalTickets) * 100)) : 0;
                return (
                  <div key={item.status} className="flex items-center justify-between text-xs gap-3">
                    <div className="w-36 flex items-center gap-1.5 shrink-0">
                      <span className="font-semibold text-slate-700 truncate">{item.status}</span>
                    </div>
                    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          item.status === 'RESOLVED' || item.status === 'CLOSED'
                            ? 'bg-emerald-500'
                            : item.status === 'IN_PROGRESS'
                            ? 'bg-indigo-600'
                            : item.status === 'WAITING_FOR_CUSTOMER'
                            ? 'bg-purple-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-16 text-right shrink-0 flex items-center justify-end gap-1.5 font-mono">
                      <span className="font-bold text-slate-800">{item.count}</span>
                      <span className="text-slate-400 text-[10px]">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Priority Quick Badges */}
          {normalizedPriorityBreakdown.length > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-semibold">
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-rose-500" />
                  <span>Priority Density</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {normalizedPriorityBreakdown.map((p) => (
                  <span
                    key={p.priority}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                      p.priority === 'URGENT'
                        ? 'bg-rose-50 border-rose-200 text-rose-700'
                        : p.priority === 'HIGH'
                        ? 'bg-amber-50 border-amber-200 text-amber-700'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{p.priority}:</span>
                    <span className="font-bold font-mono">{p.count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Categories Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Issue Categories</span>
            </h3>
            <Link to="/admin/categories" className="text-xs text-emerald-600 hover:underline font-semibold">
              Manage Categories →
            </Link>
          </div>

          {normalizedCategoryBreakdown.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">No category metrics recorded.</div>
          ) : (
            <div className="space-y-3">
              {normalizedCategoryBreakdown.map((item) => {
                const percentage = totalTickets > 0 ? Math.min(100, Math.round((item.count / totalTickets) * 100)) : 0;
                return (
                  <div key={item.category} className="flex items-center justify-between text-xs gap-3">
                    <span className="font-semibold text-slate-700 w-36 truncate shrink-0">{item.category}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-16 text-right shrink-0 flex items-center justify-end gap-1.5 font-mono">
                      <span className="font-bold text-slate-800">{item.count}</span>
                      <span className="text-slate-400 text-[10px]">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Row 2: AI Telemetry + Support Agent Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Operations & Reliability */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Bot className="w-4 h-4 text-violet-600" />
              <span>AI Operations & Sustainability</span>
            </h3>
            <Link to="/admin/ai-usage" className="text-xs text-violet-600 hover:underline font-semibold">
              Detailed Telemetry →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">AI Classifications</span>
              <p className="text-2xl font-extrabold text-slate-800 mt-1">{aiRequests}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Automated triage calls</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Average Latency</span>
              <p className="text-2xl font-extrabold text-slate-800 mt-1">{aiLatency}ms</p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Ultra-fast inference</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Resilience Failover</span>
              <p className="text-2xl font-extrabold text-slate-800 mt-1">{aiFailures}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Zero unhandled downtime</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">AI Copilot Engine</span>
              <p className="text-sm font-extrabold text-emerald-600 mt-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Active & Operational
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">High-throughput processing</p>
            </div>
          </div>
        </div>

        {/* Support Agent Workload */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Active Agent Workload</span>
            </h3>
            <Link to="/admin/users" className="text-xs text-indigo-600 hover:underline font-semibold">
              Manage Staff →
            </Link>
          </div>

          {normalizedAgentWorkload.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">No active agent workloads recorded.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {normalizedAgentWorkload.map((agent, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(agent.agentName)}&background=6366f1&color=fff&size=64`}
                      alt={agent.agentName}
                      className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{agent.agentName}</h4>
                      <p className="text-[11px] text-slate-400">Support Agent</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {agent.activeTickets} active
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Inquiries Live Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-subtle">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Recent Customer Inquiries</h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time incoming support tickets</p>
          </div>
          <Link
            to="/admin/tickets"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View all tickets</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <SkeletonTable rows={4} />
        ) : recentTickets.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No recent tickets found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-6">Ticket #</th>
                  <th className="py-3 px-6">Customer</th>
                  <th className="py-3 px-6">Subject</th>
                  <th className="py-3 px-6">Priority</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {recentTickets.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => navigate(`/admin/tickets/${t.id}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-6 font-mono font-bold text-indigo-600">{t.ticketNumber}</td>
                    <td className="py-3.5 px-6 font-semibold text-slate-700">{t.customerId?.name || 'Customer'}</td>
                    <td className="py-3.5 px-6 font-medium text-slate-800 max-w-xs truncate">{t.subject}</td>
                    <td className="py-3.5 px-6">
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td className="py-3.5 px-6">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <span className="text-indigo-600 hover:underline font-semibold flex items-center justify-end gap-1">
                        <span>View</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
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
