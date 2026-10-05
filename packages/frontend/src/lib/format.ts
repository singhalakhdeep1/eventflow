export const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export const formatMoney = (value: number, currency = 'USD') =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);

/** Only allow same-site relative redirects, to avoid open-redirect via ?next= */
export const safeNext = (next: string | null) => (next && /^\/(?!\/)/.test(next) ? next : '/events');
