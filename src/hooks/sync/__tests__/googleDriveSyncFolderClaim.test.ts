// @vitest-environment jsdom
import { performGoogleDriveSync } from '@/hooks/sync/googleDriveSync';
import { type SyncParams } from '@/hooks/sync/types';
import { saveGoogleDriveCreds } from '@/services/storage/googleStorage';
import { buildSingleItemResume } from '@/test/singleItemResume';
import { constructBackupFilename } from '@/utils/export';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const drive = vi.hoisted(() => ({
  sync: vi.fn(),
  listFiles: vi.fn(),
}));
vi.mock('@/services/google-drive', () => ({ googleDriveService: drive }));

type Deliverables = { html: string | null; pdf: null };
const WITH_HTML: Deliverables = { html: '<html></html>', pdf: null };
const NO_DELIVERABLES: Deliverables = { html: null, pdf: null };

const HASH = 'a'.repeat(64);
const params = (deliverables = WITH_HTML, projectName = 'CV', currentHash = HASH): SyncParams => ({
  resume: buildSingleItemResume('lunar'),
  variant: 'full',
  mode: 'push',
  lang: 'en',
  t: (key) => key,
  currentHash,
  includeBackup: true,
  projectName,
  artifacts: { folderName: projectName, backupFileName: projectName, json: '{}', ...deliverables },
  postingUrl: null,
});

/** The Drive function: `unique` renames a taken folder. */
const answerFolder = (folder: string) =>
  drive.sync.mockImplementation(async (_token: string, path: string[], _files, unique) => ({
    folderName: unique ? folder : path.at(-1),
  }));
const failSnapshotOnce = (folder = 'CV_2') => {
  answerFolder(folder);
  const answer = drive.sync.getMockImplementation()!;
  drive.sync.mockImplementation(async (...args: Parameters<typeof answer>) => {
    if (args[1].includes('backups')) {
      answerFolder(folder);
      throw new Error('Drive sync failed: quota');
    }
    return answer(...args);
  });
};

const exportCalls = () =>
  drive.sync.mock.calls
    .filter((call) => (call[1] as string[]).includes('exports'))
    .map((call) => [(call[1] as string[]).join('/'), Boolean(call[3])]);
const snapshotName = () => (drive.sync.mock.lastCall?.[2] as { name: string }[])[0].name;

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  saveGoogleDriveCreds('refresh-token');
  answerFolder('CV');
  drive.listFiles.mockResolvedValue([]);
});

describe('a Drive export failing partway (#91)', () => {
  it('writes the retry into the folder the failed attempt wrote', async () => {
    failSnapshotOnce();
    expect((await performGoogleDriveSync(params())).success).toBe(false);

    const retried = await performGoogleDriveSync(params());

    expect(retried).toEqual({ service: 'google_drive', success: true, renamedFolder: 'CV_2' });
    expect(exportCalls()).toEqual([
      ['KiwiCV/exports/CV', true],
      ['KiwiCV/exports/CV_2', false],
    ]);
    expect(snapshotName()).toMatch(/_2.*\.json$/);
  });

  it('gives the next export its own folder once one finished', async () => {
    await performGoogleDriveSync(params());
    await performGoogleDriveSync(params(WITH_HTML, 'CV', 'b'.repeat(64)));

    expect(exportCalls()).toEqual([
      ['KiwiCV/exports/CV', true],
      ['KiwiCV/exports/CV', true],
    ]);
  });

  it.each([
    ['another name', () => params(WITH_HTML, 'Other')],
    ['changed content', () => params(WITH_HTML, 'CV', 'b'.repeat(64))],
  ])('does not treat %s as a retry', async (_label, next) => {
    failSnapshotOnce();
    await performGoogleDriveSync(params());
    answerFolder('Fresh');

    await performGoogleDriveSync(next());

    expect(exportCalls()[1][1]).toBe(true);
  });

  it('does not treat another account as a retry', async () => {
    failSnapshotOnce();
    await performGoogleDriveSync(params());
    saveGoogleDriveCreds('other-account');
    answerFolder('Fresh');

    await performGoogleDriveSync(params());

    expect(exportCalls()[1][1]).toBe(true);
  });

  it('releases the folder when a retry finishes without deliverables', async () => {
    failSnapshotOnce();
    await performGoogleDriveSync(params());
    answerFolder('CV');
    await performGoogleDriveSync(params(NO_DELIVERABLES));
    // Forgets the stamp, which would otherwise answer the same content as already synced.
    localStorage.clear();
    saveGoogleDriveCreds('refresh-token');

    await performGoogleDriveSync(params());

    expect(exportCalls()).toEqual([
      ['KiwiCV/exports/CV', true],
      ['KiwiCV/exports/CV', true],
    ]);
  });
});

describe('the name of a Drive snapshot (#92)', () => {
  it('creates no folder for an export with no deliverables, and names none', async () => {
    const result = await performGoogleDriveSync(params(NO_DELIVERABLES));

    expect(result).toEqual({ service: 'google_drive', success: true });
    expect(exportCalls()).toEqual([]);
    expect(snapshotName()).toBe('CV.json');
  });

  it('does not overwrite an earlier snapshot of the same name', async () => {
    const name = constructBackupFilename('CV');
    drive.listFiles.mockResolvedValue([
      { name: `${name}.json` },
      { name: `${constructBackupFilename('CV_2')}.json` },
    ]);

    await performGoogleDriveSync(params(NO_DELIVERABLES, name));

    expect(snapshotName()).toBe(`${constructBackupFilename('CV_3')}.json`);
    expect(drive.listFiles).toHaveBeenCalledWith('refresh-token', ['KiwiCV', 'backups', 'en']);
  });

  it('holds for an export with deliverables after a snapshot-only one', async () => {
    const name = constructBackupFilename('CV');
    drive.listFiles.mockResolvedValue([{ name: `${name}.json` }]);

    await performGoogleDriveSync(params(WITH_HTML, name));

    expect(snapshotName()).toBe(`${constructBackupFilename('CV_2')}.json`);
  });

  it('keeps the suffix when the name is at its length limit', async () => {
    const name = constructBackupFilename('x'.repeat(50));
    drive.listFiles.mockResolvedValue([{ name: `${name}.json` }]);

    await performGoogleDriveSync(params(NO_DELIVERABLES, name));

    expect(snapshotName()).toBe(`${constructBackupFilename(`${'x'.repeat(48)}_2`)}.json`);
  });

  it('fails rather than overwriting when no name is free', async () => {
    const name = constructBackupFilename('CV');
    const taken = [
      name,
      ...Array.from({ length: 99 }, (_, i) => constructBackupFilename(`CV_${i + 2}`)),
    ];
    drive.listFiles.mockResolvedValue(taken.map((file) => ({ name: `${file}.json` })));

    const result = await performGoogleDriveSync(params(NO_DELIVERABLES, name));

    expect(result).toMatchObject({ success: false, error: 'common.error' });
    expect(drive.sync).not.toHaveBeenCalled();
  });

  it('fails rather than guessing when the listing fails', async () => {
    drive.listFiles.mockRejectedValue(new Error('LIST_FAILED'));

    const result = await performGoogleDriveSync(params(NO_DELIVERABLES));

    expect(result).toMatchObject({ success: false, error: 'LIST_FAILED' });
    expect(drive.sync).not.toHaveBeenCalled();
  });
});
