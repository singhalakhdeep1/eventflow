import axios from 'axios';
import type { User, Event, TicketType, Registration, AuthResponse } from '$lib/types';

const API_URL = 'http://localhost:3004';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (data: any): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

export const eventsApi = {
  getAll: async (filters?: any): Promise<Event[]> => {
    const response = await api.get('/events', { params: filters });
    return response.data;
  },
  getById: async (id: string): Promise<Event> => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },
  create: async (data: any): Promise<Event> => {
    const response = await api.post('/events', data);
    return response.data;
  },
  update: async (id: string, data: any): Promise<Event> => {
    const response = await api.put(`/events/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/events/${id}`);
  },
};

export const registrationsApi = {
  getAll: async (filters?: any): Promise<Registration[]> => {
    const response = await api.get('/registrations', { params: filters });
    return response.data;
  },
  getById: async (id: string): Promise<Registration> => {
    const response = await api.get(`/registrations/${id}`);
    return response.data;
  },
  create: async (data: any): Promise<Registration> => {
    const response = await api.post('/registrations', data);
    return response.data;
  },
  cancel: async (id: string): Promise<Registration> => {
    const response = await api.post(`/registrations/${id}/cancel`);
    return response.data;
  },
};
