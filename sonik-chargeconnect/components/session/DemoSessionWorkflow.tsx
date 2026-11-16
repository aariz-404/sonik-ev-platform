'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Charger, ChargingSession } from '@/types';
import { apiCreateSession, apiUpdateSession } from '@/lib/api';
import { SessionStatusBadge } from '@/components/ui/Badges';
import { useToast } from '@/hooks/useToast';
import {
  Zap,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  BatteryCharging,
  IndianRupee,
} from 'lucide-react';

interface DemoSessionWorkflowProps {
  charger: Charger;
  onSessionUpdated?: () => void;
  autoOpen?: boolean;
}

export function DemoSessionWorkflow({
  charger,
  onSessionUpdated,
  autoOpen = false,
}: DemoSessionWorkflowProps) {
  const [currentSession, setCurrentSession] = useState<ChargingSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [energyDelivered, setEnergyDelivered] = useState(15.5);

  const toast = useToast();
  const isChargerAvailable = charger.status === 'Available';

  // Live timer when session is Active
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (currentSession?.status === 'Active') {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentSession?.status]);

  // Step 3 & 4: Start Demo Session (POST /api/v1/sessions)
  const handleStartSession = async () => {
    if (!isChargerAvailable) {
      toast.error('Charger Unavailable', `This charger is currently ${charger.status}. Only Available units can be engaged.`);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const session = await apiCreateSession(charger.charger_id);
      setCurrentSession(session);
      toast.success('Session Created', `Demo session #${session.session_id} created with status: Created.`);
      if (onSessionUpdated) onSessionUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to start demo charging session.');
      toast.error('Session Creation Failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 6: Activate Session (PATCH /api/v1/sessions/<id> -> Active)
  const handleActivateSession = async () => {
    if (!currentSession) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const updated = await apiUpdateSession(currentSession.session_id, 'Active');
      setCurrentSession(updated);
      toast.success('Charging Active', 'Power relay engaged. Current session is now Active.');
      if (onSessionUpdated) onSessionUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to activate session.');
      toast.error('Activation Failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 8: Complete Session (PATCH /api/v1/sessions/<id> -> Completed)
  const handleCompleteSession = async () => {
    if (!currentSession) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const updated = await apiUpdateSession(
        currentSession.session_id,
        'Completed',
        energyDelivered
      );
      setCurrentSession(updated);
      toast.success('Session Completed', `Successfully delivered ${energyDelivered} kWh. Mock payment recorded.`);
      if (onSessionUpdated) onSessionUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to complete session.');
      toast.error('Completion Failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 8: Cancel Session (PATCH /api/v1/sessions/<id> -> Cancelled)
  const handleCancelSession = async () => {
    if (!currentSession) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const updated = await apiUpdateSession(currentSession.session_id, 'Cancelled');
      setCurrentSession(updated);
      toast.info('Session Cancelled', `Session #${currentSession.session_id} has been cancelled.`);
      if (onSessionUpdated) onSessionUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to cancel session.');
      toast.error('Cancellation Failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center">
            <BatteryCharging className="w-5 h-5 text-brand-blue" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Demonstration Charging Session</h3>
            <p className="text-xs text-slate-500">
              Interactive test workflow linked to live backend state machine
            </p>
          </div>
        </div>

        {currentSession && <SessionStatusBadge status={currentSession.status} />}
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STATE 0: Not started yet */}
      {!currentSession && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-brand-surface border border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Target Charger:</span>
              <span className="font-mono font-bold text-slate-900">
                CHG-{String(charger.charger_id).padStart(3, '0')} ({charger.connector_type})
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Power Rating:</span>
              <span className="font-bold text-brand-blue">{charger.power_kw} kW</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Current Status:</span>
              <span className={`font-semibold ${isChargerAvailable ? 'text-emerald-600' : 'text-rose-600'}`}>
                {charger.status}
              </span>
            </div>
          </div>

          <button
            onClick={handleStartSession}
            disabled={!isChargerAvailable || isLoading}
            className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-brand-blue hover:bg-brand-blue-hover shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span>Initiating Session...</span>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Start Demo Session</span>
              </>
            )}
          </button>

          {!isChargerAvailable && (
            <p className="text-center text-xs text-rose-600 font-medium">
              Cannot start session: This charger is currently {charger.status}.
            </p>
          )}
        </div>
      )}

      {/* STATE 1: Session Created (Pending activation) */}
      {currentSession && currentSession.status === 'Created' && (
        <div className="space-y-4 p-5 rounded-xl bg-indigo-50/50 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
                Session Generated
              </span>
              <p className="text-lg font-mono font-black text-slate-900">
                SES-{String(currentSession.session_id).padStart(4, '0')}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
              Ready to Plug In
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            The session was created on the backend. Plug your vehicle connector and click <strong>Activate Session</strong> to start the power flow.
          </p>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleActivateSession}
              disabled={isLoading}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-brand-blue hover:bg-brand-blue-hover shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <Zap className="w-4 h-4" />
              <span>{isLoading ? 'Activating...' : 'Activate Session'}</span>
            </button>

            <button
              onClick={handleCancelSession}
              disabled={isLoading}
              className="py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* STATE 2: Session Active (Charging in progress) */}
      {currentSession && currentSession.status === 'Active' && (
        <div className="space-y-5 p-5 rounded-xl bg-blue-50/70 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-blue block">
                Live Active Session
              </span>
              <p className="text-lg font-mono font-black text-slate-900">
                SES-{String(currentSession.session_id).padStart(4, '0')}
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-brand-blue border border-blue-200 shadow-sm text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-brand-blue animate-ping"></span>
              <span>{formatTimer(elapsedSeconds)}</span>
            </div>
          </div>

          {/* Telemetry Display */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-white border border-blue-100">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Power Delivery</span>
              <p className="text-base font-bold text-slate-900 mt-0.5">{charger.power_kw} kW</p>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Simulated Delivered Energy</span>
              <p className="text-base font-bold text-brand-blue mt-0.5">{energyDelivered} kWh</p>
            </div>
          </div>

          {/* Energy adjustment slider for realistic simulation */}
          <div>
            <div className="flex justify-between text-xs text-slate-600 font-medium mb-1">
              <span>Adjust simulated energy delivered:</span>
              <span className="font-bold text-slate-900">{energyDelivered} kWh</span>
            </div>
            <input
              type="range"
              min="1"
              max="65"
              step="0.5"
              value={energyDelivered}
              onChange={(e) => setEnergyDelivered(parseFloat(e.target.value))}
              className="w-full accent-brand-blue cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleCompleteSession}
              disabled={isLoading}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isLoading ? 'Completing...' : 'Finish & Disconnect'}</span>
            </button>

            <button
              onClick={handleCancelSession}
              disabled={isLoading}
              className="py-2.5 px-3 rounded-xl text-xs font-semibold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 transition-colors"
            >
              Emergency Abort
            </button>
          </div>
        </div>
      )}

      {/* STATE 3: Session Completed or Cancelled */}
      {currentSession && (currentSession.status === 'Completed' || currentSession.status === 'Cancelled') && (
        <div className="space-y-4 p-5 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-white border border-slate-200 shadow-sm">
            {currentSession.status === 'Completed' ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            ) : (
              <XCircle className="w-6 h-6 text-slate-400" />
            )}
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Session #{currentSession.session_id} {currentSession.status}
            </h4>
            {currentSession.status === 'Completed' && (
              <p className="text-xs text-slate-500 mt-1">
                Total energy delivered: <strong>{currentSession.energy_kwh} kWh</strong>. Hardware reset to Available.
              </p>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setCurrentSession(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Start New Test
            </button>

            <Link
              href="/driver/sessions"
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-blue hover:bg-brand-blue-hover transition-colors"
            >
              <span>View My Sessions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
