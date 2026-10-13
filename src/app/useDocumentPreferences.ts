import { useEffect } from 'react';

import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { useUIStore } from '@/store/ui/useUIStore';
import { syncThemeColorMeta } from '@/utils/themeColorMeta';

export function useDocumentPreferences(isLegacyDomain: boolean) {
  const theme = useUIStore((state) => state.appTheme);
  const language = useUIStore((state) => state.appLanguage) || 'en';

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(
      theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : theme,
    );
    syncThemeColorMeta();
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(event.matches ? 'dark' : 'light');
      syncThemeColorMeta();
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (isLegacyDomain) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get('from') !== 'migration') return;

    analytics.track(ANALYTICS_EVENTS.MIGRATION_LANDED);
    params.delete('from');
    const search = params.toString();
    const relativeUrl = `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`;
    window.history.replaceState(null, '', relativeUrl);
  }, [isLegacyDomain]);
}
