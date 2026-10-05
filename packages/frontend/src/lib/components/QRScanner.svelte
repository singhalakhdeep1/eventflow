<script lang="ts">
  import { onDestroy, onMount, createEventDispatcher } from 'svelte';
  import type { Html5Qrcode } from 'html5-qrcode';

  const dispatch = createEventDispatcher<{ scan: string }>();
  const elementId = 'qr-reader';

  let scanner: Html5Qrcode | null = null;
  let running = false;
  let error: string | null = null;
  let lastCode = '';
  let lastAt = 0;

  async function start() {
    error = null;
    try {
      // Loaded on demand: the library touches `window`/camera APIs
      const { Html5Qrcode } = await import('html5-qrcode');
      scanner = new Html5Qrcode(elementId);
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (code) => {
          // The camera reports the same frame many times; ignore repeats for 3s
          const now = Date.now();
          if (code === lastCode && now - lastAt < 3000) return;
          lastCode = code;
          lastAt = now;
          dispatch('scan', code);
        },
        () => {}
      );
      running = true;
    } catch {
      error = 'Camera unavailable. Allow camera access or enter the code manually.';
    }
  }

  async function stop() {
    if (scanner && running) {
      await scanner.stop().catch(() => {});
      scanner.clear();
    }
    running = false;
  }

  onMount(start);
  onDestroy(stop);
</script>

<div>
  <div id={elementId} class="w-full max-w-sm mx-auto rounded-lg overflow-hidden bg-black/5 min-h-[120px]"></div>
  {#if error}
    <p role="alert" class="text-sm text-red-600 mt-2">{error}</p>
    <button type="button" class="mt-2 text-sm text-purple-600 underline" on:click={start}>Try again</button>
  {/if}
</div>
