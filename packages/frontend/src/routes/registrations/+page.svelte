<script>
  import { onMount } from 'svelte';
  import { registrationStore } from '$lib/stores/registration';
  import { authStore } from '$lib/stores/auth';

  onMount(() => {
    const user = $authStore.user;
    if (user) {
      registrationStore.fetchRegistrations({ userId: user.id });
    }
  });

  $: registrations = $registrationStore.registrations;
  $: isLoading = $registrationStore.isLoading;
  $: user = $authStore.user;

  function getStatusClass(status: string) {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium';
      case 'CANCELLED': return 'bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium';
      default: return 'bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium';
    }
  }

  async function handleCancel(id: string) {
    if (confirm('Are you sure you want to cancel this registration?')) {
      await registrationStore.cancelRegistration(id);
    }
  }

  function logout() {
    authStore.logout();
    window.location.href = '/auth/login';
  }
</script>

<div class="min-h-screen bg-gray-50">
  <header class="bg-white shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center">
          <span class="text-2xl font-bold text-purple-600">EventFlow</span>
        </div>
        <nav class="flex space-x-8">
          <a href="/" class="text-gray-700 hover:text-purple-600">Home</a>
          <a href="/events" class="text-gray-700 hover:text-purple-600">Events</a>
          <button on:click={logout} class="text-gray-700 hover:text-purple-600">Logout</button>
        </nav>
      </div>
    </div>
  </header>

  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h2 class="text-3xl font-bold text-gray-900 mb-8">My Registrations</h2>

    {#if isLoading}
      <div class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading registrations...</p>
      </div>
    {:else if registrations.length === 0}
      <div class="bg-white rounded-lg shadow-md p-12 text-center">
        <p class="text-gray-600 text-lg">No registrations found</p>
        <a href="/events" class="inline-block mt-4 text-purple-600 hover:text-purple-700">
          Browse events
        </a>
      </div>
    {:else}
      <div class="space-y-6">
        {#each registrations as registration}
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <h3 class="text-xl font-semibold mb-2">{registration.event?.title}</h3>
                <div class="flex items-center text-gray-600 mb-2">
                  <span>{registration.event?.location}</span>
                </div>
                <div class="flex items-center text-gray-600 mb-2">
                  <span>
                    {new Date(registration.event?.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div class="mt-4">
                  <span class="text-2xl font-bold text-purple-600">${registration.totalPrice}</span>
                  <span class="text-gray-600"> for {registration.quantity} tickets</span>
                </div>
                <div class="mt-2">
                  <span class={getStatusClass(registration.status)}>
                    {registration.status}
                  </span>
                </div>
              </div>
              <div class="ml-6">
                {#if registration.status === 'PENDING' || registration.status === 'CONFIRMED'}
                  <button
                    on:click={() => handleCancel(registration.id)}
                    class="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
                  >
                    Cancel
                  </button>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </section>
</div>
