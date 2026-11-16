'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Charger } from '@/types';
import { apiGetCharger } from '@/lib/api';
import { ChargerStatusBadge } from '@/components/ui/Badges';
import { DemoSessionWorkflow } from '@/components/session/DemoSessionWorkflow';
import { LoadingSkeleton, ErrorState } from '@/components/ui/States';
import { useToast } from '@/hooks/useToast';
import {
  ArrowLeft,
  Zap,
  MapPin,
  IndianRupee,
  Navigation,
  Clock,
  HelpCircle,
} from 'lucide-react';

function ChargerDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const toast = useToast();

  const chargerId = Number(params.id);
  const autoStart = searchParams.get('startDemo') === '1';

  const [charger, setCharger] = useState<Charger | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchCharger = useCallback(async () => {
    if (!chargerId || isNaN(chargerId)) {
      setErrorMsg('Invalid charger ID specified.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await apiGetCharger(chargerId);
      setCharger(data);
    } catch (err: any) {
      console.error('Failed to load charger details', err);
      setErrorMsg(err.message || 'Unable to retrieve charger information.');
    } finally {
      setIsLoading(false);
    }
  }, [chargerId]);

  useEffect(() => {
    fetchCharger();
  }, [fetchCharger]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 bg-slate-200 rounded animate-pulse"></div>
        <LoadingSkeleton count={2} />
      </div>
    );
  }

  if (errorMsg || !charger) {
    return (
      <div className="space-y-4">
        <Link
          href="/driver/find-charger"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-brand-blue"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Charger Discovery</span>
        </Link>
        <ErrorState message={errorMsg || 'Charger not found'} onRetry={fetchCharger} />
      </div>
    );
  }

  const station = charger.station;
  const isAvailable = charger.status === 'Available';
  const tariffRate = station?.current_tariff?.rate_per_kwh || 18.5;
  const illustrativeDistance = `${(1.2 + (charger.charger_id * 0.7) % 8.5).toFixed(1)} km away`;

  return (
    <div className="space-y-6">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/driver/find-charger"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-brand-blue transition-colors p-2 rounded-xl hover:bg-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Chargers</span>
        </Link>

        <span className="text-xs text-slate-400 font-mono">
          ID: CHG-{String(charger.charger_id).padStart(3, '0')}
        </span>
      </div>

      {/* Hero Charger Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-blue uppercase tracking-wider mb-1">
              <Navigation className="w-3.5 h-3.5" />
              <span>{illustrativeDistance} (approx)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-brand-navy tracking-tight">
              {station?.name || `Charging Hub #${charger.station_id}`}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 mt-1.5">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{station?.address ? `${station.address}, ${station.city}` : 'Noida, Uttar Pradesh'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ChargerStatusBadge status={charger.status} className="text-sm px-3.5 py-1.5" />
          </div>
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-100">
          <div className="p-4 rounded-2xl bg-brand-surface border border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Connector Standard
            </span>
            <p className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-blue"></span>
              {charger.connector_type}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-brand-surface border border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Max Power Output
            </span>
            <p className="text-sm font-bold text-brand-blue mt-1 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-brand-blue fill-brand-blue/20" />
              {charger.power_kw} kW {Number(charger.power_kw) >= 50 ? 'DC Fast' : 'AC'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-brand-surface border border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Standard Tariff
            </span>
            <p className="text-sm font-bold text-emerald-700 mt-1 flex items-center gap-0.5">
              <IndianRupee className="w-3.5 h-3.5" />
              {tariffRate} / kWh
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-brand-surface border border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Operating City
            </span>
            <p className="text-sm font-bold text-slate-900 mt-1">
              {station?.city || 'Noida'}
            </p>
          </div>
        </div>

        {/* Quick Driver Tips */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>24/7 Access &bull; Compatible with CCS2 vehicles (Tata, MG, Hyundai, BYD)</span>
          </div>
          <Link
            href="/driver/support"
            className="text-brand-blue font-semibold hover:underline inline-flex items-center gap-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Report issue with this charger</span>
          </Link>
        </div>
      </div>

      {/* Demonstration Session Section */}
      <div className="max-w-2xl mx-auto">
        <DemoSessionWorkflow
          charger={charger}
          onSessionUpdated={fetchCharger}
          autoOpen={autoStart}
        />
      </div>
    </div>
  );
}

export default function ChargerDetailPage() {
  return (
    <Suspense fallback={<LoadingSkeleton count={2} />}>
      <ChargerDetailContent />
    </Suspense>
  );
}
