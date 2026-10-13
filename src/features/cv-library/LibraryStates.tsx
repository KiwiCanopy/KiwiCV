import { Button } from '@/components/ui/Button';
import { StatePanel } from '@/components/ui/StatePanel';
import { LIBRARY_EMPTY_CTA_ANCHOR_ID } from '@/constants/focusAnchors';
import { useTranslation } from '@/hooks/useTranslation';
import type { BackupSource } from '@/store/library/useCvLibraryStore';

/**
 * The page's non-list states, all `StatePanel` compositions so the
 * `role`/`aria-busy`/announce policy is inherited rather than re-derived.
 */

export function LibraryLoadingState() {
  const { t } = useTranslation();
  return <StatePanel variant="loading" title={t('sync.checking')} announce />;
}

export function LibraryErrorState({
  description,
  onRetry,
}: {
  description?: string | null;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  return (
    <StatePanel
      variant="error"
      title={t('cvs.error_title')}
      description={description || t('cvs.error_desc')}
      action={
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {t('common.retry')}
        </Button>
      }
    />
  );
}

export function LibraryNotConnectedState({ onConnect }: { onConnect: () => void }) {
  const { t } = useTranslation();
  return (
    <StatePanel
      variant="empty"
      title={t('cvs.empty_not_connected_title')}
      description={t('cvs.empty_not_connected_desc')}
      action={
        <Button variant="primary" size="sm" onClick={onConnect}>
          {t('cvs.connect_cloud')}
        </Button>
      }
    />
  );
}

export function LibraryNoVersionsState({ onBackupNow }: { onBackupNow: () => void }) {
  const { t } = useTranslation();
  return (
    <StatePanel
      variant="empty"
      title={t('cvs.empty_no_versions_title')}
      description={t('cvs.empty_no_versions_desc')}
      action={
        <Button
          variant="primary"
          size="sm"
          // The library's last focus rung: deleting the final version replaces
          // the table with this panel, so this is what the delete lands on.
          id={LIBRARY_EMPTY_CTA_ANCHOR_ID}
          onClick={onBackupNow}
        >
          {t('sync.backup_action')}
        </Button>
      }
    />
  );
}

/**
 * One of two providers failed. The results below are real but incomplete, which
 * the old "no backups found" message could not say.
 */
export function LibraryPartialFailureNotice({ sources }: { sources: BackupSource[] }) {
  const { t } = useTranslation();
  if (sources.length === 0) return null;

  return (
    <div className="mt-4">
      <StatePanel
        variant="warning"
        title={t('cvs.partial_failure_title')}
        description={t('cvs.partial_failure_desc', {
          provider: sources.map((source) => t(`sync.providers.${source}`)).join(', '),
        })}
      />
    </div>
  );
}
