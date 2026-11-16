import React from 'react';
import { AlertCircle, FolderOpen, RefreshCw } from 'lucide-react';

export function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2 w-2/3">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
            <div className="h-6 w-16 bg-slate-200 rounded-full"></div>
          </div>
          <div className="h-10 bg-slate-100 rounded-xl"></div>
          <div className="h-8 bg-slate-200 rounded-xl w-full"></div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  title = 'No chargers found',
  description = 'Try broadening your search query or removing power/connector filters.',
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center flex flex-col items-center justify-center my-6">
      <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-4">
        <FolderOpen className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">{description}</p>
      {action}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-6 text-center my-6 flex flex-col items-center justify-center">
      <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h4 className="text-sm font-bold text-rose-900">Communication Error</h4>
      <p className="text-xs text-rose-700 max-w-md mt-1 mb-4">
        {message || 'Unable to connect to the Sonik EV Platform backend. Please check network or retry.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 shadow-sm transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
}
