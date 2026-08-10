import { c as create_ssr_component, s as subscribe, b as each, e as escape } from "../../../chunks/ssr.js";
import { w as writable } from "../../../chunks/index.js";
import { a as authStore } from "../../../chunks/auth.js";
const createEventStore = () => {
  const { subscribe: subscribe2, set, update } = writable({ events: [], selectedEvent: null, isLoading: false, error: null });
  return {
    subscribe: subscribe2,
    fetchEvents: async (filters) => {
      update((state) => ({ ...state, isLoading: true }));
      try {
        const response = await fetch("http://localhost:3004/events");
        const events = await response.json();
        set({ events, selectedEvent: null, isLoading: false, error: null });
      } catch (error) {
        update((state) => ({ ...state, isLoading: false, error: "Failed to fetch events" }));
      }
    }
  };
};
const eventStore = createEventStore();
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let events;
  let isLoading;
  let $authStore, $$unsubscribe_authStore;
  let $eventStore, $$unsubscribe_eventStore;
  $$unsubscribe_authStore = subscribe(authStore, (value) => $authStore = value);
  $$unsubscribe_eventStore = subscribe(eventStore, (value) => $eventStore = value);
  events = $eventStore.events;
  isLoading = $eventStore.isLoading;
  $authStore.user;
  $$unsubscribe_authStore();
  $$unsubscribe_eventStore();
  return `<div class="min-h-screen bg-gray-50"><header class="bg-white shadow-sm"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="flex justify-between items-center h-16"><div class="flex items-center" data-svelte-h="svelte-1dwtx2g"><span class="text-2xl font-bold text-purple-600">EventFlow</span></div> <nav class="flex space-x-8"><a href="/" class="text-gray-700 hover:text-purple-600" data-svelte-h="svelte-m0tqf5">Home</a> <a href="/registrations" class="text-gray-700 hover:text-purple-600" data-svelte-h="svelte-o1s9yw">My Registrations</a> <button class="text-gray-700 hover:text-purple-600" data-svelte-h="svelte-k59bnh">Logout</button></nav></div></div></header> <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"><h2 class="text-3xl font-bold text-gray-900 mb-8" data-svelte-h="svelte-rwokzy">Available Events</h2> ${isLoading ? `<div class="text-center py-12" data-svelte-h="svelte-jxar63"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div> <p class="mt-4 text-gray-600">Loading events...</p></div>` : `<div class="grid grid-cols-1 md:grid-cols-3 gap-8">${each(events, (event) => {
    return `<div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"><div class="h-48 bg-gradient-to-r from-purple-400 to-purple-600"></div> <div class="p-6"><h3 class="text-xl font-semibold mb-2">${escape(event.name)}</h3> <div class="flex items-center text-gray-600 mb-2"><span class="text-sm">${escape(event.venueName || "Venue TBD")}</span></div> <div class="flex items-center text-gray-600 mb-2"><span class="text-sm">${escape(event.date || event.startDate || "TBD")}</span></div> <div class="flex items-center text-gray-600 mb-4"><span class="text-sm">${escape(event.category || "General admission")}</span></div> <div class="flex justify-between items-center"><span class="text-2xl font-bold text-purple-600">$${escape(event.basePrice || 0)}</span> <button class="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors" data-svelte-h="svelte-es1ded">Register</button> </div></div> </div>`;
  })}</div>`}</section></div>`;
});
export {
  Page as default
};
