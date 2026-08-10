import { writable } from 'svelte/store';
import type { Registration } from '$lib/types';

type RegistrationState = {
  registrations: Registration[];
  selectedRegistration: Registration | null;
  isLoading: boolean;
  error: string | null;
};

const createRegistrationStore = () => {
  const { subscribe, set, update } = writable<RegistrationState>({ registrations: [], selectedRegistration: null, isLoading: false, error: null });

  return {
    subscribe,
    fetchRegistrations: async (filters: Record<string, unknown>) => {
      update((state) => ({ ...state, isLoading: true }));
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3004/registrations', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const registrations = await response.json();
        set({ registrations, selectedRegistration: null, isLoading: false, error: null });
      } catch (error) {
        update((state) => ({ ...state, isLoading: false, error: 'Failed to fetch registrations' }));
      }
    },
    cancelRegistration: async (id: string) => {
      update((state) => ({ ...state, isLoading: true }));
      try {
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:3004/registrations/${id}/cancel`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        update((state) => ({ ...state, isLoading: false }));
      } catch (error) {
        update((state) => ({ ...state, isLoading: false, error: 'Failed to cancel registration' }));
      }
    },
  };
};

export const registrationStore = createRegistrationStore();
