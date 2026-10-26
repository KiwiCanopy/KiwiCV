import { clearExportDraft, writeExportDraft } from '@/components/modals/export/exportDraft';
import { type DownloadedBackup } from '@/hooks/cloud/useCloudOperations';
import { useTranslation } from '@/hooks/useTranslation';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { GITHUB_LAST_SYNC_HASH_KEY, githubConnection } from '@/services/storage/githubStorage';
import { GOOGLE_LAST_SYNC_HASH_KEY, googleDriveConnection } from '@/services/storage/googleStorage';
import type { BackupFile, BackupSource } from '@/store/library/useCvLibraryStore';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useConfirmStore } from '@/store/ui/useConfirmStore';
import { useToastStore } from '@/store/ui/useToastStore';
import type { ResumeData } from '@/types/resume';
import { getResumeHash } from '@/utils/hash';
import { importResume } from '@/utils/importResume';
import { type ImportWarning } from '@/utils/validation';

type DownloadBackup = (
  source: BackupSource,
  file: BackupFile,
  locale: string,
) => Promise<DownloadedBackup>;

/**
 * Downloading a backup into the live draft: confirm, loading dialog, download,
 * pre-process, `setResume`, sync-hash bookkeeping, success dialog, analytics.
 *
 * Extracted verbatim from `useCloudRestorePrompt` so the CV library page and the
 * language-switch prompt run the same restore rather than two that drift. It
 * takes `downloadBackup` as an argument because the caller already owns a
 * `useCloudOperations` instance bound to its own GitHub path map.
 */
export function useCloudRestoreAction(downloadBackup: DownloadBackup) {
  const { t } = useTranslation();
  const setResume = useResumeStore((state) => state.setResume);
  const addToast = useToastStore((state) => state.addToast);

  const performRestore = async (
    source: BackupSource,
    file: BackupFile,
    locale: string,
    skipConfirmation: boolean = false,
  ): Promise<{ imported: boolean; warnings: ImportWarning[] }> => {
    const confirmStore = useConfirmStore.getState();

    try {
      if (!skipConfirmation) {
        const shouldRestore = await confirmStore.confirm({
          title: t('sync.restore_confirm_title'),
          message:
            file.name === 'resume.json'
              ? t('sync.restore_confirm_msg_master')
              : t('sync.restore_confirm_msg', { name: file.label }),
          variant: 'primary',
          closeOnConfirm: false,
        });

        if (!shouldRestore) return { imported: false, warnings: [] };
      }

      // Ensure the confirm modal is open in loading state
      if (!confirmStore.isOpen) {
        useConfirmStore.setState({
          isOpen: true,
          options: {
            title: t('sync.restoring'),
            message: t('sync.restoring_msg'),
            isLoading: true,
            confirmText: '',
            cancelText: '',
            showCloseButton: false,
            variant: 'primary',
            preferredFocus: 'cancel',
            closeOnConfirm: true,
          },
          resolve: null,
        });
      } else {
        confirmStore.setOptions({
          title: t('sync.restoring'),
          message: t('sync.restoring_msg'),
          isLoading: true,
          confirmText: '',
          cancelText: '',
          showCloseButton: false,
        });
      }

      analytics.track(ANALYTICS_EVENTS.SYNC_RESTORE_STARTED, {
        source,
        locale,
        isMaster: file.name === 'resume.json',
      });

      // Snapshotted before the download: a disconnect during it leaves no hash.
      const recordSyncHash =
        source === 'github'
          ? githubConnection().writeHash.bind(null, GITHUB_LAST_SYNC_HASH_KEY)
          : googleDriveConnection().writeHash.bind(null, GOOGLE_LAST_SYNC_HASH_KEY);
      const { data, postingUrl } = await downloadBackup(source, file, locale);
      const { warnings, data: processedData } = await importResume(setResume, data, {
        clearAI: true,
      });
      // A restored version re-exports with its own link, never the previous CV's.
      if (postingUrl) writeExportDraft({ postingUrl });
      else clearExportDraft();

      // The data is in; a hash that fails only costs the next sync one push.
      try {
        recordSyncHash(await getResumeHash(processedData as ResumeData));
      } catch (err) {
        console.warn('[CloudRestore] Could not record the sync hash:', err);
      }

      confirmStore.setOptions({
        title: t('sync.success'),
        message:
          warnings.length > 0
            ? t('sync.success_with_warnings', { count: warnings.length })
            : t('sync.success_msg_restore'),
        confirmText: t('common.ok'),
        cancelText: '',
        variant: 'primary',
        isLoading: false,
        closeOnConfirm: true,
        showCloseButton: true,
      });

      analytics.track(ANALYTICS_EVENTS.SYNC_RESTORE_COMPLETED, {
        source,
        locale,
        warningCount: warnings.length,
      });

      return { imported: true, warnings };
    } catch (err) {
      console.error('[CloudRestore] Restore failed:', err);
      addToast(t('sync.error'), 'error');
      useConfirmStore.getState().close();
      return { imported: false, warnings: [] };
    }
  };

  return { performRestore };
}
