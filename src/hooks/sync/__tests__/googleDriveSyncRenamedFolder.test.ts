// @vitest-environment jsdom
import { performGoogleDriveSync } from '@/hooks/sync/googleDriveSync';
import { type SyncParams } from '@/hooks/sync/types';
import { saveGoogleDriveCreds } from '@/services/storage/googleStorage';
import { buildSingleItemResume } from '@/test/singleItemResume';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const drive = vi.hoisted(() => ({
  sync: vi.fn(async (..._args: unknown[]) => ({})),
  resolveFolder: vi.fn(),
}));
vi.mock('@/services/google-drive', () => ({ googleDriveService: drive }));

const params = (): SyncParams => ({
  resume: buildSingleItemResume('lunar'),
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
    html: '<html></html>',
    pdf: null,
  },
  postingUrl: null,
});

const answerWith = (exportFolder: string) =>
  drive.resolveFolder.mockResolvedValue({ folderId: 'id', folderName: exportFolder });

describe('the folder a Drive export reports (#41)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    saveGoogleDriveCreds('refresh-token');
  });

  it('reports the folder Drive wrote after a collision', async () => {
    answerWith('CV_2');

    expect(await performGoogleDriveSync(params())).toEqual({
      service: 'google_drive',
      success: true,
      renamedFolder: 'CV_2',
    });
  });

  it('reports no rename when the requested folder was free', async () => {
    answerWith('CV');

    expect(await performGoogleDriveSync(params())).toEqual({
      service: 'google_drive',
      success: true,
    });
  });
});
