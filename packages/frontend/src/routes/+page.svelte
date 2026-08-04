<script>
  import { goto } from '$app/navigation';
</script>

<div class="min-h-screen bg-gradient-to-b from-purple-50 to-white">
  <header class="bg-white shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center">
          <span class="text-2xl font-bold text-purple-600">EventFlow</span>
        </div>
        <nav class="flex space-x-8">
          <a href="/events" class="text-gray-700 hover:text-purple-600">Events</a>
          <a href="/auth/login" class="text-gray-700 hover:text-purple-600">Login</a>
          <a href="/auth/register" class="text-purple-600 hover:text-purple-700 font-medium">Sign Up</a>
        </nav>
      </div>
    </div>
  </header>

  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
    <div class="text-center">
      <h2 class="text-5xl font-bold text-gray-900 mb-6">
        Discover Amazing Events
      </h2>
      <p class="text-xl text-gray-600 mb-12">
        Find and register for events near you
      </p>

      <button
        on:click={() => goto('/events')}
        class="bg-purple-600 text-white py-3 px-8 rounded-lg hover:bg-purple-700 transition-colors font-semibold text-lg"
      >
        Browse Events
      </button>
    </div>
  </section>

  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="text-center">
        <div class="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <span class="text-2xl">🎉</span>
        </div>
        <h3 class="text-xl font-semibold mb-2">Browse Events</h3>
        <p class="text-gray-600">Find events in your area</p>
      </div>
      <div class="text-center">
        <div class="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <span class="text-2xl">🎫</span>
        </div>
        <h3 class="text-xl font-semibold mb-2">Easy Registration</h3>
        <p class="text-gray-600">Register for events in seconds</p>
      </div>
      <div class="text-center">
        <div class="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <span class="text-2xl">📅</span>
        </div>
        <h3 class="text-xl font-semibold mb-2">Stay Organized</h3>
        <p class="text-gray-600">Track your registrations</p>
      </div>
    </div>
  </section>

  <footer class="bg-gray-900 text-white py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <p>&copy; 2026 EventFlow. All rights reserved.</p>
      </div>
    </div>
  </footer>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
</style>
