import { RESUME_STORAGE_KEY, buildMigrationBackup } from '@/utils/migration-backup';
import { describe, expect, it } from 'vitest';

/**
 * A Storage stand-in whose own enumerable properties mirror the stored keys,
 * exactly as a real `localStorage` does. That property is the whole reason the
 * old whole-store fallback leaked: `JSON.stringify(localStorage)` walks them.
 */
function fakeStorage(entries: Record<string, string>) {
  const store = { ...entries } as Record<string, string> & Pick<Storage, 'getItem'>;
  store.getItem = (key: string) => entries[key] ?? null;
  return store;
}

const CREDENTIALS = {
  github_pat: 'ghp_thisisasecret',
  github_repo: 'someone/private-cv',
  github_last_sync_hash: 'abc123',
};

describe('buildMigrationBackup', () => {
  it('returns the resume when the persisted store exposes one', () => {
    const storage = fakeStorage({
      [RESUME_STORAGE_KEY]: JSON.stringify({ state: { resume: { basics: { name: 'Ada' } } } }),
    });

    expect(JSON.parse(buildMigrationBackup(storage)!)).toEqual({ basics: { name: 'Ada' } });
  });

  it('falls back to the persisted state when the resume key is absent', () => {
    const storage = fakeStorage({
      [RESUME_STORAGE_KEY]: JSON.stringify({ state: { draft: { basics: { name: 'Ada' } } } }),
    });

    expect(JSON.parse(buildMigrationBackup(storage)!)).toEqual({
      draft: { basics: { name: 'Ada' } },
    });
  });

  it('hands back the raw bytes when the store cannot be parsed', () => {
    const storage = fakeStorage({ [RESUME_STORAGE_KEY]: '{ truncated' });

    expect(buildMigrationBackup(storage)).toBe('{ truncated');
  });

  it('returns null when there is nothing stored', () => {
    expect(buildMigrationBackup(fakeStorage({}))).toBeNull();
  });

  // The regression this module exists for. Every one of these inputs used to
  // reach `dataToExport = localStorage`, which serialised the whole store.
  it.each([
    ['an unparseable store', '{ truncated'],
    ['a store with no state', JSON.stringify({ version: 3 })],
    ['a store with no resume', JSON.stringify({ state: { draft: {} } })],
    ['a well-formed store', JSON.stringify({ state: { resume: { basics: {} } } })],
  ])('never leaks provider credentials, given %s', (_case, stored) => {
    const backup = buildMigrationBackup(
      fakeStorage({ ...CREDENTIALS, [RESUME_STORAGE_KEY]: stored }),
    );

    for (const secret of Object.values(CREDENTIALS)) {
      expect(backup).not.toContain(secret);
    }
    for (const key of Object.keys(CREDENTIALS)) {
      expect(backup).not.toContain(key);
    }
  });
});
