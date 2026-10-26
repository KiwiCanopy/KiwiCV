// @vitest-environment jsdom
import { performGitHubSync } from '@/hooks/sync/githubSync';
import { type SyncParams } from '@/hooks/sync/types';
import { resetGitHubSyncHashes, saveGitHubCreds } from '@/services/storage/githubStorage';
import { buildSingleItemResume } from '@/test/singleItemResume';
import { APPLICATION_KEY, readCachedPostingUrl } from '@/utils/applicationMeta';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/** The posting link reveals where the user applies: private repos only (#54). */
const github = vi.hoisted(() => ({
  getRepo: vi.fn(async (..._args: unknown[]): Promise<Record<string, unknown>> => ({
    private: true,
  })),
  pushFile: vi.fn(async (..._args: unknown[]) => ({ content: { sha: 'blob-sha' } })),
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

const URL_ = 'https://jobs.example.com/42';

const params = (postingUrl: string | null): SyncParams => ({
  resume: buildSingleItemResume('lunar'),
  variant: 'full',
  mode: 'sync',
  lang: 'en',
  t: (key) => key,
  currentHash: 'a'.repeat(64),
  includeBackup: true,
  projectName: 'CV',
  artifacts: { folderName: 'CV', backupFileName: 'CV', json: '{}', html: null, pdf: null },
  postingUrl,
});

/** Every JSON the run wrote, by path. */
const written = () =>
  Object.fromEntries(
    github.pushFile.mock.calls.map(([, , path, content]) => [
      path as string,
      JSON.parse(content as string),
    ]),
  );

describe('the posting link in a GitHub export', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    saveGitHubCreds('pat', 'me/cv', true);
    resetGitHubSyncHashes();
  });

  it('lands in the snapshot of a private repo, and only there', async () => {
    await performGitHubSync(params(URL_), { repo: 'me/cv' });
    const files = written();
    expect(files['backups/en/CV.json'][APPLICATION_KEY]).toEqual({ postingUrl: URL_ });
    expect(files['backups/en/resume.json'][APPLICATION_KEY]).toBeUndefined();
    expect(readCachedPostingUrl('blob-sha')).toBe(URL_);
  });

  it.each([
    ['public', { private: false }],
    ['internal', { private: true, visibility: 'internal' }],
    ['Pages-published', { private: true, has_pages: true }],
  ])('never reaches a %s repo', async (_kind, repo) => {
    github.getRepo.mockResolvedValueOnce(repo);
    await performGitHubSync(params(URL_), { repo: 'me/cv' });
    for (const content of Object.values(written())) {
      expect(JSON.stringify(content)).not.toContain(URL_);
    }
    expect(readCachedPostingUrl('blob-sha')).toBeNull();
  });

  it('a changed link alone pushes again', async () => {
    await performGitHubSync(params(null), { repo: 'me/cv' });
    const again = await performGitHubSync(params(URL_), { repo: 'me/cv' });
    expect(again.alreadySynced).toBeUndefined();
    const same = await performGitHubSync(params(URL_), { repo: 'me/cv' });
    expect(same.alreadySynced).toBe(true);
  });
});
