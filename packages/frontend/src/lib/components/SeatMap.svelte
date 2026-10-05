<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Seat, SeatMapSection } from '$lib/types';

  export let sections: SeatMapSection[] = [];
  export let selected: string[] = [];
  export let currency = 'USD';
  export let maxSelectable = 10;

  const dispatch = createEventDispatcher<{ change: string[] }>();

  const money = (value: number) =>
    new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);

  function isFree(seat: Seat) {
    return seat.isAvailable && !seat.isHeld;
  }

  function toggle(seat: Seat) {
    if (!isFree(seat)) return;
    let next: string[];
    if (selected.includes(seat.id)) {
      next = selected.filter((id) => id !== seat.id);
    } else if (selected.length < maxSelectable) {
      next = [...selected, seat.id];
    } else {
      return;
    }
    selected = next;
    dispatch('change', next);
  }

  function rowsOf(seats: Seat[]) {
    const rows = new Map<string, Seat[]>();
    for (const seat of seats) {
      rows.set(seat.row, [...(rows.get(seat.row) ?? []), seat]);
    }
    return [...rows.entries()]
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([row, rowSeats]) => ({
        row,
        seats: rowSeats.sort((a, b) => Number(a.seatNumber) - Number(b.seatNumber))
      }));
  }

  function seatClass(seat: Seat, isSelected: boolean) {
    if (isSelected) return 'bg-purple-600 text-white border-purple-700';
    if (!seat.isAvailable) return 'bg-gray-300 text-gray-400 border-gray-300 cursor-not-allowed';
    if (seat.isHeld) return 'bg-yellow-100 text-yellow-700 border-yellow-300 cursor-not-allowed';
    return 'bg-white text-gray-700 border-gray-300 hover:border-purple-500';
  }

  $: allSeats = sections.flatMap((s) => s.seats);
  $: total = allSeats.filter((s) => selected.includes(s.id)).reduce((sum, s) => sum + s.price, 0);
</script>

<div class="space-y-6">
  <div class="text-center text-xs uppercase tracking-widest text-gray-500 bg-gray-100 rounded py-2">Stage</div>

  {#each sections as section (section.name)}
    <div>
      <h4 class="font-semibold text-gray-800 mb-2">Section {section.name}</h4>
      <div class="space-y-1 overflow-x-auto">
        {#each rowsOf(section.seats) as { row, seats } (row)}
          <div class="flex items-center gap-1">
            <span class="w-6 text-xs text-gray-400">{row}</span>
            {#each seats as seat (seat.id)}
              <button
                type="button"
                disabled={!isFree(seat)}
                aria-pressed={selected.includes(seat.id)}
                aria-label={`Section ${seat.section} row ${seat.row} seat ${seat.seatNumber}, ${money(seat.price)}`}
                title={`${seat.section}${seat.row}-${seat.seatNumber} · ${money(seat.price)}`}
                class={`w-7 h-7 text-[10px] rounded border ${seatClass(seat, selected.includes(seat.id))}`}
                on:click={() => toggle(seat)}
              >
                {seat.seatNumber}
              </button>
            {/each}
          </div>
        {/each}
      </div>
    </div>
  {/each}

  <div class="flex flex-wrap items-center gap-4 text-xs text-gray-600">
    <span class="flex items-center gap-1"><span class="w-3 h-3 rounded border border-gray-300 bg-white"></span>Available</span>
    <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-purple-600"></span>Selected</span>
    <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-yellow-100 border border-yellow-300"></span>Held</span>
    <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-gray-300"></span>Sold</span>
    <span class="ml-auto font-semibold text-gray-900">{selected.length} selected · {money(total)}</span>
  </div>
</div>
