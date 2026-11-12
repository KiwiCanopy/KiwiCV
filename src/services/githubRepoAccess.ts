/**
 * Whether a repo may hold what only its owner should read: the full backup and
 * the signature (#106). Private, not Enterprise "internal", not published with
 * Pages, and never one whose visibility could not be read.
 */
export const isPrivateBackupRepo = (
  repo: { private?: boolean; visibility?: string; has_pages?: boolean } | null | undefined,
): boolean => repo?.private === true && repo.visibility !== 'internal' && repo.has_pages !== true;
