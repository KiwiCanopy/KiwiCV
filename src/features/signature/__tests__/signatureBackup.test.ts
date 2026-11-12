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
import { useToastStore } from '@/store/ui/useToastStore';
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
    sync: {
      ...state.sync,
      github: { ...state.sync.github, enabled: true, repo: 'me/cv' },
      googleDrive: { ...state.sync.googleDrive, enabled: true },
    },
  }));
}

beforeEach(() => {
  vi.clearAllMocks();
  github.getRepo.mockReset().mockResolvedValue({ private: true });
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

  it('a repo whose visibility cannot be read is never a write target', async () => {
    connectBoth();
    github.getRepo.mockRejectedValueOnce(new Error('rate limited'));
    expect((await resolveBackupTargets()).github).toBeNull();
  });

  it('a destination switched off in the sync settings is not a write target, but is deleted from', async () => {
    connectBoth();
    useResumeStore.setState((state) => ({
      sync: { ...state.sync, googleDrive: { ...state.sync.googleDrive, enabled: false } },
    }));
    expect((await resolveBackupTargets()).drive).toBeNull();
    expect((await resolveBackupTargets({ forDelete: true })).drive).toBe('drive-token');
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
  it('the store starts with the backup off', () => {
    expect(useSignatureStore.getInitialState().backupEnabled).toBe(false);
  });

  it('a Remove right after a Save is not undone by the upload landing last', async () => {
    connectBoth();
    const saving = saveSignature(SIGNATURE, true, t);
    const removing = removeSignature(t);
    await Promise.all([saving, removing]);
    expect(drive.sync).not.toHaveBeenCalled();
    expect(github.pushFile).not.toHaveBeenCalled();
    expect(drive.deleteFile).toHaveBeenCalledWith('drive-token', 'drive-1');
  });

  it('a Remove during an upload deletes only after the upload has landed', async () => {
    connectBoth();
    let land!: () => void;
    drive.sync.mockImplementationOnce(
      () => new Promise((resolve) => (land = () => resolve({ folderId: 'f' }))),
    );
    const saving = saveSignature(SIGNATURE, true, t);
    await vi.waitFor(() => expect(drive.sync).toHaveBeenCalled());
    const removing = removeSignature(t);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(drive.deleteFile).not.toHaveBeenCalled();
    land();
    await Promise.all([saving, removing]);
    expect(drive.deleteFile).toHaveBeenCalledWith('drive-token', 'drive-1');
  });

  it('Remove with the backup off sweeps quietly: no destination, no request; no copy, no toast', async () => {
    const addToast = vi.spyOn(useToastStore.getState(), 'addToast');
    useSignatureStore.setState({ signature: SIGNATURE, backupEnabled: false });
    await removeSignature(t);
    expect(drive.listFiles).not.toHaveBeenCalled();

    connectBoth();
    drive.listFiles.mockResolvedValueOnce([]);
    github.getSha.mockResolvedValueOnce(undefined);
    useSignatureStore.setState({ signature: SIGNATURE, backupEnabled: false });
    await removeSignature(t);
    expect(drive.deleteFile).not.toHaveBeenCalled();
    expect(github.deleteFile).not.toHaveBeenCalled();
    expect(addToast).not.toHaveBeenCalled();
    addToast.mockRestore();
  });

  it('Remove on a device that only restored the signature deletes the copy there too', async () => {
    connectBoth();
    useSignatureStore.setState({ signature: SIGNATURE, backupEnabled: false });
    await removeSignature(t);
    expect(drive.deleteFile).toHaveBeenCalledWith('drive-token', 'drive-1');
    expect(github.deleteFile).toHaveBeenCalled();
  });

  it('a job that throws reports itself and does not stall the next one', async () => {
    const addToast = vi.spyOn(useToastStore.getState(), 'addToast');
    connectBoth();
    github.getRepo.mockImplementationOnce(() => {
      throw new Error('sync throw');
    });
    await saveSignature(SIGNATURE, true, t).catch(() => {});
    await saveSignature(SIGNATURE, true, t);
    expect(drive.sync).toHaveBeenCalled();
    addToast.mockRestore();
  });

  it('Remove deletes from a repo that has since been made public', async () => {
    connectBoth();
    await saveSignature(SIGNATURE, true, t);
    // Made public since: deletes do not ask, so this would block a write but not the delete.
    github.getRepo.mockResolvedValue({ private: false });
    await removeSignature(t);
    expect(github.deleteFile).toHaveBeenCalledWith(
      'me',
      'cv',
      'signature/signature.json',
      expect.any(String),
    );
  });

  it('Remove withdraws the backup choice, and says so when the copy cannot be reached', async () => {
    const addToast = vi.spyOn(useToastStore.getState(), 'addToast');
    useSignatureStore.setState({ signature: SIGNATURE, backupEnabled: true });
    await removeSignature(t);
    expect(useSignatureStore.getState().backupEnabled).toBe(false);
    expect(addToast).toHaveBeenCalledWith('design.signature.backup_delete_failed', 'warning', 8000);
    addToast.mockRestore();
  });

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

  it('a failed backup keeps the device copy and says so', async () => {
    const addToast = vi.spyOn(useToastStore.getState(), 'addToast');
    connectBoth();
    drive.sync.mockRejectedValueOnce(new Error('offline'));
    await saveSignature(SIGNATURE, true, t);
    expect(useSignatureStore.getState().signature).toEqual(SIGNATURE);
    expect(addToast).toHaveBeenCalledWith('design.signature.backup_failed', 'warning', 8000);
    addToast.mockRestore();
  });

  it('a different account signing in drops the backup choice with the signature', () => {
    useSignatureStore.getState().bindToUser('a');
    useSignatureStore.getState().setSignature(SIGNATURE);
    useSignatureStore.getState().setBackupEnabled(true);
    useSignatureStore.getState().bindToUser('b');
    expect(useSignatureStore.getState().backupEnabled).toBe(false);
  });
});
