// @vitest-environment jsdom
import { performGitHubSync } from '@/hooks/sync/githubSync';
import { performGoogleDriveSync } from '@/hooks/sync/googleDriveSync';
import { type SyncParams } from '@/hooks/sync/types';
import { saveGoogleDriveCreds } from '@/services/storage/googleStorage';
import { buildSingleItemResume } from '@/test/singleItemResume';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Backups write pass-through blocks flat at the top level, except to a
 * GitHub repo that is (or may be) public.
 */
const github = vi.hoisted(() => ({
  getRepo: vi.fn(),
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
const exportArtifacts = vi.hoisted(() => ({
  buildExportArtifacts: vi.fn(async (..._args: unknown[]) => ({
    pdf: new Blob(['letter-free'], { type: 'application/pdf' }),
  })),
}));
vi.mock('@/hooks/export/buildExportArtifacts', () => exportArtifacts);

const params = (): SyncParams => ({
  resume: { ...buildSingleItemResume('lunar'), passthrough: { kiwitalents: { salary: 'X' } } },
  variant: 'standard',
  mode: 'sync',
  lang: 'en',
  t: (key) => key,
  currentHash: `hash-${Math.random()}`,
  includeBackup: true,
});

const pushedBackup = () => {
  const call = github.pushFile.mock.calls.find((args) => String(args[2]).startsWith('backups/'));
  return JSON.parse(String(call?.[3]));
};

describe('backups and pass-through blocks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('github_pat', 'pat');
    saveGoogleDriveCreds('refresh-token');
  });

  it('Google Drive gets them at the top level', async () => {
    await performGoogleDriveSync(params());
    const [, , files] = drive.sync.mock.calls[0] as unknown as [
      unknown,
      unknown,
      Array<{ content: string }>,
    ];
    const written = JSON.parse(files[0].content);
    expect(written.kiwitalents).toEqual({ salary: 'X' });
    expect(written).not.toHaveProperty('passthrough');
  });

  it('a private GitHub repo gets them at the top level', async () => {
    github.getRepo.mockResolvedValue({ private: true, has_pages: false });
    expect((await performGitHubSync(params(), { repo: 'me/cv' })).success).toBe(true);
    expect(pushedBackup().kiwitalents).toEqual({ salary: 'X' });
  });

  it('a full export to a public repo leaves them out of its backup too', async () => {
    github.getRepo.mockResolvedValue({ private: false });
    const run = {
      ...params(),
      variant: 'full' as const,
      projectName: 'Ada_CV',
      artifacts: {
        folderName: 'Ada_CV',
        backupFileName: 'x',
        json: '{"stale":1}',
        html: null,
        pdf: null,
      },
    };
    expect((await performGitHubSync(run as SyncParams, { repo: 'me/cv' })).success).toBe(true);
    const call = github.pushFile.mock.calls.find((args) => String(args[2]).endsWith('Ada_CV.json'));
    const written = JSON.parse(String(call?.[3]));
    expect(written.basics.name).toBeTruthy();
    expect(written).not.toHaveProperty('kiwitalents');
  });

  it.each([
    ['public', async () => ({ private: false })],
    ['Pages-published private', async () => ({ private: true, has_pages: true })],
    ['unknown', async () => null],
    ['unreadable', async () => Promise.reject(new Error('403'))],
  ])('a %s GitHub repo does not get them', async (_label, repo) => {
    github.getRepo.mockImplementation(repo);
    expect((await performGitHubSync(params(), { repo: 'me/cv' })).success).toBe(true);
    const written = pushedBackup();
    expect(written).not.toHaveProperty('kiwitalents');
    expect(written).not.toHaveProperty('passthrough');
    expect(written.basics.name).toBeTruthy();
  });
});

/**
 * A repo anyone can read gets the reduced tier — what the CV shows — and
 * a private, unpublished one the full store.
 */
