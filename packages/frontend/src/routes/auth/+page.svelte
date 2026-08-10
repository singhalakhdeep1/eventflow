<script>
  import { goto } from '$app/navigation';
</script>

<div class="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
  <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
    <h1 class="text-3xl font-bold text-center text-purple-600 mb-8">EventFlow</h1>
    <h2 class="text-2xl font-semibold text-center text-gray-900 mb-6">Sign In</h2>
    
    <form on:submit={(e) => e.preventDefault()} class="space-y-6">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
      </div>
      
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Password</label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
      </div>
      
      <button
        type="submit"
        class="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
      >
        Sign In
      </button>
    </form>
    
    <p class="mt-6 text-center text-gray-600">
      Don't have an account?{' '}
      <a href="/auth/register" class="text-purple-600 hover:text-purple-700">
        Sign up
      </a>
    </p>
  </div>
</div>
