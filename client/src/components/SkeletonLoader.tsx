import React from 'react';

export const SkeletonLine: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
);

export const SkeletonCard: React.FC = () => (
  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-subtle animate-pulse space-y-4">
    <div className="flex justify-between items-center">
      <div className="h-4 bg-slate-200 rounded w-1/3" />
      <div className="h-4 bg-slate-200 rounded w-16" />
    </div>
    <div className="h-8 bg-slate-200 rounded w-1/2" />
    <div className="h-3 bg-slate-100 rounded w-3/4" />
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-subtle">
    <div className="p-4 border-b border-slate-100 flex gap-4">
      <div className="h-4 bg-slate-200 rounded w-1/4" />
      <div className="h-4 bg-slate-200 rounded w-1/4" />
      <div className="h-4 bg-slate-200 rounded w-1/4" />
      <div className="h-4 bg-slate-200 rounded w-1/4" />
    </div>
    <div className="divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex gap-4 animate-pulse">
          <div className="h-4 bg-slate-100 rounded w-1/4" />
          <div className="h-4 bg-slate-100 rounded w-1/4" />
          <div className="h-4 bg-slate-100 rounded w-1/4" />
          <div className="h-4 bg-slate-100 rounded w-1/4" />
        </div>
      ))}
    </div>
  </div>
);
