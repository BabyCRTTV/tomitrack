const KEY='tomitrack-theme';
export function effectiveTheme(preference,systemDark){return preference==='dark'||(preference==='system'&&systemDark)?'dark':'light'}
export function initTheme({storage=globalThis.localStorage,root=globalThis.document?.documentElement,media=globalThis.matchMedia?.('(prefers-color-scheme: dark)'),native=globalThis.window?.TomiTrackNative||globalThis.window?.TomiTrackDesktop}={}){
  let preference='system';try{const stored=storage.getItem(KEY);if(['light','dark','system'].includes(stored))preference=stored}catch{}
  function apply(){const theme=effectiveTheme(preference,media?.matches);root?.setAttribute('data-theme',theme);root?.style.setProperty('color-scheme',theme);const meta=globalThis.document?.querySelector('meta[name="theme-color"]');if(meta)meta.content=theme==='dark'?'#10171f':'#f8fafb';if(native?.setAppearance)native.setAppearance(preference);else native?.setTheme?.(theme);return theme}
  media?.addEventListener?.('change',apply);apply();
  return {get preference(){return preference},set(value){if(!['light','dark','system'].includes(value))throw Error('Unknown theme');preference=value;try{storage.setItem(KEY,value)}catch{}return apply()}};
}
