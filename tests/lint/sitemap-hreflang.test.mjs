/**
 * Google discards a non-reciprocal hreflang set outright: if `/blog/a` claims
 * `/de/blog/b` as its German variant and `/de/blog/b` does not claim `/blog/a`
 * back, neither annotation counts and the pages compete as duplicates instead
 * of consolidating. Nothing about the markup looks wrong when that happens,
 * which is why it needs a test rather than a review.
 *
 * The blog is the case that motivated this. Its alternate set is the one place
 * in the repo that is deliberately NOT derived from the locale registry — a
 * post exists in the languages it was written in, with a different slug in
 * each, so `scripts/generate-sitemap.cjs` reads them from Sanity's
 * `translation.metadata` instead. Nothing else checks that what comes back is
 * coherent, and the same metadata sat orphaned in the dataset for four months
 * without a single check noticing.
 *
 * The static routes are held to the same rule for free, so a regression in
 * their block fails here too.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const sitemap = fs.readFileSync(path.join(ROOT, 'public', 'sitemap.xml'), 'utf8');
const sanityTs = fs.readFileSync(path.join(ROOT, 'src', 'lib', 'sanity.ts'), 'utf8');
const generator = fs.readFileSync(path.join(ROOT, 'scripts', 'generate-sitemap.cjs'), 'utf8');

/**
 * The two readers of `translation.metadata`, and the fact that they must agree.
 *
 * `<SEO />` builds the alternate set at runtime through `src/lib/sanity.ts`;
 * `scripts/generate-sitemap.cjs` builds it again at build time. Google discards
 * a sitemap set the page does not confirm, so the two must stay identical — and
 * the boundary is TS/browser vs CJS/node, so no compiler spans it.
 *
 * This is the same split the repo already accepted for URL construction
 * (`src/utils/localeRouting.ts` / `scripts/localized-url.cjs`) and already
 * decided is worth binding with a test rather than a comment.
 */
const SOURCES = [
  ['src/lib/sanity.ts', sanityTs],
  ['scripts/generate-sitemap.cjs', generator],
];

const normalize = (text) => text.replace(/\s+/g, ' ');

const PROJECTION =
  '"translations": *[_type == "translation.metadata" && references(^._id)][0].translations[]{ ' +
  'language, "slug": value->slug.current }';

