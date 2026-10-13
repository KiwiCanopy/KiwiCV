// @vitest-environment jsdom
import { MemoryRouter } from 'react-router-dom';

import { LAST_LEGAL_UPDATE } from '@/constants/auth';
import { MainLayoutOverlays } from '@/layouts/main/MainLayoutOverlays';
import { useUIStore } from '@/store/ui/useUIStore';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The What's New dialog opens on load, and on a release that bumps the legal
 * date the blocking consent modal does too. Opened second, What's New takes
 * Radix's scroll lock and the consent text cannot scroll, so it waits until
 * consent is known to be clear — including while auth is still loading.
 */
type Profile = { accepted_terms_at: string; accepted_privacy_at: string } | null;
const auth: { user: { id: string } | null; loading: boolean; profile: Profile } = {
  user: null,
  loading: false,
  profile: null,
};
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ ...auth, hasDrivePermission: null }),
}));

const lastUpdate = new Date(LAST_LEGAL_UPDATE).getTime();
const consentAt = (offsetMs: number): Profile => {
  const iso = new Date(lastUpdate + offsetMs).toISOString();
  return { accepted_terms_at: iso, accepted_privacy_at: iso };
};

const overlays = () => (
  <MemoryRouter initialEntries={['/en/dashboard']}>
    <MainLayoutOverlays
      closeUpdateModal={vi.fn()}
      currentVersion="5.0.1"
      isUpdateModalOpen
      missedVersions={[]}
    />
  </MemoryRouter>
);
const whatsNew = () => screen.queryByRole('dialog', { name: /your profile/i });

beforeEach(() => {
  useUIStore.setState({ firstTimeLanguageSelected: true });
  auth.user = { id: 'u1' };
  auth.loading = false;
  auth.profile = null;
});

afterEach(() => {
  useUIStore.setState({ firstTimeLanguageSelected: false });
});

describe("What's New and the consent modal", () => {
  it('stays closed while consent to a newer legal update is pending', () => {
    auth.profile = consentAt(-1000);
    render(overlays());
    expect(whatsNew()).toBeNull();
  });

  it("stays closed while a signed-in user's profile is still loading", () => {
    auth.profile = null;
    render(overlays());
    expect(whatsNew()).toBeNull();
  });

  it('opens once consent is given, without a reload', () => {
    auth.profile = consentAt(-1000);
    const { rerender } = render(overlays());
    expect(whatsNew()).toBeNull();

    auth.profile = consentAt(1000);
    rerender(overlays());
    expect(whatsNew()).not.toBeNull();
  });

  it('opens for a guest, who has nothing to consent to', () => {
    auth.user = null;
    render(overlays());
    expect(whatsNew()).not.toBeNull();
  });
});
