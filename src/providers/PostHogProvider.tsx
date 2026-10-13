import React from 'react';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;

if (typeof window !== 'undefined' && POSTHOG_KEY && !import.meta.env.DEV) {
  posthog.init(POSTHOG_KEY, {
    api_host: '/api/v1/sync',
    // Strict Cookieless & Anonymous Configuration
    persistence: 'memory',
    cookieless_mode: 'always',
    autocapture: false, // Disable automatic event capture for privacy
    capture_pageview: false, // We will handle pageviews manually if needed
    persistence_name: 'ph_cache', // Doesn't matter much for memory persistence
    advanced_disable_flags: true,
    person_profiles: 'never',
    disable_session_recording: true,
    debug: false, // Debug is not needed if we are disabling it in dev
    capture_performance: false,
    capture_heatmaps: false,
    capture_dead_clicks: false,
  });
}

export const PostHogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <PHProvider client={posthog}>{children}</PHProvider>;
};
