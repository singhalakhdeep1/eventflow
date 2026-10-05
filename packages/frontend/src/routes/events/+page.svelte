<script lang="ts">
  import { onMount } from 'svelte';
  import Header from '$lib/components/Header.svelte';
  import { eventStore } from '$lib/stores/event';
  import { formatDate, formatMoney } from '$lib/format';

  onMount(() => {
    eventStore.fetchEvents({ status: 'PUBLISHED' });
  });
</script>

<div class="min-h-screen bg-gray-50">
  <Header />

  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h2 class="text-3xl font-bold text-gray-900 mb-8">Available events</h2>

    {#if $eventStore.isLoading}
      <div class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading events…</p>
      </div>
    {:else if $eventStore.error}
      <p role="alert" class="text-red-600">{$eventStore.error}</p>
    {:else if $eventStore.events.length === 0}
      <p class="text-gray-600">No events are on sale right now. Check back soon.</p>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        {#each $eventStore.events as event (event.id)}
          <a
            href={`/events/${event.id}`}
            class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow block"
          >
            <div class="h-40 bg-gradient-to-r from-purple-400 to-purple-600"></div>
            <div class="p-6">
              <h3 class="text-xl font-semibold mb-2">{event.name}</h3>
              <p class="text-sm text-gray-600">{event.venueName}</p>
              <p class="text-sm text-gray-600">{formatDate(event.startDate)}</p>
              <p class="text-sm text-gray-600 mb-4">{event.category}</p>
              <div class="flex justify-between items-center">
                <span class="text-2xl font-bold text-purple-600">from {formatMoney(event.basePrice, event.currency)}</span>
                <span class="text-sm text-gray-500">{event.availableSeats} left</span>
              </div>
            </div>
          </a>
        {/each}
      </div>
    {/if}
  </section>
</div>
