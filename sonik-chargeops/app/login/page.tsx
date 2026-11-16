'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiLogin } from '@/lib/api';
import { setSession, hasOperatorAccess } from '@/lib/auth';
import { Zap, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { DemoBanner } from '@/components/DemoBanner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const data = await apiLogin(email.trim(), password);
      // Check role
      if (!hasOperatorAccess(data.user.role)) {
        setErrorMsg(
          `User role "${data.user.role}" does not have operator access to ChargeOps. Please log in with an Operator, Admin, or Support account.`
        );
        setIsLoading(false);
        return;
      }

      setSession(data.token, data.user);
      router.push('/operator');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-brand-surface flex flex-col justify-between">
      <DemoBanner />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full">
          {/* Card Container */}
          <div className="bg-white rounded-2xl shadow-dropdown border border-slate-200/80 p-8 sm:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-navy text-brand-blue mb-4 shadow-sm border border-slate-800">
                <Zap className="w-6 h-6 fill-brand-blue" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-blue">
                Sonik Mobility
              </p>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                CHARGEOPS
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Centralized EV Network Operations & Fleet Management
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-700 font-medium leading-relaxed">{errorMsg}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Operator Email
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operator@sonik.ev"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-brand-blue hover:bg-brand-blue-hover focus:outline-none focus:ring-4 focus:ring-brand-blue/20 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to ChargeOps</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Logins */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
                Quick Fill Demo Accounts
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemoAccount('operator@sonik.ev', 'operator123')}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:border-brand-blue hover:text-brand-blue hover:bg-blue-50/30 transition-all text-left flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-blue shrink-0" />
                  <span className="truncate">Operator (Demo)</span>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemoAccount('admin@sonik.ev', 'admin123')}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:border-brand-blue hover:text-brand-blue hover:bg-blue-50/30 transition-all text-left flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="truncate">Admin (Demo)</span>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemoAccount('support@sonik.ev', 'support123')}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:border-brand-blue hover:text-brand-blue hover:bg-blue-50/30 transition-all text-left flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Support (Demo)</span>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemoAccount('driver@sonik.ev', 'driver123')}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:border-amber-400 hover:text-amber-700 hover:bg-amber-50/30 transition-all text-left flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
                  <span className="truncate">Driver (Test 403)</span>
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Sonik EV Platform &bull; Educational Prototype &bull; &copy; 2026
          </p>
        </div>
      </div>
    </div>
  );
}
