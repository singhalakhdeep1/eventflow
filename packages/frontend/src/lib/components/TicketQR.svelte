<script lang="ts">
  import QRCode from 'qrcode';

  export let value: string;
  export let size = 200;

  let dataUrl = '';

  $: if (value) {
    QRCode.toDataURL(value, { width: size, margin: 1, errorCorrectionLevel: 'M' })
      .then((url) => (dataUrl = url))
      .catch(() => (dataUrl = ''));
  }
</script>

{#if dataUrl}
  <img src={dataUrl} alt="Ticket QR code" width={size} height={size} class="mx-auto" />
{:else}
  <div class="mx-auto bg-gray-100 animate-pulse" style:width={`${size}px`} style:height={`${size}px`}></div>
{/if}
