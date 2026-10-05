<script lang="ts">
  import { goto } from '$app/navigation';
  import Header from '$lib/components/Header.svelte';
  import EventForm from '$lib/components/EventForm.svelte';
  import { errorMessage, eventsApi, seatMapApi } from '$lib/api';
  import { authStore } from '$lib/stores/auth';
  import type { EventInput } from '$lib/types';

  let busy = false;
  let error: string | null = null;

  $: if ($authStore.ready && !$authStore.user) goto('/auth?next=/events/new');
  $: allowed = $authStore.user?.role === 'ORGANIZER' || $authStore.user?.role === 'ADMIN';

  async function create(e: CustomEvent<EventInput>) {
    busy = true;
    error = null;
    try {
      const event = await eventsApi.create(e.detail);
      // Generate a default seat map sized to the event; organizers can adjust it from the edit page
      const perRow = 10;
      const rows = Math.ceil(e.detail.totalSeats / (perRow * 4)) || 1;
      await seatMapApi.configure(event.id, {
        sectionCount: 4,
        rowsPerSection: rows,
        seatsPerRow: perRow,
        basePrice: e.detail.basePrice
      });
      goto(`/events/${event.id}/edit`);
    } catch (err) {
      error = errorMessage(err, 'Could not create the event');
      busy = false;
    }
  }
</script>

<div class="min-h-screen bg-gray-50">
  <Header />
  <main class="max-w-3xl mx-auto px-4 py-10">
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Create event</h1>
    {#if $authStore.ready && $authStore.user && !allowed}
      <p role="alert" class="text-red-600">Only organizer accounts can create events.</p>
    {:else}
      <div class="bg-white rounded-lg shadow p-6">
        <EventForm submitLabel="Create event" {busy} {error} on:submit={create} />
      </div>
    {/if}
  </main>
</div>
