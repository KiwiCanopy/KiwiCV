import { BRAND_STORAGE_KEYS } from '@/config/brand';

/** A second failure this soon after a reload is a real error, not a stale tab. */
const RELOAD_WINDOW_MS = 10_000;

/**
 * After a release, a tab still running the previous build requests chunks the
 * new deploy no longer serves. Vite fires `vite:preloadError` for a
 * failed lazy import; reload once onto the new build instead of throwing.
 * Offline, a reload would only swap the app for the browser's offline page.
 */
export function installStaleChunkReload(reload: () => void = () => window.location.reload()) {
  let reloading = false;
  window.addEventListener('vite:preloadError', (event) => {
    // One route can fail several times (each CSS dependency, then the import).
    if (reloading) {
      event.preventDefault();
      return;
    }
    if (!navigator.onLine) return;
    try {
      const last = Number(sessionStorage.getItem(BRAND_STORAGE_KEYS.chunkReloadAt)) || 0;
      if (Date.now() - last < RELOAD_WINDOW_MS) return;
      sessionStorage.setItem(BRAND_STORAGE_KEYS.chunkReloadAt, String(Date.now()));
    } catch {
      // Without storage there is no loop guard, so let the error surface.
      return;
    }
    reloading = true;
    event.preventDefault();
    reload();
  });
}
