import { writable } from 'svelte/store';
import type { User } from '$lib/types';

type AuthState = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
};

const createAuthStore = () => {
  const { subscribe, set, update } = writable<AuthState>({ user: null, token: null, isLoading: false, error: null });

  return {
    subscribe,
    login: async (email: string, password: string) => {
      update((state) => ({ ...state, isLoading: true, error: null }));
      try {
        const response = await fetch('http://localhost:3004/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        set({ user: data.user, token: data.access_token, isLoading: false, error: null });
      } catch (error) {
        update((state) => ({ ...state, isLoading: false, error: 'Login failed' }));
      }
    },
    register: async (data: Record<string, unknown>) => {
      update((state) => ({ ...state, isLoading: true, error: null }));
      try {
        const response = await fetch('http://localhost:3004/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const payload = await response.json();
        localStorage.setItem('token', payload.access_token);
        set({ user: payload.user, token: payload.access_token, isLoading: false, error: null });
      } catch (error) {
        update((state) => ({ ...state, isLoading: false, error: 'Registration failed' }));
      }
    },
    logout: () => {
      localStorage.removeItem('token');
      set({ user: null, token: null, isLoading: false, error: null });
    },
    fetchProfile: async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const response = await fetch('http://localhost:3004/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = await response.json();
        update((state) => ({ ...state, user, isLoading: false }));
      } catch (error) {
        update((state) => ({ ...state, isLoading: false, error: 'Failed to fetch profile' }));
      }
    },
  };
};

export const authStore = createAuthStore();
