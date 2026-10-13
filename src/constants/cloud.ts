export const GOOGLE_DRIVE_ROOT = 'KiwiCV';
export const GOOGLE_DRIVE_LEGACY_ROOT = 'CVCanvas';
export const GOOGLE_DRIVE_READ_ROOTS = [GOOGLE_DRIVE_ROOT, GOOGLE_DRIVE_LEGACY_ROOT] as const;
export type GoogleDriveRoot = (typeof GOOGLE_DRIVE_READ_ROOTS)[number];

// Compatibility alias for call sites that only need the canonical write root.
export const GOOGLE_DRIVE_FOLDER = GOOGLE_DRIVE_ROOT;
export const GITHUB_API_VERSION = '2026-03-10';

/**
 * Handshake failures that prove the stored Drive refresh token can never work:
 * no drive.file grant, or a revoked/expired grant. Set by google-drive-sync.
 */
export const UNUSABLE_DRIVE_CREDENTIAL_ERRORS: ReadonlySet<string> = new Set([
  'INSUFFICIENT_SCOPE',
  'INVALID_GRANT',
]);
