<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { authStore } from '$lib/stores/auth';
  import { safeNext } from '$lib/format';

  let email = '';
  let password = '';

  async function submit() {
    if (await authStore.login(email.trim(), password)) {
      goto(safeNext($page.url.searchParams.get('next')));
    }
  }

  $: busy = $authStore.isLoading;
  const input = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500';
</script>

<div class="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
  <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
    <a href="/" class="block text-3xl font-bold text-center text-purple-600 mb-8">EventFlow</a>
    <h2 class="text-2xl font-semibold text-center text-gray-900 mb-6">Sign in</h2>

    <form on:submit|preventDefault={submit} class="space-y-6">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input id="email" type="email" autocomplete="email" placeholder="you@example.com" class={input} bind:value={email} required />
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Password</label>
        <input id="password" type="password" autocomplete="current-password" class={input} bind:value={password} required />
      </div>

      {#if $authStore.error}
        <p role="alert" class="text-sm text-red-600">{$authStore.error}</p>
      {/if}

      <button
        type="submit"
        disabled={busy}
        class="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors font-medium"
      >
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
    </form>

    <p class="mt-6 text-center text-gray-600">
      Don't have an account?
      <a href="/auth/register" class="text-purple-600 hover:text-purple-700">Sign up</a>
    </p>
  </div>
</div>
