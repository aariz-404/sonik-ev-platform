/**
 * lib/api.ts — Type-safe REST API client connecting ChargeConnect to the Flask backend.
 */

import { getStoredToken, clearSession } from '@/lib/auth';
import {
  ApiResponse,
  User,
  Station,
  Charger,
  ChargingSession,
  ServiceTicket,
} from '@/types';

function getApiBase(): string {
  let url = process.env.NEXT_PUBLIC_API_URL;
  if (!url || url.includes('localhost')) {
    if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
      return 'https://sonik-ev-platform.vercel.app/api/v1';
    }
  }
  if (url && url.includes('sonik-ev-backend.vercel.app')) {
    return url.replace('sonik-ev-backend.vercel.app', 'sonik-ev-platform.vercel.app');
  }
  return url || 'http://localhost:5000/api/v1';
}

export class ApiError extends Error {
  code: number;
  errors?: string[];

  constructor(message: string, code: number = 400, errors?: string[]) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.errors = errors;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const apiBase = getApiBase();
  const url = `${apiBase}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getStoredToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err) {
    throw new ApiError(
      'Unable to connect to Sonik backend. Ensure Flask server is running at ' + apiBase,
      0
    );
  }

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined') {
      if (!endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
        clearSession();
        window.location.href = '/login?expired=1';
      }
    }

    const message =
      json?.message ||
      json?.error ||
      `Request failed with status code ${res.status}`;
    const errors = json?.errors || (json?.detail ? [json.detail] : undefined);
    throw new ApiError(message, res.status, errors);
  }

  return json as ApiResponse<T>;
}

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------

export async function apiLogin(email: string, password: string): Promise<{
  token: string;
  token_type: string;
  expires_in: number;
  user: User;
}> {
  const res = await request<{
    token: string;
    token_type: string;
    expires_in: number;
    user: User;
  }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return res.data!;
}

export async function apiRegister(name: string, email: string, password: string): Promise<{
  token: string;
  token_type: string;
  expires_in: number;
  user: User;
}> {
  const res = await request<{
    token: string;
    token_type: string;
    expires_in: number;
    user: User;
  }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  return res.data!;
}

export async function apiGetMe(): Promise<User> {
  const res = await request<User>('/auth/me');
  return res.data!;
}

export async function apiLogout(): Promise<void> {
  try {
    await request('/auth/logout', { method: 'POST' });
  } finally {
    clearSession();
  }
}

// ---------------------------------------------------------------------------
// Chargers & Stations
// ---------------------------------------------------------------------------

export interface ChargerFilterParams {
  station_id?: number;
  connector_type?: string;
  status?: string;
  min_power?: number;
  limit?: number;
  offset?: number;
}

export async function apiGetChargers(
  params: ChargerFilterParams = {}
): Promise<{ chargers: Charger[]; pagination: any }> {
  const query = new URLSearchParams();
  if (params.station_id) query.set('station_id', String(params.station_id));
  if (params.connector_type) query.set('connector_type', params.connector_type);
  if (params.status) query.set('status', params.status);
  if (params.min_power) query.set('min_power', String(params.min_power));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.offset !== undefined) query.set('offset', String(params.offset));

  const endpoint = `/chargers${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await request<Charger[]>(endpoint);
  return {
    chargers: res.data || [],
    pagination: res.pagination,
  };
}

export async function apiGetCharger(id: number): Promise<Charger> {
  const res = await request<Charger>(`/chargers/${id}`);
  return res.data!;
}

export async function apiGetStations(city?: string): Promise<Station[]> {
  const endpoint = city ? `/stations?city=${encodeURIComponent(city)}` : '/stations';
  const res = await request<Station[]>(endpoint);
  return res.data || [];
}

export async function apiGetStation(id: number): Promise<Station> {
  const res = await request<Station>(`/stations/${id}`);
  return res.data!;
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

export async function apiCreateSession(chargerId: number): Promise<ChargingSession> {
  const res = await request<ChargingSession>('/sessions', {
    method: 'POST',
    body: JSON.stringify({ charger_id: chargerId }),
  });
  return res.data!;
}

export async function apiGetSessions(
  status?: string,
  limit: number = 20,
  offset: number = 0
): Promise<{ sessions: ChargingSession[]; pagination: any }> {
  const query = new URLSearchParams();
  if (status) query.set('status', status);
  query.set('limit', String(limit));
  query.set('offset', String(offset));

  const res = await request<ChargingSession[]>(`/sessions?${query.toString()}`);
  return {
    sessions: res.data || [],
    pagination: res.pagination,
  };
}

export async function apiUpdateSession(
  sessionId: number,
  status: string,
  energyKwh?: number
): Promise<ChargingSession> {
  const body: any = { status };
  if (energyKwh !== undefined && energyKwh !== null) {
    body.energy_kwh = energyKwh;
  }
  const res = await request<ChargingSession>(`/sessions/${sessionId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  return res.data!;
}

// ---------------------------------------------------------------------------
// Service Requests / Tickets
// ---------------------------------------------------------------------------

export async function apiCreateTicket(data: {
  charger_id?: number | null;
  category: string;
  description: string;
  priority?: string;
}): Promise<ServiceTicket> {
  const res = await request<ServiceTicket>('/tickets', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data!;
}

export async function apiGetTickets(): Promise<ServiceTicket[]> {
  const res = await request<ServiceTicket[]>('/tickets');
  return res.data || [];
}
