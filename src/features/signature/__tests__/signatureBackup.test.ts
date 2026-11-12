// @vitest-environment jsdom
import { removeSignature, saveSignature } from '@/features/signature/signatureActions';
import {
  deleteSignatureBackup,
  fetchSignatureBackup,
  pushSignatureBackup,
  resolveBackupTargets,
} from '@/features/signature/signatureBackup';
import { saveGitHubCreds } from '@/services/storage/githubStorage';
import { saveGoogleDriveCreds } from '@/services/storage/googleStorage';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { type StoredSignature, useSignatureStore } from '@/store/signature/useSignatureStore';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/** The opt-in signature backup (#106): its own file, only where it may go. */
const github = vi.hoisted(() => ({
  getRepo: vi.fn(async (..._args: unknown[]): Promise<Record<string, unknown>> => ({
    private: true,
  })),
  pushFile: vi.fn(async (..._args: unknown[]) => ({})),
  getSha: vi.fn(async (..._args: unknown[]): Promise<string | undefined> => 'sha'),
  deleteFile: vi.fn(async (..._args: unknown[]) => ({})),
  getFileContent: vi.fn(async (..._args: unknown[]): Promise<string | null> => null),
}));
vi.mock('@/services/github', () => ({
  GitHubService: vi.fn(function GitHubService() {
    return github;
  }),
}));
const drive = vi.hoisted(() => ({
  sync: vi.fn(async (..._args: unknown[]) => ({ folderId: 'f' })),
  listFiles: vi.fn(async (..._args: unknown[]) => [
    { id: 'drive-1', name: 'signature.json' },
    { id: 'other', name: 'notes.json' },
  ]),
  deleteFile: vi.fn(async (..._args: unknown[]) => undefined),
  downloadJsonByName: vi.fn(async (..._args: unknown[]): Promise<unknown> => null),
}));
vi.mock('@/services/google-drive', () => ({ googleDriveService: drive }));

const SIGNATURE: StoredSignature = { kind: 'typed', id: 'sig', faceId: 'great-vibes', text: 'Ada' };
const MESSAGES = { saved: 'save msg', removed: 'remove msg' };
const t = (key: string) => key;

function connectBoth() {
  saveGoogleDriveCreds('drive-token');
  saveGitHubCreds('pat', 'me/cv', true);
  useResumeStore.setState((state) => ({
    sync: { ...state.sync, github: { ...state.sync.github, enabled: true, repo: 'me/cv' } },
  }));
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
  useSignatureStore.setState({ signature: null, ownerUserId: null, backupEnabled: false });
});

describe('where the signature backup may go', () => {
  it('Drive and a private repo are targets', async () => {
    connectBoth();
    expect(await resolveBackupTargets()).toEqual({
      drive: 'drive-token',
      github: { pat: 'pat', owner: 'me', repo: 'cv' },
    });
  });

  it.each([
    ['public', { private: false }],
    ['internal', { private: true, visibility: 'internal' }],
    ['Pages-published', { private: true, has_pages: true }],
  ])('a %s repo is never a target', async (_kind, repo) => {
    connectBoth();
    github.getRepo.mockResolvedValueOnce(repo);
    expect((await resolveBackupTargets()).github).toBeNull();
  });

  it('nothing connected means no target and no request', async () => {
    expect(await resolveBackupTargets()).toEqual({ drive: null, github: null });
    expect(github.getRepo).not.toHaveBeenCalled();
  });
});

describe('the backup file', () => {
  const targets = {
    drive: 'drive-token',
    github: { pat: 'pat', owner: 'me', repo: 'cv' },
  };

  it('is a file of its own, outside the CV backups, holding only the signature', async () => {
    expect(await pushSignatureBackup(SIGNATURE, targets, MESSAGES)).toBe(true);

    const [, folder, [file]] = drive.sync.mock.calls[0] as [
      string,
      string[],
      { name: string; content: string }[],
    ];
    expect(folder).toEqual(['KiwiCV', 'signature']);
    expect(file.name).toBe('signature.json');
    expect(JSON.parse(file.content)).toEqual({ v: 1, signature: SIGNATURE });

    const [, , path, content, message] = github.pushFile.mock.calls[0];
    expect(path).toBe('signature/signature.json');
    expect(JSON.parse(content as string)).toEqual({ v: 1, signature: SIGNATURE });
    expect(message).toBe('save msg');
  });

  it('delete removes exactly the signature file, by Drive id and by repo path', async () => {
    expect(await deleteSignatureBackup(targets, MESSAGES)).toBe(true);
    expect(drive.deleteFile).toHaveBeenCalledTimes(1);
    expect(drive.deleteFile).toHaveBeenCalledWith('drive-token', 'drive-1');
    expect(github.deleteFile).toHaveBeenCalledWith(
      'me',
      'cv',
      'signature/signature.json',
      'remove msg',
    );
  });

  it('reads back only a valid file, Drive first', async () => {
    drive.downloadJsonByName.mockResolvedValueOnce({ v: 1, signature: SIGNATURE });
    expect(await fetchSignatureBackup(targets)).toEqual(SIGNATURE);

    drive.downloadJsonByName.mockResolvedValueOnce({ v: 1, signature: { kind: 'typed' } });
    github.getFileContent.mockResolvedValueOnce(JSON.stringify({ v: 1, signature: SIGNATURE }));
    expect(await fetchSignatureBackup(targets)).toEqual(SIGNATURE);

    github.getFileContent.mockResolvedValueOnce('not json');
    expect(await fetchSignatureBackup(targets)).toBeNull();
  });
});

describe('saving and removing with the backup choice', () => {
  it('off by default: a save touches no network at all', async () => {
    connectBoth();
    await saveSignature(SIGNATURE, false, t);
    expect(useSignatureStore.getState().signature).toEqual(SIGNATURE);
    expect(drive.sync).not.toHaveBeenCalled();
    expect(github.getRepo).not.toHaveBeenCalled();
  });

  it('on: the save writes the copy; switched off: the copy is deleted', async () => {
    connectBoth();
    await saveSignature(SIGNATURE, true, t);
    expect(drive.sync).toHaveBeenCalledTimes(1);
    expect(github.pushFile).toHaveBeenCalledTimes(1);

    await saveSignature(SIGNATURE, false, t);
    expect(drive.deleteFile).toHaveBeenCalledWith('drive-token', 'drive-1');
    expect(github.deleteFile).toHaveBeenCalled();
    expect(useSignatureStore.getState().backupEnabled).toBe(false);
  });

  it('Remove deletes the backed-up copy too', async () => {
    connectBoth();
    await saveSignature(SIGNATURE, true, t);
    await removeSignature(t);
    expect(useSignatureStore.getState().signature).toBeNull();
    expect(drive.deleteFile).toHaveBeenCalledWith('drive-token', 'drive-1');
    expect(github.deleteFile).toHaveBeenCalled();
  });

  it('a failed backup keeps the device copy', async () => {
    connectBoth();
    drive.sync.mockRejectedValueOnce(new Error('offline'));
    await saveSignature(SIGNATURE, true, t);
    expect(useSignatureStore.getState().signature).toEqual(SIGNATURE);
  });

  it('a different account signing in drops the backup choice with the signature', () => {
    useSignatureStore.getState().bindToUser('a');
    useSignatureStore.getState().setSignature(SIGNATURE);
    useSignatureStore.getState().setBackupEnabled(true);
    useSignatureStore.getState().bindToUser('b');
    expect(useSignatureStore.getState().backupEnabled).toBe(false);
  });
});
