<script lang="ts">
  import { goto } from '$app/navigation';
  import Header from '$lib/components/Header.svelte';
  import { errorMessage, eventsApi, payoutsApi } from '$lib/api';
  import { formatDate, formatMoney } from '$lib/format';
  import { authStore } from '$lib/stores/auth';
  import type { Event, Payout } from '$lib/types';

  let events: Event[] = [];
  let payouts: Payout[] = [];
  let pending = 0;
  let loading = true;
  let error: string | null = null;
  let notice: string | null = null;
  let started = false;

  $: user = $authStore.user;
  $: isStaff = user?.role === 'ORGANIZER' || user?.role === 'ADMIN';

  $: if ($authStore.ready) {
    if (!user) {
      goto('/auth?next=/organizer');
    } else if (isStaff && !started) {
      started = true;
      load();
    } else if (!isStaff) {
      loading = false;
    }
  }

  async function load() {
    try {
      const [mine, earnings, history] = await Promise.all([
        eventsApi.getAll({ organizerId: user!.id }),
        payoutsApi.pending(),
        payoutsApi.history()
      ]);
      events = mine;
      pending = earnings.pendingEarnings;
      payouts = history;
    } catch (err) {
      error = errorMessage(err, 'Could not load your dashboard');
    } finally {
      loading = false;
    }
  }

  const hasPayout = (eventId: string) =>
    payouts.some((p) => p.eventId === eventId && p.status !== 'FAILED');

  async function requestPayout(event: Event) {
    error = notice = null;
    try {
      await payoutsApi.request(event.id);
      notice = `Payout requested for ${event.name}. An admin will process it.`;
      await load();
    } catch (err) {
      error = errorMessage(err, 'Could not request a payout');
    }
  }

  const statusColor: Record<string, string> = {
    DRAFT: 'bg-gray-200 text-gray-700',
    PUBLISHED: 'bg-green-100 text-green-800',
    ONGOING: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-purple-100 text-purple-800',
    CANCELLED: 'bg-red-100 text-red-800'
  };
</script>

<div class="min-h-screen bg-gray-50">
  <Header />
  <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-900">Organizer dashboard</h1>
      <a href="/events/new" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">New event</a>
    </div>

    {#if $authStore.ready && user && !isStaff}
      <p role="alert" class="text-red-600">This page is for organizer accounts.</p>
    {:else if loading}
      <p class="text-gray-600">Loading…</p>
    {:else}
      {#if error}<p role="alert" class="text-red-600">{error}</p>{/if}
      {#if notice}<p role="status" class="text-green-700">{notice}</p>{/if}

      <section class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white rounded-lg shadow p-5">
          <p class="text-sm text-gray-500">Events</p>
          <p class="text-3xl font-bold">{events.length}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-5">
          <p class="text-sm text-gray-500">Earnings not yet paid out (after 5% fee)</p>
          <p class="text-3xl font-bold text-purple-600">{formatMoney(pending)}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-5">
          <p class="text-sm text-gray-500">Payouts</p>
          <p class="text-3xl font-bold">{payouts.length}</p>
        </div>
      </section>

      <section class="bg-white rounded-lg shadow overflow-hidden">
        <h2 class="text-lg font-semibold p-5 border-b">Your events</h2>
        {#if events.length === 0}
          <p class="p-5 text-gray-600">You have not created any events yet.</p>
        {:else}
          <ul class="divide-y">
            {#each events as event (event.id)}
              <li class="p-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <a href={`/events/${event.id}`} class="font-medium text-gray-900 hover:text-purple-600">{event.name}</a>
                  <p class="text-sm text-gray-500">{formatDate(event.startDate)} · {event.availableSeats}/{event.totalSeats} seats left</p>
                </div>
                <div class="flex items-center gap-3 text-sm">
                  <span class={`px-2 py-1 rounded ${statusColor[event.status] ?? ''}`}>{event.status}</span>
                  <a href={`/events/${event.id}/edit`} class="text-purple-600 underline">Edit</a>
                  <a href={`/organizer/checkin/${event.id}`} class="text-purple-600 underline">Check-in</a>
                  {#if new Date(event.endDate) < new Date() && !hasPayout(event.id)}
                    <button on:click={() => requestPayout(event)} class="border border-purple-600 text-purple-600 px-3 py-1 rounded hover:bg-purple-50">
                      Request payout
                    </button>
                  {/if}
                </div>
              </li>
            {/each}
          </ul>
        {/if}
      </section>

      <section class="bg-white rounded-lg shadow overflow-hidden">
        <h2 class="text-lg font-semibold p-5 border-b">Payout history</h2>
        {#if payouts.length === 0}
          <p class="p-5 text-gray-600">No payouts yet.</p>
        {:else}
          <table class="w-full text-sm">
            <thead class="text-left text-gray-500">
              <tr><th class="p-3">Event</th><th class="p-3">Amount</th><th class="p-3">Status</th><th class="p-3">Requested</th></tr>
            </thead>
            <tbody class="divide-y">
              {#each payouts as payout (payout.id)}
                <tr>
                  <td class="p-3">{payout.event?.name ?? payout.eventId}</td>
                  <td class="p-3">{formatMoney(payout.amount)}</td>
                  <td class="p-3">{payout.status}</td>
                  <td class="p-3">{formatDate(payout.requestedAt)}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        {/if}
        <p class="p-4 text-xs text-gray-500 border-t">
          Payouts are sent to the Stripe account connected to your profile. Stripe account onboarding is not available in the app yet.
        </p>
      </section>
    {/if}
  </main>
</div>
