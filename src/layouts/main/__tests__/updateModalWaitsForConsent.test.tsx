// @vitest-environment jsdom
import { MemoryRouter } from 'react-router-dom';

import { LAST_LEGAL_UPDATE } from '@/constants/auth';
import { MainLayoutOverlays } from '@/layouts/main/MainLayoutOverlays';
import { useUIStore } from '@/store/ui/useUIStore';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The What's New dialog opens after the blocking consent modal on a release
 * that bumps both. Opened second, it takes Radix's scroll lock and the consent
 * text cannot scroll, so it must wait until consent is given.
 */
const auth = {
  user: { id: 'u1' },
  loading: false,
  hasDrivePermission: null,
  profile: { accepted_terms_at: '', accepted_privacy_at: '' },
};
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => auth }));

function consentAt(iso: string) {
  auth.profile = { accepted_terms_at: iso, accepted_privacy_at: iso };
}

function renderOverlays() {
  return render(
    <MemoryRouter initialEntries={['/en/dashboard']}>
      <MainLayoutOverlays
        closeUpdateModal={vi.fn()}
        currentVersion="5.0.1"
        isUpdateModalOpen
        missedVersions={[]}
      />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  useUIStore.setState({ firstTimeLanguageSelected: true });
});

afterEach(() => {
  useUIStore.setState({ firstTimeLanguageSelected: false });
});

describe("What's New and the consent modal", () => {
  it('stays closed while consent to a newer legal update is pending', () => {
    consentAt(new Date(new Date(LAST_LEGAL_UPDATE).getTime() - 1000).toISOString());
    renderOverlays();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens once the current legal update is accepted', () => {
    consentAt(new Date(new Date(LAST_LEGAL_UPDATE).getTime() + 1000).toISOString());
    renderOverlays();
    expect(screen.getByRole('dialog')).toBeTruthy();
  });
});
