import { writable } from 'svelte/store';
import { errorMessage, eventsApi } from '$lib/api';
import type { Event, EventStatus } from '$lib/types';

type EventState = {
  events: Event[];
  isLoading: boolean;
  error: string | null;
};

const createEventStore = () => {
  const { subscribe, set, update } = writable<EventState>({ events: [], isLoading: false, error: null });

  return {
    subscribe,
    fetchEvents: async (filters: { status?: EventStatus; organizerId?: string } = {}) => {
      update((s) => ({ ...s, isLoading: true, error: null }));
      try {
        set({ events: await eventsApi.getAll(filters), isLoading: false, error: null });
      } catch (error) {
        set({ events: [], isLoading: false, error: errorMessage(error, 'Failed to load events') });
      }
    }
  };
};

export const eventStore = createEventStore();
