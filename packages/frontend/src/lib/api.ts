import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';
import type {
  AuthResponse,
  CheckinStats,
  Event,
  EventInput,
  EventStatus,
  Payout,
  RegisterInput,
  SeatHold,
  SeatMap,
  Ticket,
  User
} from '$lib/types';

export const API_URL = env.PUBLIC_API_URL || 'http://localhost:3002';
const TOKEN_KEY = 'token';

export const tokenStorage = {
  get: () => (browser ? localStorage.getItem(TOKEN_KEY) : null),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY)
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  params?: Record<string, string | undefined>;
};

async function request<T>(path: string, { method = 'GET', body, params }: RequestOptions = {}): Promise<T> {
  const url = new URL(path, API_URL);
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined) url.searchParams.set(key, value);
  }

  const headers: Record<string, string> = {};
  const token = tokenStorage.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let response: Response;
  try {
    response = await fetch(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ApiError(0, 'Cannot reach the server');
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    // A 401 on the login call itself is just bad credentials, not an expired session
    if (response.status === 401 && path !== '/auth/login' && browser) {
      tokenStorage.clear();
      window.location.href = '/auth';
    }
    const message = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
    throw new ApiError(response.status, typeof message === 'string' ? message : response.statusText);
  }
  return data as T;
}

/** Extracts a human-readable message from an API error. */
export function errorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error instanceof ApiError) {
    // Generic server errors are not useful to end users
    return error.status >= 500 ? fallback : error.message || fallback;
  }
  return fallback;
}

export const authApi = {
  login: (email: string, password: string) => request<AuthResponse>('/auth/login', { method: 'POST', body: { email, password } }),
  register: (data: RegisterInput) => request<AuthResponse>('/auth/register', { method: 'POST', body: data }),
  getProfile: () => request<User>('/auth/profile')
};

export const eventsApi = {
  getAll: (params?: { status?: EventStatus; organizerId?: string }) => request<Event[]>('/events', { params }),
  getById: (id: string) => request<Event>(`/events/${id}`),
  create: (data: EventInput) => request<Event>('/events', { method: 'POST', body: data }),
  update: (id: string, data: Partial<EventInput>) => request<Event>(`/events/${id}`, { method: 'PUT', body: data }),
  setStatus: (id: string, status: EventStatus) => request<Event>(`/events/${id}/status`, { method: 'PUT', body: { status } }),
  remove: (id: string) => request<Event>(`/events/${id}`, { method: 'DELETE' })
};

export const seatMapApi = {
  get: (eventId: string) => request<SeatMap>(`/seat-map/event/${eventId}`),
  hold: (eventId: string, seatIds: string[]) => request<SeatHold>('/seat-map/hold', { method: 'POST', body: { eventId, seatIds } }),
  release: (seatIds: string[]) => request<{ released: number }>('/seat-map/release', { method: 'POST', body: { seatIds } }),
  configure: (
    eventId: string,
    config: { sectionCount: number; rowsPerSection: number; seatsPerRow: number; basePrice?: number }
  ) => request<{ created: number }>(`/seat-map/configure/${eventId}`, { method: 'POST', body: config })
};

export const ticketsApi = {
  purchase: (seatId: string) => request<Ticket>('/tickets/purchase', { method: 'POST', body: { seatId } }),
  mine: () => request<Ticket[]>('/tickets/my-tickets')
};

export const checkinApi = {
  scan: (qrCode: string) => request<Ticket>('/checkin/scan', { method: 'POST', body: { qrCode } }),
  stats: (eventId: string) => request<CheckinStats>(`/checkin/event/${eventId}/stats`),
  list: (eventId: string) => request<Ticket[]>(`/checkin/event/${eventId}`)
};

export const payoutsApi = {
  pending: () => request<{ pendingEarnings: number; events: number }>('/payouts/pending'),
  history: () => request<Payout[]>('/payouts/history'),
  request: (eventId: string) => request<Payout>('/payouts/request', { method: 'POST', body: { eventId } })
};
