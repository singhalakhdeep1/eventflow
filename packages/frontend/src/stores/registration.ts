import { writable } from 'svelte/store';
import type { Registration } from '$lib/types';
import { registrationsApi } from '$lib/api';

interface RegistrationState {
  registrations: Registration[];
  selectedRegistration: Registration | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: RegistrationState = {
  registrations: [],
  selectedRegistration: null,
  isLoading: false,
  error: null,
};

function createRegistrationStore() {
  const { subscribe, set, update } = writable<RegistrationState>(initialState);

  return {
    subscribe,
    fetchRegistrations: async (filters?: any) => {
      update(state => ({ ...state, isLoading: true }));
      try {
        const registrations = await registrationsApi.getAll(filters);
        update(state => ({ ...state, registrations, isLoading: false }));
      } catch (error: any) {
        update(state => ({
          ...state,
          isLoading: false,
          error: error.message || 'Failed to fetch registrations',
        }));
      }
    },
    fetchRegistrationById: async (id: string) => {
      update(state => ({ ...state, isLoading: true }));
      try {
        const registration = await registrationsApi.getById(id);
        update(state => ({ ...state, selectedRegistration: registration, isLoading: false }));
      } catch (error: any) {
        update(state => ({
          ...state,
          isLoading: false,
          error: error.message || 'Failed to fetch registration',
        }));
      }
    },
    createRegistration: async (data: any) => {
      update(state => ({ ...state, isLoading: true }));
      try {
        const registration = await registrationsApi.create(data);
        update(state => ({
          ...state,
          registrations: [...state.registrations, registration],
          isLoading: false,
        }));
      } catch (error: any) {
        update(state => ({
          ...state,
          isLoading: false,
          error: error.message || 'Failed to create registration',
        }));
      }
    },
    cancelRegistration: async (id: string) => {
      update(state => ({ ...state, isLoading: true }));
      try {
        const registration = await registrationsApi.cancel(id);
        update(state => ({
          ...state,
          registrations: state.registrations.map(r => r.id === id ? registration : r),
          isLoading: false,
        }));
      } catch (error: any) {
        update(state => ({
          ...state,
          isLoading: false,
          error: error.message || 'Failed to cancel registration',
        }));
      }
    },
    clearError: () => {
      update(state => ({ ...state, error: null }));
    },
  };
}

export const registrationStore = createRegistrationStore();
