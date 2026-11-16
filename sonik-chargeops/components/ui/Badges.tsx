import React from 'react';
import { ChargerStatus, SessionStatus, TicketPriority, TicketStatus } from '@/types';
import { Zap, AlertTriangle, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

interface BadgeProps {
  className?: string;
}

// ---------------------------------------------------------------------------
// Charger Status Badge
// ---------------------------------------------------------------------------
export function ChargerStatusBadge({
  status,
  className = '',
}: {
  status: ChargerStatus | string;
} & BadgeProps) {
  switch (status) {
    case 'Available':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Available
        </span>
      );
    case 'Charging':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-brand-blue border border-blue-200/60 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse"></span>
          Charging
        </span>
      );
    case 'Maintenance':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/60 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Maintenance
        </span>
      );
    case 'Offline':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          Offline
        </span>
      );
  }
}

// ---------------------------------------------------------------------------
// Session Status Badge
// ---------------------------------------------------------------------------
export function SessionStatusBadge({
  status,
  className = '',
}: {
  status: SessionStatus | string;
} & BadgeProps) {
  switch (status) {
    case 'Active':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-brand-blue border border-blue-200/80 ${className}`}
        >
          <Zap className="w-3 h-3 text-brand-blue animate-pulse" />
          Active
        </span>
      );
    case 'Completed':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 ${className}`}
        >
          <CheckCircle className="w-3 h-3 text-emerald-500" />
          Completed
        </span>
      );
    case 'Created':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/60 ${className}`}
        >
          <Clock className="w-3 h-3 text-indigo-500" />
          Created
        </span>
      );
    case 'Cancelled':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 ${className}`}
        >
          <XCircle className="w-3 h-3 text-slate-400" />
          Cancelled
        </span>
      );
    case 'Failed':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200/60 ${className}`}
        >
          <AlertCircle className="w-3 h-3 text-rose-500" />
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

// ---------------------------------------------------------------------------
// Ticket Priority Badge
// ---------------------------------------------------------------------------
export function TicketPriorityBadge({
  priority,
  className = '',
}: {
  priority: TicketPriority | string;
} & BadgeProps) {
  switch (priority) {
    case 'Critical':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 ${className}`}
        >
          <AlertCircle className="w-3 h-3 text-rose-600" />
          Critical
        </span>
      );
    case 'High':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 ${className}`}
        >
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          High
        </span>
      );
    case 'Medium':
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 ${className}`}
        >
          Medium
        </span>
      );
    case 'Low':
    default:
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 ${className}`}
        >
          Low
        </span>
      );
  }
}

// ---------------------------------------------------------------------------
// Ticket Status Badge
// ---------------------------------------------------------------------------
export function TicketStatusBadge({
  status,
  className = '',
}: {
  status: TicketStatus | string;
} & BadgeProps) {
  switch (status) {
    case 'Open':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Open
        </span>
      );
    case 'InProgress':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-brand-blue border border-blue-200 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse"></span>
          In Progress
        </span>
      );
    case 'Resolved':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}
        >
          <CheckCircle className="w-3 h-3 text-emerald-500" />
          Resolved
        </span>
      );
    case 'Closed':
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 ${className}`}
        >
          Closed
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
