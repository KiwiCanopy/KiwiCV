// @vitest-environment jsdom
import { buildExportArtifacts } from '@/hooks/export/buildExportArtifacts';
import { performGitHubSync } from '@/hooks/sync/githubSync';
import { type SyncParams } from '@/hooks/sync/types';
import { resetGitHubSyncHashes, saveGitHubCreds } from '@/services/storage/githubStorage';
import { type StoredSignature, useSignatureStore } from '@/store/signature/useSignatureStore';
import { buildSingleItemResume } from '@/test/singleItemResume';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/** A repo anyone can read never receives a PDF carrying the signature (#103). */
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
  buildExportArtifacts: vi.fn(async () => ({ pdf: new Blob(['public']) })),
}));

const SIGNATURE: StoredSignature = {
  kind: 'typed',
  id: 'sig',
  faceId: 'great-vibes',
  text: 'Jane Doe',
};

const params = (): SyncParams => {
  const resume = buildSingleItemResume('lunar');
  resume.coverLetter = { ...resume.coverLetter, enabled: false };
  return {
    resume,
    variant: 'full',
    mode: 'sync',
    lang: 'en',
    t: (key) => key,
    currentHash: 'a'.repeat(64),
    includeBackup: true,
    projectName: 'CV',
    artifacts: {
      folderName: 'CV',
      backupFileName: 'CV',
      json: '{}',
      html: null,
      pdf: new Blob(['signed']),
    },
    postingUrl: null,
  };
};

describe('the signature in a GitHub export', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    saveGitHubCreds('pat', 'me/cv', true);
    resetGitHubSyncHashes();
    useSignatureStore.setState({ signature: SIGNATURE });
  });

  it.each([
    ['public', { private: false }],
    ['internal', { private: true, visibility: 'internal' }],
    ['Pages-published', { private: true, has_pages: true }],
  ])('a %s repo gets a PDF compiled without it', async (_kind, repo) => {
    github.getRepo.mockResolvedValueOnce(repo);
    await performGitHubSync(params(), { repo: 'me/cv' });
    expect(vi.mocked(buildExportArtifacts)).toHaveBeenCalledWith(
      expect.objectContaining({ signature: null }),
    );
  });

  it('a private repo keeps the signed PDF the export built', async () => {
    await performGitHubSync(params(), { repo: 'me/cv' });
    expect(vi.mocked(buildExportArtifacts)).not.toHaveBeenCalled();
  });
});
