import { LANGUAGES, type LocaleCode } from '@/locales';

/**
 * The locale served unprefixed at the origin root.
 *
 * KiwiCV used to prefix every locale, English included, so the home page lived
 * at `/en` and the bare `/` only ever client-side redirected there. That cost
 * the site its Google site name: site names are resolved from the domain-root
 * home page and are not supported at subdirectory level, and `WebSite`
 * structured data has to sit on that root. The sibling sites (kiwidesk,
 * kiwicanopy) have always served English from the root, with only non-default
 * locales prefixed — this brings KiwiCV onto the same shape.
 *
 * ⚠️ This is NOT the reverse of an earlier defect, which canonicalized `/en` to `/`
 * while the router, every internal link and the sitemap still emitted `/en/…`,
 * so the canonical disavowed the exact URLs the site pointed at. Here the
 * *whole* scheme moves together: routes, links, canonical, hreflang and
 * sitemap all stop emitting `/en`, and `/en/*` 301s to the bare form in
 * `netlify.toml`. Changing any one of those alone reintroduces it.
 */
export const DEFAULT_LANGUAGE: LocaleCode = 'en';

/** Every locale that still carries a `/xx` path prefix. */
export const PREFIXED_LANGUAGES: LocaleCode[] = LANGUAGES.map((language) => language.code).filter(
  (code): code is LocaleCode => code !== DEFAULT_LANGUAGE,
);

const SUPPORTED_CODES = new Set<string>(LANGUAGES.map((language) => language.code));

export const isSupportedLanguage = (value: string | undefined): value is LocaleCode =>
  value !== undefined && SUPPORTED_CODES.has(value);

/**
 * The single source of truth for building an in-app path.
 *
 * Always use this instead of a `/${lang}${path}` template literal — that
 * pattern was duplicated across three dozen call sites, and each one would
 * have had to learn the root-locale rule separately.
 *
 * ⚠️ **Nothing enforces this.** This comment claimed `scripts/check-locale-paths.cjs`
 * failed the build if the literal reappeared; that script has never existed in
 * this repo, and the belief that it did is why a raw `/${lang}` template
 * survived in `BlogPost.tsx`'s JSON-LD until 2026-08-30, emitting `/en/blog/…`
 * `@id`s that 301. Grep for the literal by hand when you touch locale paths.
 *
 * @param path a leading-slash path with no locale segment (`/dashboard`), or
 *             `''`/`'/'` for the locale's landing page.
 */
export function localizedPath(lang: string, path = ''): string {
  const suffix = path === '/' ? '' : path;
  if (lang === DEFAULT_LANGUAGE) return suffix || '/';
  return `/${lang}${suffix}`;
}

/** Absolute form of {@link localizedPath}, for canonical, hreflang and OG tags. */
export function localizedUrl(origin: string, lang: string, path = ''): string {
  const localized = localizedPath(lang, path);
  return localized === '/' ? `${origin}/` : `${origin}${localized}`;
}

/**
 * Splits a pathname into its locale and the rest.
 *
 * An unprefixed path is English by definition, so `/dashboard` returns
 * `{ lang: 'en', pathWithoutLang: '/dashboard' }`. A path whose first segment
 * is not a supported locale is treated the same way — `/nonsense` is an
 * English 404, not an unknown-locale bounce.
 */
export function splitLanguagePath(pathname: string): {
  lang: LocaleCode;
  pathWithoutLang: string;
} {
  const [, first = '', ...rest] = pathname.split('/');

  if (isSupportedLanguage(first)) {
    const remainder = rest.join('/');
    return { lang: first, pathWithoutLang: remainder ? `/${remainder}` : '' };
  }

  return { lang: DEFAULT_LANGUAGE, pathWithoutLang: pathname === '/' ? '' : pathname };
}
