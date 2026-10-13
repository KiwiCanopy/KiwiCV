export const GOOGLE_REFRESH_TOKEN_KEY = 'google_drive_refresh_token';
export const GOOGLE_TOKEN_OWNER_KEY = 'google_drive_token_owner';
export const GOOGLE_LAST_SYNC_HASH_KEY = 'google_drive_last_sync_hash';
export const GOOGLE_LAST_FULL_PUSH_HASH_KEY = 'google_drive_last_full_push_hash';

export const loadGoogleDriveCreds = (): string => {
  return localStorage.getItem(GOOGLE_REFRESH_TOKEN_KEY) || '';
};

export const hasStoredGoogleDriveCreds = (): boolean => Boolean(loadGoogleDriveCreds());

/**
 * The Supabase user id this credential was stored for, or `''` when it predates
 * owner tracking.
 *
 * A refresh token is one person's standing capability against their Google
 * Drive, and `localStorage` is shared by everyone using the browser profile.
 * Recording the owner lets `AuthProvider` drop a credential the moment a
 * different account signs in, instead of leaving it readable — and, until
 * server-side storage lands, silently adoptable — by the next user.
 *
 * An empty owner is not treated as a mismatch: credentials stored before this
 * key existed keep restoring Drive without a re-consent. Only a Connect over
 * one re-consents, so the fresh token it returns is stamped.
 */
export const getGoogleDriveCredsOwner = (): string => {
  return localStorage.getItem(GOOGLE_TOKEN_OWNER_KEY) || '';
};

export const saveGoogleDriveCreds = (token: string, ownerId?: string) => {
  localStorage.setItem(GOOGLE_REFRESH_TOKEN_KEY, token);
  if (ownerId) localStorage.setItem(GOOGLE_TOKEN_OWNER_KEY, ownerId);
};

export const resetGoogleDriveSyncHashes = () => {
  localStorage.removeItem(GOOGLE_LAST_SYNC_HASH_KEY);
  localStorage.removeItem(GOOGLE_LAST_FULL_PUSH_HASH_KEY);
};

export const clearGoogleDriveCreds = () => {
  localStorage.removeItem(GOOGLE_REFRESH_TOKEN_KEY);
  localStorage.removeItem(GOOGLE_TOKEN_OWNER_KEY);
  resetGoogleDriveSyncHashes();
  localStorage.removeItem('google_drive_creds'); // Legacy key cleanup
};

export const getGoogleLastSyncHash = (): string => {
  return localStorage.getItem(GOOGLE_LAST_SYNC_HASH_KEY) || '';
};

export const getGoogleLastFullPushHash = (): string => {
  return localStorage.getItem(GOOGLE_LAST_FULL_PUSH_HASH_KEY) || '';
};

export type GoogleSyncHashKey =
  typeof GOOGLE_LAST_SYNC_HASH_KEY | typeof GOOGLE_LAST_FULL_PUSH_HASH_KEY;

/**
 * Snapshots the stored Drive refresh token. A hash says what that token's Drive
 * holds, so `writeHash` writes only while the same token is still stored: a
 * disconnect or reconnect mid-await drops it. The owner stamp never
 * changes without the token, so it is not compared.
 */
export const googleDriveConnection = () => {
  const refreshToken = loadGoogleDriveCreds();
  return {
    refreshToken,
    writeHash: (key: GoogleSyncHashKey, value: string) => {
      if (refreshToken && loadGoogleDriveCreds() === refreshToken) {
        localStorage.setItem(key, value);
      }
    },
  };
};
