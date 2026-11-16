'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Topbar } from '@/components/Topbar';
import { DashboardMetricCard } from '@/components/dashboard/DashboardMetricCard';
import { EnergyChart } from '@/components/dashboard/EnergyChart';
import { ChargerStatusBadge, SessionStatusBadge } from '@/components/ui/Badges';
import { ErrorState, LoadingSkeleton } from '@/components/ui/States';
import { apiGetAnalyticsSummary } from '@/lib/api';
import { AnalyticsSummary } from '@/types';
import {
  MapPin,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Activity,
  BatteryCharging,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';

export default function NetworkOverviewPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const toast = useToast();

  const fetchAnalytics = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const summary = await apiGetAnalyticsSummary();
      setData(summary);
      if (isManual) {
        toast.success('Dashboard Updated', 'Latest network telemetry synchronized.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve analytics summary');
      if (isManual) {
        toast.error('Sync Failed', err.message);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const stats = data?.stats;

  return (
    <>
      <Topbar
        title="Network Overview"
        subtitle="Real-time telemetry and infrastructure performance metrics"
        onOpenSidebar={() => {}}
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Top Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Charging Grid Telemetry</h2>
            <p className="text-xs text-slate-500">Live operational telemetry across Noida & Greater Noida clusters</p>
          </div>
          <button
            onClick={() => fetchAnalytics(true)}
            disabled={isRefreshing || isLoading}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition-all disabled:opacity-50 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-brand-blue ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Synchronizing...' : 'Refresh Telemetry'}</span>
          </button>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={() => fetchAnalytics(false)} />
        ) : (
          <>
            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <DashboardMetricCard
                title="Total Stations"
                value={stats?.total_stations ?? 0}
                subtext="Active regional charging hubs"
                icon={<MapPin className="w-5 h-5" />}
                accentColor="blue"
                isLoading={isLoading}
              />

              <DashboardMetricCard
                title="Total Chargers"
                value={stats?.total_chargers ?? 0}
                subtext={`${stats?.available_chargers ?? 0} available / online`}
                icon={<Zap className="w-5 h-5" />}
                accentColor="indigo"
                isLoading={isLoading}
              />

              <DashboardMetricCard
                title="Currently Charging"
                value={stats?.charging_chargers ?? 0}
                subtext={`${stats?.active_sessions ?? 0} live active sessions`}
                icon={<BatteryCharging className="w-5 h-5" />}
                accentColor="blue"
                isLoading={isLoading}
              />

              <DashboardMetricCard
                title="Energy Consumed Today"
                value={`${stats?.total_energy_today_kwh ?? 0} kWh`}
                subtext={`All-time: ${stats?.total_energy_all_time_kwh ?? 0} kWh`}
                icon={<Flame className="w-5 h-5" />}
                accentColor="amber"
                isLoading={isLoading}
              />
            </div>

            {/* Status Breakdown Bar */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-card grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-400 uppercase">Available</p>
                  <p className="text-lg font-bold text-slate-800">{stats?.available_chargers ?? 0}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 sm:pt-0 sm:pl-4">
                <div className="p-2 rounded-lg bg-blue-50 text-brand-blue">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-400 uppercase">Charging</p>
                  <p className="text-lg font-bold text-slate-800">{stats?.charging_chargers ?? 0}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 sm:pt-0 sm:pl-4">
                <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-400 uppercase">Offline</p>
                  <p className="text-lg font-bold text-slate-800">{stats?.offline_chargers ?? 0}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 sm:pt-0 sm:pl-4">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-400 uppercase">Maintenance</p>
                  <p className="text-lg font-bold text-slate-800">{stats?.maintenance_chargers ?? 0}</p>
                </div>
              </div>
            </div>

            {/* Energy Trend Chart */}
            <EnergyChart
              todayTotal={stats?.total_energy_today_kwh ?? 0}
              recentSessions={data?.recent_activity ?? []}
            />

            {/* Recent Activity Table */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-card overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Recent Charger Activity</h3>
                  <p className="text-xs text-slate-500">Live operational log from connected charging sessions</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {data?.recent_activity?.length ?? 0} Events
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                    <tr>
                      <th className="px-4 py-3">Station</th>
                      <th className="px-4 py-3">Charger ID</th>
                      <th className="px-4 py-3">User / Driver</th>
                      <th className="px-4 py-3">Power</th>
                      <th className="px-4 py-3">Energy</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="p-0">
                          <LoadingSkeleton rows={4} />
                        </td>
                      </tr>
                    ) : !data?.recent_activity?.length ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-xs text-slate-400">
                          No recent charging activity detected.
                        </td>
                      </tr>
                    ) : (
                      data.recent_activity.map((item) => (
                        <tr key={item.session_id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3">
                            <p className="text-xs font-semibold text-slate-900">{item.station_name || '—'}</p>
                            <p className="text-[11px] text-slate-500">{item.station_city || '—'}</p>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs font-medium text-brand-blue">
                            CHG-{String(item.charger_id).padStart(3, '0')}
                          </td>
                          <td className="px-4 py-3 text-xs font-medium text-slate-800">
                            {item.user_name || 'Driver'}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-700">
                            {item.charger_power_kw ? `${item.charger_power_kw} kW (${item.charger_connector})` : '—'}
                          </td>
                          <td className="px-4 py-3 text-xs font-semibold text-slate-900">
                            {item.energy_kwh ? `${item.energy_kwh} kWh` : '0.00 kWh'}
                          </td>
                          <td className="px-4 py-3">
                            <SessionStatusBadge status={item.status} />
                          </td>
                          <td className="px-4 py-3 text-right text-xs text-slate-500">
                            {item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
