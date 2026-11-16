/**
 * lib/auth.ts — Authentication and session management for Sonik ChargeConnect
 */

import { User } from '@/types';

const DRIVER_TOKEN_KEY = 'sonik_driver_token';
const DRIVER_USER_KEY = 'sonik_driver_user';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(DRIVER_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DRIVER_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setSession(token: string, user: User): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DRIVER_TOKEN_KEY, token);
    localStorage.setItem(DRIVER_USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to store driver session', e);
  }
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(DRIVER_TOKEN_KEY);
    localStorage.removeItem(DRIVER_USER_KEY);
  } catch (e) {
    console.error('Failed to clear driver session', e);
  }
}

export function isAuthenticated(): boolean {
  return Boolean(getStoredToken());
}
