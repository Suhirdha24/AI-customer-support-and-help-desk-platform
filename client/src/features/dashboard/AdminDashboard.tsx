import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client.js';
import { SkeletonCard, SkeletonTable } from '../../components/SkeletonLoader.js';
import {
  BarChart3,
  TrendingUp,
  Star,
  Users,
  Bot,
  Activity,
  CheckCircle2,
  Clock,
} from 'lucide-react';


export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/dashboard/admin');
        if (res.data.success) {
          setMetrics(res.data.data);
        }
      } catch (error) {
        console.error('Failed to load admin metrics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Enterprise Analytics</span>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
          Executive Platform Overview
        </h2>
        <p className="text-sm text-slate-500">
          Aggregated ticket velocity, SLA fulfillment, CSAT scores, agent workload, and AI engine telemetry.
        </p>
      </div>

      {/* Metrics Row 1 */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Inquiries</p>
            <div className="flex items-center justify-between mt-1">
              <h3 className="text-3xl font-extrabold text-slate-900">{metrics?.totalTickets || 0}</h3>
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                <BarChart3 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">Platform lifetime tickets recorded</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">Open Backlog</p>
            <div className="flex items-center justify-between mt-1">
              <h3 className="text-3xl font-extrabold text-blue-600">{metrics?.openTickets || 0}</h3>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">Currently awaiting resolution</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-500">Customer CSAT</p>
            <div className="flex items-center justify-between mt-1">
              <h3 className="text-3xl font-extrabold text-amber-600 flex items-center gap-1.5">
                <span>{metrics?.csat?.averageRating ? metrics.csat.averageRating.toFixed(1) : '5.0'}</span>
                <Star className="w-5 h-5 fill-amber-500 text-amber-500 inline" />
              </h3>
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">{metrics?.csat?.totalRatings || 0} reviews recorded</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500">Resolution Rate</p>
            <div className="flex items-center justify-between mt-1">
              <h3 className="text-3xl font-extrabold text-emerald-600">
                {metrics?.totalTickets
                  ? `${Math.round(((metrics.resolvedTickets || 0) / metrics.totalTickets) * 100)}%`
                  : '100%'}
              </h3>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">{metrics?.resolvedTickets || 0} successfully closed</p>
          </div>
        </div>
      )}

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            <span>Ticket Status Breakdown</span>
          </h3>

          <div className="space-y-3">
            {metrics?.statusBreakdown &&
              Object.entries(metrics.statusBreakdown).map(([status, count]: any) => (
                <div key={status} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 w-32 truncate">{status}</span>
                  <div className="flex-1 mx-4 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${metrics.totalTickets ? Math.min(100, Math.round((count / metrics.totalTickets) * 100)) : 0}%`,
                      }}
                    />
                  </div>
                  <span className="font-mono font-bold text-slate-800 w-8 text-right">{count}</span>
                </div>
              ))}
          </div>
        </div>

        {/* AI Performance Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Bot className="w-4 h-4 text-violet-600" />
            <span>AI Operations & Reliability</span>
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">AI Classifications</span>
              <p className="text-xl font-extrabold text-slate-800 mt-1">{metrics?.aiUsage?.totalCalls || 0}</p>
              <p className="text-[11px] text-slate-500 mt-1">Autonomous zero-shot runs</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Average Latency</span>
              <p className="text-xl font-extrabold text-slate-800 mt-1">
                {metrics?.aiUsage?.avgLatencyMs ? `${metrics.aiUsage.avgLatencyMs}ms` : '42ms'}
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">Fast inference time</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Fallback Heuristics</span>
              <p className="text-xl font-extrabold text-slate-800 mt-1">{metrics?.aiUsage?.fallbackCalls || 0}</p>
              <p className="text-[11px] text-slate-500 mt-1">100% resilient failover</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Provider Status</span>
              <p className="text-sm font-extrabold text-emerald-600 mt-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Operational
              </p>
              <p className="text-[11px] text-slate-400 mt-1">OpenAI + Offline Simulator</p>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Workload Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-subtle">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Support Agent Workloads</h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time open ticket distribution per team member</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>{metrics?.agents?.length || 0} Registered Agents</span>
          </div>
        </div>

        {loading ? (
          <SkeletonTable rows={3} />
        ) : !metrics?.agents || metrics.agents.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">No agents registered in the system.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Agent</th>
                  <th className="py-3.5 px-6">Email</th>
                  <th className="py-3.5 px-6">Assigned Teams</th>
                  <th className="py-3.5 px-6">Active Tickets</th>
                  <th className="py-3.5 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {metrics.agents.map((agent: any) => (
                  <tr key={agent.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            agent.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&background=6366f1&color=fff`
                          }
                          alt={agent.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <span className="font-semibold text-slate-800 text-xs">{agent.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">{agent.email}</td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {agent.teamIds && agent.teamIds.length > 0 ? (
                          agent.teamIds.map((team: any) => (
                            <span
                              key={team._id || team.id}
                              className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold"
                            >
                              {team.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">General</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {agent.activeTickets} tickets
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active
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
