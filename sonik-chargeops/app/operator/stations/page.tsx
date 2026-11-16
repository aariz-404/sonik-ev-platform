'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Topbar } from '@/components/Topbar';
import { DataTable } from '@/components/tables/DataTable';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterDropdown } from '@/components/ui/FilterDropdown';
import { ChargerStatusBadge } from '@/components/ui/Badges';
import { apiGetStations, apiGetStation, apiGetChargers } from '@/lib/api';
import { Station, Charger } from '@/types';
import { MapPin, Zap, X, ExternalLink, IndianRupee, Layers } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

export default function StationsPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [offset, setOffset] = useState(0);

  // Selected Station Modal State
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [stationChargers, setStationChargers] = useState<Charger[]>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const toast = useToast();

  const fetchStations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiGetStations({
        search: search.trim() || undefined,
        city: cityFilter || undefined,
        limit: 10,
        offset,
      });
      setStations(res.stations);
      setPagination(res.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch stations');
      toast.error('Failed to load stations', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [search, cityFilter, offset, toast]);

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  // Load detailed station modal
  const handleOpenDetail = async (station: Station) => {
    setSelectedStation(station);
    setIsLoadingDetail(true);
    try {
      const [fullStation, chargersRes] = await Promise.all([
        apiGetStation(station.station_id),
        apiGetChargers({ station_id: station.station_id, limit: 50 }),
      ]);
      setSelectedStation(fullStation);
      setStationChargers(chargersRes.chargers);
    } catch (err: any) {
      toast.error('Error', 'Failed to load station chargers and tariff info.');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const cityOptions = [
    { label: 'All Cities', value: '' },
    { label: 'Noida', value: 'Noida' },
    { label: 'Greater Noida', value: 'Greater Noida' },
  ];

  const columns = [
    {
      header: 'Station ID',
      accessor: 'station_id',
      render: (row: Station) => (
        <span className="font-mono text-xs font-semibold text-brand-blue">
          STN-{String(row.station_id).padStart(3, '0')}
        </span>
      ),
    },
    {
      header: 'Station Name & Location',
      accessor: 'name',
      render: (row: Station) => (
        <div>
          <p className="font-semibold text-slate-900">{row.name}</p>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
            <span className="truncate max-w-xs">{row.address}</span>
          </p>
        </div>
      ),
    },
    {
      header: 'City',
      accessor: 'city',
      render: (row: Station) => (
        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
          {row.city}
        </span>
      ),
    },
    {
      header: 'Coordinates',
      accessor: 'latitude',
      render: (row: Station) => (
        <span className="font-mono text-xs text-slate-500">
          {Number(row.latitude).toFixed(4)}, {Number(row.longitude).toFixed(4)}
        </span>
      ),
    },
    {
      header: 'Chargers',
      accessor: 'charger_count',
      render: (row: Station) => (
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
          <Zap className="w-3.5 h-3.5 text-brand-blue" />
          <span>{row.charger_count ?? '—'} units</span>
        </div>
      ),
    },
    {
      header: 'Action',
      render: (row: Station) => (
        <button
          onClick={() => handleOpenDetail(row)}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-brand-blue hover:bg-brand-blue hover:text-white transition-all"
        >
          <span>View Details</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      ),
    },
  ];

  return (
    <>
      <Topbar
        title="Station Management"
        subtitle="Explore regional charging hubs, geo-coordinates, and charger configurations"
        onOpenSidebar={() => {}}
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto w-full">
        {/* Search & Filters Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-card">
          <SearchInput
            value={search}
            onChange={(val) => {
              setSearch(val);
              setOffset(0);
            }}
            placeholder="Search station by name or street address..."
            className="w-full sm:w-80"
          />

          <div className="flex items-center gap-2">
            <FilterDropdown
              label="City"
              options={cityOptions}
              selectedValue={cityFilter}
              onChange={(val) => {
                setCityFilter(val);
                setOffset(0);
              }}
            />
          </div>
        </div>

        {/* Stations Data Table */}
        <DataTable
          columns={columns}
          data={stations}
          isLoading={isLoading}
          error={error}
          onRetry={fetchStations}
          pagination={pagination}
          onPageChange={(newOffset) => setOffset(newOffset)}
          emptyTitle="No Charging Stations Found"
          emptyDescription="No stations match your search term or city filter. Try clearing filters."
        />

        {/* Station Detail Modal */}
        {selectedStation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-dropdown border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-brand-navy text-white">
                    <MapPin className="w-5 h-5 text-brand-blue" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-brand-blue">
                        STN-{String(selectedStation.station_id).padStart(3, '0')}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
                        {selectedStation.city}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                      {selectedStation.name}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStation(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto space-y-6">
                {/* Station Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Address</p>
                    <p className="text-xs font-semibold text-slate-800 mt-1">{selectedStation.address}</p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Active Tariff</p>
                    <div className="flex items-center gap-1 mt-1 text-slate-900 font-bold text-sm">
                      <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        {selectedStation.current_tariff?.rate_per_kwh
                          ? `${selectedStation.current_tariff.rate_per_kwh} / kWh`
                          : '16.50 / kWh'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Coordinates</p>
                    <p className="text-xs font-mono font-medium text-slate-700 mt-1">
                      {selectedStation.latitude}, {selectedStation.longitude}
                    </p>
                  </div>
                </div>

                {/* Associated Chargers Inventory */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-brand-blue" />
                      <h4 className="text-sm font-bold text-slate-900">
                        Installed Chargers ({stationChargers.length})
                      </h4>
                    </div>
                  </div>

                  {isLoadingDetail ? (
                    <div className="py-8 text-center text-xs text-slate-400">Loading chargers...</div>
                  ) : stationChargers.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">No chargers linked to this station.</p>
                  ) : (
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                      {stationChargers.map((chg) => (
                        <div key={chg.charger_id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-50 text-brand-blue font-mono text-xs font-bold">
                              CHG-{String(chg.charger_id).padStart(3, '0')}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900">
                                {chg.connector_type} &bull; {chg.power_kw} kW
                              </p>
                              <p className="text-[11px] text-slate-400">
                                Output: {Number(chg.power_kw) > 50 ? 'DC Fast Charger' : 'AC Standard'}
                              </p>
                            </div>
                          </div>
                          <ChargerStatusBadge status={chg.status} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50/50">
                <button
                  onClick={() => setSelectedStation(null)}
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
