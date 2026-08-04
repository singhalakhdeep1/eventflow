import { writable } from 'svelte/store';
import type { User, AuthResponse } from '$lib/types';
import { authApi } from '$lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>(initialState);

  return {
    subscribe,
    login: async (email: string, password: string) => {
      update(state => ({ ...state, isLoading: true, error: null }));
      try {
        const response = await authApi.login(email, password);
        localStorage.setItem('token', response.access_token);
        set({
          user: response.user,
          token: response.access_token,
          isLoading: false,
          error: null,
        });
      } catch (error: any) {
        update(state => ({
          ...state,
          isLoading: false,
          error: error.message || 'Login failed',
        }));
        throw error;
      }
    },
    register: async (data: any) => {
      update(state => ({ ...state, isLoading: true, error: null }));
      try {
        const response = await authApi.register(data);
        localStorage.setItem('token', response.access_token);
        set({
          user: response.user,
          token: response.access_token,
          isLoading: false,
          error: null,
        });
      } catch (error: any) {
        update(state => ({
          ...state,
          isLoading: false,
          error: error.message || 'Registration failed',
        }));
        throw error;
      }
    },
    logout: () => {
      localStorage.removeItem('token');
      set(initialState);
    },
    fetchProfile: async () => {
      update(state => ({ ...state, isLoading: true }));
      try {
        const user = await authApi.getProfile();
        update(state => ({ ...state, user, isLoading: false }));
      } catch (error: any) {
        update(state => ({
          ...state,
          isLoading: false,
          error: error.message || 'Failed to fetch profile',
        }));
      }
    },
    clearError: () => {
      update(state => ({ ...state, error: null }));
    },
  };
}

export const authStore = createAuthStore();
