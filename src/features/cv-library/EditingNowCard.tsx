import { Link } from 'react-router-dom';

import { resolveThemeId } from '@/components/preview/themeIds';
import { Button } from '@/components/ui/Button';
import { VersionThumbnail } from '@/features/cv-library/VersionThumbnail';
import type { CvVersion } from '@/features/cv-library/types';
import { useLanguage } from '@/hooks/useLanguage';
import { useTranslation } from '@/hooks/useTranslation';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { localizedPath } from '@/utils/localeRouting';
import { HardDrive, PenLine, UploadCloud } from 'lucide-react';

interface EditingNowCardProps {
  /**
   * The `resume.json` for the language the draft is written in, or `null` when
   * that language has never been backed up. Another language's master says
   * nothing about this draft, so it is deliberately not the newest one.
   */
  activeLanguageMaster: CvVersion | null;
  onBackupNow: () => void;
  isBackingUp?: boolean;
}

/**
 * The draft in the editor, above the cloud versions, because it is the one
 * thing on this page that is not a backup.
 *
 * ⚠️ It deliberately shows **no clock**. `lastSavedAt` is excluded from the
 * resume store's persistence, so it is `null` until the first edit after a page
 * load — a timestamp here would be blank exactly when a returning visitor most
 * wants to trust it. "Saved on this device" is true without one, and nothing in
 * the persistence writer had to change to say it.
 */
export function EditingNowCard({
  activeLanguageMaster,
  onBackupNow,
  isBackingUp,
}: EditingNowCardProps) {
  const { t } = useTranslation();
  const lang = useLanguage();
  const name = useResumeStore((state) => state.resume.basics.name);
  // The draft's stored theme is a *lookup*, not a label: the thumbnail has to
  // show the design the editor is actually rendering, so it goes through the
  // same resolution the preview does rather than the row's unknown-theme
  // fallback, which exists for filenames the app did not write.
  const themeId = useResumeStore((state) => resolveThemeId(state.resume.meta.theme.name));

  const backedUpAt = activeLanguageMaster?.file.updatedAt
    ? new Date(activeLanguageMaster.file.updatedAt)
    : null;
  const backedUpLabel =
    backedUpAt && !Number.isNaN(backedUpAt.getTime())
      ? t('cvs.not_backed_up_since', {
          date: backedUpAt.toLocaleDateString(undefined, { dateStyle: 'medium' }),
        })
      : t('cvs.never_backed_up');

  return (
    <section
      aria-labelledby="cv-library-editing-now"
      className="border-border bg-card rounded-xl border p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-start gap-4">
        <VersionThumbnail theme={themeId} className="h-20 w-15" />

        <div className="min-w-0 flex-1">
          <p
            id="cv-library-editing-now"
            className="text-muted-foreground text-xs font-semibold tracking-wide uppercase"
          >
            {t('cvs.editing_now')}
          </p>
          <p className="text-foreground mt-1 truncate text-base font-extrabold">
            {name || t('cvs.untitled_cv')}
          </p>
          <p className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
            <span className="inline-flex items-center gap-1">
              <HardDrive className="h-3.5 w-3.5" aria-hidden="true" />
              {t('cvs.saved_on_device')}
            </span>
            <span aria-hidden="true">·</span>
            <span>{backedUpLabel}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            onClick={onBackupNow}
            loading={isBackingUp}
            loadingLabel={t('sync.backing_up')}
          >
            <UploadCloud className="mr-2 h-4 w-4" aria-hidden="true" />
            {t('sync.backup_action')}
          </Button>
          <Link
            to={localizedPath(lang, `/dashboard`)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex min-h-11 items-center rounded-lg border border-transparent px-4 text-sm font-medium transition-colors"
          >
            <PenLine className="mr-2 h-4 w-4" aria-hidden="true" />
            {t('cvs.continue_editing')}
          </Link>
        </div>
      </div>
    </section>
  );
}
