import { BRAND_CONFIG } from '@/config/brand';
import { LANGUAGES } from '@/locales';
import {
  DEFAULT_LANGUAGE,
  PREFIXED_LANGUAGES,
  localizedPath,
  localizedUrl,
  splitLanguagePath,
} from '@/utils/localeRouting';
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const sitemapRule = require('../../../scripts/localized-url.cjs') as {
  BASE_URL: string;
  DEFAULT_LANG: string;
  localizedUrl: (lang: string, routePath?: string) => string;
};

/** The static route set `generate-sitemap.cjs` emits, plus a nested one. */
const ROUTES = [
  '',
  '/blog',
  '/blog/some-post',
  '/extras',
  '/privacy',
  '/terms',
  '/withdrawal',
  '/legal-notice',
];

describe('locale path rule', () => {
  it('serves English unprefixed and every other locale prefixed', () => {
    expect(localizedPath('en')).toBe('/');
    expect(localizedPath('en', '/dashboard')).toBe('/dashboard');
    expect(localizedPath('de')).toBe('/de');
    expect(localizedPath('de', '/dashboard')).toBe('/de/dashboard');
  });

  it('treats a bare and a trailing-slash landing path as the same page', () => {
    expect(localizedPath('en', '/')).toBe('/');
    expect(localizedPath('de', '/')).toBe('/de');
  });

  it('excludes only the default language from the prefixed set', () => {
    expect(PREFIXED_LANGUAGES).not.toContain(DEFAULT_LANGUAGE);
    expect(PREFIXED_LANGUAGES).toHaveLength(LANGUAGES.length - 1);
  });

  it('round-trips every locale and route through splitLanguagePath', () => {
    for (const { code } of LANGUAGES) {
      for (const route of ROUTES) {
        const path = localizedPath(code, route);
        const split = splitLanguagePath(path);
        expect(split.lang).toBe(code);
        expect(localizedPath(split.lang, split.pathWithoutLang)).toBe(path);
      }
    }
  });

  it('reads an unrecognized first segment as an English page, not a locale', () => {
    expect(splitLanguagePath('/nonsense')).toEqual({
      lang: 'en',
      pathWithoutLang: '/nonsense',
    });
    expect(splitLanguagePath('/')).toEqual({ lang: 'en', pathWithoutLang: '' });
  });

  /**
   * The one that matters. `generate-sitemap.cjs` cannot import the TypeScript
   * helper, so it carries its own copy of the rule. If the two ever disagree the
   * sitemap starts advertising URLs the app canonicalizes elsewhere — which is
   * precisely the failure this scheme was meant to end.
   */
  it('agrees with the sitemap generator for every locale and route', () => {
    expect(sitemapRule.BASE_URL).toBe(BRAND_CONFIG.canonicalOrigin);
    expect(sitemapRule.DEFAULT_LANG).toBe(DEFAULT_LANGUAGE);

    for (const { code } of LANGUAGES) {
      for (const route of ROUTES) {
        expect(sitemapRule.localizedUrl(code, route)).toBe(
          localizedUrl(BRAND_CONFIG.canonicalOrigin, code, route),
        );
      }
    }
  });
});
