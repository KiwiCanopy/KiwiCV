import { BRAND_STORAGE_KEYS } from '@/config/brand';
import '@/index.css';
import { initPwaInstall } from '@/services/pwaInstall';
import { migrateBrandStorage } from '@/services/storage/brandStorageMigration';
import { discardLegacySyncHashes } from '@/services/storage/syncHashes';
import { installStaleChunkReload } from '@/utils/staleChunkReload';
import { syncThemeColorMeta } from '@/utils/themeColorMeta';

migrateBrandStorage(localStorage, sessionStorage);
discardLegacySyncHashes(localStorage);
installStaleChunkReload();
initPwaInstall();

// Apply theme class synchronously BEFORE React renders to prevent forced reflows.
// Reading from localStorage + applying the class here ensures the initial paint
// already has the correct theme, avoiding CSSOM invalidation from useEffect.
(() => {
  try {
    const stored = localStorage.getItem(BRAND_STORAGE_KEYS.uiPreferences);
    const prefs = stored ? JSON.parse(stored) : null;
    const theme = prefs?.state?.appTheme ?? 'system';
    const root = document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      root.classList.add(
        window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      );
    } else {
      root.classList.add(theme);
    }
    syncThemeColorMeta();
  } catch {
    // Fallback: let React handle it
  }
})();

void import('@/bootstrap');
