import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { useUIStore } from '@/store/ui/useUIStore';
import { localizedPath } from '@/utils/localeRouting';

/**
 * PromoRedirect handles incoming promotional links like /promo/:channel.
 * It tracks the source in PostHog and redirects the user to the localized home page.
 */
export const PromoRedirect = () => {
  const { channel } = useParams<{ channel: string }>();
  const navigate = useNavigate();
  const uiLanguage = useUIStore((state) => state.appLanguage) || 'en';

  useEffect(() => {
    if (channel) {
      analytics.track(ANALYTICS_EVENTS.PROMO_REDIRECTED, { channel });
    }

    // Always redirect to the localized home page
    navigate(localizedPath(uiLanguage), { replace: true });
  }, [channel, navigate, uiLanguage]);

  return null;
};
