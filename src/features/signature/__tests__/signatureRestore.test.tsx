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
  listFiles: vi.fn(async (..._args: unknown[]): Promise<{ id: string; name: string }[]> => []),
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
  it('is offered, not applied, and taken on the click with its backup still on', async () => {
    const user = userEvent.setup();
    drive.downloadJsonByName.mockResolvedValue({ v: 1, signature: SAVED });
    render(<SignatureRow />);

    await user.click(screen.getByRole('button', { name: 'Add signature' }));
    const use = await screen.findByRole('button', { name: 'Use it' });
    expect(useSignatureStore.getState().signature).toBeNull();

    // The copy exists by earlier consent, so the box arrives ticked.
    expect(screen.getByRole('checkbox')).toHaveProperty('checked', true);
    await user.click(use);
    expect(useSignatureStore.getState().signature).toEqual(SAVED);
    expect(useSignatureStore.getState().backupEnabled).toBe(true);
  });

  it('unticking before taking it withdraws consent and deletes the copy', async () => {
    const user = userEvent.setup();
    drive.downloadJsonByName.mockResolvedValue({ v: 1, signature: SAVED });
    drive.listFiles.mockResolvedValue([{ id: 'drive-1', name: 'signature.json' }]);
    render(<SignatureRow />);

    await user.click(screen.getByRole('button', { name: 'Add signature' }));
    const use = await screen.findByRole('button', { name: 'Use it' });
    await user.click(screen.getByRole('checkbox'));
    await user.click(use);

    expect(useSignatureStore.getState().signature).toEqual(SAVED);
    expect(useSignatureStore.getState().backupEnabled).toBe(false);
    await vi.waitFor(() => expect(drive.deleteFile).toHaveBeenCalledWith('drive-token', 'drive-1'));
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

describe('withdrawing while the copy cannot be written', () => {
  it('keeps the box, and unticking it deletes the copy', async () => {
    const user = userEvent.setup();
    // Drive sync switched off: no write target, but a copy exists.
    useResumeStore.setState((state) => ({
      sync: { ...state.sync, googleDrive: { ...state.sync.googleDrive, enabled: false } },
    }));
    useSignatureStore.setState({ signature: SAVED, backupEnabled: true });
    render(<SignatureRow />);

    await user.click(screen.getByRole('button', { name: 'Change' }));
    const box = await screen.findByRole('checkbox', { name: /Google Drive/ });
    expect(box).toHaveProperty('checked', true);
    await user.click(box);
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await vi.waitFor(() => expect(drive.listFiles).toHaveBeenCalled());
    expect(useSignatureStore.getState().backupEnabled).toBe(false);
  });
});
