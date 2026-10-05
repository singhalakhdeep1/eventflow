<script lang="ts">
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth';

  let firstName = '';
  let lastName = '';
  let email = '';
  let password = '';
  let role: 'ATTENDEE' | 'ORGANIZER' = 'ATTENDEE';

  async function submit() {
    const ok = await authStore.register({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password,
      role
    });
    if (ok) goto(role === 'ORGANIZER' ? '/organizer' : '/events');
  }

  $: busy = $authStore.isLoading;
  const input = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500';
</script>

<div class="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center py-12">
  <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
    <a href="/" class="block text-3xl font-bold text-center text-purple-600 mb-8">EventFlow</a>
    <h2 class="text-2xl font-semibold text-center text-gray-900 mb-6">Create account</h2>

    <form on:submit|preventDefault={submit} class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">First name</label>
          <input id="firstName" class={input} autocomplete="given-name" bind:value={firstName} required />
        </div>
        <div>
          <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2">Last name</label>
          <input id="lastName" class={input} autocomplete="family-name" bind:value={lastName} required />
        </div>
      </div>

      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input id="email" type="email" class={input} autocomplete="email" bind:value={email} required />
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Password</label>
        <input
          id="password"
          type="password"
          class={input}
          autocomplete="new-password"
          minlength="8"
          maxlength="72"
          bind:value={password}
          required
        />
        <p class="text-xs text-gray-500 mt-1">At least 8 characters.</p>
      </div>

      <fieldset>
        <legend class="block text-sm font-medium text-gray-700 mb-2">I want to</legend>
        <label class="flex items-center gap-2 text-sm text-gray-700">
          <input type="radio" bind:group={role} value="ATTENDEE" /> Buy tickets
        </label>
        <label class="flex items-center gap-2 text-sm text-gray-700">
          <input type="radio" bind:group={role} value="ORGANIZER" /> Organize events
        </label>
      </fieldset>

      {#if $authStore.error}
        <p role="alert" class="text-sm text-red-600">{$authStore.error}</p>
      {/if}

      <button
        type="submit"
        disabled={busy}
        class="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors font-medium"
      >
        {busy ? 'Creating account…' : 'Create account'}
      </button>
    </form>

    <p class="mt-6 text-center text-gray-600">
      Already have an account?
      <a href="/auth" class="text-purple-600 hover:text-purple-700">Sign in</a>
    </p>
  </div>
</div>
