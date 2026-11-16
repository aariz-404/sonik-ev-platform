/**
 * lib/api.ts — Type-safe REST API client connecting ChargeOps to the Flask backend.
 */

import { getStoredToken, clearSession } from '@/lib/auth';
import {
  ApiResponse,
  User,
  Station,
  Charger,
  ChargingSession,
  ServiceTicket,
  AnalyticsSummary,
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
      // Don't auto-redirect if trying to login
      if (!endpoint.includes('/auth/login')) {
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
// Auth APIs
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
// Analytics APIs
// ---------------------------------------------------------------------------

export async function apiGetAnalyticsSummary(): Promise<AnalyticsSummary> {
  const res = await request<AnalyticsSummary>('/analytics/summary');
  return res.data!;
}

// ---------------------------------------------------------------------------
// Station APIs
// ---------------------------------------------------------------------------

export interface StationFilterParams {
  city?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export async function apiGetStations(
  params: StationFilterParams = {}
): Promise<{ stations: Station[]; pagination: any }> {
  const query = new URLSearchParams();
  if (params.city) query.set('city', params.city);
  if (params.search) query.set('search', params.search);
  if (params.limit) query.set('limit', String(params.limit));
  if (params.offset !== undefined) query.set('offset', String(params.offset));

  const endpoint = `/stations${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await request<Station[]>(endpoint);
  return {
    stations: res.data || [],
    pagination: res.pagination,
  };
}

export async function apiGetStation(id: number): Promise<Station> {
  const res = await request<Station>(`/stations/${id}`);
  return res.data!;
}

// ---------------------------------------------------------------------------
// Charger APIs
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

// ---------------------------------------------------------------------------
// Session APIs
// ---------------------------------------------------------------------------

export interface SessionFilterParams {
  status?: string;
  charger_id?: number;
  limit?: number;
  offset?: number;
}

export async function apiGetSessions(
  params: SessionFilterParams = {}
): Promise<{ sessions: ChargingSession[]; pagination: any }> {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.charger_id) query.set('charger_id', String(params.charger_id));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.offset !== undefined) query.set('offset', String(params.offset));

  const endpoint = `/sessions${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await request<ChargingSession[]>(endpoint);
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
// Ticket APIs
// ---------------------------------------------------------------------------

export interface TicketFilterParams {
  status?: string;
  priority?: string;
  limit?: number;
  offset?: number;
}

export async function apiGetTickets(
  params: TicketFilterParams = {}
): Promise<{ tickets: ServiceTicket[]; pagination: any }> {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.priority) query.set('priority', params.priority);
  if (params.limit) query.set('limit', String(params.limit));
  if (params.offset !== undefined) query.set('offset', String(params.offset));

  const endpoint = `/tickets${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await request<ServiceTicket[]>(endpoint);
  return {
    tickets: res.data || [],
    pagination: res.pagination,
  };
}

export async function apiUpdateTicket(
  ticketId: number,
  data: { status?: string; priority?: string; description?: string }
): Promise<ServiceTicket> {
  const res = await request<ServiceTicket>(`/tickets/${ticketId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return res.data!;
}
