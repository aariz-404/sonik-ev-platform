import React from 'react';
import { AlertCircle, FolderOpen, RefreshCw } from 'lucide-react';

export function LoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full space-y-3 p-4 animate-pulse">
      <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-2 border-b border-slate-100 last:border-0">
          <div className="h-3 bg-slate-200 rounded w-1/6"></div>
          <div className="h-3 bg-slate-200 rounded w-1/4"></div>
          <div className="h-3 bg-slate-200 rounded w-1/5"></div>
          <div className="h-3 bg-slate-200 rounded w-1/6"></div>
          <div className="h-3 bg-slate-200 rounded w-1/12 ml-auto"></div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  title = 'No records found',
  description = 'No matching data matches your filter criteria or search query.',
  icon,
  action,
}: {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-400 mb-3">
        {icon || <FolderOpen className="w-6 h-6" />}
      </div>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mt-1">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = 'Failed to load data',
  message,
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="p-6 rounded-xl border border-rose-200 bg-rose-50/50 flex flex-col items-center justify-center text-center my-4">
      <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-3">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-rose-900">{title}</h3>
      <p className="text-xs text-rose-700 max-w-md mt-1 mb-4">
        {message || 'An error occurred while connecting to the backend service. Check your connection or retry.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Request
        </button>
      )}
    </div>
  );
}
