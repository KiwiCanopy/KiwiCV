// @vitest-environment jsdom
import { useExportDestinations } from '@/components/modals/export/useExportDestinations';
import { BRAND_STORAGE_KEYS } from '@/config/brand';
import { type ProviderState } from '@/hooks/sync/providerState';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const providerStates = {
  github: 'not_connected' as ProviderState,
  googleDrive: 'not_connected' as ProviderState,
};

vi.mock('@/hooks/sync/useProviderStates', () => ({
  useProviderStates: () => providerStates,
}));

function withProviders(github: ProviderState, googleDrive: ProviderState) {
  providerStates.github = github;
  providerStates.googleDrive = googleDrive;
  return renderHook(() => useExportDestinations());
}

const ids = (result: { current: { destinations: { id: string }[] } }) =>
  result.current.destinations.map((d) => d.id);

describe('useExportDestinations', () => {
  beforeEach(() => {
    localStorage.clear();
    providerStates.github = 'not_connected';
    providerStates.googleDrive = 'not_connected';
  });

  it('always offers the ZIP, and offers the setup row when nothing is connected', () => {
    const { result } = withProviders('not_connected', 'not_connected');

    expect(ids(result)).toEqual(['zip']);
    expect(result.current.showCloudSetup).toBe(true);
    expect(result.current.selected).toEqual(['zip']);
  });

  it('offers the repository and the publish rows once GitHub is connected', () => {
    const { result } = withProviders('active', 'not_connected');

    expect(ids(result)).toEqual(['zip', 'github_repo', 'github_pages']);
    expect(result.current.showCloudSetup).toBe(false);
  });

  it('offers no publish row for a Drive-only user, because Pages is GitHub-specific', () => {
    const { result } = withProviders('not_connected', 'active');

    expect(ids(result)).toEqual(['zip', 'google_drive']);
  });

  it('offers all four rows when both providers are connected', () => {
    const { result } = withProviders('active', 'active');

    expect(ids(result)).toEqual(['zip', 'github_repo', 'google_drive', 'github_pages']);
  });

  /**
   * Credentials exist, background sync is switched off in Settings. The row is
   * shown so the user can still export there once, defaulted off, and running
   * it does not touch `sync.*.enabled`.
   */
  it('offers a row for a connected provider whose background sync is switched off', () => {
    const { result } = withProviders('connected_disabled', 'connected_disabled');

    expect(ids(result)).toEqual(['zip', 'github_repo', 'google_drive', 'github_pages']);
    expect(result.current.destinations.every((d) => d.id === 'zip' || !d.enabled)).toBe(true);
  });

  it('renders the Drive row inert, not absent, while the handshake is unresolved', () => {
    const { result } = withProviders('not_connected', 'checking');

    expect(ids(result)).toEqual(['zip', 'google_drive']);
    expect(result.current.destinations.find((d) => d.id === 'google_drive')?.pending).toBe(true);
    expect(result.current.showCloudSetup).toBe(false);
  });

  it('never runs a pending destination, even with a stored flag switching it on', () => {
    localStorage.setItem(
      BRAND_STORAGE_KEYS.exportPreferences,
      JSON.stringify({ v: 1, destinations: { google_drive: true } }),
    );

    const { result } = withProviders('not_connected', 'checking');

    expect(result.current.selected).not.toContain('google_drive');
  });

  it('hides a stored destination whose provider is gone, and excludes it from the run', () => {
    localStorage.setItem(
      BRAND_STORAGE_KEYS.exportPreferences,
      JSON.stringify({ v: 1, destinations: { zip: true, github_repo: true } }),
    );

    const { result } = withProviders('not_connected', 'not_connected');

    expect(ids(result)).toEqual(['zip']);
    expect(result.current.selected).toEqual(['zip']);
    // The stored preference survives, so reconnecting restores it.
    const stored = JSON.parse(localStorage.getItem(BRAND_STORAGE_KEYS.exportPreferences) as string);
    expect(stored.destinations.github_repo).toBe(true);
  });

  it('is not a permission_required row: that state feeds the setup variant', () => {
    const { result } = withProviders('not_connected', 'permission_required');

    expect(ids(result)).toEqual(['zip']);
    expect(result.current.showCloudSetup).toBe(true);
  });

  it('toggles a destination into the run without touching provider state', () => {
    const { result } = withProviders('active', 'not_connected');

    act(() => result.current.toggleDestination('github_repo', true));

    expect(result.current.selected).toEqual(['zip', 'github_repo']);
  });

  it('exposes the format toggles, defaulting both optional deliverables on', () => {
    const { result } = withProviders('not_connected', 'not_connected');

    expect(result.current.formats).toEqual({ pdf: true, html: true });

    act(() => result.current.toggleFormat('pdf', false));

    expect(result.current.formats).toEqual({ pdf: false, html: true });
  });
});
