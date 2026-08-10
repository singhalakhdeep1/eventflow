

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/auth/register/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/4.Bliu1VlR.js","_app/immutable/chunks/scheduler.B7z6WnsH.js","_app/immutable/chunks/index.DfG39IbD.js","_app/immutable/chunks/paths.DZneuIiZ.js"];
export const stylesheets = [];
export const fonts = [];
