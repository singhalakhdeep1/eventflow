

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/auth/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/3.CfRFHK1l.js","_app/immutable/chunks/scheduler.B7z6WnsH.js","_app/immutable/chunks/index.DfG39IbD.js","_app/immutable/chunks/paths.DZneuIiZ.js"];
export const stylesheets = [];
export const fonts = [];
