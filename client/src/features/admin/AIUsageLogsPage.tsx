import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client.js';
import { SkeletonTable } from '../../components/SkeletonLoader.js';
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

export const AIUsageLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/admin/ai-usage?page=${page}&limit=15`);
      if (res.data.success) {
        setLogs(res.data.data);
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.totalPages);
        }
      }
    } catch (error) {
      console.error('Failed to load AI usage logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Model Telemetry</span>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
          AI Operations & Inference Logs
        </h2>
        <p className="text-sm text-slate-500">
          Auditing AI model latency, token consumption, schema validations, and fallback heuristic executions.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-subtle">
        {loading ? (
          <SkeletonTable rows={8} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-6">Operation</th>
                  <th className="py-3.5 px-6">Model Used</th>
                  <th className="py-3.5 px-6">Latency</th>
                  <th className="py-3.5 px-6">Tokens</th>
                  <th className="py-3.5 px-6">Fallback?</th>
                  <th className="py-3.5 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-mono text-slate-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-slate-800">
                      {log.operation}
                    </td>
                    <td className="py-3.5 px-6 font-mono text-slate-600">
                      {log.model}
                    </td>
                    <td className="py-3.5 px-6 font-mono font-medium text-slate-700">
                      {log.latencyMs}ms
                    </td>
                    <td className="py-3.5 px-6 font-mono text-slate-600">
                      {log.tokensUsed || 0}
                    </td>
                    <td className="py-3.5 px-6">
                      {log.usedFallback ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Fallback</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Primary</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <span
                        className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
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
