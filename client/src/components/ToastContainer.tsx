import React from 'react';
import { useToastStore, Toast } from '../store/useToastStore.js';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: Toast; onClose: () => void }> = ({ toast, onClose }) => {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-500 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-200 bg-white',
    error: 'border-rose-200 bg-white',
    warning: 'border-amber-200 bg-white',
    info: 'border-indigo-200 bg-white',
  };

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-elevated transition-all transform duration-200 animate-slide-in ${
        borders[toast.type]
      }`}
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        {toast.title && <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-0.5">{toast.title}</h4>}
        <p className="text-sm font-medium text-slate-600 leading-snug">{toast.message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
