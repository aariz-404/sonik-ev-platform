'use client';

import React from 'react';
import Link from 'next/link';
import { Charger } from '@/types';
import { ChargerStatusBadge } from '@/components/ui/Badges';
import { MapPin, Zap, Navigation, ArrowRight, IndianRupee } from 'lucide-react';

interface ChargerCardProps {
  charger: Charger;
  onStartDemo?: (charger: Charger) => void;
}

export function ChargerCard({ charger, onStartDemo }: ChargerCardProps) {
  const isAvailable = charger.status === 'Available';

  // Calculate deterministic illustrative distance based on charger ID if not provided
  const illustrativeDistance = charger.distanceKm
    ? `${charger.distanceKm.toFixed(1)} km away`
    : `${(1.2 + (charger.charger_id * 0.7) % 8.5).toFixed(1)} km away`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Header: Station & Status Badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold uppercase tracking-wider mb-0.5">
              <Navigation className="w-3 h-3 text-brand-blue" />
              <span>{illustrativeDistance} (approx)</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-1">
              {charger.station?.name || `Charging Station #${charger.station_id}`}
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 line-clamp-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{charger.station?.address || charger.station?.city || 'Noida Hub'}</span>
            </p>
          </div>
          <ChargerStatusBadge status={charger.status} />
        </div>

        {/* Charger Hardware Specs Box */}
        <div className="grid grid-cols-2 gap-2 p-3 my-4 rounded-xl bg-brand-surface border border-slate-100">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
              Connector
            </span>
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-blue"></span>
              {charger.connector_type}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
              Output Power
            </span>
            <span className="text-xs font-bold text-brand-blue flex items-center gap-1 mt-0.5">
              <Zap className="w-3.5 h-3.5 text-brand-blue fill-brand-blue/20" />
              {charger.power_kw} kW {Number(charger.power_kw) >= 50 ? 'DC' : 'AC'}
            </span>
          </div>
        </div>

        {/* Pricing / Tariff if available */}
        {charger.station?.current_tariff && (
          <div className="flex items-center justify-between text-xs text-slate-600 px-1 mb-4">
            <span className="text-slate-500">Rate:</span>
            <span className="font-bold text-emerald-700 flex items-center gap-0.5">
              <IndianRupee className="w-3 h-3" />
              {charger.station.current_tariff.rate_per_kwh} / kWh
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <Link
          href={`/driver/chargers/${charger.charger_id}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <span>Details</span>
        </Link>

        {isAvailable ? (
          <Link
            href={`/driver/chargers/${charger.charger_id}?startDemo=1`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-brand-blue hover:bg-brand-blue-hover shadow-sm transition-all"
          >
            <span>Start Session</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <span className="flex-1 text-center py-2 text-xs font-semibold text-slate-400 bg-slate-50 rounded-xl cursor-not-allowed">
            {charger.status === 'Charging' ? 'In Use' : 'Unavailable'}
          </span>
        )}
      </div>
    </div>
  );
}
