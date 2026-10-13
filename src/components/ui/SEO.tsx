import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

import { BRAND_CONFIG } from '@/config/brand';
import { useTranslation } from '@/hooks/useTranslation';
import { LANGUAGES } from '@/locales';
import { type SeoOverride, useSeoStore } from '@/store/ui/useSeoStore';
import { useUIStore } from '@/store/ui/useUIStore';
import { DEFAULT_LANGUAGE, localizedUrl, splitLanguagePath } from '@/utils/localeRouting';

const VALID_SEO_PAGES = [
  'dashboard',
  'cvs',
  'extras',
  'login',
  'account',
  'settings',
  'json',
  'privacy',
  'terms',
  'withdrawal',
  'legal-notice',
  'blog',
];

/**
 * Routes that resolve their own title and description but must stay out of the
 * index. None of them has anything a searcher wants: `/login`, `/account` and
 * `/settings` are account chrome, and `/json` is a raw-data editor.
 *
 * `/dashboard` joined them on the owner's decision. It served a crawler
 * 184 KB of editor chrome whose only headings were `Edit` and the placeholder
 * `John Doe`, at sitemap priority 0.7 — the third-most-promoted URL on the
 * site ranking on demo data, competing with the landing page for the same
 * queries. Reverse this only together with real above-the-fold copy for
 * logged-out visitors.
 *
 * These stay in `VALID_SEO_PAGES` on purpose — they keep their real `<title>`
 * for the browser tab and for anyone sharing a link. Only the robots directive
 * changes.
 *
 * ⚠️ They are also removed from `STATIC_ROUTES` in `scripts/generate-sitemap.cjs`.
 * The two have to move together: a sitemap entry is a request to index, so
 * listing a `noindex` URL there asks Google to do two contradictory things.
 *
 * ⚠️ Do **not** add these to `robots.txt` as `Disallow`. That blocks the crawl,
 * which prevents the crawler from ever reading the `noindex` — the page then
 * stays indexed on inbound links alone, with no snippet.
 */
const NOINDEX_PAGES = new Set(['login', 'account', 'settings', 'json', 'dashboard', 'cvs']);

/**
 * Derived from the locale registry rather than written out again: a hand-kept
 * copy is how a sixteenth language silently misses its `hreflang` alternate.
 */
const SUPPORTED_LANGUAGES = LANGUAGES.map((language) => language.code);

const alternateLink = (lang: string, path: string, hrefLang: string) => (
  <link
    key={hrefLang}
    rel="alternate"
    href={localizedUrl(BRAND_CONFIG.canonicalOrigin, lang, path)}
    hrefLang={hrefLang}
  />
);

/**
 * The hreflang block.
 *
 * `false` suppresses it, for routes whose locale variants are not derivable —
 * guessing them would advertise URLs that 404. An array publishes a set the
 * route resolved itself.
 *
 * ⚠️ An explicit set is deliberately NOT derived from `LANGUAGES`, and this is
 * the one place in the app where that is correct. hreflang may only name
 * variants that exist: a blog post has an English and a German document and
 * nothing else, so looping the registry would advertise 13 URLs that serve the
 * English article under a canonical pointing elsewhere.
 */
const buildAlternateLinks = (alternates: SeoOverride['alternates'], pathWithoutLang: string) => {
  if (alternates === false) return [];

  if (Array.isArray(alternates)) {
    return alternates.flatMap((alternate) => {
      const link = alternateLink(alternate.lang, alternate.pathWithoutLang, alternate.lang);
      // x-default names the default-language variant when the set has one.
      return alternate.lang === DEFAULT_LANGUAGE
        ? [alternateLink(alternate.lang, alternate.pathWithoutLang, 'x-default'), link]
        : [link];
    });
  }

  return [DEFAULT_LANGUAGE, ...SUPPORTED_LANGUAGES].map((lang, index) =>
    alternateLink(lang, pathWithoutLang, index === 0 ? 'x-default' : lang),
  );
};

/**
 * SEO component to manage dynamic head tags.
 * Synchronizes with the application language and current route.
 *
 * **Mounted exactly once**, in `App`. A route that needs values the path alone
 * cannot supply publishes them through `useSeoOverride`; mounting a second
 * instance emits two of every tag, and the later mount loses.
 */
