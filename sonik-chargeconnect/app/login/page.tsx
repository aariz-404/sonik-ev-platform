'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Zap, Mail, Lock, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { apiLogin } from '@/lib/api';
import { setSession, isAuthenticated } from '@/lib/auth';
import { useToast } from '@/hooks/useToast';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace('/driver/find-charger');
    }
    if (searchParams.get('expired') === '1') {
      setErrorMsg('Your session has expired. Please sign in again.');
    }
  }, [router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const data = await apiLogin(email, password);
      setSession(data.token, data.user);
      toast.success('Welcome Back!', `Signed in as ${data.user.name}`);
      router.push('/driver/find-charger');
    } catch (err: any) {
      const msg = err.message || 'Authentication failed. Please verify credentials.';
      setErrorMsg(msg);
      toast.error('Login Failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseDemo = () => {
    setEmail('driver@sonik.ev');
    setPassword('driver123');
    setErrorMsg(null);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-modal p-7 sm:p-9 space-y-6">
      {/* Logo & Headline */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand-navy flex items-center justify-center text-brand-blue mx-auto shadow-sm">
          <Zap className="w-7 h-7 fill-brand-blue" />
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-brand-blue block">
            Sonik Mobility
          </span>
          <h1 className="text-2xl font-black text-brand-navy tracking-tight">
            ChargeConnect
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            EV Driver Charger Discovery & Session Management
          </p>
        </div>
      </div>

      {/* Quick Demo Autofill Button */}
      <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200/60 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-brand-navy">Demo EV Driver Account</p>
          <p className="text-[11px] text-slate-500 font-mono">driver@sonik.ev / driver123</p>
        </div>
        <button
          type="button"
          onClick={handleUseDemo}
          className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-brand-blue text-white hover:bg-brand-blue-hover transition-colors shadow-sm"
        >
          Autofill
        </button>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 block">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="driver@sonik.ev"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 block">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-brand-blue hover:bg-brand-blue-hover shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <span>Signing In...</span>
          ) : (
            <>
              <span>Sign In to ChargeConnect</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Footer: Register Link */}
      <div className="pt-2 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-600">
          New EV driver?{' '}
          <Link
            href="/register"
            className="font-bold text-brand-blue hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-brand-surface">
      {/* Top Banner */}
      <div className="bg-brand-navy text-white text-xs py-2 px-4 text-center border-b border-slate-800 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-brand-blue shrink-0" />
        <span>Demonstration EV Driver Portal &bull; Sonik Mobility Network</span>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <Suspense fallback={
          <div className="w-full max-w-md bg-white rounded-3xl p-9 text-center">
            <div className="w-8 h-8 border-3 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500 mt-3">Loading authentication portal...</p>
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>

      {/* Footer disclaimer */}
      <footer className="py-4 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} Sonik Mobility. EV Charging Network Management Platform.
      </footer>
    </div>
  );
}
