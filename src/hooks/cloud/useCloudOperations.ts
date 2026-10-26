import { useTranslation } from '@/hooks/useTranslation';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { GitHubService } from '@/services/github';
import { googleDriveService } from '@/services/google-drive';
import { loadGoogleDriveCreds } from '@/services/storage/googleStorage';
import {
  type BackupFile,
  type BackupSource,
  useCvLibraryStore,
} from '@/store/library/useCvLibraryStore';
import { useConfirmStore } from '@/store/ui/useConfirmStore';
import { useToastStore } from '@/store/ui/useToastStore';
import type { ResumeData } from '@/types/resume';
import { peelBackup } from '@/utils/applicationMeta';
import { type FocusAnchor } from '@/utils/focus';

export interface DownloadedBackup {
  data: ResumeData;
  postingUrl: string | null;
}

export function useCloudOperations(githubPaths: Record<string, string>) {
  const { t } = useTranslation();
  const addToast = useToastStore((state) => state.addToast);

  const pat = localStorage.getItem('github_pat') || sessionStorage.getItem('github_pat');
  const repo = localStorage.getItem('github_repo');
  const refreshToken = loadGoogleDriveCreds();

  /**
   * The one cloud read point. The posting link is peeled off here, before
   * anything validates the resume, so it never lands in `passthrough` (#54).
   */
  const downloadBackup = async (
    source: BackupSource,
    file: BackupFile,
    locale: string,
  ): Promise<DownloadedBackup> => {
    let data: ResumeData;

    if (source === 'github') {
      if (!pat || !repo) throw new Error('GitHub credentials not found');
      const gh = new GitHubService(pat);
      const [owner, repoName] = repo.split('/');
      const basePath = githubPaths[locale] || `backups/${locale}`;
      const path = `${basePath}/${file.name}`;
      const content = await gh.getFileContent(owner, repoName, path);
      if (!content) throw new Error('File not found');
      data = JSON.parse(content);
    } else {
      if (!refreshToken) throw new Error('Google Drive credentials not found');
      if (!file.id) throw new Error('Google Drive file ID not found');
      data = await googleDriveService.downloadJsonById(refreshToken, file.id);
    }

    if (!data) throw new Error('No data received');
    return peelBackup(data);
  };

  const handleDelete = async (
    file: BackupFile,
    source: BackupSource,
    locale: string,
    /**
     * Where focus goes once the row is gone. The confirmed delete removes the
     * row, so the control that opened this dialog is unmounted by the time it
     * closes and `DialogFrame` correctly declines a dead opener.
     *
     * ⚠️ It has to survive `setOptions` below, which rewrites this same dialog
     * into the success report rather than opening a second one — the dialog that
     * finally closes is that one, still carrying the dead opener.
     */
    restoreFocusTo?: FocusAnchor,
  ) => {
    const confirmStore = useConfirmStore.getState();

    const shouldDelete = await confirmStore.confirm({
      title: t('sync.delete_title'),
      message: t('sync.delete_confirm_msg', { name: file.label }),
      variant: 'destructive',
      closeOnConfirm: false, // Keep open for loading
      restoreFocusTo,
    });

    if (!shouldDelete) return;

    try {
      confirmStore.setLoading(true);

      analytics.track(ANALYTICS_EVENTS.SYNC_DELETE_STARTED, {
        source,
        locale,
        isMaster: file.name === 'resume.json',
      });

      if (source === 'github') {
        if (!pat || !repo) throw new Error('GitHub credentials not found');
        const gh = new GitHubService(pat);
        const [owner, repoName] = repo.split('/');
        const path = githubPaths[locale] || `backups/${locale}`;
        const deleteMsg = `${t('sync.commit_prefix')} ${t('sync.commit_delete', { name: file.name })}`;
        await gh.deleteFile(owner, repoName, `${path}/${file.name}`, deleteMsg);
      } else {
        if (!refreshToken) throw new Error('Google Drive credentials not found');
        await googleDriveService.deleteFile(refreshToken, file.id!);
      }

      // Update local store
      useCvLibraryStore.getState().removeFile(locale, source, file);

      // Show success modal (instead of just toast)
      confirmStore.setOptions({
        title: t('sync.delete_success'),
        message: t('sync.delete_success_msg'),
        confirmText: t('common.ok'),
        cancelText: '', // Hide cancel
        variant: 'primary',
        isLoading: false,
        closeOnConfirm: true,
      });

      analytics.track(ANALYTICS_EVENTS.SYNC_DELETE_COMPLETED, {
        source,
        locale,
      });
    } catch (err) {
      console.error('[CloudRestore] Delete failed:', err);
      addToast(t('sync.delete_error'), 'error');
      confirmStore.close();
    }
  };

  return { downloadBackup, handleDelete };
}