describe('what a GitHub backup holds', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('github_pat', 'pat');
    saveGoogleDriveCreds('refresh-token');
  });

  const withPrivateData = (): SyncParams => {
    const run = params();
    const resume = structuredClone(run.resume);
    resume.work = [{ ...resume.work[0], name: 'Hidden Corp', _vId: 'hide-me' }];
    resume.meta.content.hiddenIds = ['work:hide-me'];
    resume.coverLetter.recipient.name = 'Recipient Person';
    return { ...run, resume };
  };

  it.each([
    ['public', async () => ({ private: false })],
    ['Pages-published private', async () => ({ private: true, has_pages: true })],
    ['Enterprise internal', async () => ({ private: true, visibility: 'internal' })],
    ['unreadable', async () => Promise.reject(new Error('403'))],
  ])('a %s repo gets no hidden entry and no cover letter', async (_label, repo) => {
    github.getRepo.mockImplementation(repo);
    expect((await performGitHubSync(withPrivateData(), { repo: 'me/cv' })).success).toBe(true);
    const backup = pushedBackup();
    const written = JSON.stringify(backup);
    expect(written).not.toContain('Hidden Corp');
    expect(written).not.toContain('Recipient Person');
    // The design travels, so a restore keeps the look; the hide markers do not.
    expect(backup.meta.theme.name).toBe('lunar');
    expect(backup.meta.content.hiddenIds).toEqual([]);
  });

  it('a full export to a public repo pushes the PDF without the cover letter', async () => {
    github.getRepo.mockResolvedValue({ private: false });
    const run = withPrivateData();
    run.resume.coverLetter.enabled = true;
    const withLetter = new Blob(['with-letter'], { type: 'application/pdf' });
    const full = {
      ...run,
      variant: 'full' as const,
      projectName: 'Ada_CV',
      artifacts: {
        folderName: 'Ada_CV',
        backupFileName: 'x',
        json: '',
        html: null,
        pdf: withLetter,
      },
    };
    expect((await performGitHubSync(full as SyncParams, { repo: 'me/cv' })).success).toBe(true);

    const [{ resume }] = exportArtifacts.buildExportArtifacts.mock.calls[0] as unknown as [
      { resume: { coverLetter: { enabled: boolean } } },
    ];
    expect(resume.coverLetter.enabled).toBe(false);
    const [, , , files] = github.pushExport.mock.calls[0] as unknown as [
      unknown,
      unknown,
      unknown,
      Array<{ path: string; content: string }>,
    ];
    expect(atob(files.find((f) => f.path.endsWith('.pdf'))!.content)).toBe('letter-free');
  });

  it('a public repo gets no PDF when the user did not export one', async () => {
    github.getRepo.mockResolvedValue({ private: false });
    const run = withPrivateData();
    run.resume.coverLetter.enabled = true;
    const full = {
      ...run,
      variant: 'full' as const,
      projectName: 'Ada_CV',
      artifacts: { folderName: 'Ada_CV', backupFileName: 'x', json: '', html: null, pdf: null },
    };
    expect((await performGitHubSync(full as SyncParams, { repo: 'me/cv' })).success).toBe(true);
    expect(exportArtifacts.buildExportArtifacts).not.toHaveBeenCalled();
    const pushed = (github.pushExport.mock.calls[0]?.[3] ?? []) as Array<{ path: string }>;
    expect(pushed.some((file) => file.path.endsWith('.pdf'))).toBe(false);
  });

  it('a private repo gets the PDF the user exported', async () => {
    github.getRepo.mockResolvedValue({ private: true, has_pages: false });
    const run = withPrivateData();
    run.resume.coverLetter.enabled = true;
    const full = {
      ...run,
      variant: 'full' as const,
      projectName: 'Ada_CV',
      artifacts: {
        folderName: 'Ada_CV',
        backupFileName: 'x',
        json: '',
        html: null,
        pdf: new Blob(['with-letter'], { type: 'application/pdf' }),
      },
    };
    expect((await performGitHubSync(full as SyncParams, { repo: 'me/cv' })).success).toBe(true);
    expect(exportArtifacts.buildExportArtifacts).not.toHaveBeenCalled();
  });

  it('a private, unpublished repo keeps the full store', async () => {
    github.getRepo.mockResolvedValue({ private: true, has_pages: false });
    expect((await performGitHubSync(withPrivateData(), { repo: 'me/cv' })).success).toBe(true);
    const written = JSON.stringify(pushedBackup());
    expect(written).toContain('Hidden Corp');
    expect(written).toContain('Recipient Person');
  });
});
