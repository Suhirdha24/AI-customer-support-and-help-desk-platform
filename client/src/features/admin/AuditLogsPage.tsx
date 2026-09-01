import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client.js';
import { SkeletonTable } from '../../components/SkeletonLoader.js';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/admin/audit-logs?page=${page}&limit=15`);
      if (res.data.success) {
        setLogs(res.data.data);
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.totalPages);
        }
      }
    } catch (error) {
      console.error('Failed to load audit logs:', error);
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
        <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Compliance & Security</span>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
          Immutable Audit Trail
        </h2>
        <p className="text-sm text-slate-500">
          Append-only ledger documenting state transitions, permission grants, user access, and security events.
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
                  <th className="py-3.5 px-6">Event Action</th>
                  <th className="py-3.5 px-6">Entity</th>
                  <th className="py-3.5 px-6">Actor</th>
                  <th className="py-3.5 px-6">Details / Diff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-mono text-slate-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="font-mono font-bold text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-medium text-slate-700">
                      {log.entityType} ({String(log.entityId).substring(0, 8)}...)
                    </td>
                    <td className="py-3.5 px-6">
                      <p className="font-semibold text-slate-800">{log.performedBy?.name || 'System'}</p>
                      <p className="text-[10px] text-slate-400">{log.performedBy?.email}</p>
                    </td>
                    <td className="py-3.5 px-6 max-w-xs truncate font-mono text-[11px] text-slate-500">
                      {JSON.stringify(log.details || log.metadata || {})}
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
