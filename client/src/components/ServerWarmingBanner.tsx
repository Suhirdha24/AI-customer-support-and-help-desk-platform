import React, { useEffect, useState } from 'react';
import { Loader2, CloudLightning } from 'lucide-react';

export const ServerWarmingBanner: React.FC = () => {
  const [isWarming, setIsWarming] = useState(false);

  useEffect(() => {
    const handleWarming = (e: any) => {
      setIsWarming(Boolean(e.detail?.warming));
    };

    window.addEventListener('render-server-warming', handleWarming);
    return () => window.removeEventListener('render-server-warming', handleWarming);
  }, []);

  if (!isWarming) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 animate-bounce-gentle">
      <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/90 dark:bg-slate-800/90 text-white text-xs font-semibold shadow-elevated border border-indigo-500/40 backdrop-blur-md">
        <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
        <CloudLightning className="w-3.5 h-3.5 text-amber-400" />
        <span>Waking up cloud server (Render spin-up in progress, takes a few seconds)...</span>
      </div>
    </div>
  );
};
