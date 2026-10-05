import { writable } from 'svelte/store';
import { authApi, errorMessage, tokenStorage } from '$lib/api';
import type { RegisterInput, User } from '$lib/types';

type AuthState = {
  user: User | null;
  isLoading: boolean;
  // True once the initial profile lookup has finished, so pages can avoid redirecting too early
  ready: boolean;
  error: string | null;
};

const createAuthStore = () => {
  const { subscribe, set, update } = writable<AuthState>({ user: null, isLoading: false, ready: false, error: null });

  async function authenticate(request: () => ReturnType<typeof authApi.login>, failure: string): Promise<boolean> {
    update((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const { access_token, user } = await request();
      tokenStorage.set(access_token);
      set({ user, isLoading: false, ready: true, error: null });
      return true;
    } catch (error) {
      update((s) => ({ ...s, isLoading: false, error: errorMessage(error, failure) }));
      return false;
    }
  }

  return {
    subscribe,
    login: (email: string, password: string) => authenticate(() => authApi.login(email, password), 'Login failed'),
    register: (input: RegisterInput) => authenticate(() => authApi.register(input), 'Registration failed'),
    logout: () => {
      tokenStorage.clear();
      set({ user: null, isLoading: false, ready: true, error: null });
    },
    /** Restores the session from a stored token, if any. */
    init: async () => {
      if (!tokenStorage.get()) {
        update((s) => ({ ...s, ready: true }));
        return;
      }
      try {
        const user = await authApi.getProfile();
        set({ user, isLoading: false, ready: true, error: null });
      } catch {
        tokenStorage.clear();
        set({ user: null, isLoading: false, ready: true, error: null });
      }
    }
  };
};

export const authStore = createAuthStore();
