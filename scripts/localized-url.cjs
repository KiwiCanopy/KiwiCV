const BASE_URL = 'https://kiwicv.kiwicanopy.com';
const DEFAULT_LANG = 'en';

/**
 * The CommonJS mirror of `localizedPath`/`localizedUrl` in
 * `src/utils/localeRouting.ts`: English is served unprefixed at the origin root,
 * every other locale keeps its `/xx` prefix.
 *
 * It lives in its own module rather than inside `generate-sitemap.cjs` because
 * that script runs its generator on import — requiring it from a test would
 * rewrite `public/sitemap.xml` as a side effect.
 *
 * ⚠️ Duplicated from the TypeScript helper on purpose: build scripts are CJS
 * and cannot import it. `src/utils/__tests__/localeRouting.test.ts` asserts the two
 * agree for every locale and every static route, because a sitemap listing a
 * URL the app canonicalizes elsewhere disavows its own entry.
 */
function localizedUrl(lang, routePath = '') {
  const suffix = routePath === '/' ? '' : routePath;
  if (lang === DEFAULT_LANG) return suffix ? `${BASE_URL}${suffix}` : `${BASE_URL}/`;
  return `${BASE_URL}/${lang}${suffix}`;
}

module.exports = { BASE_URL, DEFAULT_LANG, localizedUrl };
