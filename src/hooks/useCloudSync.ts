import { type ExportArtifacts } from '@/hooks/export/types';
import { performGitHubSync } from '@/hooks/sync/githubSync';
import { performGoogleDriveSync } from '@/hooks/sync/googleDriveSync';
import { type SyncParams, type SyncResult, type SyncVariant } from '@/hooks/sync/types';
import { useTranslation } from '@/hooks/useTranslation';
import { loadGoogleDriveCreds } from '@/services/storage/googleStorage';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { getResumeHash } from '@/utils/hash';

export type { SyncResult, SyncVariant };

/** The `service` values a `SyncResult` reports. */
export type SyncProviderId = 'github' | 'google_drive';

export interface CloudSyncOptions {
  /**
   * Run exactly these providers, ignoring the stored `sync.*.enabled` flags.
   *
   * The export dialog's per-destination toggle is a per-run choice; the store
   * flag is the *background backup* preference. Conflating them would let one
   * export silently switch the Backup button's behaviour back on. A targeted
   * provider that turns out to be missing credentials reports a failure result
   * rather than quietly producing none, so the dialog can show the row as
   * failed instead of done.
   */
  providers?: SyncProviderId[];
  /**
   * Deliverables built once for the whole run. Without this every provider
   * compiles its own PDF through the single Typst worker, one after another.
   */
  artifacts?: ExportArtifacts;
  /** The run's normalized posting link, for the `full` snapshot only. */
  postingUrl?: string | null;
}

export const useCloudSync = () => {
  const setIsSyncingData = useResumeStore((state) => state.setIsSyncingData);
  const syncVersion = useResumeStore((state) => state.syncVersion);
  const { t } = useTranslation();

  const handleSync = async (
    variant: SyncVariant = 'standard',
    projectName?: string,
    mode: 'sync' | 'push' = 'sync',
    options?: CloudSyncOptions,
  ): Promise<{ success: boolean; results: SyncResult[]; error?: string }> => {
    syncVersion();
    const currentResume = useResumeStore.getState().resume;
    const latestSyncConfig = useResumeStore.getState().sync;
    setIsSyncingData(true);

    const lang = currentResume.meta.theme.locale || 'en';
    const results: SyncResult[] = [];
    const targeted = options?.providers;

    try {
      const syncParams: SyncParams = {
        resume: currentResume,
        variant,
        mode,
        lang,
        t,
        currentHash: await getResumeHash(currentResume),
        includeBackup: true,
        projectName,
        artifacts: options?.artifacts,
        postingUrl: options?.postingUrl,
      };

      const syncTasks: Promise<void>[] = [];

      // --- GitHub Sync ---
      const githubConfig = latestSyncConfig?.github;
      const wantsGitHub = targeted ? targeted.includes('github') : !!githubConfig?.enabled;
      if (wantsGitHub && githubConfig?.repo) {
        const pat = localStorage.getItem('github_pat') || sessionStorage.getItem('github_pat');
        if (!pat) {
          // Self-heal: Disable sync if PAT is missing. Only the stored
          // preference is corrected — a targeted run never writes to it.
          if (!targeted) {
            useResumeStore.getState().updateSync({ github: { enabled: false } });
          } else {
            results.push({
              service: 'github',
              success: false,
              error: t('sync.error_github_creds'),
            });
          }
        } else {
          const repo = githubConfig.repo;
          syncTasks.push(
            (async () => {
              const result = await performGitHubSync(syncParams, {
                repo,
              });
              results.push(result);
            })(),
          );
        }
      } else if (targeted?.includes('github')) {
        results.push({ service: 'github', success: false, error: t('sync.error_github_creds') });
      }

      // --- Google Drive Sync ---
      const googleDriveConfig = latestSyncConfig?.googleDrive;
      const wantsGoogleDrive = targeted
        ? targeted.includes('google_drive')
        : !!googleDriveConfig?.enabled;
      if (wantsGoogleDrive) {
        const refreshToken = loadGoogleDriveCreds();
        if (!refreshToken) {
          // Self-heal: Disable sync if credentials are missing
          if (!targeted) {
            useResumeStore.getState().updateSync({ googleDrive: { enabled: false } });
          } else {
            results.push({
              service: 'google_drive',
              success: false,
              error: t('sync.error_google_creds'),
            });
          }
        } else {
          syncTasks.push(
            (async () => {
              const result = await performGoogleDriveSync(syncParams);
              results.push(result);
            })(),
          );
        }
      }

      if (syncTasks.length === 0) {
        return { success: results.every((r) => r.success), results };
      }

      await Promise.all(syncTasks);

      const overallSuccess = results.every((r) => r.success);
      return { success: overallSuccess, results };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message, results };
    } finally {
      setIsSyncingData(false);
    }
  };

  return { handleSync };
};
