import { MASTER_FILENAME } from '@/features/cv-library/flattenDiscovery';
import { type DownloadedBackup } from '@/hooks/cloud/useCloudOperations';
import {
  type BackupDiscoveryMap,
  type BackupFile,
  type BackupSource,
  useCvLibraryStore,
} from '@/store/library/useCvLibraryStore';
import { readCachedPostingUrl, writeCachedPostingUrl } from '@/utils/applicationMeta';

type DownloadBackup = (
  source: BackupSource,
  file: BackupFile,
  locale: string,
) => Promise<DownloadedBackup>;

/** Shas being read right now, so two loads never read the same blob twice. */
const inFlight = new Set<string>();

const CONCURRENCY = 4;

/**
 * Fills the GitHub posting links the per-device cache missed, one backup read
 * each, after the list has rendered (#54). Drive rows need none: their link
 * comes with the listing. The master backup never carries one.
 *
 * A failed read is not cached, so the next visit tries again.
 */
export async function hydrateGitHubPostingUrls(
  discovery: BackupDiscoveryMap,
  downloadBackup: DownloadBackup,
): Promise<void> {
  const queue = Object.entries(discovery).flatMap(([locale, sources]) =>
    (sources.github ?? [])
      .filter(
        (file): file is BackupFile & { sha: string } =>
          file.name !== MASTER_FILENAME &&
          !!file.sha &&
          !inFlight.has(file.sha) &&
          readCachedPostingUrl(file.sha) === undefined,
      )
      .map((file) => ({ locale, file })),
  );
  for (const { file } of queue) inFlight.add(file.sha);

  const worker = async () => {
    for (let next = queue.shift(); next; next = queue.shift()) {
      const { locale, file } = next;
      try {
        const { postingUrl } = await downloadBackup('github', file, locale);
        writeCachedPostingUrl(file.sha, postingUrl);
        if (postingUrl) {
          useCvLibraryStore.getState().setPostingUrl(locale, 'github', file.sha, postingUrl);
        }
      } catch (err) {
        console.warn('[CvLibrary] Could not read a posting link:', err);
      } finally {
        inFlight.delete(file.sha);
      }
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
}
