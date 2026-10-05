<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { EventInput } from '$lib/types';

  export let initial: Partial<EventInput> | null = null;
  export let submitLabel = 'Save event';
  export let busy = false;
  export let error: string | null = null;

  const dispatch = createEventDispatcher<{ submit: EventInput }>();

  // <input type="datetime-local"> wants "YYYY-MM-DDTHH:mm" in local time
  const toLocalInput = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 16);
  };

  let name = initial?.name ?? '';
  let description = initial?.description ?? '';
  let venueName = initial?.venueName ?? '';
  let venueAddress = initial?.venueAddress ?? '';
  let category = initial?.category ?? 'Music';
  let startDate = toLocalInput(initial?.startDate);
  let endDate = toLocalInput(initial?.endDate);
  let totalSeats = initial?.totalSeats ?? 100;
  let basePrice = initial?.basePrice ?? 0;
  let validation: string | null = null;

  const categories = ['Music', 'Sports', 'Conference', 'Arts', 'Food', 'Community', 'Other'];

  function submit() {
    validation = null;
    if (!startDate || !endDate || new Date(endDate) <= new Date(startDate)) {
      validation = 'The end date must be after the start date.';
      return;
    }
    dispatch('submit', {
      name: name.trim(),
      description: description.trim(),
      venueName: venueName.trim(),
      venueAddress: venueAddress.trim(),
      category,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      totalSeats: Number(totalSeats),
      basePrice: Number(basePrice)
    });
  }

  const input = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500';
</script>

<form on:submit|preventDefault={submit} class="space-y-5">
  <div>
    <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Event name</label>
    <input id="name" class={input} bind:value={name} maxlength="200" required />
  </div>

  <div>
    <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
    <textarea id="description" class={input} rows="4" bind:value={description} required></textarea>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div>
      <label for="venueName" class="block text-sm font-medium text-gray-700 mb-1">Venue</label>
      <input id="venueName" class={input} bind:value={venueName} required />
    </div>
    <div>
      <label for="venueAddress" class="block text-sm font-medium text-gray-700 mb-1">Address</label>
      <input id="venueAddress" class={input} bind:value={venueAddress} required />
    </div>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div>
      <label for="startDate" class="block text-sm font-medium text-gray-700 mb-1">Starts</label>
      <input id="startDate" type="datetime-local" class={input} bind:value={startDate} required />
    </div>
    <div>
      <label for="endDate" class="block text-sm font-medium text-gray-700 mb-1">Ends</label>
      <input id="endDate" type="datetime-local" class={input} bind:value={endDate} required />
    </div>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <div>
      <label for="category" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
      <select id="category" class={input} bind:value={category}>
        {#each categories as c}<option value={c}>{c}</option>{/each}
      </select>
    </div>
    <div>
      <label for="totalSeats" class="block text-sm font-medium text-gray-700 mb-1">Total seats</label>
      <input id="totalSeats" type="number" min="1" step="1" class={input} bind:value={totalSeats} required />
    </div>
    <div>
      <label for="basePrice" class="block text-sm font-medium text-gray-700 mb-1">Base price</label>
      <input id="basePrice" type="number" min="0" step="0.01" class={input} bind:value={basePrice} required />
    </div>
  </div>

  {#if validation || error}
    <p role="alert" class="text-sm text-red-600">{validation ?? error}</p>
  {/if}

  <button
    type="submit"
    disabled={busy}
    class="bg-purple-600 text-white py-2 px-6 rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
  >
    {busy ? 'Saving…' : submitLabel}
  </button>
</form>
