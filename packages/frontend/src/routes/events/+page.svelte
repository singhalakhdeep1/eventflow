<script>
  import { onMount } from 'svelte';
  import { eventStore } from '$lib/stores/event';
  import { authStore } from '$lib/stores/auth';

  onMount(() => {
    eventStore.fetchEvents({ status: 'PUBLISHED' });
  });

  $: events = $eventStore.events;
  $: isLoading = $eventStore.isLoading;
  $: user = $authStore.user;

  /** @param {string} eventId */
  function handleRegister(eventId) {
    if (!user) {
      window.location.href = '/auth/login';
      return;
    }
    window.location.href = `/events/${eventId}`;
  }

  function logout() {
    authStore.logout();
    window.location.href = '/auth/login';
  }
</script>

<div class="min-h-screen bg-gray-50">
  <header class="bg-white shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center">
          <span class="text-2xl font-bold text-purple-600">EventFlow</span>
        </div>
        <nav class="flex space-x-8">
          <a href="/" class="text-gray-700 hover:text-purple-600">Home</a>
          <a href="/registrations" class="text-gray-700 hover:text-purple-600">My Registrations</a>
          <button on:click={logout} class="text-gray-700 hover:text-purple-600">Logout</button>
        </nav>
      </div>
    </div>
  </header>

  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h2 class="text-3xl font-bold text-gray-900 mb-8">Available Events</h2>

    {#if isLoading}
      <div class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading events...</p>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        {#each events as event}
          <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div class="h-48 bg-gradient-to-r from-purple-400 to-purple-600"></div>
            <div class="p-6">
              <h3 class="text-xl font-semibold mb-2">{event.name}</h3>
              <div class="flex items-center text-gray-600 mb-2">
                <span class="text-sm">{event.venueName || 'Venue TBD'}</span>
              </div>
              <div class="flex items-center text-gray-600 mb-2">
                <span class="text-sm">{event.date || event.startDate || 'TBD'}</span>
              </div>
              <div class="flex items-center text-gray-600 mb-4">
                <span class="text-sm">{event.category || 'General admission'}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-2xl font-bold text-purple-600">${event.basePrice || 0}</span>
                <button
                  on:click={() => handleRegister(event.id)}
                  class="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </section>
</div>
