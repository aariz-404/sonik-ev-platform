'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, MapPin, Activity, LifeBuoy, LogOut, User as UserIcon, Menu, X } from 'lucide-react';
import { getStoredUser, clearSession } from '@/lib/auth';

export function Navbar() {
  const pathname = usePathname();
  const user = getStoredUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Find a Charger', href: '/driver/find-charger', icon: <MapPin className="w-4 h-4" /> },
    { label: 'My Sessions', href: '/driver/sessions', icon: <Activity className="w-4 h-4" /> },
    { label: 'Support & Issues', href: '/driver/support', icon: <LifeBuoy className="w-4 h-4" /> },
  ];

  const handleLogout = () => {
    clearSession();
    window.location.href = '/login';
  };

  return (
    <>
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <Link href="/driver/find-charger" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-navy flex items-center justify-center text-brand-blue shadow-sm">
                <Zap className="w-5 h-5 fill-brand-blue" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold tracking-widest text-brand-blue leading-none">
                  Sonik Mobility
                </span>
                <span className="text-base font-black tracking-tight text-brand-navy">
                  CHARGECONNECT
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-brand-blue text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right: Driver Profile & Logout */}
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    {user?.name || 'EV Driver'}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate max-w-[140px]">
                    {user?.email || 'driver@sonik.ev'}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-50 text-brand-blue border border-blue-200 flex items-center justify-center font-bold text-xs">
                  {user?.name ? user.name[0].toUpperCase() : 'D'}
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                    isActive ? 'bg-brand-blue text-white' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">{user?.name || 'EV Driver'}</p>
                <p className="text-[11px] text-slate-500">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs text-rose-600 font-semibold px-2 py-1 rounded bg-rose-50"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Bottom Navigation Bar (App-like for EV drivers on mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 flex justify-around py-2 px-1 shadow-modal">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors ${
                isActive ? 'text-brand-blue' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {item.icon}
              <span>{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
