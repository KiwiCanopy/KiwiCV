import { useNavigate } from 'react-router-dom';

import { useCloudDiscovery } from '@/hooks/cloud/useCloudDiscovery';
import { useCloudOperations } from '@/hooks/cloud/useCloudOperations';
import { useCloudRestoreAction } from '@/hooks/cloud/useCloudRestoreAction';
import { useLanguage } from '@/hooks/useLanguage';
import { useTranslation } from '@/hooks/useTranslation';
import { type DriveFile } from '@/services/google-drive';
import { useCvLibraryStore } from '@/store/library/useCvLibraryStore';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useConfirmStore } from '@/store/ui/useConfirmStore';
import { useToastStore } from '@/store/ui/useToastStore';
import { localizedPath } from '@/utils/localeRouting';
import { type ImportWarning } from '@/utils/validation';

export function useCloudRestorePrompt() {
  const { t } = useTranslation();
  const confirm = useConfirmStore((state) => state.confirm);
  const addToast = useToastStore((state) => state.addToast);
  const navigate = useNavigate();
  const lang = useLanguage();

  const { discoverBackups, githubPaths } = useCloudDiscovery();
  const { downloadBackup, handleDelete } = useCloudOperations(githubPaths.current);
  const { performRestore } = useCloudRestoreAction(downloadBackup);

  /**
   * TARGETED: Triggered when the user switches languages.
   * Focuses on a specific locale and provides lightweight feedback (Toasts).
   */
  const checkAndRestoreLocale = async (
    locale: string,
  ): Promise<{ imported: boolean; warnings: ImportWarning[] }> => {
    const syncState = useResumeStore.getState().sync;
    const pat = localStorage.getItem('github_pat') || sessionStorage.getItem('github_pat');
    const githubRepo = syncState?.github?.repo;
    const googleDriveConnected = !!syncState?.googleDrive?.enabled;
    const isCloudConfigured = (!!pat && !!githubRepo) || googleDriveConnected;

    if (!isCloudConfigured) return { imported: false, warnings: [] };

    const { foundBackups } = await discoverBackups(locale);
    const localeData = foundBackups[locale];

    if (!localeData || (!localeData.github?.length && !localeData.google_drive?.length)) {
      addToast(t('sync.no_backups_found_toast'), 'info');
      return { imported: false, warnings: [] };
    }

    const totalFiles = (localeData.github?.length || 0) + (localeData.google_drive?.length || 0);

    if (totalFiles === 1) {
      const source = localeData.github?.length ? 'github' : 'google_drive';
      const file = localeData[source]![0];

      // Quick confirmation for direct restore
      const shouldRestore = await confirm({
        title: t('sync.backups_found_title_single'),
        message: t('sync.backups_found_single'),
        confirmText: t('common.yes_please'),
        cancelText: t('common.no_thanks'),
      });

      if (!shouldRestore) return { imported: false, warnings: [] };
      return performRestore(source, file, locale, true);
    }

    // More than one candidate for this language. Picking between them is what
    // the CV library page is for, so the switch offers to open it rather than
    // deciding for the user or reproducing a picker inline.
    const shouldOpen = await confirm({
      title: t('cvs.backups_found_title'),
      message: t('sync.backups_found_multiple'),
      confirmText: t('cvs.open_from_language_switch'),
      cancelText: t('common.no_thanks'),
    });

    if (!shouldOpen) return { imported: false, warnings: [] };

    // The discovery just paid for is handed straight to the page, so opening it
    // costs no second round trip.
    useCvLibraryStore.getState().setReady(foundBackups, githubPaths.current);
    navigate(localizedPath(lang, `/cvs?language=${encodeURIComponent(locale)}`));
    return { imported: false, warnings: [] };
  };

  /**
   * BROAD: after a provider connects, or after a Google login that carried a
   * pending restore.
   *
   * It seeds `useCvLibraryStore` and reports whether there is anything to show;
   * the caller navigates. Previously it opened the selector modal itself, which
   * is why a "just connected" flow raced the closing modal it was rendering
   * into.
   */
  const discoverBackupsForRoute = async (
    specificSource?: 'github' | 'google_drive',
    preFetchedBackups?: Record<string, DriveFile[]> | null,
  ): Promise<{ hasBackups: boolean }> => {
    const syncState = useResumeStore.getState().sync;
    const pat = localStorage.getItem('github_pat') || sessionStorage.getItem('github_pat');
    const githubRepo = syncState?.github?.repo;
    const googleDriveConnected = !!syncState?.googleDrive?.enabled;
    const isCloudConfigured = (!!pat && !!githubRepo) || googleDriveConnected;

    // Safety check for management entry
    if (!isCloudConfigured && !specificSource) return { hasBackups: false };

    const epoch = useCvLibraryStore.getState().setLoading();

    // 1. Focused Search
    const focused = await discoverBackups(undefined, specificSource, preFetchedBackups);
    let backups = focused.foundBackups;
    let paths = focused.githubPaths;
    let failed = focused.failed;

    // 2. Fallback to Broad Search
    if (Object.keys(backups).length === 0 && specificSource && isCloudConfigured) {
      const broad = await discoverBackups(undefined, undefined);
      backups = broad.foundBackups;
      paths = broad.githubPaths;
      failed = broad.failed;
    }

    useCvLibraryStore.getState().setReady(backups, paths, failed, epoch);

    if (Object.keys(backups).length === 0) {
      await confirm({
        title: t('sync.no_backup_found_title'),
        message: (
          <div className="flex flex-col gap-4">
            <p className="leading-relaxed">{t('sync.no_backups_found_marketing')}</p>
          </div>
        ),
        confirmText: t('sync.no_backup_found_ok'),
        cancelText: '',
      });
      return { hasBackups: false };
    }

    return { hasBackups: true };
  };

  return { checkAndRestoreLocale, discoverBackupsForRoute, handleDelete };
}
