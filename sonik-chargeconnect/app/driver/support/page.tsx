'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ServiceTicket, Charger } from '@/types';
import { apiCreateTicket, apiGetTickets, apiGetChargers } from '@/lib/api';
import { LoadingSkeleton, EmptyState, ErrorState } from '@/components/ui/States';
import { useToast } from '@/hooks/useToast';
import {
  LifeBuoy,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  HelpCircle,
  Wrench,
  ShieldAlert,
  CreditCard,
  WifiOff,
} from 'lucide-react';

export default function SupportPage() {
  const toast = useToast();

  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [category, setCategory] = useState<string>('Hardware');
  const [priority, setPriority] = useState<string>('Medium');
  const [selectedChargerId, setSelectedChargerId] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [ticketList, chargerRes] = await Promise.all([
        apiGetTickets(),
        apiGetChargers({ limit: 50 }),
      ]);
      setTickets(ticketList);
      setChargers(chargerRes.chargers);
    } catch (err: any) {
      console.error('Failed to load support tickets', err);
      setErrorMsg(err.message || 'Unable to retrieve tickets.');
      toast.error('Data Fetch Error', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error('Validation Error', 'Please describe the issue in detail.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newTicket = await apiCreateTicket({
        category,
        priority,
        charger_id: selectedChargerId ? Number(selectedChargerId) : null,
        description: description.trim(),
      });

      toast.success(
        'Ticket Submitted',
        `Service ticket #${newTicket.ticket_id} logged. Operations team notified.`
      );

      // Reset form
      setDescription('');
      setSelectedChargerId('');
      setCategory('Hardware');
      setPriority('Medium');

      // Refresh list
      await loadData();
    } catch (err: any) {
      toast.error('Submission Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'Critical':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">Critical</span>;
      case 'High':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">High</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700">Medium</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">Low</span>;
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Resolved
          </span>
        );
      case 'InProgress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-brand-blue border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-brand-blue" />
            In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Open
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">
          Driver Assistance
        </span>
        <h1 className="text-2xl font-black text-brand-navy tracking-tight mt-0.5">
          Support & Service Requests
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Report damaged connectors, billing inquiries, or charging interruptions to ChargeOps
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Ticket Submission Form */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <PlusCircle className="w-4 h-4 text-brand-blue" />
            <h2 className="text-sm font-bold text-slate-900">Log New Service Ticket</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Issue Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-blue"
              >
                <option value="Hardware">Hardware / Connector Defect</option>
                <option value="Software">Software / Screen Freeze</option>
                <option value="Connectivity">Network / Offline Station</option>
                <option value="Billing">Billing & Tariff Query</option>
                <option value="Safety">Safety & Parking Obstruction</option>
                <option value="Other">General Feedback / Other</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Affected Charger (Optional)
              </label>
              <select
                value={selectedChargerId}
                onChange={(e) => setSelectedChargerId(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-blue"
              >
                <option value="">General (No Specific Charger)</option>
                {chargers.map((c) => (
                  <option key={c.charger_id} value={c.charger_id}>
                    CHG-{String(c.charger_id).padStart(3, '0')} — {c.station?.name || `Station #${c.station_id}`} ({c.connector_type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Urgency Level
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {['Low', 'Medium', 'High', 'Critical'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setPriority(lvl)}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      priority === lvl
                        ? 'bg-brand-navy text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Detailed Description
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the symptom (e.g. CCS2 gun lock would not engage, dispenser screen blacked out)..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-brand-blue hover:bg-brand-blue-hover shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Submitting Request...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Ticket to ChargeOps</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Existing Tickets List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-sm font-bold text-slate-900">Recent Service Tickets</h2>
            <span className="text-xs text-slate-400 font-medium">
              {tickets.length} total recorded
            </span>
          </div>

          {errorMsg ? (
            <ErrorState message={errorMsg} onRetry={loadData} />
          ) : isLoading ? (
            <LoadingSkeleton count={3} />
          ) : tickets.length === 0 ? (
            <EmptyState
              title="No tickets submitted"
              description="You have not submitted any service tickets yet. If you encounter any issue at our charging stations, file a report above."
            />
          ) : (
            <div className="space-y-3">
              {tickets.map((t) => (
                <div
                  key={t.ticket_id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          TCK-{String(t.ticket_id).padStart(4, '0')}
                        </span>
                        {getPriorityBadge(t.priority)}
                        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {t.category}
                        </span>
                      </div>
                      {t.charger_id && (
                        <p className="text-xs text-brand-blue font-medium mt-1">
                          Ref: Charger CHG-{String(t.charger_id).padStart(3, '0')}
                        </p>
                      )}
                    </div>
                    {getStatusBadge(t.status)}
                  </div>

                  <p className="text-xs text-slate-700 bg-brand-surface p-3 rounded-xl border border-slate-100 leading-relaxed">
                    {t.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-50">
                    <span>
                      Logged: {new Date(t.created_at).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                    <span className="font-medium text-slate-500">
                      ChargeOps Response Window: &lt; 2 hrs
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
