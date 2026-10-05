<script lang="ts">
  import { goto } from '$app/navigation';
  import Header from '$lib/components/Header.svelte';
  import TicketQR from '$lib/components/TicketQR.svelte';
  import { errorMessage, ticketsApi } from '$lib/api';
  import { formatDate, formatMoney } from '$lib/format';
  import { authStore } from '$lib/stores/auth';
  import type { Ticket } from '$lib/types';

  let tickets: Ticket[] = [];
  let loading = true;
  let error: string | null = null;
  let started = false;

  $: if ($authStore.ready) {
    if (!$authStore.user) {
      goto('/auth?next=/tickets');
    } else if (!started) {
      started = true;
      load();
    }
  }

  async function load() {
    try {
      tickets = await ticketsApi.mine();
    } catch (err) {
      error = errorMessage(err, 'Could not load your tickets');
    } finally {
      loading = false;
    }
  }

  const badge: Record<Ticket['status'], string> = {
    VALID: 'bg-green-100 text-green-800',
    USED: 'bg-gray-200 text-gray-700',
    REFUNDED: 'bg-yellow-100 text-yellow-800',
    TRANSFERRED: 'bg-blue-100 text-blue-800'
  };
</script>

<div class="min-h-screen bg-gray-50">
  <Header />
  <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">My tickets</h1>

    {#if loading}
      <p class="text-gray-600">Loading…</p>
    {:else if error}
      <p role="alert" class="text-red-600">{error}</p>
    {:else if tickets.length === 0}
      <p class="text-gray-600">You have no tickets yet. <a href="/events" class="text-purple-600 underline">Browse events</a></p>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        {#each tickets as ticket (ticket.id)}
          <article class="bg-white rounded-lg shadow p-6">
            <div class="flex justify-between items-start gap-2 mb-4">
              <div>
                <h2 class="text-lg font-semibold text-gray-900">{ticket.event?.name ?? 'Event'}</h2>
                {#if ticket.event}
                  <p class="text-sm text-gray-600">{ticket.event.venueName}</p>
                  <p class="text-sm text-gray-600">{formatDate(ticket.event.startDate)}</p>
                {/if}
                {#if ticket.seat}
                  <p class="text-sm text-gray-800 mt-1">
                    Section {ticket.seat.section} · Row {ticket.seat.row} · Seat {ticket.seat.seatNumber}
                  </p>
                {/if}
              </div>
              <span class={`text-xs font-medium px-2 py-1 rounded ${badge[ticket.status]}`}>{ticket.status}</span>
            </div>

            {#if ticket.status === 'VALID'}
              <TicketQR value={ticket.qrCode} />
              <p class="text-center text-xs text-gray-500 mt-2 break-all">{ticket.qrCode}</p>
            {:else if ticket.checkedInAt}
              <p class="text-sm text-gray-600">Checked in {formatDate(ticket.checkedInAt)}</p>
            {/if}

            <p class="text-sm text-gray-500 mt-3">Paid {formatMoney(ticket.purchasePrice, ticket.event?.currency)}</p>
          </article>
        {/each}
      </div>
    {/if}
  </main>
</div>
