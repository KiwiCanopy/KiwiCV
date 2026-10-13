// @vitest-environment jsdom
import { disconnectGitHub } from '@/hooks/sync/disconnectGitHub';
import { performGitHubSync } from '@/hooks/sync/githubSync';
import { type SyncParams } from '@/hooks/sync/types';
import {
  GITHUB_LAST_FULL_PUSH_HASH_KEY,
  GITHUB_LAST_HOSTING_HASH_KEY,
  GITHUB_LAST_SYNC_HASH_KEY,
  resetGitHubSyncHashes,
  saveGitHubCreds,
} from '@/services/storage/githubStorage';
import { buildSingleItemResume } from '@/test/singleItemResume';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/** A sync in flight across a disconnect must not stamp the next connection. */
const github = vi.hoisted(() => ({
  getRepo: vi.fn(async (..._args: unknown[]) => ({ private: true })),
  pushFile: vi.fn(async (..._args: unknown[]) => ({})),
  pushExport: vi.fn(async (..._args: unknown[]) => ({})),
}));
vi.mock('@/services/github', () => ({
  GitHubService: vi.fn(function GitHubService() {
    return github;
  }),
}));
vi.mock('@/hooks/export/buildExportArtifacts', () => ({
  buildExportArtifacts: vi.fn(async () => ({ json: '{}' })),
}));

const REPO = 'me/cv';
const hashes = () => [
  localStorage.getItem(GITHUB_LAST_SYNC_HASH_KEY),
  localStorage.getItem(GITHUB_LAST_FULL_PUSH_HASH_KEY),
  localStorage.getItem(GITHUB_LAST_HOSTING_HASH_KEY),
];

const params = (variant: SyncParams['variant'], includeBackup = true): SyncParams => ({
  resume: buildSingleItemResume('lunar'),
  variant,
  mode: 'sync',
  lang: 'en',
  t: (key) => key,
  currentHash: 'a'.repeat(64),
  includeBackup,
  projectName: 'CV',
  artifacts: {
    folderName: 'CV',
    backupFileName: 'CV',
    json: '{}',
    html: '<html></html>',
    pdf: null,
  },
});

/** Holds the next call of `method` open until the returned release is called. */
const holdNext = (method: typeof github.pushFile) => {
  let release = () => {};
  method.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        release = () => resolve({});
      }),
  );
  return () => release();
};

const connect = (repo = REPO) => {
  saveGitHubCreds('pat', repo, true);
  resetGitHubSyncHashes();
};

describe('GitHub sync across a disconnect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    connect();
  });

  const interruptions = {
    disconnect: () => disconnectGitHub(),
    'a Connect to another repository': () => connect('me/other'),
  };
  const modes = [
    ['standard', true, 'pushFile'],
    ['full', true, 'pushExport'],
    ['full', false, 'pushExport'],
    ['hosting', false, 'pushFile'],
  ] as const;

  describe.each(Object.entries(interruptions))('across %s', (_, interrupt) => {
    it.each(modes)(
      'a %s sync (backup: %s) held open writes no hash',
      async (variant, includeBackup, method) => {
        const release = holdNext(github[method]);
        const syncing = performGitHubSync(params(variant, includeBackup), { repo: REPO });
        await vi.waitFor(() => expect(github[method]).toHaveBeenCalled());

        interrupt();
        release();
        await syncing;

        expect(hashes()).toEqual([null, null, null]);
      },
    );
  });

  it.each([
    ['standard', true],
    ['full', false],
    ['hosting', false],
  ] as const)(
    'a %s sync that completes on the same connection still records its hash',
    async (variant, includeBackup) => {
      await performGitHubSync(params(variant, includeBackup), { repo: REPO });
      expect(hashes().filter(Boolean)).toHaveLength(1);

      const again = await performGitHubSync(params(variant, includeBackup), { repo: REPO });
      expect(again.alreadySynced).toBe(true);
    },
  );
});
