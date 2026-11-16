/**
 * types/index.ts — Shared TypeScript definitions for Sonik ChargeOps
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
  user?: User;
  charger?: Charger;
}

export interface PaymentRecord {
  payment_id: number;
  session_id: number;
  amount: number;
  payment_status: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
  reference_code: string;
  created_at: string;
}

export interface AnalyticsStats {
  total_stations: number;
  total_chargers: number;
  available_chargers: number;
  charging_chargers: number;
  offline_chargers: number;
  maintenance_chargers: number;
  active_sessions: number;
  open_tickets: number;
  total_energy_today_kwh: number;
  total_energy_all_time_kwh: number;
  completed_sessions_today: number;
}

export interface RecentActivityItem {
  session_id: number;
  user_id: number;
  user_name: string;
  charger_id: number;
  charger_connector: string | null;
  charger_power_kw: number | null;
  station_name: string | null;
  station_city: string | null;
  start_time: string | null;
  end_time: string | null;
  energy_kwh: number;
  status: SessionStatus;
  created_at: string;
}

export interface AnalyticsSummary {
  stats: AnalyticsStats;
  recent_activity: RecentActivityItem[];
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
