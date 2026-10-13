/** The only key the migration backup is ever allowed to read. */
export const RESUME_STORAGE_KEY = 'resume-storage';

export const MIGRATION_BACKUP_FILENAME = 'kiwicv_migration_backup.json';

/**
 * Serialises the resume for the legacy-domain migration download.
 *
 * Scoped to `resume-storage` on purpose. The previous implementation defaulted
 * to the whole `localStorage` object and fell back to it whenever the store
 * failed to parse or did not expose `state.resume` — and `JSON.stringify` on a
 * Storage object walks every key, so that fallback wrote `github_pat`,
 * `github_repo` and the sync hashes into a file the user is then told to
 * upload to the new domain. A backup carries resume data; it never carries
 * provider credentials.
 *
 * Returns null when there is nothing to back up, so the caller can keep the
 * download affordance off the page entirely.
 */
export function buildMigrationBackup(storage: Pick<Storage, 'getItem'>): string | null {
  const raw = storage.getItem(RESUME_STORAGE_KEY);
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Unparseable but present: hand back the bytes verbatim rather than
    // nothing. It is still the user's only copy, and a human or a repair tool
    // can read it.
    return raw;
  }

  const state = (parsed as { state?: { resume?: unknown } } | null)?.state;
  const payload = state?.resume ?? state ?? parsed;

  return JSON.stringify(payload, null, 2);
}
