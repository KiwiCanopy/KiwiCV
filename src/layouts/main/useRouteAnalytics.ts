import { useEffect } from 'react';

import { BRAND_STORAGE_KEYS } from '@/config/brand';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';

export function useRouteAnalytics(pathname: string, language: string | undefined) {
  const isDashboard = pathname.includes('/dashboard');

  useEffect(() => {
    if (!localStorage.getItem(BRAND_STORAGE_KEYS.lastSeenVersion)) {
      analytics.track(ANALYTICS_EVENTS.APP_FIRST_VISIT);
    }
  }, []);

  useEffect(() => {
    const highValuePages = ['settings', 'extras', 'json', 'account', 'cvs'];
    const page =
      highValuePages.find((candidate) => pathname.includes(candidate)) ||
      (isDashboard ? 'dashboard' : null);

    if (page) analytics.track(ANALYTICS_EVENTS.PAGE_VIEWED, { page });
    analytics.trackPageView();
  }, [pathname, language, isDashboard]);

  return isDashboard;
}
