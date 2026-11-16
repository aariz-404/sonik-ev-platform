import React from 'react';
import { AlertTriangle } from 'lucide-react';

export function DemoBanner() {
  return (
    <div className="bg-amber-500 text-slate-950 px-4 py-1 text-xs font-medium flex items-center justify-center gap-2 select-none border-b border-amber-600/30">
      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
      <span>
        <strong>DEMO PROTOTYPE ONLY:</strong> Fictional EV charging infrastructure records. Not connected to physical EV charger hardware or live billing systems.
      </span>
    </div>
  );
}
