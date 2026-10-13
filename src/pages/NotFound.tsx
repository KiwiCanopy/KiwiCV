import { Link, useLocation } from 'react-router-dom';

import { useLanguage } from '@/hooks/useLanguage';
import { useSeoOverride } from '@/hooks/useSeoOverride';
import { useTranslation } from '@/hooks/useTranslation';
import { Compass } from 'lucide-react';

/**
 * The unknown-path view.
 *
 * Unknown paths used to redirect to the landing page and answer 200 with the
 * homepage's canonical, so every typo and stale inbound link became an
 * indexable duplicate of `/`. Netlify's SPA rewrite means the status stays
 * 200; `noindex` is what keeps the set out of the index.
 */
export function NotFound() {
  const lang = useLanguage();
  const { pathname } = useLocation();
  const { t } = useTranslation();

  useSeoOverride({
    title: t('common.not_found.title'),
    description: t('common.not_found.description'),
    // Self-canonical. Without this the route resolves to the landing page's
    // empty path and a 404 would go on declaring itself the homepage — the
    // signal that made these soft 404s duplicates of `/`.
    pathWithoutLang: pathname.replace(/^\/[^/]+/, '') || '/',
    noindex: true,
    // Nothing to alternate to — the path does not exist in any locale.
    alternates: false,
  });

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <div className="bg-primary/5 mb-8 flex h-20 w-20 items-center justify-center rounded-3xl">
        <Compass className="text-primary-strong h-9 w-9" />
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
        {t('common.not_found.title')}
      </h1>
      <p className="text-muted-foreground mt-4 max-w-md text-base leading-relaxed">
        {t('common.not_found.description')}
      </p>

      <Link
        to={`/${lang || 'en'}`}
        className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary-strong mt-10 rounded-xl px-6 py-3 text-sm font-bold transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        {t('common.not_found.back_home')}
      </Link>
    </div>
  );
}
