import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';

import { BRAND_CONFIG, buildCanonicalMigrationUrl } from '@/config/brand';
import { useTranslation } from '@/hooks/useTranslation';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { useUIStore } from '@/store/ui/useUIStore';
import { cn } from '@/utils/cn';
import { MIGRATION_BACKUP_FILENAME, buildMigrationBackup } from '@/utils/migration-backup';
import { CircleCheck, Download, ExternalLink } from 'lucide-react';

export const MigrationGateway = () => {
  const { t, formatUIDate, uiLanguage } = useTranslation();
  const theme = useUIStore((state) => state.appTheme);
  const isDark = theme === 'dark';

  // Read once. The gateway is a terminal screen on the old domain — nothing
  // here writes to storage, so re-reading it every render buys nothing.
  const backup = useMemo(() => buildMigrationBackup(localStorage), []);
  const hasData = backup !== null;

  const [hasDownloaded, setHasDownloaded] = useState(false);

  // The message copy carries <b> for the on-page render; a meta description is
  // plain text, so the tags are stripped rather than shipped literally.
  const metaDescription = useMemo(
    () =>
      t('migration.message_no_data', { domain: BRAND_CONFIG.canonicalHostname }).replace(
        /<[^>]+>/g,
        '',
      ),
    [t],
  );

  const handleDownloadBackup = () => {
    if (!backup) return;
    analytics.track(ANALYTICS_EVENTS.MIGRATION_DOWNLOAD_CLICKED);

    const blob = new Blob([backup], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = MIGRATION_BACKUP_FILENAME;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setHasDownloaded(true);
  };

  const handleGoToNewDomain = () => {
    analytics.track(ANALYTICS_EVENTS.MIGRATION_LINK_CLICKED);
    window.location.href = buildCanonicalMigrationUrl(
      window.location.pathname,
      window.location.search,
      window.location.hash,
    );
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-[9999] flex items-center justify-center font-sans transition-colors duration-500',
        isDark ? 'bg-[#050505]' : 'bg-slate-50',
      )}
    >
      {/* The gateway renders in `App` *before* `<BrowserRouter>`, so the app's
          shared <SEO /> — which calls `useLocation` — can never mount here.
          That is why the one page every legacy visitor lands on shipped an
          empty <title>, leaving the tab to fall back to the bare hostname.
          `HelmetProvider` is already above this in `bootstrap.tsx`, so a local
          Helmet is enough; do not reach for <SEO /> without a Router above
          it. */}
      <Helmet>
        <html lang={uiLanguage} />
        <title>{t('migration.title')}</title>
        <meta name="description" content={metaDescription} />
        {/* `noindex, follow` alone, deliberately: the legacy host must not
            compete with the new one, and a canonical alongside noindex is a
            conflicting pair Google advises against — the two would be arguing
            about whether to index this page at all. The eventual
            301s are the real consolidation signal. */}
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      {/* Background Accents */}
      {isDark ? (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1e1b4b_0%,#050505_100%)] opacity-70" />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#e2e8f0_0%,#f8fafc_100%)] opacity-70" />
      )}

      <div className="relative w-full max-w-[440px] px-4">
        <div
          className={cn(
            // p-6 below 640px: at 320px the old flat p-10 left ~208px of
            // content width, which wrapped the button labels.
            'animate-in fade-in zoom-in-95 overflow-hidden rounded-[40px] border p-6 text-center shadow-2xl backdrop-blur-2xl transition-all duration-500 sm:p-10',
            isDark ? 'border-white/10 bg-neutral-900/80' : 'border-slate-200 bg-white/90',
          )}
        >
          {/* Logo */}
          <div className="mb-10 flex justify-center">
            <img
              src={BRAND_CONFIG.assets.symbol}
              className="h-12 w-auto transition-transform duration-300 hover:scale-105"
              alt={t('common.logo_alt')}
            />
          </div>

          <h1
            className={cn(
              'mb-4 text-3xl font-extrabold tracking-tight',
              isDark ? 'text-white' : 'text-slate-900',
            )}
          >
            {t('migration.title')}
          </h1>

          <p
            className={cn(
              'mb-10 text-base leading-relaxed',
              isDark ? 'text-neutral-400' : 'text-slate-600',
            )}
            dangerouslySetInnerHTML={{
              __html: hasData
                ? t('migration.message', { domain: BRAND_CONFIG.canonicalHostname })
                : t('migration.message_no_data', { domain: BRAND_CONFIG.canonicalHostname }),
            }}
          />

          {/* Shown in both variants: a visitor with no local data still needs
              to know the address dies, and on which exact date. The
              date is one ISO constant formatted per locale, so translators
              never hand-write fifteen date formats. */}
          <p
            className={cn(
              'mb-10 rounded-xl border px-4 py-3 text-sm leading-relaxed',
              isDark
                ? 'border-amber-500/20 bg-amber-500/5 text-amber-200/90'
                : 'border-amber-500/30 bg-amber-50 text-amber-900',
            )}
            dangerouslySetInnerHTML={{
              __html: t('migration.retirement_notice', {
                date: formatUIDate(BRAND_CONFIG.legacyGatewayRetirementDate),
              }),
            }}
          />

          <div className="space-y-4">
            {/* The download is a one-shot moment on a domain the user is
                leaving, so it gets an explicit acknowledgement rather than a
                silent file drop. Announced politely: nothing moves focus, and
                the primary action changing under the pointer is the visual
                half of the same message. */}
            <p
              aria-live="polite"
              className={cn(
                'flex items-center justify-center gap-2 overflow-hidden text-sm font-bold transition-all duration-300',
                hasDownloaded ? 'text-success h-6 opacity-100' : 'h-0 opacity-0',
              )}
            >
              {hasDownloaded && (
                <>
                  <CircleCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{t('common.success')}</span>
                </>
              )}
            </p>

            {/* Once the backup exists, continuing is the next step, so it takes
                the primary slot and the download drops to the quiet one. The
                download stays reachable: a blocked or discarded file otherwise
                leaves no second chance. */}
            {hasData && !hasDownloaded && (
              <button
                onClick={handleDownloadBackup}
                className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary-strong flex h-14 w-full items-center justify-center gap-3 rounded-2xl px-4 text-base font-black transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <Download className="h-5 w-5 shrink-0" />
                <span className="truncate">{t('migration.button')}</span>
              </button>
            )}

            <button
              onClick={handleGoToNewDomain}
              className={cn(
                'focus-visible:ring-primary-strong flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:outline-none',
                hasData && !hasDownloaded
                  ? cn(
                      'group mx-auto gap-2 text-sm font-bold',
                      isDark
                        ? 'text-neutral-500 hover:text-white'
                        : 'text-slate-400 hover:text-slate-900',
                    )
                  : 'bg-primary text-primary-foreground hover:bg-primary/90 h-14 w-full gap-2 rounded-2xl px-4 text-base font-black',
              )}
            >
              <ExternalLink
                className={cn(
                  'shrink-0',
                  hasData && !hasDownloaded
                    ? 'h-4 w-4 transition-transform group-hover:scale-110'
                    : 'h-5 w-5',
                )}
              />
              <span className="truncate">{t('migration.link')}</span>
            </button>

            {hasData && hasDownloaded && (
              <button
                onClick={handleDownloadBackup}
                className={cn(
                  'group focus-visible:ring-primary-strong mx-auto flex items-center gap-2 text-sm font-bold transition-colors focus-visible:ring-2 focus-visible:outline-none',
                  isDark
                    ? 'text-neutral-500 hover:text-white'
                    : 'text-slate-400 hover:text-slate-900',
                )}
              >
                <Download className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                <span className="truncate">{t('migration.button')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
