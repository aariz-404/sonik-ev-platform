'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Charger, Station } from '@/types';
import { apiGetChargers, apiGetStations } from '@/lib/api';
import { ChargerCard } from '@/components/charger/ChargerCard';
import { LoadingSkeleton, EmptyState, ErrorState } from '@/components/ui/States';
import { useToast } from '@/hooks/useToast';
import {
  Search,
  Filter,
  Zap,
  MapPin,
  SlidersHorizontal,
  RefreshCw,
  CheckCircle2,
  BatteryMedium,
} from 'lucide-react';

export default function FindChargerPage() {
  const toast = useToast();

  const [chargers, setChargers] = useState<Charger[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filter states
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedStationId, setSelectedStationId] = useState<string>('all');
  const [selectedConnector, setSelectedConnector] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [minPower, setMinPower] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [chargerRes, stationRes] = await Promise.all([
        apiGetChargers({
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
          connector_type: selectedConnector !== 'all' ? selectedConnector : undefined,
          station_id: selectedStationId !== 'all' ? Number(selectedStationId) : undefined,
          min_power: minPower !== 'all' ? Number(minPower) : undefined,
          limit: 100,
        }),
        apiGetStations(),
      ]);

      setChargers(chargerRes.chargers);
      setStations(stationRes);
    } catch (err: any) {
      console.error('Error fetching chargers', err);
      setErrorMsg(err.message || 'Unable to retrieve chargers from backend.');
      toast.error('Data Fetch Error', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus, selectedConnector, selectedStationId, minPower, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Client-side text search & city filtering
  const filteredChargers = chargers.filter((c) => {
    if (selectedCity !== 'all') {
      const stationCity = c.station?.city?.toLowerCase() || '';
      if (!stationCity.includes(selectedCity.toLowerCase())) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const stationName = c.station?.name?.toLowerCase() || '';
      const address = c.station?.address?.toLowerCase() || '';
      const city = c.station?.city?.toLowerCase() || '';
      const chargerIdStr = `chg-${c.charger_id}`.toLowerCase();
      const connector = c.connector_type.toLowerCase();

      return (
        stationName.includes(q) ||
        address.includes(q) ||
        city.includes(q) ||
        chargerIdStr.includes(q) ||
        connector.includes(q)
      );
    }
    return true;
  });

  // Extract unique cities
  const uniqueCities = Array.from(new Set(stations.map((s) => s.city).filter(Boolean)));

  // Availability counters
  const totalCount = chargers.length;
  const availableCount = chargers.filter((c) => c.status === 'Available').length;
  const chargingCount = chargers.filter((c) => c.status === 'Charging').length;

  const handleResetFilters = () => {
    setSelectedCity('all');
    setSelectedStationId('all');
    setSelectedConnector('all');
    setSelectedStatus('all');
    setMinPower('all');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">
            Charger Discovery
          </span>
          <h1 className="text-2xl font-black text-brand-navy tracking-tight mt-0.5">
            Find an EV Charger
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse compatible high-speed connectors across the NCR charging corridor
          </p>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block leading-none">
                Available
              </span>
              <span className="text-sm font-black text-emerald-600">{availableCount}</span>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block leading-none">
                Charging
              </span>
              <span className="text-sm font-black text-orange-600">{chargingCount}</span>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block leading-none">
                Total
              </span>
              <span className="text-sm font-black text-slate-800">{totalCount}</span>
            </div>
          </div>

          <button
            onClick={loadData}
            title="Refresh charger live status"
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-brand-blue hover:border-brand-blue transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-card space-y-4">
        {/* Top search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by station name, landmark, address, or connector (e.g. CCS2, Advant, Sector 62)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
          />
        </div>

        {/* Filter controls row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-1">
          {/* City / Location */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Location / City
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-blue"
            >
              <option value="all">All Locations</option>
              {uniqueCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Connector Type */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Connector
            </label>
            <select
              value={selectedConnector}
              onChange={(e) => setSelectedConnector(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-blue"
            >
              <option value="all">All Connectors</option>
              <option value="CCS2">CCS2 (Fast DC)</option>
              <option value="Type2">Type 2 (AC)</option>
              <option value="CHAdeMO">CHAdeMO</option>
              <option value="AC">AC Standard</option>
              <option value="DC">DC Fast</option>
            </select>
          </div>

          {/* Minimum Power */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Min Power (kW)
            </label>
            <select
              value={minPower}
              onChange={(e) => setMinPower(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-blue"
            >
              <option value="all">Any Power Rating</option>
              <option value="22">22 kW+ (Fast AC)</option>
              <option value="50">50 kW+ (Rapid DC)</option>
              <option value="120">120 kW+ (Ultra DC)</option>
              <option value="150">150 kW+ (Hyper DC)</option>
            </select>
          </div>

          {/* Availability Status */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Availability
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-blue"
            >
              <option value="all">All Statuses</option>
              <option value="Available">Available Only</option>
              <option value="Charging">In Use (Charging)</option>
              <option value="Offline">Offline</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          {/* Reset button */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-1 flex items-end">
            <button
              onClick={handleResetFilters}
              className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {errorMsg ? (
        <ErrorState message={errorMsg} onRetry={loadData} />
      ) : isLoading ? (
        <LoadingSkeleton count={6} />
      ) : filteredChargers.length === 0 ? (
        <EmptyState
          title="No compatible chargers found"
          description="None of the charging points match your current filter criteria. Try clearing power filters or selecting all locations."
          action={
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-blue hover:bg-brand-blue-hover shadow-sm transition-all"
            >
              Clear All Filters
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredChargers.map((charger) => (
            <ChargerCard key={charger.charger_id} charger={charger} />
          ))}
        </div>
      )}
    </div>
  );
}
