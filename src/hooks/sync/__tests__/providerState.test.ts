import { deriveGitHubState, deriveGoogleDriveState } from '@/hooks/sync/providerState';
import { describe, expect, it } from 'vitest';

describe('deriveGoogleDriveState', () => {
  const signedInAndGranted = {
    isSignedIn: true,
    hasDriveCredentials: true,
    hasDrivePermission: true,
    isEnabled: true,
  };

  it('reports not_connected when there is no session', () => {
    expect(
      deriveGoogleDriveState({
        ...signedInAndGranted,
        isSignedIn: false,
      }),
    ).toBe('not_connected');
  });

  it('reports permission_required when the handshake was denied', () => {
    expect(
      deriveGoogleDriveState({
        ...signedInAndGranted,
        hasDrivePermission: false,
      }),
    ).toBe('permission_required');
  });

  it('reports permission_required when credentials are missing', () => {
    expect(
      deriveGoogleDriveState({
        ...signedInAndGranted,
        hasDriveCredentials: false,
      }),
    ).toBe('permission_required');
  });

  it('reports checking while a held credential is still unresolved', () => {
    // We have something and do not yet know whether it works. This used to
    // report not_connected, which reads as "you have never set this up".
    expect(
      deriveGoogleDriveState({
        ...signedInAndGranted,
        hasDrivePermission: null,
      }),
    ).toBe('checking');
  });

  it('does not treat an unchecked handshake as a denial', () => {
    expect(
      deriveGoogleDriveState({
        ...signedInAndGranted,
        hasDrivePermission: null,
      }),
    ).not.toBe('permission_required');
  });

  it('matches the runtime predicate, which requires an explicit granted handshake', () => {
    // useSyncWorkflow and ExportButton both gate on hasDrivePermission === true.
    // Reporting active on an unchecked handshake would claim a connection those
    // paths would refuse to use.
    expect(
      deriveGoogleDriveState({
        ...signedInAndGranted,
        hasDrivePermission: null,
        isEnabled: true,
      }),
    ).not.toBe('active');
  });

  it('still requires permission when the handshake is unchecked and credentials are missing', () => {
    expect(
      deriveGoogleDriveState({
        ...signedInAndGranted,
        hasDrivePermission: null,
        hasDriveCredentials: false,
      }),
    ).toBe('permission_required');
  });

  it('separates a granted-but-switched-off provider from an active one', () => {
    expect(deriveGoogleDriveState(signedInAndGranted)).toBe('active');
    expect(deriveGoogleDriveState({ ...signedInAndGranted, isEnabled: false })).toBe(
      'connected_disabled',
    );
  });

  it('prefers permission_required over enablement', () => {
    expect(
      deriveGoogleDriveState({
        ...signedInAndGranted,
        hasDrivePermission: false,
        isEnabled: true,
      }),
    ).toBe('permission_required');
  });
});

describe('deriveGitHubState', () => {
  it('requires both a token and a repository before reporting a connection', () => {
    expect(deriveGitHubState({ hasPat: true, hasRepo: false, isEnabled: true })).toBe(
      'not_connected',
    );
    expect(deriveGitHubState({ hasPat: false, hasRepo: true, isEnabled: true })).toBe(
      'not_connected',
    );
  });

  it('separates a configured-but-switched-off provider from an active one', () => {
    expect(deriveGitHubState({ hasPat: true, hasRepo: true, isEnabled: true })).toBe('active');
    expect(deriveGitHubState({ hasPat: true, hasRepo: true, isEnabled: false })).toBe(
      'connected_disabled',
    );
  });

  it('never reports permission_required or checking, which GitHub cannot express today', () => {
    // A PAT is present or it is not; there is no handshake to be in flight.
    const combinations = [true, false].flatMap((hasPat) =>
      [true, false].flatMap((hasRepo) =>
        [true, false].map((isEnabled) => ({ hasPat, hasRepo, isEnabled })),
      ),
    );
    for (const input of combinations) {
      expect(deriveGitHubState(input)).not.toBe('permission_required');
      expect(deriveGitHubState(input)).not.toBe('checking');
    }
  });
});
