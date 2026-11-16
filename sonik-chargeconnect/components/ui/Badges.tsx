import React from 'react';
import { ChargerStatus, SessionStatus } from '@/types';
import { Zap, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

export function ChargerStatusBadge({
  status,
  className = '',
}: {
  status: ChargerStatus | string;
  className?: string;
}) {
  switch (status) {
    case 'Available':
      // Green for Available
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Available
        </span>
      );
    case 'Charging':
      // Orange for Charging
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200 ${className}`}
        >
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
          In Use (Charging)
        </span>
      );
    case 'Maintenance':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 ${className}`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          Maintenance
        </span>
      );
    case 'Offline':
    default:
      // Red for Offline
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 ${className}`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          Offline
        </span>
      );
  }
}

export function SessionStatusBadge({
  status,
  className = '',
}: {
  status: SessionStatus | string;
  className?: string;
}) {
  switch (status) {
    case 'Active':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-brand-blue border border-blue-200 ${className}`}
        >
          <Zap className="w-3.5 h-3.5 text-brand-blue animate-pulse" />
          Active Charging
        </span>
      );
    case 'Completed':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Completed
        </span>
      );
    case 'Created':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 ${className}`}
        >
          <Clock className="w-3.5 h-3.5 text-indigo-600" />
          Created / Ready
        </span>
      );
    case 'Cancelled':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 ${className}`}
        >
          <XCircle className="w-3.5 h-3.5 text-slate-400" />
          Cancelled
        </span>
      );
    case 'Failed':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 ${className}`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
          Failed
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 ${className}`}>
          {status}
        </span>
      );
  }
}
