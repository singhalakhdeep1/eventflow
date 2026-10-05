<script lang="ts">
  import Header from '$lib/components/Header.svelte';
</script>

<div class="min-h-screen bg-gradient-to-b from-purple-50 to-white">
  <Header />

  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
    <h1 class="text-5xl font-bold text-gray-900 mb-6">Discover amazing events</h1>
    <p class="text-xl text-gray-600 mb-12">Pick your seat, get your ticket, walk in with a QR code.</p>
    <a
      href="/events"
      class="inline-block bg-purple-600 text-white py-3 px-8 rounded-lg hover:bg-purple-700 transition-colors font-semibold text-lg"
    >
      Browse events
    </a>
  </section>

  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
    <div>
      <div class="text-3xl mb-3" aria-hidden="true">🎉</div>
      <h3 class="text-xl font-semibold mb-2">Browse events</h3>
      <p class="text-gray-600">Find concerts, conferences and more.</p>
    </div>
    <div>
      <div class="text-3xl mb-3" aria-hidden="true">🎫</div>
      <h3 class="text-xl font-semibold mb-2">Choose your seat</h3>
      <p class="text-gray-600">See the live seat map and hold seats while you decide.</p>
    </div>
    <div>
      <div class="text-3xl mb-3" aria-hidden="true">📱</div>
      <h3 class="text-xl font-semibold mb-2">Digital tickets</h3>
      <p class="text-gray-600">Show your QR code at the door for fast check-in.</p>
    </div>
  </section>
</div>
