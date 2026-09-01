import React from 'react';
import { TicketPriority } from '../types/index.js';
import { AlertCircle, AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react';

interface PriorityBadgeProps {
  priority: TicketPriority;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = '' }) => {
  const getPriorityConfig = (p: TicketPriority) => {
    switch (p) {
      case 'URGENT':
        return {
          label: 'Urgent',
          bg: 'bg-red-50 text-red-700 border-red-200',
          icon: <AlertCircle className="w-3.5 h-3.5 text-red-600" />,
        };
      case 'HIGH':
        return {
          label: 'High',
          bg: 'bg-orange-50 text-orange-700 border-orange-200',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />,
        };
      case 'MEDIUM':
        return {
          label: 'Medium',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: <ArrowUp className="w-3.5 h-3.5 text-blue-600" />,
        };
      case 'LOW':
        return {
          label: 'Low',
          bg: 'bg-slate-50 text-slate-600 border-slate-200',
          icon: <ArrowDown className="w-3.5 h-3.5 text-slate-500" />,
        };
      default:
        return {
          label: p,
          bg: 'bg-slate-50 text-slate-600 border-slate-200',
          icon: null,
        };
    }
  };

  const config = getPriorityConfig(priority);

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${config.bg} ${className}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
};
