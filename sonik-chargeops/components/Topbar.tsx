'use client';

import React from 'react';
import { Menu, Wifi, Shield, LogOut } from 'lucide-react';
import { getStoredUser, clearSession } from '@/lib/auth';

interface TopbarProps {
  title: string;
  subtitle?: string;
  onOpenSidebar: () => void;
}

export function Topbar({ title, subtitle, onOpenSidebar }: TopbarProps) {
  const user = getStoredUser();

  const handleLogout = () => {
    clearSession();
    window.location.href = '/login';
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="Open navigation sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-500 hidden sm:block">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right: API indicator & Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* API connection indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-medium text-emerald-700">
          <Wifi className="w-3.5 h-3.5 text-emerald-500" />
          <span>Core API Connected</span>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-800 leading-tight">
              {user?.name || 'Operator'}
            </p>
            <p className="text-[10px] text-brand-blue font-semibold uppercase tracking-wider">
              {user?.role || 'OPERATOR'}
            </p>
          </div>

          <div className="w-8 h-8 rounded-full bg-brand-blue/10 border border-brand-blue/30 flex items-center justify-center text-brand-blue text-xs font-bold">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>

          <button
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
