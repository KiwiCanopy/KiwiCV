import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { useLanguage } from '@/hooks/useLanguage';
import { useSyncSelfHeal } from '@/hooks/useSyncSelfHeal';
import { useTranslation } from '@/hooks/useTranslation';
import { Header } from '@/layouts/Header';
import { Sidebar } from '@/layouts/Sidebar';
import { MainLayoutOverlays } from '@/layouts/main/MainLayoutOverlays';
import { usePostAuthNavigation } from '@/layouts/main/usePostAuthNavigation';
import { useReleaseHighlights } from '@/layouts/main/useReleaseHighlights';
import { useRouteAnalytics } from '@/layouts/main/useRouteAnalytics';
import { localizedPath } from '@/utils/localeRouting';

export function MainLayout() {
  useSyncSelfHeal();
  usePostAuthNavigation();
  const { t } = useTranslation();

  const location = useLocation();
  const lang = useLanguage();
  const isDashboard = useRouteAnalytics(location.pathname, lang);
  const releaseHighlights = useReleaseHighlights();
  // `localizedPath` already normalizes the trailing slash away, so the old
  // `/${lang}` vs `/${lang}/` pair collapses to one comparison. The bare `/`
  // it returns for English is the landing page too.
  const landingPath = localizedPath(lang);
  const isLanding = location.pathname === landingPath || location.pathname === `${landingPath}/`;
  const isPreview = location.pathname.includes('/preview');
  const mainRef = useRef<HTMLElement>(null);
  const previousPathname = useRef(location.pathname);

  useEffect(() => {
    if (previousPathname.current === location.pathname) return;
    previousPathname.current = location.pathname;
    mainRef.current?.focus({ preventScroll: true });
  }, [location.pathname]);

  return (
    <div className="bg-background flex h-screen transition-colors">
      <a
        href="#main-content"
        className="bg-card text-foreground fixed top-2 left-2 z-[100] -translate-y-20 rounded-lg px-4 py-3 font-semibold shadow-[var(--elevation-2)] transition-transform focus:translate-y-0"
      >
        {t('common.skip_to_content')}
      </a>
      <MainLayoutOverlays {...releaseHighlights} />
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Off the dashboard this bar carries only the menu button and the brand,
            so `--card` claimed a near-empty surface — the largest white area
            on a phone screen, separated from the canvas under it by a hue break
            rather than by a tonal step. It reads as canvas now; `border-b` still
            marks where chrome ends.

            ⚠️ The dashboard header stays `bg-card`, ruled by the owner on
            2026-09-02 when the blend was tried there and rejected. There the bar
            is a real toolbar (tabs, CV language, back up, export) and the
            segmented switcher's `--muted` track and `bg-card` thumb are drawn
            against it — the white is the editor's surface, not an empty slab.
            Do not "finish the job" by extending the blend to this branch. */}
        <Header className={isDashboard ? '' : 'bg-background lg:hidden'} showBrand={!isDashboard} />
        <main
          ref={mainRef}
          id="main-content"
          tabIndex={-1}
          className="flex flex-1 flex-col overflow-auto outline-none"
        >
          <div
            className={`flex flex-1 flex-col ${isPreview || isDashboard || isLanding ? '' : 'p-4 sm:p-8'}`}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
