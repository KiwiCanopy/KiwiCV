/**
 * Shared presentation model for cloud provider connection states.
 *
 * Every surface that shows Google Drive or GitHub connectivity derives its
 * label from these helpers so the same signals never render as two different
 * stories. The helpers are pure: they take the signals each surface already
 * reads and return a state name. They do not read storage, call services, or
 * change credentials or enablement.
 */
export type ProviderState =
  'not_connected' | 'checking' | 'connected_disabled' | 'permission_required' | 'active';

export interface GoogleDriveStateInput {
  /** A Supabase session exists. */
  isSignedIn: boolean;
  /** A Google Drive refresh token is present in browser storage. */
  hasDriveCredentials: boolean;
  /**
   * Result of the Drive handshake. `null` means "not checked yet", and is
   * deliberately not treated as a denial.
   */
  hasDrivePermission: boolean | null;
  /** The user has switched Drive sync on. */
  isEnabled: boolean;
}

export interface GitHubStateInput {
  /** A personal access token is present in local or session storage. */
  hasPat: boolean;
  /** A repository has been configured. */
  hasRepo: boolean;
  /** The user has switched GitHub sync on. */
  isEnabled: boolean;
}

/**
 * Drive can express all five states. The permission check wins over
 * enablement: a revoked or never-granted scope is what the user must act on
 * first, regardless of whether the toggle is on.
 *
 * A credential we hold but have not yet resolved reports `checking`, not
 * `not_connected`. An earlier note here claimed an honest "checking" needed
 * durable server-side status; that was wrong. The signal was already in
 * this function's inputs — `hasDrivePermission === null` alongside a stored
 * credential is exactly "we have something and do not yet know whether it
 * works". Only the *durable* half, recognising a grant on another device,
 * needs the server.
 *
 * `checking` is a presentation state only. The sync workflow and the export
 * button still require an explicit `true` before acting, so nothing here lets
 * the runtime attempt a connection it cannot make.
 */
export function deriveGoogleDriveState({
  isSignedIn,
  hasDriveCredentials,
  hasDrivePermission,
  isEnabled,
}: GoogleDriveStateInput): ProviderState {
  if (!isSignedIn) return 'not_connected';
  if (hasDrivePermission === false || !hasDriveCredentials) return 'permission_required';
  if (hasDrivePermission !== true) return 'checking';
  return isEnabled ? 'active' : 'connected_disabled';
}

/**
 * GitHub can only express three states, and never `checking`: a PAT is either
 * present or not, and there is no handshake to be in flight. A revoked or
 * expired token leaves no stored signal, so it stays indistinguishable from a
 * working one until a sync actually fails. Durable provider connection status
 * is a separate open question and is not resolved here.
 */
export function deriveGitHubState({ hasPat, hasRepo, isEnabled }: GitHubStateInput): ProviderState {
  if (!hasPat || !hasRepo) return 'not_connected';
  return isEnabled ? 'active' : 'connected_disabled';
}
