/**
 * lib/auth.ts — Authentication and session management helpers for Sonik ChargeOps
 */

import { User } from '@/types';

const TOKEN_KEY = 'sonik_chargeops_token';
const USER_KEY = 'sonik_chargeops_user';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setSession(token: string, user: User): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to store session in localStorage', e);
  }
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (e) {
    console.error('Failed to clear session', e);
  }
}

export function isAuthenticated(): boolean {
  return Boolean(getStoredToken());
}

export function hasOperatorAccess(role?: string): boolean {
  if (!role) {
    const user = getStoredUser();
    role = user?.role;
  }
  return role === 'ADMIN' || role === 'OPERATOR' || role === 'SUPPORT';
}
