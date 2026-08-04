import { writable } from 'svelte/store';
import type { Event } from '$lib/types';
import { eventsApi } from '$lib/api';

interface EventState {
  events: Event[];
  selectedEvent: Event | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: EventState = {
  events: [],
  selectedEvent: null,
  isLoading: false,
  error: null,
};

function createEventStore() {
  const { subscribe, set, update } = writable<EventState>(initialState);

  return {
    subscribe,
    fetchEvents: async (filters?: any) => {
      update(state => ({ ...state, isLoading: true }));
      try {
        const events = await eventsApi.getAll(filters);
        update(state => ({ ...state, events, isLoading: false }));
      } catch (error: any) {
        update(state => ({
          ...state,
          isLoading: false,
          error: error.message || 'Failed to fetch events',
        }));
      }
    },
    fetchEventById: async (id: string) => {
      update(state => ({ ...state, isLoading: true }));
      try {
        const event = await eventsApi.getById(id);
        update(state => ({ ...state, selectedEvent: event, isLoading: false }));
      } catch (error: any) {
        update(state => ({
          ...state,
          isLoading: false,
          error: error.message || 'Failed to fetch event',
        }));
      }
    },
    createEvent: async (data: any) => {
      update(state => ({ ...state, isLoading: true }));
      try {
        const event = await eventsApi.create(data);
        update(state => ({
          ...state,
          events: [...state.events, event],
          isLoading: false,
        }));
      } catch (error: any) {
        update(state => ({
          ...state,
          isLoading: false,
          error: error.message || 'Failed to create event',
        }));
      }
    },
    updateEvent: async (id: string, data: any) => {
      update(state => ({ ...state, isLoading: true }));
      try {
        const event = await eventsApi.update(id, data);
        update(state => ({
          ...state,
          events: state.events.map(e => e.id === id ? event : e),
          selectedEvent: state.selectedEvent?.id === id ? event : state.selectedEvent,
          isLoading: false,
        }));
      } catch (error: any) {
        update(state => ({
          ...state,
          isLoading: false,
          error: error.message || 'Failed to update event',
        }));
      }
    },
    deleteEvent: async (id: string) => {
      update(state => ({ ...state, isLoading: true }));
      try {
        await eventsApi.delete(id);
        update(state => ({
          ...state,
          events: state.events.filter(e => e.id !== id),
          selectedEvent: state.selectedEvent?.id === id ? null : state.selectedEvent,
          isLoading: false,
        }));
      } catch (error: any) {
        update(state => ({
          ...state,
          isLoading: false,
          error: error.message || 'Failed to delete event',
        }));
      }
    },
    setSelectedEvent: (event: Event | null) => {
      update(state => ({ ...state, selectedEvent: event }));
    },
    clearError: () => {
      update(state => ({ ...state, error: null }));
    },
  };
}

export const eventStore = createEventStore();
