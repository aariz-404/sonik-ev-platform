'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MapPin,
  Zap,
  Activity,
  LifeBuoy,
  LogOut,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { getStoredUser, clearSession } from '@/lib/auth';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const user = getStoredUser();

  const navItems = [
    {
      label: 'Network Overview',
      href: '/operator',
      icon: <LayoutDashboard className="w-4 h-4" />,
      exact: true,
    },
    {
      label: 'Stations',
      href: '/operator/stations',
      icon: <MapPin className="w-4 h-4" />,
      exact: false,
    },
    {
      label: 'Chargers',
      href: '/operator/chargers',
      icon: <Zap className="w-4 h-4" />,
      exact: false,
    },
    {
      label: 'Sessions',
      href: '/operator/sessions',
      icon: <Activity className="w-4 h-4" />,
      exact: false,
    },
    {
      label: 'Service Tickets',
      href: '/operator/tickets',
      icon: <LifeBuoy className="w-4 h-4" />,
      exact: false,
    },
  ];

  const handleLogout = () => {
    clearSession();
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-brand-navy flex flex-col border-r border-slate-800 transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-blue">
              Sonik Mobility
            </span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-wider text-white">CHARGEOPS</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-brand-blue/20 text-brand-blue border border-brand-blue/30">
                PRO
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Operations
          </div>
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-blue text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 opacity-75" />}
              </Link>
            );
          })}
        </div>

        {/* User Profile & Role Card */}
        <div className="p-4 border-t border-slate-800/80 bg-brand-navy-dark/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-brand-blue/20 border border-brand-blue/40 flex items-center justify-center text-brand-blue font-bold text-xs">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'OP'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'Operator'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                  {user?.role || 'OPERATOR'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
