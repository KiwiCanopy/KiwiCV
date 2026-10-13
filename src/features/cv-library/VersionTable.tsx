import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { StatePanel } from '@/components/ui/StatePanel';
import { VersionRow } from '@/features/cv-library/VersionRow';
import type { CvVersion } from '@/features/cv-library/types';
import { useTranslation } from '@/hooks/useTranslation';

const INITIAL_ROWS = 10;

interface VersionTableProps {
  versions: CvVersion[];
  totalCount: number;
  onRestore: (version: CvVersion) => void;
  onDelete: (version: CvVersion, index: number) => void;
  onDownload: (version: CvVersion) => void;
  onResetFilters: () => void;
}

export function VersionTable({
  versions,
  totalCount,
  onRestore,
  onDelete,
  onDownload,
  onResetFilters,
}: VersionTableProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const shown = expanded ? versions : versions.slice(0, INITIAL_ROWS);
  const isTruncated = versions.length > INITIAL_ROWS;

  return (
    <section aria-labelledby="cv-library-versions" className="mt-6">
      <h2 id="cv-library-versions" className="sr-only">
        {t('cvs.versions_heading')}
      </h2>

      {versions.length === 0 ? (
        <StatePanel
          variant="empty"
          title={t('common.no_results')}
          description={t('cvs.no_matches_desc')}
          action={
            <Button variant="secondary" size="sm" onClick={onResetFilters}>
              {t('sync.reset_filters')}
            </Button>
          }
        />
      ) : (
        <div className="border-border bg-card overflow-hidden rounded-xl border">
          <div className="border-border text-muted-foreground hidden border-b px-4 py-2 text-xs font-semibold tracking-wide uppercase md:flex md:items-center md:gap-4">
            <span className="w-11 shrink-0" aria-hidden="true" />
            <span className="min-w-0 flex-1">{t('cvs.col_version')}</span>
            <span className="min-w-0 flex-1">{t('cvs.col_tailored_for')}</span>
            <span className="w-24 shrink-0">{t('cvs.col_saved')}</span>
            <span className="sr-only">{t('cvs.col_actions')}</span>
          </div>

          {shown.map((version, index) => (
            <VersionRow
              key={version.key}
              version={version}
              index={index}
              onRestore={onRestore}
              onDelete={onDelete}
              onDownload={onDownload}
            />
          ))}

          <div className="border-border bg-secondary/40 flex items-center justify-between gap-3 border-t px-4 py-2">
            <span className="text-muted-foreground text-xs" role="status" aria-live="polite">
              {t('cvs.showing_count', { shown: shown.length, total: totalCount })}
            </span>
            {isTruncated && (
              <Button variant="quiet" size="sm" onClick={() => setExpanded((open) => !open)}>
                {expanded ? t('cvs.show_fewer') : t('cvs.show_all')}
              </Button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
