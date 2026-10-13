import { SiGithub } from 'react-icons/si';

import { Button } from '@/components/ui/Button';
import { GoogleDriveIcon } from '@/components/ui/Icons';
import { VersionThumbnail } from '@/features/cv-library/VersionThumbnail';
import type { CvVersion } from '@/features/cv-library/types';
import { useTranslation } from '@/hooks/useTranslation';
import { RotateCcw } from 'lucide-react';

interface LatestBackupSectionProps {
  /** The pinned masters, active language first. Empty renders nothing. */
  masters: CvVersion[];
  onRestore: (version: CvVersion) => void;
}

interface LatestBackupRowProps {
  version: CvVersion;
  onRestore: (version: CvVersion) => void;
}

function LatestBackupRow({ version, onRestore }: LatestBackupRowProps) {
  const { t } = useTranslation();
  const savedAt = version.file.updatedAt ? new Date(version.file.updatedAt) : null;
  const savedLabel =
    savedAt && !Number.isNaN(savedAt.getTime())
      ? savedAt.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
      : t('cvs.saved_unknown');

  return (
    <div className="border-border bg-secondary/50 flex flex-wrap items-center gap-3 rounded-xl border p-4 sm:gap-4">
      <VersionThumbnail theme={version.file.theme} />

      {/* Same phone shape as `VersionRow`: below the thumbnail's own line, not
          beside it. At 375px a name, four meta chips and a Restore button on one
          row leave the text column ~110px, which reads as the button sitting on
          top of the metadata. */}
      <div className="order-last min-w-0 flex-1 basis-full sm:order-none sm:basis-auto">
        <p className="text-foreground truncate text-sm font-semibold">{version.file.name}</p>
        <p className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
          <span className="inline-flex items-center gap-1">
            {version.source === 'github' ? (
              <SiGithub className="h-3 w-3" aria-hidden="true" />
            ) : (
              <GoogleDriveIcon size={12} aria-hidden="true" />
            )}
            {t(`sync.providers.${version.source}`)}
          </span>
          <span aria-hidden="true">·</span>
          <span>{t(`languages.${version.locale}`)}</span>
          <span aria-hidden="true">·</span>
          <span>{savedLabel}</span>
        </p>
      </div>

      <Button
        variant="secondary"
        onClick={() => onRestore(version)}
        className="ml-auto shrink-0 sm:ml-0"
      >
        <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
        {t('common.restore')}
      </Button>
    </div>
  );
}

/**
 * The masters — the `resume.json` each device syncs to — pinned above the
 * table, one per language.
 *
 * It is a list rather than a single row because the pinned area follows the
 * language filter: "All languages" pins one master per language, and picking a
 * language pins that one. Whichever is pinned is not in the table, so the same
 * file never appears twice on the page.
 *
 * A tailored version is never pinned however new it is. This row answers "where
 * is the copy my devices sync to", not "what did I save last".
 */
export function LatestBackupSection({ masters, onRestore }: LatestBackupSectionProps) {
  const { t } = useTranslation();

  if (masters.length === 0) return null;

  return (
    <section aria-labelledby="cv-library-latest-backup" className="mt-4">
      <h2
        id="cv-library-latest-backup"
        className="text-muted-foreground text-xs font-semibold tracking-wide uppercase"
      >
        {t('cvs.latest_backup')}
      </h2>
      <p className="text-muted-foreground/80 mt-1 text-xs">{t('cvs.master_copy_note')}</p>

      <ul className="mt-2 space-y-2">
        {masters.map((version) => (
          <li key={version.key}>
            <LatestBackupRow version={version} onRestore={onRestore} />
          </li>
        ))}
      </ul>
    </section>
  );
}
