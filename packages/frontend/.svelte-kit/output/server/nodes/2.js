

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.BkFfLmRo.js","_app/immutable/chunks/scheduler.B7z6WnsH.js","_app/immutable/chunks/index.DfG39IbD.js","_app/immutable/chunks/singletons.CnVED-yv.js","_app/immutable/chunks/index.CTemoNj2.js","_app/immutable/chunks/paths.DZneuIiZ.js"];
export const stylesheets = ["_app/immutable/assets/2.B5Gh6RiO.css"];
export const fonts = [];
