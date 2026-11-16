'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChargingSession } from '@/types';
import { apiGetSessions, apiUpdateSession } from '@/lib/api';
import { SessionStatusBadge } from '@/components/ui/Badges';
import { LoadingSkeleton, EmptyState, ErrorState } from '@/components/ui/States';
import { useToast } from '@/hooks/useToast';
import {
  Activity,
  Zap,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowRight,
  Receipt,
  IndianRupee,
  Filter,
} from 'lucide-react';

export default function MySessionsPage() {
  const toast = useToast();

  const [sessions, setSessions] = useState<ChargingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiGetSessions(
        statusFilter !== 'all' ? statusFilter : undefined,
        50
      );
      setSessions(res.sessions);
    } catch (err: any) {
      console.error('Error fetching sessions', err);
      setErrorMsg(err.message || 'Unable to retrieve your charging history.');
      toast.error('Session Fetch Error', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, toast]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Handle in-line completion or cancellation
  const handleUpdateSession = async (
    sessionId: number,
    nextStatus: 'Active' | 'Completed' | 'Cancelled'
  ) => {
    setActionLoadingId(sessionId);
    try {
      await apiUpdateSession(
        sessionId,
        nextStatus,
        nextStatus === 'Completed' ? 18.5 : undefined
      );
      toast.success(
        'Session Updated',
        `Session #${sessionId} is now ${nextStatus}.`
      );
      await fetchSessions();
    } catch (err: any) {
      toast.error('Operation Failed', err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const totalEnergy = sessions
    .filter((s) => s.status === 'Completed')
    .reduce((acc, curr) => acc + (curr.energy_kwh || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">
            Charging History
          </span>
          <h1 className="text-2xl font-black text-brand-navy tracking-tight mt-0.5">
            My Charging Sessions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track real-time energy telemetry and review past charging records
          </p>
        </div>

        {/* Aggregate Counters */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center">
              <Zap className="w-4 h-4 fill-brand-blue" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block leading-none">
                Total Energy
              </span>
              <span className="text-sm font-black text-slate-900">
                {totalEnergy.toFixed(1)} kWh
              </span>
            </div>
          </div>

          <button
            onClick={fetchSessions}
            title="Refresh history"
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-brand-blue hover:border-brand-blue transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-card flex items-center gap-1.5 overflow-x-auto">
        {[
          { label: 'All Sessions', value: 'all' },
          { label: 'Active', value: 'Active' },
          { label: 'Created / Ready', value: 'Created' },
          { label: 'Completed', value: 'Completed' },
          { label: 'Cancelled', value: 'Cancelled' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === tab.value
                ? 'bg-brand-blue text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Sessions List */}
      {errorMsg ? (
        <ErrorState message={errorMsg} onRetry={fetchSessions} />
      ) : isLoading ? (
        <LoadingSkeleton count={3} />
      ) : sessions.length === 0 ? (
        <EmptyState
          title="No charging sessions recorded"
          description={
            statusFilter !== 'all'
              ? `You do not have any sessions with status "${statusFilter}".`
              : 'You have not initiated any charging sessions yet. Select an available charger to start.'
          }
          action={
            <Link
              href="/driver/find-charger"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-blue hover:bg-brand-blue-hover shadow-sm transition-all"
            >
              <span>Discover Available Chargers</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const isCreated = s.status === 'Created';
            const isActive = s.status === 'Active';
            const isCompleted = s.status === 'Completed';
            const isBusy = actionLoadingId === s.session_id;

            return (
              <div
                key={s.session_id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Session ID, Station & Charger info */}
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      isActive
                        ? 'bg-blue-50 text-brand-blue ring-2 ring-brand-blue/30'
                        : isCompleted
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Zap className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-slate-900">
                        SES-{String(s.session_id).padStart(4, '0')}
                      </span>
                      <SessionStatusBadge status={s.status} />
                    </div>

                    <h3 className="text-sm font-bold text-slate-800 mt-1">
                      {s.charger?.station?.name || `Charging Station #${s.charger?.station_id || '—'}`}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>
                        Charger: <strong>CHG-{String(s.charger_id).padStart(3, '0')}</strong> ({s.charger?.connector_type || 'CCS2'})
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Started: {formatDate(s.start_time || s.created_at)}</span>
                      </span>
                      {s.end_time && (
                        <>
                          <span>&bull;</span>
                          <span>Ended: {formatDate(s.end_time)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Telemetry & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {/* Energy display */}
                  <div className="text-left md:text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Energy Delivered
                    </span>
                    <span className="text-sm font-black text-brand-blue">
                      {s.energy_kwh ? `${Number(s.energy_kwh).toFixed(1)} kWh` : '0.0 kWh'}
                    </span>
                  </div>

                  {/* Actions according to state machine */}
                  <div className="flex items-center gap-2">
                    {isCreated && (
                      <>
                        <button
                          onClick={() => handleUpdateSession(s.session_id, 'Active')}
                          disabled={isBusy}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-brand-blue hover:bg-brand-blue-hover shadow-sm transition-all"
                        >
                          {isBusy ? 'Activating...' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleUpdateSession(s.session_id, 'Cancelled')}
                          disabled={isBusy}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {isActive && (
                      <>
                        <button
                          onClick={() => handleUpdateSession(s.session_id, 'Completed')}
                          disabled={isBusy}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isBusy ? 'Finishing...' : 'Complete'}</span>
                        </button>
                        <button
                          onClick={() => handleUpdateSession(s.session_id, 'Cancelled')}
                          disabled={isBusy}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                        >
                          Abort
                        </button>
                      </>
                    )}

                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                        <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Mock Paid</span>
                      </span>
                    )}

                    <Link
                      href={`/driver/chargers/${s.charger_id}`}
                      className="p-2 rounded-xl text-slate-400 hover:text-brand-blue hover:bg-slate-50 transition-colors"
                      title="View Charger"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
