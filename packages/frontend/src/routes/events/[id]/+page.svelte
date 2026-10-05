<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Header from '$lib/components/Header.svelte';
  import SeatMap from '$lib/components/SeatMap.svelte';
  import { errorMessage, eventsApi, seatMapApi, ticketsApi } from '$lib/api';
  import { formatDate, formatMoney } from '$lib/format';
  import { authStore } from '$lib/stores/auth';
  import type { Event, SeatMapSection } from '$lib/types';

  const eventId = $page.params.id;

  let event: Event | null = null;
  let sections: SeatMapSection[] = [];
  let selected: string[] = [];
  let loading = true;
  let loadError: string | null = null;
  let buying = false;
  let buyError: string | null = null;

  $: user = $authStore.user;
  $: canManage = !!user && !!event && (user.role === 'ADMIN' || user.id === event.organizerId);
  $: onSale = event?.status === 'PUBLISHED';

  async function loadSeats() {
    sections = (await seatMapApi.get(eventId)).sections;
  }

  onMount(async () => {
    try {
      [event] = await Promise.all([eventsApi.getById(eventId), loadSeats()]);
    } catch (error) {
      loadError = errorMessage(error, 'Event not found');
    } finally {
      loading = false;
    }
  });

  async function buy() {
    if (!user) {
      goto(`/auth?next=${encodeURIComponent(`/events/${eventId}`)}`);
      return;
    }
    buying = true;
    buyError = null;
    try {
      await seatMapApi.hold(eventId, selected);
    } catch (error) {
      buyError = errorMessage(error, 'Those seats are no longer available');
      selected = [];
      buying = false;
      await loadSeats().catch(() => {});
      return;
    }

    const failed: string[] = [];
    let bought = 0;
    for (const seatId of selected) {
      try {
        await ticketsApi.purchase(seatId);
        bought += 1;
      } catch {
        failed.push(seatId);
      }
    }

    if (failed.length) {
      await seatMapApi.release(failed).catch(() => {});
    }
    buying = false;

    if (bought > 0) {
      goto('/tickets');
      return;
    }
    buyError = 'We could not complete your purchase. Please try again.';
    selected = [];
    await loadSeats().catch(() => {});
  }
</script>

<div class="min-h-screen bg-gray-50">
  <Header />

  <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    {#if loading}
      <p class="text-gray-600">Loading…</p>
    {:else if loadError || !event}
      <p role="alert" class="text-red-600">{loadError}</p>
      <a href="/events" class="text-purple-600 underline">Back to events</a>
    {:else}
      <div class="bg-white rounded-lg shadow p-6 mb-8">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-sm text-purple-600 font-medium">{event.category}</p>
            <h1 class="text-3xl font-bold text-gray-900">{event.name}</h1>
            <p class="text-gray-600 mt-1">{event.venueName} · {event.venueAddress}</p>
            <p class="text-gray-600">{formatDate(event.startDate)} – {formatDate(event.endDate)}</p>
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold text-purple-600">from {formatMoney(event.basePrice, event.currency)}</p>
            {#if canManage}
              <a href={`/events/${event.id}/edit`} class="text-sm text-purple-600 underline">Edit event</a>
            {/if}
          </div>
        </div>
        <p class="mt-4 text-gray-700 whitespace-pre-line">{event.description}</p>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Choose your seats</h2>

        {#if !onSale}
          <p class="text-gray-600">Tickets for this event are not on sale ({event.status.toLowerCase()}).</p>
        {:else if sections.length === 0}
          <p class="text-gray-600">The seat map for this event has not been published yet.</p>
        {:else}
          <SeatMap {sections} bind:selected currency={event.currency} />

          {#if buyError}
            <p role="alert" class="text-sm text-red-600 mt-4">{buyError}</p>
          {/if}

          <div class="mt-6 flex items-center gap-4">
            <button
              on:click={buy}
              disabled={buying || selected.length === 0}
              class="bg-purple-600 text-white py-3 px-8 rounded-lg hover:bg-purple-700 disabled:opacity-50 font-semibold"
            >
              {buying ? 'Reserving…' : user ? 'Get tickets' : 'Sign in to buy'}
            </button>
            <span class="text-xs text-gray-500">Seats are held for 15 minutes while you check out.</span>
          </div>
        {/if}
      </div>
    {/if}
  </main>
</div>
