

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/events/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/5.VEEYtSDk.js","_app/immutable/chunks/scheduler.B7z6WnsH.js","_app/immutable/chunks/index.DfG39IbD.js","_app/immutable/chunks/each.D6YF6ztN.js","_app/immutable/chunks/index.CTemoNj2.js","_app/immutable/chunks/auth.BBFefSoI.js"];
export const stylesheets = [];
export const fonts = [];
