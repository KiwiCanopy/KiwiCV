// @vitest-environment jsdom
import {
  readCachedPostingUrl,
  wrapBackupJson,
  writeCachedPostingUrl,
} from '@/hooks/cloud/applicationMeta';
import { useCloudDiscovery } from '@/hooks/cloud/useCloudDiscovery';
import { saveGitHubCreds } from '@/services/storage/githubStorage';
import { useCvLibraryStore } from '@/store/library/useCvLibraryStore';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/** GitHub rows take their posting link from a sha-keyed cache, else one lazy read (#54). */
const github = vi.hoisted(() => ({
  files: [] as { name: string; sha: string }[],
  contents: {} as Record<string, string>,
  getFileContent: vi.fn(),
}));
vi.mock('@/services/github', () => ({
  GitHubService: vi.fn(function GitHubService() {
    return {
      listContents: async (_owner: string, _repo: string, path: string) =>
        path === 'backups'
          ? [{ type: 'dir', name: 'en' }]
          : path === 'backups/en'
            ? github.files.map((f) => ({ ...f, type: 'file' }))
            : [],
      getLastCommit: async () => null,
      getFileContent: github.getFileContent,
    };
  }),
}));
vi.mock('@/hooks/useTranslation', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));

const URL_ = 'https://jobs.example.com/42';

const discover = async () => {
  const { result } = renderHook(() => useCloudDiscovery());
  const found = await result.current.discoverBackups(undefined, 'github');
  useCvLibraryStore.getState().setReady(found.foundBackups, found.githubPaths);
  await result.current.hydrateGitHubPostingUrls(found.foundBackups, found.githubPaths);
  return useCvLibraryStore.getState().discoveryData!.en.github!;
};

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  useCvLibraryStore.getState().reset();
  saveGitHubCreds('pat', 'me/cv', true);
  github.getFileContent.mockImplementation(
    async (_o: string, _r: string, path: string) => github.contents[path] ?? null,
  );
});

describe('GitHub posting links in My CVs', () => {
  it('reads an uncached version once, then serves it from the cache', async () => {
    github.files = [{ name: 'CV_Acme.json', sha: 's1' }];
    github.contents['backups/en/CV_Acme.json'] = wrapBackupJson('{}', URL_);

    expect((await discover())[0].postingUrl).toBe(URL_);
    expect(readCachedPostingUrl('s1')).toBe(URL_);

    expect((await discover())[0].postingUrl).toBe(URL_);
    expect(github.getFileContent).toHaveBeenCalledTimes(1);
  });

  it('a rename keeps the link: same sha, new name, no read', async () => {
    writeCachedPostingUrl('s1', URL_);
    github.files = [{ name: 'CV_Renamed.json', sha: 's1' }];

    expect((await discover())[0].postingUrl).toBe(URL_);
    expect(github.getFileContent).not.toHaveBeenCalled();
  });

  it('caches "no link" and never reads the master backup', async () => {
    github.files = [
      { name: 'resume.json', sha: 'm1' },
      { name: 'CV_Plain.json', sha: 's2' },
    ];
    github.contents['backups/en/CV_Plain.json'] = '{}';

    const rows = await discover();
    expect(rows.every((row) => !row.postingUrl)).toBe(true);
    expect(readCachedPostingUrl('s2')).toBeNull();
    expect(github.getFileContent.mock.calls.map((call) => call[2])).toEqual([
      'backups/en/CV_Plain.json',
    ]);
  });
});
