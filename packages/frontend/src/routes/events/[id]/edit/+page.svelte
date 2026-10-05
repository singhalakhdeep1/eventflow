<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Header from '$lib/components/Header.svelte';
  import EventForm from '$lib/components/EventForm.svelte';
  import { errorMessage, eventsApi, seatMapApi } from '$lib/api';
  import { authStore } from '$lib/stores/auth';
  import type { Event, EventInput, EventStatus } from '$lib/types';

  const eventId = $page.params.id;

  let event: Event | null = null;
  let loadError: string | null = null;
  let busy = false;
  let error: string | null = null;
  let notice: string | null = null;

  let sectionCount = 4;
  let rowsPerSection = 8;
  let seatsPerRow = 12;

  $: if ($authStore.ready && !$authStore.user) goto(`/auth?next=/events/${eventId}/edit`);

  async function load() {
    try {
      event = await eventsApi.getById(eventId);
    } catch (err) {
      loadError = errorMessage(err, 'Event not found');
    }
  }
  onMount(load);

  async function save(e: CustomEvent<EventInput>) {
    busy = true;
    error = notice = null;
    try {
      event = await eventsApi.update(eventId, e.detail);
      notice = 'Event saved.';
    } catch (err) {
      error = errorMessage(err, 'Could not save the event');
    } finally {
      busy = false;
    }
  }

  async function setStatus(status: EventStatus) {
    error = notice = null;
    try {
      event = await eventsApi.setStatus(eventId, status);
      notice = `Event is now ${status.toLowerCase()}.`;
    } catch (err) {
      error = errorMessage(err, 'Could not change the status');
    }
  }

  async function regenerateSeats() {
    if (!confirm('This replaces the existing seat map. Continue?')) return;
    error = notice = null;
    try {
      const result = await seatMapApi.configure(eventId, {
        sectionCount,
        rowsPerSection,
        seatsPerRow,
        basePrice: event?.basePrice
      });
      notice = `Seat map generated: ${result.created} seats.`;
      await load();
    } catch (err) {
      error = errorMessage(err, 'Could not generate the seat map');
    }
  }

  async function remove() {
    if (!confirm('Delete this event? This cannot be undone.')) return;
    try {
      await eventsApi.remove(eventId);
      goto('/organizer');
    } catch (err) {
      error = errorMessage(err, 'Could not delete the event (events with sold tickets cannot be deleted)');
    }
  }

  const statuses: EventStatus[] = ['DRAFT', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED'];
  const input = 'w-24 px-2 py-1 border border-gray-300 rounded';
</script>

<div class="min-h-screen bg-gray-50">
  <Header />
  <main class="max-w-3xl mx-auto px-4 py-10 space-y-8">
    {#if loadError}
      <p role="alert" class="text-red-600">{loadError}</p>
    {:else if !event}
      <p class="text-gray-600">Loading…</p>
    {:else}
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-gray-900">Edit event</h1>
        <a href={`/events/${event.id}`} class="text-purple-600 underline text-sm">View public page</a>
      </div>

      {#if notice}<p role="status" class="text-sm text-green-700">{notice}</p>{/if}

      <div class="bg-white rounded-lg shadow p-6">
        <EventForm initial={event} submitLabel="Save changes" {busy} {error} on:submit={save} />
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-3">Status: <span class="text-purple-600">{event.status}</span></h2>
        <div class="flex flex-wrap gap-2">
          {#each statuses as status}
            <button
              class="px-3 py-1 rounded border text-sm disabled:opacity-40 hover:border-purple-500"
              disabled={event.status === status}
              on:click={() => setStatus(status)}
            >
              {status}
            </button>
          {/each}
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-3">Seat map</h2>
        <div class="flex flex-wrap items-end gap-4 text-sm">
          <label>Sections <input type="number" min="1" max="26" class={input} bind:value={sectionCount} /></label>
          <label>Rows <input type="number" min="1" max="50" class={input} bind:value={rowsPerSection} /></label>
          <label>Seats/row <input type="number" min="1" max="50" class={input} bind:value={seatsPerRow} /></label>
          <button on:click={regenerateSeats} class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
            Generate seat map
          </button>
        </div>
        <p class="text-xs text-gray-500 mt-2">Not possible once tickets have been sold. Sections A and B are priced as VIP and premium.</p>
      </div>

      <div class="flex gap-4 text-sm">
        <a href={`/organizer/checkin/${event.id}`} class="text-purple-600 underline">Open check-in</a>
        <button on:click={remove} class="text-red-600 underline">Delete event</button>
      </div>
    {/if}
  </main>
</div>