export const SEO: React.FC = () => {
  const uiLanguage = useUIStore((state) => state.appLanguage) || DEFAULT_LANGUAGE;
  const { t } = useTranslation();
  const location = useLocation();
  const publishedOverride = useSeoStore((state) => state.override);

  // An override belongs to the route that published it. Ignoring a stale one
  // keeps the previous page's title off the new page during the render between
  // its cleanup and the successor's effect.
  const override = publishedOverride?.pathname === location.pathname ? publishedOverride : null;

  const { pageKey, isIndexRoute } = useMemo(() => {
    // English is unprefixed, so the page name is the FIRST segment there and the
    // second under `/de`. `splitLanguagePath` absorbs that difference — reading
    // `segments[1]` directly made every English page look like the landing page.
    const { pathWithoutLang } = splitLanguagePath(location.pathname);
    const pageSegment = pathWithoutLang.split('/').filter(Boolean)[0];
    const isIndex = !pageSegment || !VALID_SEO_PAGES.includes(pageSegment);
    // 'landing' is only used as the SEO translation key — never as a URL segment
    return { pageKey: isIndex ? 'landing' : pageSegment!, isIndexRoute: isIndex };
  }, [location.pathname]);

  const seoKey = pageKey === 'legal-notice' ? 'notice' : pageKey;

  // `t` returns the key path on a miss, which is truthy — so `t(a) || t(b)`
  // never reached its fallback and shipped the literal `seo.foo.title` as the
  // page title. A resolved value never looks like its own key.
  const routeTitle = t(`seo.${seoKey}.title`);
  const routeDescription = t(`seo.${seoKey}.description`);
  const isMiss = (value: string) => value.startsWith('seo.');

  const seoTitle = override?.title ?? (isMiss(routeTitle) ? t('seo.landing.title') : routeTitle);
  const description =
    override?.description ??
    (isMiss(routeDescription) ? t('seo.landing.description') : routeDescription);

  // Construct the base path for canonical/hreflang logic (e.g., /extras)
  const routePath = useMemo(() => {
    // Index route has no page segment in the URL
    return isIndexRoute ? '' : `/${pageKey}`;
  }, [pageKey, isIndexRoute]);

  // English is served unprefixed at the origin root; every other locale keeps
  // its prefix. `localizedUrl` is the single source of that rule — the router,
  // every internal <Link> and `generate-sitemap.cjs` resolve through the same
  // helper, so the canonical can never point somewhere the site does not link.
  //
  // The locale comes from the URL, not from the store. A canonical describes
  // the URL that was served, and the store can legitimately disagree with it for
  // a render or two while `LanguageSyncWrapper` catches up — long enough for a
  // prerender snapshot to capture `/de` as the canonical of `/`.
  const pathWithoutLang = override?.pathWithoutLang ?? routePath;
  const urlLanguage = splitLanguagePath(location.pathname).lang;

  // A route may pin the canonical to a language other than the served URL's,
  // when the same content is reachable under more than one prefix. Only a blog
  // post does: `getPosts` falls back to English for locales that have no posts,
  // so `/fr/blog/kiwicv-origin` serves the English article. Without the pin each
  // of those 13 fallback views canonicalized to itself and claimed to be an
  // independent copy of the same text.
  const canonicalLanguage = override?.canonicalLang ?? urlLanguage;
  const canonicalUrl = localizedUrl(
    BRAND_CONFIG.canonicalOrigin,
    canonicalLanguage,
    pathWithoutLang,
  );

  // An override wins when it sets `noindex` explicitly (the 404 route does),
  // otherwise the route's own membership decides.
  const noindex = override?.noindex ?? NOINDEX_PAGES.has(pageKey);
  const ogImage =
    override?.image ?? `${BRAND_CONFIG.canonicalOrigin}${BRAND_CONFIG.assets.socialImage}`;
  const twitterCard = 'summary_large_image';

  const alternateLinks = buildAlternateLinks(override?.alternates, pathWithoutLang);

  return (
    <Helmet>
      {/* Basic Metadata */}
      <html lang={uiLanguage} />
      <title>{seoTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      {noindex ? <meta name="robots" content="noindex, follow" /> : null}

      {/* Hreflang Tags: Ensures Google understands language variations */}
      {alternateLinks}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};
