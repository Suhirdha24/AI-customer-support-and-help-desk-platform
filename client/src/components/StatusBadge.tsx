import React from 'react';
import { TicketStatus } from '../types/index.js';

interface StatusBadgeProps {
  status: TicketStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getStatusConfig = (st: TicketStatus) => {
    switch (st) {
      case 'OPEN':
        return {
          label: 'Open',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
        };
      case 'ASSIGNED':
        return {
          label: 'Assigned',
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          dot: 'bg-indigo-500',
        };
      case 'IN_PROGRESS':
        return {
          label: 'In Progress',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
        };
      case 'WAITING_FOR_CUSTOMER':
        return {
          label: 'Waiting on Customer',
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          dot: 'bg-purple-500',
        };
      case 'RESOLVED':
        return {
          label: 'Resolved',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 'CLOSED':
        return {
          label: 'Closed',
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
        };
      case 'REOPENED':
        return {
          label: 'Reopened',
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
        };
      default:
        return {
          label: st,
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};
