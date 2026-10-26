import { useState } from 'react';
import { SiGithub } from 'react-icons/si';

import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { GoogleDriveIcon } from '@/components/ui/Icons';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import { CV_LIBRARY_LIST_ID } from '@/constants/focusAnchors';
import { VersionThumbnail } from '@/features/cv-library/VersionThumbnail';
import type { CvVersion } from '@/features/cv-library/types';
import { useTranslation } from '@/hooks/useTranslation';
import { Download, EllipsisVertical, ExternalLink, RotateCcw, Trash2 } from 'lucide-react';

interface VersionRowProps {
  version: CvVersion;
  /** Position among the rendered rows — the focus anchor is read positionally. */
  index: number;
  onRestore: (version: CvVersion) => void;
  onDelete: (version: CvVersion, index: number) => void;
  onDownload: (version: CvVersion) => void;
}

function formatSaved(updatedAt?: string) {
  if (!updatedAt) return null;
  const parsed = new Date(updatedAt);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString(undefined, { dateStyle: 'medium' });
}

export function VersionRow({ version, index, onRestore, onDelete, onDownload }: VersionRowProps) {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { file, source, locale } = version;

  const savedOn = formatSaved(file.updatedAt);
  const tailoredFor = [file.position, file.company].filter(Boolean).join(' · ');

  // Every icon action names the version it acts on, so a screen reader user
  // hears which row a menu belongs to rather than eleven identical "More".
  const rowMenuLabel = t('cvs.row_menu', { name: file.label });

  return (
    <div className="border-border hover:bg-secondary/50 flex flex-wrap items-center gap-3 border-b px-3 py-3 transition-colors last:border-b-0 sm:flex-nowrap sm:gap-4 sm:px-4">
      <VersionThumbnail theme={file.theme} />

      <div className="order-last min-w-0 flex-1 basis-full sm:order-none sm:basis-auto">
        <p className="text-foreground truncate text-sm font-semibold">{file.label}</p>
        <p className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
          <span className="inline-flex items-center gap-1">
            {source === 'github' ? (
              <SiGithub className="h-3 w-3" aria-hidden="true" />
            ) : (
              <GoogleDriveIcon size={12} aria-hidden="true" />
            )}
            {t(`sync.providers.${source}`)}
          </span>
          <span aria-hidden="true">·</span>
          <span>{t(`languages.${locale}`)}</span>
          {file.theme && (
            <>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{file.theme}</span>
            </>
          )}
        </p>
      </div>

      {/* Truncation sits on the inner span: on the <p> it would clip the link's focus ring. */}
      <p className="text-muted-foreground hidden min-w-0 flex-1 text-xs md:block">
        {file.postingUrl ? (
          <a
            href={file.postingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-strong inline-flex max-w-full items-center gap-1 underline-offset-4 hover:underline"
          >
            {/* The visible text leads the accessible name (WCAG 2.5.3). */}
            <span className="truncate">{tailoredFor || t('cvs.open_posting')}</span>{' '}
            <span className="sr-only">{t('cvs.open_posting_for', { name: file.label })}</span>
            <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
          </a>
        ) : (
          <span className="block truncate">{tailoredFor || t('cvs.no_target')}</span>
        )}
      </p>

      <p className="text-muted-foreground w-24 shrink-0 text-right text-xs sm:text-left">
        {savedOn ?? t('cvs.saved_unknown')}
      </p>

      <div className="ml-auto flex shrink-0 items-center gap-1 sm:ml-0">
        <Button size="sm" variant="secondary" onClick={() => onRestore(version)}>
          <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
          {t('common.restore')}
        </Button>

        <Popover open={menuOpen} onOpenChange={setMenuOpen}>
          <PopoverTrigger asChild>
            {/* The focus anchor for the confirmed delete, rather than the Delete
                item itself: this popover's content is unmounted while closed, so
                the item is gone before `entryDeleteAnchor` ever looks. */}
            <IconButton variant="quiet" label={rowMenuLabel} data-entry-delete={CV_LIBRARY_LIST_ID}>
              <EllipsisVertical className="h-4 w-4" aria-hidden="true" />
            </IconButton>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56 p-1.5">
            <div className="flex flex-col">
              {/* The row's own link sits in a column phones do not show. */}
              {file.postingUrl && (
                <a
                  href={file.postingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="text-foreground hover:bg-muted inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold transition-colors md:hidden"
                >
                  <ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
                  {t('cvs.open_posting')} <span className="sr-only">{t('cvs.opens_new_tab')}</span>
                </a>
              )}
              <Button
                variant="quiet"
                size="sm"
                className="justify-start"
                onClick={() => {
                  setMenuOpen(false);
                  onDownload(version);
                }}
              >
                <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                {t('cvs.download_json')}
              </Button>
              <Button
                variant="quiet"
                size="sm"
                className="text-destructive justify-start"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(version, index);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                {t('common.delete')}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
