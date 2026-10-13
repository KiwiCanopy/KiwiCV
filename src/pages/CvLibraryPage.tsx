import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { PageContainer } from '@/components/ui/PageContainer';
import { LIBRARY_HEADING_ANCHOR_ID } from '@/constants/focusAnchors';
import { ActiveFilterChips } from '@/features/cv-library/ActiveFilterChips';
import { EditingNowCard } from '@/features/cv-library/EditingNowCard';
import { LatestBackupSection } from '@/features/cv-library/LatestBackupSection';
import {
  LibraryErrorState,
  LibraryLoadingState,
  LibraryNoVersionsState,
  LibraryNotConnectedState,
  LibraryPartialFailureNotice,
} from '@/features/cv-library/LibraryStates';
import { LibraryToolbar } from '@/features/cv-library/LibraryToolbar';
import { VersionTable } from '@/features/cv-library/VersionTable';
import { useCvLibrary } from '@/features/cv-library/useCvLibrary';
import { useCvLibraryFilters } from '@/features/cv-library/useCvLibraryFilters';
import { useSyncAuthGateway } from '@/hooks/sync/useSyncAuthGateway';
import { useSyncWorkflow } from '@/hooks/useSyncWorkflow';
import { useTranslation } from '@/hooks/useTranslation';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { useUIStore } from '@/store/ui/useUIStore';
import { cn } from '@/utils/cn';

/**
 * "My CVs" as a page rather than a popup.
 *
 * The route reads `?source=` and `?language=` so the post-connect and
 * language-switch flows can land on the narrowing they meant, instead of
 * opening a modal that first asks the user to pick both.
 */
export function CvLibraryPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { isCloudActive, ensureConnected } = useSyncAuthGateway();

  const library = useCvLibrary();
  // The hook splits the pinned masters off the rows itself, because which ones
  // are pinned depends on its own language filter.
  const filters = useCvLibraryFilters(library.versions, library.activeLocale);

  const { handleTrigger: handleBackupNow, syncStatus } = useSyncWorkflow({
    mode: 'sync',
    variant: 'root',
  });

  const setSyncModal = useUIStore((state) => state.setSyncModal);

  const { setScope, setLocaleFilter } = filters;
  useEffect(() => {
    const source = searchParams.get('source');
    if (source === 'github' || source === 'google_drive') setScope(source);
    const language = searchParams.get('language');
    if (language) setLocaleFilter(language);
  }, [searchParams, setScope, setLocaleFilter]);

  useEffect(() => {
    analytics.track(ANALYTICS_EVENTS.CV_LIBRARY_VIEWED);
  }, []);

  const { status } = library;
  const isLoading = status === 'loading';
  const hasVersions = library.versions.length > 0;

  return (
    <PageContainer className="px-4 pb-12 sm:px-6">
      <header className="mt-6 mb-6">
        <h1
          /* The library's terminal focus rung — the one element that outlives
             the table, the filtered no-results panel and the empty-library
             panel alike. `tabIndex={-1}` is focusable programmatically
             without joining the tab order; the id's uniqueness is pinned by
             `tests/lint/entry-delete-anchor.test.mjs`. */
          id={LIBRARY_HEADING_ANCHOR_ID}
          tabIndex={-1}
          className={cn(
            'text-foreground text-2xl font-extrabold tracking-tight',
            // ⚠️ Softer than the app-wide ring, matching `SectionPage`'s heading:
            // a landing target is not a control, and 3px plus a separator around
            // a left-aligned title reads as a text input (owner review).
            // ⚠️ Not a colour change — re-pointing focus tokens locally is what
            // broke the sidebar's ghost buttons (`tokens.css` .bg-nav).
            'focus-visible:border-l-foreground -ml-3 border-l-2 border-l-transparent pl-3 focus-visible:shadow-none focus-visible:outline-none',
          )}
        >
          {t('cvs.title')}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">{t('cvs.subtitle')}</p>
      </header>

      <EditingNowCard
        activeLanguageMaster={library.activeLanguageMaster}
        onBackupNow={handleBackupNow}
        isBackingUp={syncStatus === 'loading'}
      />

      {status === 'unconfigured' || !isCloudActive ? (
        <div className="mt-6">
          <LibraryNotConnectedState
            onConnect={() =>
              ensureConnected({
                mode: 'manage',
                onSuccess: library.refresh,
                // ⚠️ The branch a signed-in user without Drive credentials
                // takes, so this is the panel's only working button.
                onSetupRequired: () => setSyncModal('gateway', 'manage'),
              })
            }
          />
        </div>
      ) : status === 'error' ? (
        <div className="mt-6">
          <LibraryErrorState description={library.error} onRetry={library.refresh} />
        </div>
      ) : (
        <>
          <LibraryPartialFailureNotice sources={library.failedSources} />

          <LatestBackupSection masters={filters.pinned} onRestore={library.restore} />

          {isLoading && !hasVersions ? (
            <div className="mt-6">
              <LibraryLoadingState />
            </div>
          ) : !hasVersions ? (
            <div className="mt-6">
              <LibraryNoVersionsState onBackupNow={handleBackupNow} />
            </div>
          ) : (
            <>
              <LibraryToolbar filters={filters} onRefresh={library.refresh} isBusy={isLoading} />
              <ActiveFilterChips filters={filters} />
              <VersionTable
                versions={filters.filtered}
                totalCount={filters.scopeCounts.all}
                onRestore={library.restore}
                onDelete={library.remove}
                onDownload={library.downloadJson}
                onResetFilters={filters.resetAll}
              />
            </>
          )}
        </>
      )}
    </PageContainer>
  );
}
