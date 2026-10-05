<script lang="ts">
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth';

  $: user = $authStore.user;
  $: isStaff = user?.role === 'ORGANIZER' || user?.role === 'ADMIN';

  function logout() {
    authStore.logout();
    goto('/auth');
  }
</script>

<header class="bg-white shadow-sm">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-16">
      <a href="/" class="text-2xl font-bold text-purple-600">EventFlow</a>
      <nav class="flex items-center space-x-6 text-sm">
        <a href="/events" class="text-gray-700 hover:text-purple-600">Events</a>
        {#if user}
          <a href="/tickets" class="text-gray-700 hover:text-purple-600">My Tickets</a>
          {#if isStaff}
            <a href="/organizer" class="text-gray-700 hover:text-purple-600">Organizer</a>
          {/if}
          <span class="text-gray-500 hidden sm:inline">{user.firstName}</span>
          <button on:click={logout} class="text-gray-700 hover:text-purple-600">Logout</button>
        {:else}
          <a href="/auth" class="text-gray-700 hover:text-purple-600">Sign in</a>
          <a href="/auth/register" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">Sign up</a>
        {/if}
      </nav>
    </div>
  </div>
</header>
