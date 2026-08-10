import { c as create_ssr_component, s as subscribe, b as each, e as escape, d as add_attribute } from "../../../chunks/ssr.js";
import { w as writable } from "../../../chunks/index.js";
import { a as authStore } from "../../../chunks/auth.js";
const createRegistrationStore = () => {
  const { subscribe: subscribe2, set, update } = writable({ registrations: [], selectedRegistration: null, isLoading: false, error: null });
  return {
    subscribe: subscribe2,
    fetchRegistrations: async (filters) => {
      update((state) => ({ ...state, isLoading: true }));
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:3004/registrations", {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const registrations = await response.json();
        set({ registrations, selectedRegistration: null, isLoading: false, error: null });
      } catch (error) {
        update((state) => ({ ...state, isLoading: false, error: "Failed to fetch registrations" }));
      }
    },
    cancelRegistration: async (id) => {
      update((state) => ({ ...state, isLoading: true }));
      try {
        const token = localStorage.getItem("token");
        await fetch(`http://localhost:3004/registrations/${id}/cancel`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        update((state) => ({ ...state, isLoading: false }));
      } catch (error) {
        update((state) => ({ ...state, isLoading: false, error: "Failed to cancel registration" }));
      }
    }
  };
};
const registrationStore = createRegistrationStore();
function getStatusClass(status) {
  switch (status) {
    case "CONFIRMED":
      return "bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium";
    case "CANCELLED":
      return "bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium";
    default:
      return "bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium";
  }
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let registrations;
  let isLoading;
  let $authStore, $$unsubscribe_authStore;
  let $registrationStore, $$unsubscribe_registrationStore;
  $$unsubscribe_authStore = subscribe(authStore, (value) => $authStore = value);
  $$unsubscribe_registrationStore = subscribe(registrationStore, (value) => $registrationStore = value);
  registrations = $registrationStore.registrations;
  isLoading = $registrationStore.isLoading;
  $authStore.user;
  $$unsubscribe_authStore();
  $$unsubscribe_registrationStore();
  return `<div class="min-h-screen bg-gray-50"><header class="bg-white shadow-sm"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="flex justify-between items-center h-16"><div class="flex items-center" data-svelte-h="svelte-1dwtx2g"><span class="text-2xl font-bold text-purple-600">EventFlow</span></div> <nav class="flex space-x-8"><a href="/" class="text-gray-700 hover:text-purple-600" data-svelte-h="svelte-m0tqf5">Home</a> <a href="/events" class="text-gray-700 hover:text-purple-600" data-svelte-h="svelte-fk2rp6">Events</a> <button class="text-gray-700 hover:text-purple-600" data-svelte-h="svelte-k59bnh">Logout</button></nav></div></div></header> <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"><h2 class="text-3xl font-bold text-gray-900 mb-8" data-svelte-h="svelte-hi4r9m">My Registrations</h2> ${isLoading ? `<div class="text-center py-12" data-svelte-h="svelte-18c6et6"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div> <p class="mt-4 text-gray-600">Loading registrations...</p></div>` : `${registrations.length === 0 ? `<div class="bg-white rounded-lg shadow-md p-12 text-center" data-svelte-h="svelte-1um0ep"><p class="text-gray-600 text-lg">No registrations found</p> <a href="/events" class="inline-block mt-4 text-purple-600 hover:text-purple-700">Browse events</a></div>` : `<div class="space-y-6">${each(registrations, (registration) => {
    return `<div class="bg-white rounded-lg shadow-md p-6"><div class="flex justify-between items-start"><div class="flex-1"><h3 class="text-xl font-semibold mb-2">${escape(registration.id)}</h3> <div class="flex items-center text-gray-600 mb-2"><span>Registration for event ${escape(registration.eventId)}</span></div> <div class="mt-4" data-svelte-h="svelte-wed2y9"><span class="text-2xl font-bold text-purple-600">Confirmed</span> <span class="text-gray-600">for event access</span></div> <div class="mt-2"><span${add_attribute("class", getStatusClass(registration.status), 0)}>${escape(registration.status)}</span> </div></div> <div class="ml-6">${registration.status === "PENDING" || registration.status === "CONFIRMED" ? `<button class="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700" data-svelte-h="svelte-1jz1dk2">Cancel
                  </button>` : ``} </div></div> </div>`;
  })}</div>`}`}</section></div>`;
});
export {
  Page as default
};
