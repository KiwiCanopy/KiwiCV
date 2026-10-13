import { useLocation } from 'react-router-dom';

import { LAST_LEGAL_UPDATE } from '@/constants/auth';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/store/ui/useUIStore';

/** Pages the blocking consent modal never covers, so a user can read what they accept. */
const EXCLUDED_SEGMENTS = ['privacy', 'terms', 'legal-notice', 'account', 'blog'];

/**
 * Whether the blocking re-consent modal is showing on this route. Other modals
 * that open on load must wait for it: Radix locks scrolling to the most recently
 * opened dialog, so a second one opening later freezes the consent modal.
 */
export function useLegalConsentPending(): boolean {
  const { user, profile } = useAuth();
  const location = useLocation();
  const firstTimeLanguageSelected = useUIStore((state) => state.firstTimeLanguageSelected);

  if (!firstTimeLanguageSelected || !user || !profile) return false;

  const segments = location.pathname.toLowerCase().split('/');
  if (EXCLUDED_SEGMENTS.some((segment) => segments.includes(segment))) return false;

  const acceptedPrivacyAt = profile.accepted_privacy_at
    ? new Date(profile.accepted_privacy_at)
    : null;
  const acceptedTermsAt = profile.accepted_terms_at ? new Date(profile.accepted_terms_at) : null;
  const lastUpdate = new Date(LAST_LEGAL_UPDATE);

  return (
    !acceptedPrivacyAt ||
    !acceptedTermsAt ||
    acceptedPrivacyAt < lastUpdate ||
    acceptedTermsAt < lastUpdate
  );
}
