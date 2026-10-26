// @vitest-environment jsdom
import { useCloudRestoreAction } from '@/hooks/cloud/useCloudRestoreAction';
import { readExportDraft, writeExportDraft } from '@/hooks/export/exportDraft';
import {
  GITHUB_LAST_FULL_PUSH_HASH_KEY,
  GITHUB_LAST_SYNC_HASH_KEY,
  clearGitHubCreds,
  saveGitHubCreds,
} from '@/services/storage/githubStorage';
import {
  GOOGLE_LAST_SYNC_HASH_KEY,
  clearGoogleDriveCreds,
  saveGoogleDriveCreds,
} from '@/services/storage/googleStorage';
import { buildSingleItemResume } from '@/test/singleItemResume';
import { isResumeDigest } from '@/utils/hash';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const hashing = vi.hoisted(() => ({ fail: false }));

vi.mock('@/utils/hash', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/utils/hash')>();
  return {
    ...actual,
    getResumeHash: (...args: Parameters<typeof actual.getResumeHash>) =>
      hashing.fail ? Promise.reject(new Error('no crypto.subtle')) : actual.getResumeHash(...args),
  };
});
vi.mock('@/utils/importResume', () => ({
  importResume: vi.fn(async (_set: unknown, data: unknown) => ({ warnings: [], data })),
}));
vi.mock('@/hooks/useTranslation', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('@/services/analytics', () => ({
  ANALYTICS_EVENTS: {},
  analytics: { track: vi.fn() },
}));

const file = { name: 'resume.json', label: 'resume.json' } as never;
const restore = (postingUrl: string | null = null) => {
  const download = vi.fn(async () => ({ data: buildSingleItemResume('lunar'), postingUrl }));
  const { result } = renderHook(() => useCloudRestoreAction(download));
  return result.current.performRestore('github', file, 'en', true);
};

beforeEach(() => {
  localStorage.clear();
  hashing.fail = false;
  saveGitHubCreds('pat', 'me/cv', true);
  saveGoogleDriveCreds('refresh-token');
});

describe('useCloudRestoreAction sync-hash bookkeeping', () => {
  it('records the restored store as the last sync, and leaves the full-push stamp alone', async () => {
    localStorage.setItem(GITHUB_LAST_FULL_PUSH_HASH_KEY, 'a'.repeat(64));

    expect((await restore()).imported).toBe(true);

    expect(isResumeDigest(localStorage.getItem(GITHUB_LAST_SYNC_HASH_KEY) ?? '')).toBe(true);
    expect(localStorage.getItem(GITHUB_LAST_FULL_PUSH_HASH_KEY)).toBe('a'.repeat(64));
  });

  it('still reports an imported restore when hashing fails', async () => {
    hashing.fail = true;
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect((await restore()).imported).toBe(true);
    expect(localStorage.getItem(GITHUB_LAST_SYNC_HASH_KEY)).toBeNull();
  });
});

describe('a restore and the export draft (#54)', () => {
  it('hands the restored posting link to the next export', async () => {
    writeExportDraft({ company: 'Old Co', postingUrl: 'https://old.example.com/job' });
    await restore('https://jobs.example.com/42');
    expect(readExportDraft()).toEqual({ postingUrl: 'https://jobs.example.com/42' });
  });

  it('drops a previous link when the restored version has none', async () => {
    writeExportDraft({ postingUrl: 'https://old.example.com/job' });
    await restore(null);
    expect(readExportDraft()).toBeNull();
  });
});

describe('a restore across a disconnect', () => {
  it.each([
    ['github', GITHUB_LAST_SYNC_HASH_KEY, clearGitHubCreds],
    ['google_drive', GOOGLE_LAST_SYNC_HASH_KEY, clearGoogleDriveCreds],
  ] as const)(
    'a %s download held open across a disconnect writes no hash',
    async (source, key, disconnect) => {
      let release = () => {};
      const download = vi.fn(
        () =>
          new Promise<{ data: ReturnType<typeof buildSingleItemResume>; postingUrl: null }>(
            (resolve) => {
              release = () => resolve({ data: buildSingleItemResume('lunar'), postingUrl: null });
            },
          ),
      );
      const { result } = renderHook(() => useCloudRestoreAction(download));
      const restoring = result.current.performRestore(source, file, 'en', true);
      await vi.waitFor(() => expect(download).toHaveBeenCalled());

      disconnect();
      release();

      expect((await restoring).imported).toBe(true);
      expect(localStorage.getItem(key)).toBeNull();
    },
  );
});
