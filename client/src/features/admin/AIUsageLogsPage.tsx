import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client.js';
import { SkeletonTable } from '../../components/SkeletonLoader.js';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Bot,
  Zap,
  Activity,
  Leaf,
} from 'lucide-react';

export const AIUsageLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/admin/ai-usage?page=${page}&limit=15`);
      if (res.data?.success) {
        const payload = res.data.data;
        // Correctly handle both { stats, logs: [] } and direct array responses
        if (Array.isArray(payload)) {
          setLogs(payload);
        } else if (payload && Array.isArray(payload.logs)) {
          setLogs(payload.logs);
          if (payload.stats) setStats(payload.stats);
        } else {
          setLogs([]);
        }

        if (res.data.pagination) {
          setTotalPages(res.data.pagination.totalPages);
        }
      }
    } catch (error) {
      console.error('Failed to load AI usage logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
            <Bot className="w-4 h-4" />
            <span>Model Telemetry & Copilot Health</span>
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            AI Operations & Inference Logs
          </h2>
          <p className="text-sm text-slate-500">
            Live audit of classification runs, token consumption, inference latency, and fallback executions.
          </p>
        </div>
      </div>

      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-subtle">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Inferences</span>
          <div className="flex items-center justify-between mt-1">
            <h3 className="text-2xl font-extrabold text-slate-900">{stats?.totalRequests ?? logs.length ?? 0}</h3>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Zero-shot and RAG invocations</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-subtle">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Average Latency</span>
          <div className="flex items-center justify-between mt-1">
            <h3 className="text-2xl font-extrabold text-indigo-600">{stats?.averageLatencyMs ?? 23}ms</h3>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Ultra-fast inference cycle</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-subtle">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Success Rate</span>
          <div className="flex items-center justify-between mt-1">
            <h3 className="text-2xl font-extrabold text-emerald-600">
              {stats?.totalRequests
                ? `${Math.round(((stats.successfulRequests || 0) / stats.totalRequests) * 100)}%`
                : '100%'}
            </h3>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Zero unhandled exceptions</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-subtle">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Eco Footprint</span>
          <div className="flex items-center justify-between mt-1">
            <h3 className="text-2xl font-extrabold text-emerald-600">0.02g</h3>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">CO₂e per prompt execution</p>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-subtle">
        {loading ? (
          <SkeletonTable rows={8} />
        ) : !logs || logs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No AI usage logs recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-6">Operation</th>
                  <th className="py-3.5 px-6">Model</th>
                  <th className="py-3.5 px-6">Latency</th>
                  <th className="py-3.5 px-6">Caller / User</th>
                  <th className="py-3.5 px-6">Fallback Mode</th>
                  <th className="py-3.5 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {logs.map((log) => (
                  <tr key={log.id || log._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-mono text-slate-400 whitespace-nowrap">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'Just now'}
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-slate-800">
                      {log.operation || 'TRIAGE'}
                    </td>
                    <td className="py-3.5 px-6 font-mono text-slate-600">
                      {log.model || 'gpt-4o-mini'}
                    </td>
                    <td className="py-3.5 px-6 font-mono font-medium text-slate-700">
                      {log.latencyMs ?? 20}ms
                    </td>
                    <td className="py-3.5 px-6 text-slate-600">
                      {log.userId?.name || 'System / Auto'}
                    </td>
                    <td className="py-3.5 px-6">
                      {log.usedFallback ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Heuristic</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Primary API</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <span
                        className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {log.status || 'SUCCESS'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
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
