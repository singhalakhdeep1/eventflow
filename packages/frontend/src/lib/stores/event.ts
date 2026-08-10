import { writable } from 'svelte/store';
import type { Event } from '$lib/types';

type EventState = {
  events: Event[];
  selectedEvent: Event | null;
  isLoading: boolean;
  error: string | null;
};

const createEventStore = () => {
  const { subscribe, set, update } = writable<EventState>({ events: [], selectedEvent: null, isLoading: false, error: null });

  return {
    subscribe,
    fetchEvents: async (filters: Record<string, unknown>) => {
      update((state) => ({ ...state, isLoading: true }));
      try {
        const response = await fetch('http://localhost:3004/events');
        const events = await response.json();
        set({ events, selectedEvent: null, isLoading: false, error: null });
      } catch (error) {
        update((state) => ({ ...state, isLoading: false, error: 'Failed to fetch events' }));
      }
    },
  };
};

export const eventStore = createEventStore();
