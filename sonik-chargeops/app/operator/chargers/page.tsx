'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Topbar } from '@/components/Topbar';
import { DataTable } from '@/components/tables/DataTable';
import { FilterDropdown } from '@/components/ui/FilterDropdown';
import { ChargerStatusBadge } from '@/components/ui/Badges';
import { apiGetChargers, apiGetCharger, apiGetStation } from '@/lib/api';
import { Charger, Station } from '@/types';
import { Zap, MapPin, IndianRupee, X, Info } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

export default function ChargersPage() {
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [connectorFilter, setConnectorFilter] = useState('');
  const [minPowerFilter, setMinPowerFilter] = useState('');
  const [offset, setOffset] = useState(0);

  // Detail Modal
  const [selectedCharger, setSelectedCharger] = useState<Charger | null>(null);
  const [chargerStation, setChargerStation] = useState<Station | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const toast = useToast();

  const fetchChargers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiGetChargers({
        status: statusFilter || undefined,
        connector_type: connectorFilter || undefined,
        min_power: minPowerFilter ? Number(minPowerFilter) : undefined,
        limit: 10,
        offset,
      });
      setChargers(res.chargers);
      setPagination(res.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch chargers');
      toast.error('Error', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, connectorFilter, minPowerFilter, offset, toast]);

  useEffect(() => {
    fetchChargers();
  }, [fetchChargers]);

  const handleOpenDetail = async (charger: Charger) => {
    setSelectedCharger(charger);
    setIsLoadingDetail(true);
    try {
      const fullCharger = await apiGetCharger(charger.charger_id);
      setSelectedCharger(fullCharger);
      if (fullCharger.station_id) {
        const station = await apiGetStation(fullCharger.station_id);
        setChargerStation(station);
      }
    } catch (err: any) {
      toast.error('Error', 'Failed to retrieve detailed charger telemetry.');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Available', value: 'Available' },
    { label: 'Charging', value: 'Charging' },
    { label: 'Offline', value: 'Offline' },
    { label: 'Maintenance', value: 'Maintenance' },
  ];

  const connectorOptions = [
    { label: 'All Connectors', value: '' },
    { label: 'CCS2 (DC Fast)', value: 'CCS2' },
    { label: 'Type 2 (AC)', value: 'Type2' },
    { label: 'CHAdeMO (DC)', value: 'CHAdeMO' },
  ];

  const powerOptions = [
    { label: 'All Power Ratings', value: '' },
    { label: '≥ 20 kW', value: '20' },
    { label: '≥ 50 kW (DC Fast)', value: '50' },
    { label: '≥ 100 kW (Ultra-Fast)', value: '100' },
  ];

  const columns = [
    {
      header: 'Charger ID',
      accessor: 'charger_id',
      render: (row: Charger) => (
        <span className="font-mono text-xs font-semibold text-brand-blue">
          CHG-{String(row.charger_id).padStart(3, '0')}
        </span>
      ),
    },
    {
      header: 'Assigned Station',
      render: (row: Charger) => (
        <div>
          <p className="font-semibold text-slate-900 text-xs">{row.station?.name || `Station #${row.station_id}`}</p>
          <p className="text-[11px] text-slate-500">{row.station?.city || '—'}</p>
        </div>
      ),
    },
    {
      header: 'Connector',
      accessor: 'connector_type',
      render: (row: Charger) => (
        <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800">
          {row.connector_type}
        </span>
      ),
    },
    {
      header: 'Power Output',
      accessor: 'power_kw',
      render: (row: Charger) => (
        <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
          <Zap className="w-3.5 h-3.5 text-brand-blue" />
          <span>{row.power_kw} kW</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row: Charger) => <ChargerStatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      render: (row: Charger) => (
        <button
          onClick={() => handleOpenDetail(row)}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-brand-blue hover:text-white transition-all"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Inspect</span>
        </button>
      ),
    },
  ];

  return (
    <>
      <Topbar
        title="Charger Management"
        subtitle="Monitor charging hardware status, connector types, and power telemetry"
        onOpenSidebar={() => {}}
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto w-full">
        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-2.5 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-card">
          <FilterDropdown
            label="Status"
            options={statusOptions}
            selectedValue={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setOffset(0);
            }}
          />

          <FilterDropdown
            label="Connector"
            options={connectorOptions}
            selectedValue={connectorFilter}
            onChange={(val) => {
              setConnectorFilter(val);
              setOffset(0);
            }}
          />

          <FilterDropdown
            label="Min Power"
            options={powerOptions}
            selectedValue={minPowerFilter}
            onChange={(val) => {
              setMinPowerFilter(val);
              setOffset(0);
            }}
          />

          {(statusFilter || connectorFilter || minPowerFilter) && (
            <button
              onClick={() => {
                setStatusFilter('');
                setConnectorFilter('');
                setMinPowerFilter('');
                setOffset(0);
              }}
              className="text-xs text-brand-blue hover:underline font-medium px-2 py-1"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Chargers Data Table */}
        <DataTable
          columns={columns}
          data={chargers}
          isLoading={isLoading}
          error={error}
          onRetry={fetchChargers}
          pagination={pagination}
          onPageChange={(newOffset) => setOffset(newOffset)}
          emptyTitle="No Chargers Found"
          emptyDescription="No chargers match the current filter criteria."
        />

        {/* Charger Detail Modal */}
        {selectedCharger && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-dropdown border border-slate-200 max-w-lg w-full overflow-hidden">
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-brand-navy text-white">
                    <Zap className="w-5 h-5 text-brand-blue" />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-semibold text-brand-blue">
                      CHG-{String(selectedCharger.charger_id).padStart(3, '0')}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {selectedCharger.connector_type} Fast Charger
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCharger(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-xs font-semibold text-slate-600">Current Status</span>
                  <ChargerStatusBadge status={selectedCharger.status} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Power Rating</p>
                    <p className="text-base font-bold text-slate-900 mt-1">{selectedCharger.power_kw} kW</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Connector Type</p>
                    <p className="text-base font-bold text-slate-900 mt-1">{selectedCharger.connector_type}</p>
                  </div>
                </div>

                {/* Station & Tariff Info */}
                <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-brand-blue" />
                    <span>Station Location</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    {chargerStation?.name || selectedCharger.station?.name || 'Assigned Station'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {chargerStation?.address || selectedCharger.station?.address || '—'}
                  </p>

                  {chargerStation?.current_tariff && (
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Current Tariff:</span>
                      <span className="font-bold text-emerald-700 flex items-center gap-0.5">
                        <IndianRupee className="w-3 h-3" />
                        {chargerStation.current_tariff.rate_per_kwh} / kWh
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50/50">
                <button
                  onClick={() => setSelectedCharger(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
