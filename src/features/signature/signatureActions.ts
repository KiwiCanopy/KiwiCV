import {
  deleteSignatureBackup,
  fetchSignatureBackup,
  hasBackupTarget,
  pushSignatureBackup,
  resolveBackupTargets,
} from '@/features/signature/signatureBackup';
import { type StoredSignature, useSignatureStore } from '@/store/signature/useSignatureStore';
import { useToastStore } from '@/store/ui/useToastStore';

type Translate = (key: string) => string;

const commitMessages = (t: Translate) => ({
  saved: t('design.signature.commit_saved'),
  removed: t('design.signature.commit_removed'),
});

const reportBackupFailure = (t: Translate) =>
  useToastStore.getState().addToast(t('design.signature.backup_failed'), 'warning', 6000);

/**
 * Saves a signature on the device and applies the backup choice made with it:
 * on, the copy is written; switched off, the copy is deleted. The device copy
 * never waits on, or fails with, the network.
 */
export async function saveSignature(
  next: StoredSignature,
  backup: boolean,
  t: Translate,
): Promise<void> {
  const store = useSignatureStore.getState();
  const wasBackedUp = store.backupEnabled;
  store.setSignature(next);
  store.setBackupEnabled(backup);
  if (!backup && !wasBackedUp) return;

  const targets = await resolveBackupTargets();
  if (!hasBackupTarget(targets)) return;
  const ok = backup
    ? await pushSignatureBackup(next, targets, commitMessages(t))
    : await deleteSignatureBackup(targets, commitMessages(t));
  if (!ok) reportBackupFailure(t);
}

/** Removes the signature from the device and, when it was backed up, from the backup. */
export async function removeSignature(t: Translate): Promise<void> {
  const store = useSignatureStore.getState();
  const wasBackedUp = store.backupEnabled;
  store.removeSignature();
  if (!wasBackedUp) return;
  const targets = await resolveBackupTargets();
  if (!hasBackupTarget(targets)) return;
  if (!(await deleteSignatureBackup(targets, commitMessages(t)))) reportBackupFailure(t);
}

export { fetchSignatureBackup, hasBackupTarget, resolveBackupTargets };
