import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <Inbox className="w-12 h-12 text-slate-400" />,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-dashed border-slate-200 rounded-xl my-6">
      <div className="p-3 bg-slate-50 rounded-full mb-3 text-slate-500">{icon}</div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