/** `<url>` blocks, each reduced to its `<loc>` and its alternate links. */
const entries = (sitemap.match(/<url>[\s\S]*?<\/url>/g) || []).map((block) => {
  const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
  const alternates = [
    ...block.matchAll(/<xhtml:link\s+rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"/g),
  ].map((m) => ({ hreflang: m[1], href: m[2] }));

  return { loc, alternates };
});

const locs = new Set(entries.map((entry) => entry.loc));
const byLoc = new Map(entries.map((entry) => [entry.loc, entry]));

/** The set that must match between reciprocal partners — x-default excluded,
 * since it names one member rather than adding one. */
const languageSet = (entry) =>
  entry.alternates
    .filter((alternate) => alternate.hreflang !== 'x-default')
    .map((alternate) => alternate.href)
    .sort();

test('both readers use the same GROQ projection', () => {
  for (const [name, source] of SOURCES) {
    assert.ok(
      normalize(source).includes(PROJECTION),
      `${name} no longer contains the shared translation projection. Both ` +
        'readers must join `translation.metadata` identically — if you changed ' +
        'one deliberately, change the other and update PROJECTION here.',
    );
  }
});

test('both readers drop dangling references after the dereference', () => {
  // A weak reference to a discarded draft satisfies `defined(value)`; only
  // `value->` reveals it as a null slug. Filtering before the deref silently
  // keeps orphans, which is how three of them survived four months.
  for (const [name, source] of SOURCES) {
    assert.match(
      normalize(source),
      /translation\?*\.language && translation\?*\.slug|translation\.language && translation\.slug/,
      `${name} no longer filters translations on a resolved language AND slug ` +
        'after the dereference — a dangling reference will reach the output',
    );
  }
});

test('the sitemap parsed into entries', () => {
  assert.ok(entries.length > 0, 'no <url> blocks parsed out of public/sitemap.xml');
  assert.ok(
    entries.every((entry) => entry.loc),
    'a <url> block has no <loc>',
  );
});

/**
 * Posts that genuinely exist in one language only.
 *
 * Empty today: all six posts are linked en<->de in Sanity. An entry here is a
 * claim that no translation of that post exists — never a way to quiet a link
 * that broke. Like the other baselines in this directory it may only shrink.
 */
const SINGLE_LANGUAGE_POSTS = [];

/**
 * ⚠️ The assertion the rest of this file cannot make.
 *
 * Every other test here is guarded by `if (entry.alternates.length === 0)
 * continue`, so they check the shape of a set that exists and say nothing about
 * whether it exists. Stripping every blog alternate out of the sitemap left the
 * original seven tests passing 7/7 — which is precisely the state the dataset
 * was in for four months, and precisely what this file was written to catch.
 *
 * Re-orphan the `translation.metadata` documents, typo the GROQ projection, or
 * have `value->` start returning null again, and the sitemap silently
 * regenerates with the pre-fix output. Only this test notices.
 */
test('every blog post carries an alternate set', () => {
  const blogEntries = entries.filter((entry) => /\/blog\/[^/]+$/.test(entry.loc));

  assert.ok(
    blogEntries.length > 0,
    'no blog entries in the sitemap at all — the Sanity fetch in ' +
      'scripts/generate-sitemap.cjs returned nothing, or fell back to preserved blocks',
  );

  for (const entry of blogEntries) {
    const slug = entry.loc.split('/blog/')[1];
    if (SINGLE_LANGUAGE_POSTS.includes(slug)) continue;

    assert.ok(
      languageSet(entry).length >= 2,
      `${entry.loc} carries no hreflang alternates. Either its ` +
        '`translation.metadata` link is missing or dangling in Sanity, or the ' +
        'join in scripts/generate-sitemap.cjs stopped resolving — regenerate ' +
        'with `npm run sitemap:generate` and check the links resolve. If the ' +
        'post really has no translation, add its slug to SINGLE_LANGUAGE_POSTS.',
    );
  }
});

test('no entry advertises a lone alternate', () => {
  for (const entry of entries) {
    if (entry.alternates.length === 0) continue;
    assert.ok(
      languageSet(entry).length !== 1,
      `${entry.loc} lists exactly one language alternate — a set of one says ` +
        'nothing and is the shape a half-linked translation produces',
    );
  }
});

test('no entry repeats an hreflang', () => {
  for (const entry of entries) {
    const seen = entry.alternates.map((alternate) => alternate.hreflang);
    assert.equal(
      new Set(seen).size,
      seen.length,
      `${entry.loc} declares the same hreflang twice: ${seen.join(', ')}`,
    );
  }
});

test('every alternate points at a URL the sitemap also lists', () => {
  for (const entry of entries) {
    for (const alternate of entry.alternates) {
      assert.ok(
        locs.has(alternate.href),
        `${entry.loc} names ${alternate.href} (hreflang="${alternate.hreflang}") ` +
          'as an alternate, but no <url> block lists it — an alternate Google ' +
          'cannot find in the sitemap is an unverifiable claim',
      );
    }
  }
});

test('every alternate set includes the page declaring it', () => {
  for (const entry of entries) {
    if (entry.alternates.length === 0) continue;
    assert.ok(
      languageSet(entry).includes(entry.loc),
      `${entry.loc} lists alternates but not itself — a self-referential entry ` +
        'is required for the set to be reciprocal',
    );
  }
});

test('alternate sets are reciprocal', () => {
  for (const entry of entries) {
    if (entry.alternates.length === 0) continue;
    const mine = languageSet(entry);

    for (const href of mine) {
      const partner = byLoc.get(href);
      if (!partner) continue; // already reported by the coverage test above

      assert.deepEqual(
        languageSet(partner),
        mine,
        `${entry.loc} and ${href} disagree about their alternate set. Google ` +
          'discards hreflang that is not reciprocal, so a partial link is ' +
          'worth exactly as much as none',
      );
    }
  }
});

test('x-default, when present, names a member of the set', () => {
  for (const entry of entries) {
    const xDefault = entry.alternates.find((alternate) => alternate.hreflang === 'x-default');
    if (!xDefault) continue;

    assert.ok(
      languageSet(entry).includes(xDefault.href),
      `${entry.loc} points x-default at ${xDefault.href}, which is not one of ` +
        'its language alternates',
    );
  }
});
