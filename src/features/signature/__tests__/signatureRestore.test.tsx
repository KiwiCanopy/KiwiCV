// @vitest-environment jsdom
import { SignatureRow } from '@/features/signature/SignatureRow';
import { saveGoogleDriveCreds } from '@/services/storage/googleStorage';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { type StoredSignature, useSignatureStore } from '@/store/signature/useSignatureStore';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/** A saved copy is offered on a device without a signature, never applied silently (#106). */
const SAVED: StoredSignature = { kind: 'typed', id: 'saved', faceId: 'great-vibes', text: 'Ada' };
const drive = vi.hoisted(() => ({
  sync: vi.fn(async (..._args: unknown[]) => ({ folderId: 'f' })),
  listFiles: vi.fn(async (..._args: unknown[]) => []),
  deleteFile: vi.fn(async (..._args: unknown[]) => undefined),
  downloadJsonByName: vi.fn(async (..._args: unknown[]): Promise<unknown> => null),
}));
vi.mock('@/services/google-drive', () => ({ googleDriveService: drive }));

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  useSignatureStore.setState({ signature: null, ownerUserId: null, backupEnabled: false });
  saveGoogleDriveCreds('drive-token');
  useResumeStore.setState((state) => ({
    sync: { ...state.sync, googleDrive: { ...state.sync.googleDrive, enabled: true } },
  }));
});

describe('restoring the backed-up signature', () => {
  it('is offered, not applied, and only taken on the click, with the box as the user left it', async () => {
    const user = userEvent.setup();
    drive.downloadJsonByName.mockResolvedValue({ v: 1, signature: SAVED });
    render(<SignatureRow />);

    await user.click(screen.getByRole('button', { name: 'Add signature' }));
    const use = await screen.findByRole('button', { name: 'Use it' });
    expect(useSignatureStore.getState().signature).toBeNull();

    await user.click(use);
    expect(useSignatureStore.getState().signature).toEqual(SAVED);
    // The checkbox was never ticked here, so restoring does not switch the backup on.
    expect(useSignatureStore.getState().backupEnabled).toBe(false);
  });

  it('is not offered when the device already has a signature', async () => {
    const user = userEvent.setup();
    drive.downloadJsonByName.mockResolvedValue({ v: 1, signature: SAVED });
    useSignatureStore.setState({
      signature: { ...SAVED, id: 'local', text: 'Local' },
    });
    render(<SignatureRow />);

    await user.click(screen.getByRole('button', { name: 'Change' }));
    await screen.findByRole('checkbox');
    expect(screen.queryByRole('button', { name: 'Use it' })).toBeNull();
    expect(drive.downloadJsonByName).not.toHaveBeenCalled();
  });
});
