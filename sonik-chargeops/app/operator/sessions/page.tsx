'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Topbar } from '@/components/Topbar';
import { DataTable } from '@/components/tables/DataTable';
import { FilterDropdown } from '@/components/ui/FilterDropdown';
import { SessionStatusBadge } from '@/components/ui/Badges';
import { apiGetSessions, apiUpdateSession } from '@/lib/api';
import { ChargingSession } from '@/types';
import { Activity, Clock, Zap, AlertCircle, X, Check, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

export default function SessionsPage() {
  const [sessions, setSessions] = useState<ChargingSession[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [offset, setOffset] = useState(0);

  // Action Modal State
  const [targetSession, setTargetSession] = useState<ChargingSession | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [energyKwhInput, setEnergyKwhInput] = useState<string>('20.0');
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const toast = useToast();

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiGetSessions({
        status: statusFilter || undefined,
        limit: 10,
        offset,
      });
      setSessions(res.sessions);
      setPagination(res.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch charging sessions');
      toast.error('Error', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, offset, toast]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleOpenActionModal = (session: ChargingSession) => {
    setTargetSession(session);
    setActionError(null);

    // Pick sensible default next transition based on state machine
    if (session.status === 'Created') {
      setNewStatus('Active');
    } else if (session.status === 'Active') {
      setNewStatus('Completed');
      setEnergyKwhInput('25.0');
    } else {
      setNewStatus('');
    }
  };

  const handleExecuteTransition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSession || !newStatus) return;

    setIsUpdating(true);
    setActionError(null);

    try {
      let energyVal: number | undefined = undefined;
      if (newStatus === 'Completed') {
        const parsed = parseFloat(energyKwhInput);
        if (isNaN(parsed) || parsed <= 0) {
          setActionError('Please enter a valid positive energy consumption (kWh).');
          setIsUpdating(false);
          return;
        }
        energyVal = parsed;
      }

      await apiUpdateSession(targetSession.session_id, newStatus, energyVal);
      toast.success(
        'Session Updated',
        `Session #${targetSession.session_id} successfully updated to "${newStatus}".`
      );
      setTargetSession(null);
      fetchSessions();
    } catch (err: any) {
      setActionError(err.message || 'Failed to transition session state.');
      toast.error('Transition Failed', err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const statusOptions = [
    { label: 'All Sessions', value: '' },
    { label: 'Active', value: 'Active' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Created', value: 'Created' },
    { label: 'Cancelled', value: 'Cancelled' },
    { label: 'Failed', value: 'Failed' },
  ];

  const columns = [
    {
      header: 'Session ID',
      accessor: 'session_id',
      render: (row: ChargingSession) => (
        <span className="font-mono text-xs font-semibold text-brand-blue">
          SES-{String(row.session_id).padStart(4, '0')}
        </span>
      ),
    },
    {
      header: 'Charger',
      accessor: 'charger_id',
      render: (row: ChargingSession) => (
        <div className="flex items-center gap-1.5 font-mono text-xs font-medium text-slate-800">
          <Zap className="w-3.5 h-3.5 text-brand-blue" />
          <span>CHG-{String(row.charger_id).padStart(3, '0')}</span>
        </div>
      ),
    },
    {
      header: 'Driver / User',
      accessor: 'user_id',
      render: (row: ChargingSession) => (
        <span className="text-xs font-semibold text-slate-800">
          User #{row.user_id}
        </span>
      ),
    },
    {
      header: 'Start / End Time',
      render: (row: ChargingSession) => (
        <div className="text-xs space-y-0.5">
          <p className="text-slate-700 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            {row.start_time ? new Date(row.start_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Pending Start'}
          </p>
          {row.end_time && (
            <p className="text-[11px] text-slate-400">
              End: {new Date(row.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Energy (kWh)',
      accessor: 'energy_kwh',
      render: (row: ChargingSession) => (
        <span className="text-xs font-bold text-slate-900">
          {Number(row.energy_kwh) > 0 ? `${Number(row.energy_kwh).toFixed(2)} kWh` : '0.00 kWh'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row: ChargingSession) => <SessionStatusBadge status={row.status} />,
    },
    {
      header: 'Operator Action',
      render: (row: ChargingSession) => {
        const canTransition = row.status === 'Created' || row.status === 'Active';
        if (!canTransition) {
          return <span className="text-xs text-slate-400 font-medium">Archived</span>;
        }

        return (
          <button
            onClick={() => handleOpenActionModal(row)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-brand-blue hover:bg-brand-blue hover:text-white transition-all shadow-sm"
          >
            <span>Update State</span>
          </button>
        );
      },
    },
  ];

  return (
    <>
      <Topbar
        title="Charging Sessions"
        subtitle="Live charging session history, energy delivery, and operator overrides"
        onOpenSidebar={() => {}}
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto w-full">
        {/* Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-card">
          <div className="flex items-center gap-3">
            <FilterDropdown
              label="Session State"
              options={statusOptions}
              selectedValue={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setOffset(0);
              }}
            />
          </div>

          <button
            onClick={fetchSessions}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Sessions Table */}
        <DataTable
          columns={columns}
          data={sessions}
          isLoading={isLoading}
          error={error}
          onRetry={fetchSessions}
          pagination={pagination}
          onPageChange={(newOffset) => setOffset(newOffset)}
          emptyTitle="No Charging Sessions Found"
          emptyDescription="No charging sessions match your current filter settings."
        />

        {/* Transition State Modal */}
        {targetSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-dropdown border border-slate-200 max-w-md w-full overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <Activity className="w-5 h-5 text-brand-blue" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Update Session #{targetSession.session_id}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Current State: <strong className="text-slate-800">{targetSession.status}</strong>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setTargetSession(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleExecuteTransition} className="p-5 space-y-4">
                {actionError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700 font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                    <span>{actionError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase">
                    Select Target Transition
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                  >
                    {targetSession.status === 'Created' && (
                      <>
                        <option value="Active">Transition to: Active (Start Charging)</option>
                        <option value="Cancelled">Transition to: Cancelled</option>
                      </>
                    )}
                    {targetSession.status === 'Active' && (
                      <>
                        <option value="Completed">Transition to: Completed (Finish Session)</option>
                        <option value="Cancelled">Transition to: Cancelled</option>
                        <option value="Failed">Transition to: Failed (Hardware Fault)</option>
                      </>
                    )}
                  </select>
                </div>

                {newStatus === 'Completed' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase">
                      Delivered Energy (kWh)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.1"
                      required
                      value={energyKwhInput}
                      onChange={(e) => setEnergyKwhInput(e.target.value)}
                      placeholder="e.g. 24.5"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Billing record will automatically compute using active station tariff.
                    </p>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetSession(null)}
                    className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-brand-blue text-white hover:bg-brand-blue-hover shadow-sm transition-all disabled:opacity-50"
                  >
                    {isUpdating ? (
                      <span>Applying...</span>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirm Transition</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
