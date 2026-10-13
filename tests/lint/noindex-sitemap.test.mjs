/**
 * A sitemap entry is a request to index. A `noindex` directive is a request not
 * to. A URL carrying both is a self-contradiction that Google reports as an
 * error in Search Console, and the two live in different files — `NOINDEX_PAGES`
 * in `src/components/ui/SEO.tsx` and `STATIC_ROUTES` in
 * `scripts/generate-sitemap.cjs` — so nothing stops one from moving without the
 * other.
 *
 * These tests bind them together, and check the committed sitemap too: it is a
 * build artifact that is only as fresh as the last commit which happened to
 * include a build.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const seo = fs.readFileSync(path.join(ROOT, 'src', 'components', 'ui', 'SEO.tsx'), 'utf8');
const generator = fs.readFileSync(path.join(ROOT, 'scripts', 'generate-sitemap.cjs'), 'utf8');
const sitemap = fs.readFileSync(path.join(ROOT, 'public', 'sitemap.xml'), 'utf8');
const robots = fs.readFileSync(path.join(ROOT, 'public', 'robots.txt'), 'utf8');

const noindexPages = [...seo.matchAll(/const NOINDEX_PAGES = new Set\(\[([\s\S]*?)\]\)/g)].flatMap(
  (m) => [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]),
);

const staticRoutePaths = [...generator.matchAll(/\{\s*path:\s*'([^']*)'/g)].map((m) => m[1]);

test('NOINDEX_PAGES is non-empty and parsed correctly', () => {
  assert.ok(noindexPages.length > 0, 'could not parse NOINDEX_PAGES out of SEO.tsx');
});

test('no noindex route is listed in the sitemap generator', () => {
  for (const page of noindexPages) {
    assert.ok(
      !staticRoutePaths.includes(`/${page}`),
      `/${page} emits noindex but is still in STATIC_ROUTES — a sitemap entry ` +
        'asks Google to index exactly what the page tells it not to',
    );
  }
});

test('no noindex route appears in the committed sitemap', () => {
  for (const page of noindexPages) {
    const hits = sitemap.split(`/${page}</loc>`).length - 1;
    assert.equal(
      hits,
      0,
      `public/sitemap.xml still lists /${page} (${hits} entries) — regenerate ` +
        'it with `node scripts/generate-sitemap.cjs`',
    );
  }
});

test('noindex routes are not also Disallowed in robots.txt', () => {
  // Blocking the crawl prevents the crawler from ever reading the noindex, so
  // the page stays indexable on inbound links alone — with no snippet, which is
  // strictly worse than either option alone.
  const disallowed = [...robots.matchAll(/^Disallow:\s*(\S+)/gm)].map((m) => m[1]);

  for (const page of noindexPages) {
    assert.ok(
      !disallowed.some((rule) => rule === `/${page}` || rule === `/${page}/`),
      `robots.txt disallows /${page}, which blocks the crawl that would read ` +
        'its noindex directive',
    );
  }
});
