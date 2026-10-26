// @vitest-environment jsdom
import { performGoogleDriveSync } from '@/hooks/sync/googleDriveSync';
import { type SyncParams } from '@/hooks/sync/types';
import { type DriveUploadFile } from '@/services/google-drive';
import { saveGoogleDriveCreds } from '@/services/storage/googleStorage';
import { buildSingleItemResume } from '@/test/singleItemResume';
import { APPLICATION_KEY, fromDriveAppProperties } from '@/utils/applicationMeta';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/** A Drive snapshot carries the link in the file and in `appProperties` (#54). */
const drive = vi.hoisted(() => ({
  sync: vi.fn(async (..._args: unknown[]): Promise<{ folderName?: string }> => ({})),
}));
vi.mock('@/services/google-drive', () => ({ googleDriveService: drive }));

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

/** Every file the run uploaded, by name. */
const uploaded = () =>
  Object.fromEntries(
    drive.sync.mock.calls.flatMap(([, , files]) =>
      (files as DriveUploadFile[]).map((file) => [file.name, file]),
    ),
  );

const stored = (properties: DriveUploadFile['appProperties']) =>
  Object.fromEntries(
    Object.entries(properties ?? {}).filter((entry): entry is [string, string] => !!entry[1]),
  );

describe('the posting link in a Drive export', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    saveGoogleDriveCreds('refresh-token');
  });

  it('lands in the snapshot body and its appProperties, never in the master', async () => {
    await performGoogleDriveSync(params(URL_));
    const files = uploaded();

    expect(JSON.parse(files['CV.json'].content as string)[APPLICATION_KEY]).toEqual({
      postingUrl: URL_,
    });
    expect(fromDriveAppProperties(stored(files['CV.json'].appProperties))).toBe(URL_);
    expect(files['resume.json'].appProperties).toBeUndefined();
    expect(JSON.parse(files['resume.json'].content as string)).not.toHaveProperty(APPLICATION_KEY);
  });

  it('clears every slot when the version has no link', async () => {
    await performGoogleDriveSync(params(null));
    const { appProperties } = uploaded()['CV.json'];

    expect(Object.keys(appProperties ?? {}).length).toBeGreaterThan(0);
    expect(Object.values(appProperties ?? {}).every((value) => value === null)).toBe(true);
  });
});
