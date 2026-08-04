<script>
  import { onMount } from 'svelte';
  import { authStore } from '$lib/stores/auth';

  onMount(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authStore.fetchProfile();
    }
  });
</script>

<slot />
