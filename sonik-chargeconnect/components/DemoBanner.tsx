import React from 'react';
import { Sparkles } from 'lucide-react';

export function DemoBanner() {
  return (
    <div className="bg-brand-navy text-white text-[11px] sm:text-xs font-medium py-1.5 px-4 text-center border-b border-slate-800 flex items-center justify-center gap-2 select-none">
      <Sparkles className="w-3.5 h-3.5 text-brand-blue shrink-0" />
      <span>
        <strong>DEMONSTRATION PORTAL ONLY:</strong> Simulated EV charging telemetry & fictional station records. No physical vehicle hardware or real payment processing is involved.
      </span>
    </div>
  );
}
