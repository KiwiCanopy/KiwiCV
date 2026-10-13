---
paths:
  - 'src/components/ui/SEO.tsx'
  - 'src/hooks/useSeoOverride.ts'
  - 'src/store/ui/useSeoStore.ts'
  - 'src/utils/localeRouting.ts'
  - 'scripts/generate-sitemap.cjs'
  - 'scripts/localized-url.cjs'
  - 'netlify/edge-functions/**'
  - 'public/robots.txt'
---

# SEO surface

`code/SEO.md` is the reference — prerendering, titles, JSON-LD, blog alternates
from Sanity, the verification commands. This is what binds.

## Exactly one `<SEO />` is mounted

It lives once, in `src/App.tsx`. **Do not mount a second one to fix a wrong
value.** That is exactly how it once broke: blog routes mounted their own instance,
one `HelmetProvider` emitted two `<title>`, two canonicals and 32 hreflang tags,
the global instance won, and every post served the blog index's metadata.

A route needing values the path cannot supply publishes them:

```ts
useSeoOverride({ title, description, pathWithoutLang, image, noindex, alternates });
```

The override records the pathname it was published for, and `<SEO />` ignores
one whose pathname is not current — that is what stops a stale title surviving
the gap between the old page's cleanup and the new page's effect. Do not remove
that check to "simplify"; it has no other purpose and no visible symptom until
navigation is fast.

`alternates: false` suppresses hreflang for routes whose locale variants are not
derivable. `noindex: true` emits `noindex, follow`.

## A noindex route moves three files or none

| File                           | What must be true               |
| ------------------------------ | ------------------------------- |
| `src/components/ui/SEO.tsx`    | listed in `NOINDEX_PAGES`       |
| `scripts/generate-sitemap.cjs` | **absent** from `STATIC_ROUTES` |
| `public/robots.txt`            | **not** `Disallow`ed            |

Nothing about these three is obviously coupled, so this is the entry to read
before touching any of them.

A sitemap entry is a request to index, so listing a `noindex` URL asks Google
for two contradictory things. And `Disallow` is **worse** than it looks: it
blocks the crawl that would have read the `noindex`, leaving the page indexable
on inbound links alone, with no snippet. `tests/lint/noindex-sitemap.test.mjs`
fails when any of the three drifts.

## English is unprefixed; the `/en/*` 301 is enforced twice on purpose

`/blog` is English, `/de/blog` is German, `x-default` points at the unprefixed
URL. `src/utils/localeRouting.ts` is the single source of that rule and
`scripts/localized-url.cjs` mirrors it for the CJS build scripts — change one
and you must change the other.

⚠️ **The duplicate 301 is the fix, not sloppiness.** `[[redirects]]` in
`netlify.toml` never reached crawlers: the prerender extension is an edge
function, edge functions run before redirects, and that ordering is not
configurable — so bots got a prerendered `200` at the retired URL while browsers
got the `301`. `netlify/edge-functions/en-redirect.js` now returns the 301 for
every user agent, and the `[[redirects]]` rules stay as the browser-facing
backstop. `tests/lint/en-redirect-edge.test.mjs` pins the whole arrangement,
including the rewritten request shape the prerenderer produces.

**Do not consolidate these two into one.** Deleting either restores the split
where bots and browsers see different status codes, which is invisible in a
browser.

Verify with a bot user agent, never only a browser one:

```bash
curl -s -o /dev/null -w "%{http_code}\n" -A "Googlebot/2.1" https://kiwicv.kiwicanopy.com/en/blog
```

## The sitemap is built, not fetched

`npm run sitemap:generate` runs at build time against Sanity. Blog pages fetch
Sanity **client-side**, so a post published between releases is live to readers
and absent from `sitemap.xml` until the next production deploy. That is a
crawler-visibility gap, not a broken page — and it is not fixed by adding a
build hook, because the tag gate cancels any build of an untagged `main`.
