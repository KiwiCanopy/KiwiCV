// @vitest-environment jsdom
import { disconnectGoogleDrive } from '@/hooks/sync/disconnectGoogleDrive';
import { performGoogleDriveSync } from '@/hooks/sync/googleDriveSync';
import { type SyncParams } from '@/hooks/sync/types';
import {
  getGoogleLastFullPushHash,
  getGoogleLastSyncHash,
  saveGoogleDriveCreds,
} from '@/services/storage/googleStorage';
import { buildSingleItemResume } from '@/test/singleItemResume';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/** A sync in flight across a disconnect must not stamp the next connection. */
const drive = vi.hoisted(() => ({
  sync: vi.fn(async (..._args: unknown[]): Promise<{ folderName?: string }> => ({})),
  revoke: vi.fn(async (..._args: unknown[]) => true),
}));
vi.mock('@/services/google-drive', () => ({ googleDriveService: drive }));
vi.mock('@/hooks/export/buildExportArtifacts', () => ({
  buildExportArtifacts: vi.fn(async () => ({ json: '{}' })),
}));

const params = (variant: SyncParams['variant'], includeBackup = true): SyncParams => ({
  resume: buildSingleItemResume('lunar'),
  variant,
  mode: 'sync',
  lang: 'en',
  t: (key) => key,
  currentHash: 'a'.repeat(64),
  includeBackup,
  projectName: 'CV',
});

/** Holds the next Drive upload open until the returned release is called. */
const holdNextUpload = () => {
  let release = () => {};
  drive.sync.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        release = () => resolve({});
      }),
  );
  return () => release();
};

describe('Drive sync across a disconnect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    saveGoogleDriveCreds('token-before', 'user-1');
  });

  it.each([
    ['standard', true],
    ['full', true],
    ['full', false],
  ] as const)(
    'a %s sync (backup: %s) held open across a disconnect writes no hash',
    async (variant, includeBackup) => {
      const release = holdNextUpload();
      const syncing = performGoogleDriveSync(params(variant, includeBackup));
      await vi.waitFor(() => expect(drive.sync).toHaveBeenCalled());

      await disconnectGoogleDrive();
      release();
      await syncing;

      expect(getGoogleLastSyncHash()).toBe('');
      expect(getGoogleLastFullPushHash()).toBe('');
    },
  );

  it('the first sync after a reconnect uploads unchanged content', async () => {
    const release = holdNextUpload();
    const syncing = performGoogleDriveSync(params('standard'));
    await vi.waitFor(() => expect(drive.sync).toHaveBeenCalled());
    await disconnectGoogleDrive();
    release();
    await syncing;

    saveGoogleDriveCreds('token-after', 'user-2');
    drive.sync.mockClear();
    const result = await performGoogleDriveSync(params('standard'));

    expect(result.alreadySynced).toBeUndefined();
    expect(drive.sync).toHaveBeenCalledWith('token-after', expect.anything(), expect.anything());
  });

  it('a sync that completes on the same connection still records its hash', async () => {
    await performGoogleDriveSync(params('standard'));
    expect(getGoogleLastSyncHash()).toBe('a'.repeat(64));

    const again = await performGoogleDriveSync(params('standard'));
    expect(again.alreadySynced).toBe(true);
  });

  it('a full sync that completes on the same connection still records its stamp', async () => {
    await performGoogleDriveSync(params('full', false));
    expect(getGoogleLastFullPushHash()).not.toBe('');

    const again = await performGoogleDriveSync(params('full', false));
    expect(again.alreadySynced).toBe(true);
  });
});
