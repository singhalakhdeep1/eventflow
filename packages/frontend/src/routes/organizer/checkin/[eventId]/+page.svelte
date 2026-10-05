<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Header from '$lib/components/Header.svelte';
  import QRScanner from '$lib/components/QRScanner.svelte';
  import { checkinApi, errorMessage, eventsApi } from '$lib/api';
  import { formatDate } from '$lib/format';
  import { authStore } from '$lib/stores/auth';
  import type { CheckinStats, Event, Ticket } from '$lib/types';

  const eventId = $page.params.eventId;

  let event: Event | null = null;
  let stats: CheckinStats | null = null;
  let recent: Ticket[] = [];
  let loadError: string | null = null;
  let manualCode = '';
  let busy = false;
  let result: { ok: boolean; message: string } | null = null;
  let scanning = true;
  let started = false;

  $: if ($authStore.ready) {
    if (!$authStore.user) {
      goto(`/auth?next=/organizer/checkin/${eventId}`);
    } else if (!started) {
      started = true;
      refresh();
    }
  }

  async function refresh() {
    try {
      [event, stats, recent] = await Promise.all([
        eventsApi.getById(eventId),
        checkinApi.stats(eventId),
        checkinApi.list(eventId)
      ]);
    } catch (err) {
      loadError = errorMessage(err, 'Could not load check-in data');
    }
  }

  async function checkIn(code: string) {
    const qrCode = code.trim();
    if (!qrCode || busy) return;
    busy = true;
    try {
      const ticket = await checkinApi.scan(qrCode);
      const seat = ticket.seat ? `Section ${ticket.seat.section} Row ${ticket.seat.row} Seat ${ticket.seat.seatNumber}` : 'General admission';
      result = { ok: true, message: `Checked in · ${seat}` };
      manualCode = '';
      await refresh();
    } catch (err) {
      result = { ok: false, message: errorMessage(err, 'Check-in failed') };
    } finally {
      busy = false;
    }
  }
</script>

<div class="min-h-screen bg-gray-50">
  <Header />
  <main class="max-w-4xl mx-auto px-4 py-10 space-y-8">
    {#if loadError}
      <p role="alert" class="text-red-600">{loadError}</p>
    {:else}
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Check-in</h1>
        {#if event}<p class="text-gray-600">{event.name} · {formatDate(event.startDate)}</p>{/if}
      </div>

      {#if stats}
        <section class="grid grid-cols-3 gap-4 text-center">
          <div class="bg-white rounded-lg shadow p-4"><p class="text-2xl font-bold">{stats.checkedIn}</p><p class="text-sm text-gray-500">Checked in</p></div>
          <div class="bg-white rounded-lg shadow p-4"><p class="text-2xl font-bold">{stats.pending}</p><p class="text-sm text-gray-500">Still to arrive</p></div>
          <div class="bg-white rounded-lg shadow p-4"><p class="text-2xl font-bold">{Math.round(stats.checkInRate)}%</p><p class="text-sm text-gray-500">Attendance</p></div>
        </section>
      {/if}

      <section class="bg-white rounded-lg shadow p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">Scan a ticket</h2>
          <button class="text-sm text-purple-600 underline" on:click={() => (scanning = !scanning)}>
            {scanning ? 'Turn camera off' : 'Turn camera on'}
          </button>
        </div>

        {#if scanning}
          <QRScanner on:scan={(e) => checkIn(e.detail)} />
        {/if}

        {#if result}
          <p
            role="status"
            class={`text-center font-medium rounded-lg py-3 ${result.ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
          >
            {result.message}
          </p>
        {/if}

        <form on:submit|preventDefault={() => checkIn(manualCode)} class="flex gap-2">
          <input
            class="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Or enter the ticket code"
            aria-label="Ticket code"
            bind:value={manualCode}
          />
          <button disabled={busy || !manualCode.trim()} class="bg-purple-600 text-white px-4 rounded-lg disabled:opacity-50">Check in</button>
        </form>
      </section>

      <section class="bg-white rounded-lg shadow overflow-hidden">
        <h2 class="text-lg font-semibold p-5 border-b">Recent check-ins</h2>
        {#if recent.length === 0}
          <p class="p-5 text-gray-600">Nobody has checked in yet.</p>
        {:else}
          <ul class="divide-y text-sm">
            {#each recent.slice(0, 20) as ticket (ticket.id)}
              <li class="p-4 flex justify-between">
                <span>{ticket.seat ? `${ticket.seat.section}${ticket.seat.row}-${ticket.seat.seatNumber}` : 'GA'}</span>
                <span class="text-gray-500">{ticket.checkedInAt ? formatDate(ticket.checkedInAt) : ''}</span>
              </li>
            {/each}
          </ul>
        {/if}
      </section>
    {/if}
  </main>
</div>
