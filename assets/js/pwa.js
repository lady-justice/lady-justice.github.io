/**
 * Service Worker registration. No-op on file:// or in unsupported browsers.
 */
export function initPwa() {
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol === 'file:') return;

  const swUrl = new URL('../../sw.js', import.meta.url);
  navigator.serviceWorker.register(swUrl).catch(() => {});
}
