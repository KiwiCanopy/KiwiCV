import { useLocation } from 'react-router-dom';

import { LAST_LEGAL_UPDATE } from '@/constants/auth';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/store/ui/useUIStore';

/** Pages the blocking consent modal never covers, so a user can read what they accept. */
const EXCLUDED_SEGMENTS = ['privacy', 'terms', 'legal-notice', 'account', 'blog'];

/**
 * Whether the blocking re-consent modal shows on this route: `'unknown'` until
 * auth has resolved a signed-in user's profile. The modal stays usable over a
 * dialog that opens after it (`staysOnTop`, #9); wait for `'clear'` only to keep
 * a dialog from appearing behind it.
 */
export function useLegalConsentState(): 'pending' | 'clear' | 'unknown' {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const firstTimeLanguageSelected = useUIStore((state) => state.firstTimeLanguageSelected);

  if (loading || (user && !profile)) return 'unknown';
  if (!firstTimeLanguageSelected || !user || !profile) return 'clear';

  const segments = location.pathname.toLowerCase().split('/');
  if (EXCLUDED_SEGMENTS.some((segment) => segments.includes(segment))) return 'clear';

  const acceptedPrivacyAt = profile.accepted_privacy_at
    ? new Date(profile.accepted_privacy_at)
    : null;
  const acceptedTermsAt = profile.accepted_terms_at ? new Date(profile.accepted_terms_at) : null;
  const lastUpdate = new Date(LAST_LEGAL_UPDATE);

  const pending =
    !acceptedPrivacyAt ||
    !acceptedTermsAt ||
    acceptedPrivacyAt < lastUpdate ||
    acceptedTermsAt < lastUpdate;
  return pending ? 'pending' : 'clear';
}
