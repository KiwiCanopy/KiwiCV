// @vitest-environment jsdom
import { performGoogleDriveSync } from '@/hooks/sync/googleDriveSync';
import { type SyncParams } from '@/hooks/sync/types';
import { saveGoogleDriveCreds } from '@/services/storage/googleStorage';
import { buildSingleItemResume } from '@/test/singleItemResume';
import { constructBackupFilename } from '@/utils/export';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const drive = vi.hoisted(() => ({
  resolveFolder: vi.fn(),
  sync: vi.fn(),
  listFiles: vi.fn(),
}));
vi.mock('@/services/google-drive', () => ({ googleDriveService: drive }));

type Deliverables = { html: string | null; pdf: null };
const WITH_HTML: Deliverables = { html: '<html></html>', pdf: null };
const NO_DELIVERABLES: Deliverables = { html: null, pdf: null };

const params = (
  deliverables = WITH_HTML,
  projectName = 'CV',
  mode: SyncParams['mode'] = 'push',
): SyncParams => ({
  resume: buildSingleItemResume('lunar'),
  variant: 'full',
  mode,
  lang: 'en',
  t: (key) => key,
  currentHash: 'a'.repeat(64),
  includeBackup: true,
  projectName,
  artifacts: { folderName: projectName, backupFileName: projectName, json: '{}', ...deliverables },
  postingUrl: null,
});

const pathsWritten = () => drive.sync.mock.calls.map((call) => (call[1] as string[]).join('/'));
const snapshotName = () =>
  (drive.sync.mock.lastCall?.[2] as { name: string }[] | undefined)?.[0]?.name;

/** Fails the upload into `backups/`, after the deliverables landed. */
const failSnapshotOnce = () =>
  drive.sync.mockImplementation(async (_token: string, path: string[]) => {
    if (path.includes('backups')) throw new Error('Drive sync failed: quota');
    return { folderId: 'id' };
  });

describe('a Drive export failing partway (#91)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    saveGoogleDriveCreds('refresh-token');
    drive.resolveFolder.mockResolvedValue({ folderId: 'id', folderName: 'CV_2' });
    drive.sync.mockResolvedValue({ folderId: 'id' });
    drive.listFiles.mockResolvedValue([]);
  });

  it('claims a folder once, and writes the retry into it', async () => {
    failSnapshotOnce();
    const failed = await performGoogleDriveSync(params());
    expect(failed.success).toBe(false);

    drive.sync.mockResolvedValue({ folderId: 'id' });
    const retried = await performGoogleDriveSync(params());

    expect(retried).toEqual({ service: 'google_drive', success: true, renamedFolder: 'CV_2' });
    expect(drive.resolveFolder).toHaveBeenCalledTimes(1);
    expect(pathsWritten().filter((path) => path.includes('exports'))).toEqual([
      'KiwiCV/exports/CV_2',
      'KiwiCV/exports/CV_2',
    ]);
    expect(snapshotName()).toMatch(/_2.*\.json$/);
  });

  it('keeps the claim when the deliverables themselves fail', async () => {
    drive.sync.mockRejectedValueOnce(new Error('Drive sync failed: timeout'));
    await performGoogleDriveSync(params());

    await performGoogleDriveSync(params());

    expect(drive.resolveFolder).toHaveBeenCalledTimes(1);
  });

  it('claims again once the export finished, so the next one gets its own folder', async () => {
    await performGoogleDriveSync(params());
    await performGoogleDriveSync({ ...params(), currentHash: 'b'.repeat(64) });

    expect(drive.resolveFolder).toHaveBeenCalledTimes(2);
  });

  it('does not write a differently named export into the claim', async () => {
    failSnapshotOnce();
    await performGoogleDriveSync(params());
    drive.sync.mockResolvedValue({ folderId: 'id' });
    drive.resolveFolder.mockResolvedValue({ folderId: 'id', folderName: 'Other' });

    await performGoogleDriveSync(params(WITH_HTML, 'Other'));

    expect(drive.resolveFolder).toHaveBeenCalledTimes(2);
    expect(pathsWritten()).toContain('KiwiCV/exports/Other');
    // Lets the first claim go, or it would leak into the next test.
    await performGoogleDriveSync(params());
  });

  it('does not write another account into the claim', async () => {
    failSnapshotOnce();
    await performGoogleDriveSync(params());
    saveGoogleDriveCreds('other-account');
    drive.sync.mockResolvedValue({ folderId: 'id' });

    await performGoogleDriveSync(params());

    expect(drive.resolveFolder).toHaveBeenCalledTimes(2);
  });
});

describe('a Drive export with no deliverables (#92)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    saveGoogleDriveCreds('refresh-token');
    drive.sync.mockResolvedValue({ folderId: 'id' });
    drive.listFiles.mockResolvedValue([]);
  });

  it('creates no folder and names none', async () => {
    const result = await performGoogleDriveSync(params(NO_DELIVERABLES));

    expect(result).toEqual({ service: 'google_drive', success: true });
    expect(drive.resolveFolder).not.toHaveBeenCalled();
    expect(pathsWritten()).toEqual(['KiwiCV/backups/en']);
    expect(snapshotName()).toBe('CV.json');
  });

  it('does not overwrite an earlier snapshot of the same name', async () => {
    const name = constructBackupFilename('CV');
    drive.listFiles.mockResolvedValue([
      { name: `${name}.json` },
      { name: `${constructBackupFilename('CV_2')}.json` },
    ]);

    const result = await performGoogleDriveSync(params(NO_DELIVERABLES, name));

    expect(result).toEqual({ service: 'google_drive', success: true });
    expect(snapshotName()).toBe(`${constructBackupFilename('CV_3')}.json`);
    expect(drive.listFiles).toHaveBeenCalledWith('refresh-token', ['KiwiCV', 'backups', 'en']);
  });

  it('still writes the master backup on a backing-up export', async () => {
    await performGoogleDriveSync(params(NO_DELIVERABLES, 'CV', 'sync'));

    expect(pathsWritten()).toEqual(['KiwiCV/backups/en', 'KiwiCV/backups/en']);
  });
});
