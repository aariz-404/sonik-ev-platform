import React from 'react';

interface DashboardMetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  accentColor?: 'blue' | 'emerald' | 'amber' | 'slate' | 'indigo';
  isLoading?: boolean;
}

export function DashboardMetricCard({
  title,
  value,
  subtext,
  icon,
  accentColor = 'blue',
  isLoading = false,
}: DashboardMetricCardProps) {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50/80',
      text: 'text-brand-blue',
      border: 'border-blue-100',
    },
    emerald: {
      bg: 'bg-emerald-50/80',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
    },
    amber: {
      bg: 'bg-amber-50/80',
      text: 'text-amber-600',
      border: 'border-amber-100',
    },
    slate: {
      bg: 'bg-slate-100/80',
      text: 'text-slate-600',
      border: 'border-slate-200',
    },
    indigo: {
      bg: 'bg-indigo-50/80',
      text: 'text-indigo-600',
      border: 'border-indigo-100',
    },
  }[accentColor];

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{title}</p>
          {isLoading ? (
            <div className="h-8 w-24 bg-slate-200 rounded animate-pulse my-1"></div>
          ) : (
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
          )}
          {subtext && (
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1">{subtext}</p>
          )}
        </div>
        <div className={`p-2.5 rounded-xl ${colorMap.bg} ${colorMap.text} border ${colorMap.border}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
