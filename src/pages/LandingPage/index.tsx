import { useEffect } from 'react';

import { FAQ } from '@/pages/LandingPage/sections/FAQ';
import { Hero } from '@/pages/LandingPage/sections/Hero';
import { Pricing } from '@/pages/LandingPage/sections/Pricing';
import { Privacy } from '@/pages/LandingPage/sections/Privacy';
import { Proof } from '@/pages/LandingPage/sections/Proof';
import { Workflow } from '@/pages/LandingPage/sections/Workflow';
import { useLandingActions } from '@/pages/LandingPage/useLandingActions';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';

/**
 * LandingPage - Marketing root entry point.
 * Uses Intersection Observer + CSS for stable, mobile-friendly animations.
 */
export function LandingPage() {
  const { hasCv, goToEditor, openImport } = useLandingActions();

  useEffect(() => {
    analytics.track(ANALYTICS_EVENTS.PAGE_VIEWED, { page: 'landing' });
  }, []);

  return (
    <div className="flex flex-col" data-page="landing">
      <Hero hasCv={hasCv} onCreate={() => goToEditor('hero')} onImport={openImport} />
      <Workflow />
      <Proof />
      <Privacy />
      <Pricing />
      <FAQ hasCv={hasCv} onCreate={() => goToEditor('closing_cta')} onImport={openImport} />
    </div>
  );
}
