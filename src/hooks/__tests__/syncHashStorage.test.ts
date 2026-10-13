// @vitest-environment jsdom
import { useCloudSync } from '@/hooks/useCloudSync';
import { saveGoogleDriveCreds } from '@/services/storage/googleStorage';
import { ALL_SYNC_HASH_KEYS } from '@/services/storage/syncHashes';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { buildSingleItemResume } from '@/test/singleItemResume';
import { isResumeDigest } from '@/utils/hash';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * What a sync run leaves in localStorage beside the store itself: a digest per
 * sync-hash key, never a copy of the resume that can be read back.
 */
const github = vi.hoisted(() => ({
  getRepo: vi.fn(async () => ({ private: true, has_pages: false })),
  pushFile: vi.fn(async (..._args: unknown[]) => ({})),
  pushExport: vi.fn(async (..._args: unknown[]) => ({})),
}));
const drive = vi.hoisted(() => ({ sync: vi.fn(async (..._args: unknown[]) => ({})) }));

vi.mock('@/services/github', () => ({
  GitHubService: vi.fn(function GitHubService() {
    return github;
  }),
}));
vi.mock('@/services/google-drive', () => ({ googleDriveService: drive }));

const NAME = 'Ada Sync-Hash Lovelace';
/** A backup file name carries where the user applied. */
const PROJECT = 'Ada_Acme-Corp_Staff-Engineer';
const artifacts = {
  folderName: PROJECT,
  backupFileName: PROJECT,
  json: '{}',
  html: '<p/>',
  pdf: null,
};

/** The value itself, and its base64 decoding when it has one. */
const readable = (value: string): string[] => {
  try {
    return [value, decodeURIComponent(escape(atob(value)))];
  } catch {
    return [value];
  }
};

beforeEach(() => {
  drive.sync.mockImplementation(async () => ({}));
  localStorage.clear();
  localStorage.setItem('github_pat', 'pat');
  saveGoogleDriveCreds('refresh-token');
  const resume = buildSingleItemResume('lunar');
  resume.basics.name = NAME;
  useResumeStore.setState({
    resume,
    sync: { github: { enabled: true, repo: 'me/cv' }, googleDrive: { enabled: true } },
  });
});

describe('sync hashes in localStorage', () => {
  it('hold a SHA-256 digest under every key, and nothing that reads back as the resume', async () => {
    const storeKey = useResumeStore.persist.getOptions().name;
    const before = { ...localStorage };
    const { result } = renderHook(() => useCloudSync());

    for (const variant of ['standard', 'hosting', 'full'] as const) {
      const run = await result.current.handleSync(variant, PROJECT, 'sync', { artifacts });
      expect(run.success).toBe(true);
    }

    const written = Object.keys(localStorage).filter(
      (key) => key !== storeKey && localStorage.getItem(key) !== before[key],
    );
    expect(written.sort()).toEqual([...ALL_SYNC_HASH_KEYS].sort());
    for (const key of written) {
      const value = localStorage.getItem(key)!;
      expect(isResumeDigest(value)).toBe(true);
      for (const text of readable(value)) {
        expect(text).not.toContain(NAME);
        expect(text).not.toContain('Acme');
      }
    }
  });

  it('recognises an unchanged Drive full push after Drive renamed its export folder', async () => {
    drive.sync.mockImplementation(async (...args: unknown[]) =>
      (args[1] as string[]).includes('exports') ? { folderName: `${PROJECT}_2` } : {},
    );
    const { result } = renderHook(() => useCloudSync());
    const options = { artifacts, providers: ['google_drive' as const] };
    await result.current.handleSync('full', PROJECT, 'sync', options);

    const again = await result.current.handleSync('full', PROJECT, 'sync', options);

    expect(again.results).toEqual([
      { service: 'google_drive', success: true, alreadySynced: true },
    ]);
  });

  it('recognises an unchanged full push by its stamp, for both providers', async () => {
    const { result } = renderHook(() => useCloudSync());
    await result.current.handleSync('full', PROJECT, 'sync', { artifacts });

    const again = await result.current.handleSync('full', PROJECT, 'sync', { artifacts });

    expect(again.results.map((r) => [r.service, r.alreadySynced])).toEqual(
      expect.arrayContaining([
        ['github', true],
        ['google_drive', true],
      ]),
    );
  });
});
