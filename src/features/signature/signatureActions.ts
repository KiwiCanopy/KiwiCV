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

// Prefixed like every other KiwiCV commit (`githubSync.ts`).
const commitMessages = (t: Translate) => ({
  saved: `${t('sync.commit_prefix')} ${t('design.signature.commit_saved')}`,
  removed: `${t('sync.commit_prefix')} ${t('design.signature.commit_removed')}`,
});

const toast = (message: string) => useToastStore.getState().addToast(message, 'warning', 8000);

/**
 * Backup work runs one job at a time, and each job reads the store when it
 * starts rather than when it was asked for: a Remove right after a Save must
 * not be undone by the Save's upload landing last.
 */
let queue: Promise<void> = Promise.resolve();
const enqueue = (job: () => Promise<void>, onError: () => void): Promise<void> => {
  // A job that throws reports itself and never stalls or rejects the queue.
  const safe = () => job().catch(onError);
  queue = queue.then(safe, safe);
  return queue;
};

const writeCurrentBackup = (t: Translate) =>
  enqueue(
    async () => {
      const { signature, backupEnabled } = useSignatureStore.getState();
      if (!signature || !backupEnabled) return;
      const targets = await resolveBackupTargets();
      if (!hasBackupTarget(targets)) return;
      if (!(await pushSignatureBackup(signature, targets, commitMessages(t)))) {
        toast(t('design.signature.backup_failed'));
      }
    },
    () => toast(t('design.signature.backup_failed')),
  );

/**
 * `expected`: the copy is known to exist, so not reaching it is worth a warning.
 * Otherwise the delete is a quiet sweep: a copy may exist from another device.
 */
const deleteBackup = (t: Translate, expected: boolean) =>
  enqueue(
    async () => {
      const targets = await resolveBackupTargets({ forDelete: true });
      if (!hasBackupTarget(targets)) {
        // A copy that cannot be reached is a copy the user believes is gone: say so.
        if (expected) toast(t('design.signature.backup_delete_failed'));
        return;
      }
      if (!(await deleteSignatureBackup(targets, commitMessages(t)))) {
        toast(t('design.signature.backup_delete_failed'));
      }
    },
    () => toast(t('design.signature.backup_delete_failed')),
  );

/**
 * Saves a signature on the device and applies the backup choice made with it:
 * on, the copy is written; switched off, the copy is deleted. The device copy
 * never waits on, or fails with, the network.
 */
export function saveSignature(
  next: StoredSignature,
  backup: boolean,
  t: Translate,
  { copyExists = false }: { copyExists?: boolean } = {},
): Promise<void> {
  const store = useSignatureStore.getState();
  const wasBackedUp = store.backupEnabled;
  store.setSignature(next);
  store.setBackupEnabled(backup);
  if (backup) return writeCurrentBackup(t);
  // Unticking withdraws consent wherever the copy came from, this device or another.
  return wasBackedUp || copyExists ? deleteBackup(t, true) : Promise.resolve();
}

/**
 * Removes the signature from the device and, when it was backed up, the copy.
 * Remove also withdraws the backup choice: the next signature starts unticked.
 */
export function removeSignature(t: Translate): Promise<void> {
  const wasBackedUp = useSignatureStore.getState().backupEnabled;
  useSignatureStore.getState().removeSignature();
  // Always swept where a destination is connected: a signature restored on this
  // device was backed up on another, and Remove must withdraw it here too.
  return deleteBackup(t, wasBackedUp);
}

export { fetchSignatureBackup, hasBackupTarget, resolveBackupTargets };
