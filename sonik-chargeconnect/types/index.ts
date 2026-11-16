/**
 * types/index.ts — Shared TypeScript definitions for Sonik ChargeConnect
 */

export type UserRole = 'ADMIN' | 'OPERATOR' | 'DRIVER' | 'SUPPORT';

export interface User {
  user_id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export interface Tariff {
  tariff_id: number;
  station_id: number;
  rate_per_kwh: number;
  valid_from: string;
  valid_to?: string | null;
  created_at?: string;
}

export interface Station {
  station_id: number;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  created_at?: string;
  updated_at?: string;
  charger_count?: number;
  available_chargers?: number;
  current_tariff?: Tariff | null;
}

export type ChargerConnector = 'CCS2' | 'Type2' | 'CHAdeMO' | 'AC' | 'DC';
export type ChargerStatus = 'Available' | 'Charging' | 'Offline' | 'Maintenance';

export interface Charger {
  charger_id: number;
  station_id: number;
  connector_type: ChargerConnector;
  power_kw: number;
  status: ChargerStatus;
  created_at?: string;
  updated_at?: string;
  station?: Station | null;
  distanceKm?: number;
}

export type SessionStatus = 'Created' | 'Active' | 'Completed' | 'Cancelled' | 'Failed';

export interface ChargingSession {
  session_id: number;
  user_id: number;
  charger_id: number;
  start_time?: string | null;
  end_time?: string | null;
  energy_kwh: number;
  status: SessionStatus;
  created_at: string;
  updated_at?: string;
  user?: User;
  charger?: Charger;
}

export type TicketCategory = 'Hardware' | 'Software' | 'Billing' | 'Connectivity' | 'Safety' | 'Other';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TicketStatus = 'Open' | 'InProgress' | 'Resolved' | 'Closed';

export interface ServiceTicket {
  ticket_id: number;
  user_id: number;
  charger_id: number;
  category: TicketCategory;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  created_at: string;
  updated_at?: string;
}

export interface Pagination {
  total: number;
  limit: number;
  offset: number;
  pages: number;
  current_page: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: string[];
  pagination?: Pagination;
}
