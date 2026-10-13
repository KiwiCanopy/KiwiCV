import { type DestinationId } from '@/components/modals/export/types';
import { type ExportArtifacts } from '@/hooks/export/types';
import { type SyncResult, type SyncVariant } from '@/hooks/sync/types';
import { type SyncProviderId } from '@/hooks/useCloudSync';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

export interface DestinationRunResult {
  success: boolean;
  error?: string;
}

export interface DestinationRunContext {
  /** Built once for the whole run, before any destination is touched. */
  artifacts: ExportArtifacts;
  /**
   * `useCloudSync().handleSync`, pre-bound to the run's project name and
   * artifacts. Targets exactly the providers it is given.
   */
  syncToCloud: (
    variant: SyncVariant,
    providers: SyncProviderId[],
    mode: 'sync' | 'push',
  ) => Promise<{ success: boolean; results: SyncResult[]; error?: string }>;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

export type DestinationAdapter = (context: DestinationRunContext) => Promise<DestinationRunResult>;

/**
 * Writes the prebuilt artifacts to disk as a single archive.
 *
 * The inner names are deliberately plain: the metadata already lives in the ZIP
 * filename, so repeating it inside the archive only lengthens the paths.
 */
export async function saveArtifactsAsZip(artifacts: ExportArtifacts): Promise<void> {
  const zip = new JSZip();

  zip.file('backup.json', artifacts.json);
  if (artifacts.pdf) zip.file(`${artifacts.folderName}.pdf`, artifacts.pdf);
  if (artifacts.html) zip.file('index.html', artifacts.html);

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${artifacts.folderName}.zip`);
}

/**
 * A cloud destination is one provider and one variant.
 *
 * `mode` is not cosmetic: `'sync'` also refreshes the master
 * `backups/{lang}/resume.json` that the restore flow reads, which is what the
 * export has always done. Publishing the HTML is not a backup operation and
 * runs as `'push'`, so selecting it alongside the repository destination does
 * not push the same snapshot twice.
 */
const cloudDestination =
  (variant: SyncVariant, provider: SyncProviderId, mode: 'sync' | 'push'): DestinationAdapter =>
  async ({ syncToCloud, t }) => {
    const { success, results, error } = await syncToCloud(variant, [provider], mode);
    if (success) return { success: true };

    const failed = results.find((result) => !result.success);
    return { success: false, error: failed?.error || error || t('common.error') };
  };

export const DESTINATION_ADAPTERS: Record<DestinationId, DestinationAdapter> = {
  zip: async ({ artifacts }) => {
    await saveArtifactsAsZip(artifacts);
    return { success: true };
  },
  github_repo: cloudDestination('full', 'github', 'sync'),
  google_drive: cloudDestination('full', 'google_drive', 'sync'),
  github_pages: cloudDestination('hosting', 'github', 'push'),
};

/**
 * Runs one destination and never throws.
 *
 * One failure must not lose the others: the sequencer's loop reports this
 * result and carries on, so a rejected adapter has to arrive as data.
 */
export async function runDestination(
  id: DestinationId,
  context: DestinationRunContext,
): Promise<DestinationRunResult> {
  try {
    return await DESTINATION_ADAPTERS[id](context);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
