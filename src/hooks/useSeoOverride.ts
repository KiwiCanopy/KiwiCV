import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { type SeoOverride, useSeoStore } from '@/store/ui/useSeoStore';

type SeoOverrideInput = Omit<SeoOverride, 'pathname'>;

/**
 * Publishes head metadata for the current route to the single `<SEO />`
 * instance mounted in `App`.
 *
 * Call it unconditionally — pass values that depend on loading state rather
 * than calling the hook conditionally. Passing `null` publishes nothing, which
 * leaves the route-derived defaults in place.
 */
export const useSeoOverride = (override: SeoOverrideInput | null) => {
  const { pathname } = useLocation();
  const setOverride = useSeoStore((state) => state.setOverride);
  const clearOverride = useSeoStore((state) => state.clearOverride);

  // `override` is an object literal at nearly every callsite, so a reference
  // comparison would re-publish on every render. Compare the values instead.
  const fingerprint = override ? JSON.stringify(override) : null;

  useEffect(() => {
    if (!fingerprint) return;

    setOverride({ pathname, ...(JSON.parse(fingerprint) as SeoOverrideInput) });

    return () => clearOverride(pathname);
  }, [fingerprint, pathname, setOverride, clearOverride]);
};
