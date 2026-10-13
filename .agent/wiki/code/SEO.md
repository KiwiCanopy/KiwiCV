# SEO Strategy

> **Last Updated: 2026-09-08**

## Contents

- [Overview](#overview)
- [Dynamic Metadata](#dynamic-metadata)
- [Sitemap](#sitemap)
- [Noindex routes](#noindex-routes)
- [Structured data (JSON-LD)](#structured-data-json-ld)
- [Maintenance](#maintenance)
- [Verification](#verification)

> [!IMPORTANT]
> The obligations — one `<SEO />` mount, the three files a noindex route moves
> together, and why the `/en/*` 301 is deliberately duplicated — are in
> `.claude/rules/seo.md`, which loads when you edit any of those files. This
> page keeps the measurements, the prerendering detail and the verification
> commands.

## Overview

KiwiCV combines route-aware localized metadata, canonical/hreflang tags, a
language-neutral social image, and a generated sitemap for 15 languages. The
canonical origin and asset paths come from `src/config/brand.ts`.

## Dynamic Metadata

`src/components/ui/SEO.tsx` uses `react-helmet-async` to:

- resolve localized title and description values from `src/locales/{lang}/seo.ts`;
- emit the canonical URL for the active route and language;
- emit `x-default` plus all 15 supported `hreflang` alternates;
- use `public/logos/kiwicv/og.jpg` for every language;
- emit matching Open Graph and Twitter metadata.

`index.html` intentionally does not duplicate dynamic title, description, OG,
or Twitter tags. Static JSON-LD identifies the KiwiCV software application.

### ⚠️ Prerendering covers some bots, and the list is not in this repo

Netlify's prerender extension is configured in the **dashboard**, so nothing in
this repository pins which user-agents it serves. It has already changed once
without a commit, and both `index.html` and this page previously asserted a
blanket "bots receive the fully-rendered tags" that was wrong.

Measured against production on 2026-07-23, `/en/blog`:

| Response                 | User-agents                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------- |
| 33,153 bytes, rendered   | `Googlebot`, `bingbot`, `Twitterbot`, `LinkedInBot`, `DuckDuckBot`                                      |
| 1,716 bytes, empty shell | `Google-InspectionTool`, `Applebot`, `YandexBot`, `GPTBot`, `PerplexityBot`, `ClaudeBot`, real browsers |

Earlier the same day the first two rows were **reversed** — Googlebot and
bingbot got the shell while the AI crawlers got rendered HTML. Search is
therefore fine now, but:

- ⚠️ **`Google-InspectionTool` still receives the shell**, and that is what
  Search Console's URL Inspection and the **Rich Results Test** fetch as. So
  structured data cannot be validated through those tools until it is covered.
  This is the remaining open gap.
- Applebot, YandexBot and the AI crawlers lost coverage. Declining to serve
  rendered content to training crawlers is a legitimate choice; Applebot feeds
  Siri and Spotlight, which is a search surface rather than a training one.

**Re-measure rather than trusting the table.** One line per agent:

```bash
curl -s -A "Googlebot/2.1" https://kiwicv.kiwicanopy.com/en/blog | wc -c
```

Consequences for verification work:

- **`curl -A Twitterbot` is the safe default** — it has been on the rendered
  side throughout. `-A Googlebot` works today but did not before, so a failed
  check may mean the allow-list moved rather than the tags being missing.
- Raw `curl` with no crawler UA shows nothing: the app is an SPA and the head
  tags are client-rendered.

### Exactly one `<SEO />` is mounted

`<SEO />` lives once, in `src/App.tsx`, and nowhere else. Until 2026-07-23 blog
routes also mounted their own instance; under one `HelmetProvider` that emitted
**two** `<title>`, **two** canonicals and **32** hreflang tags on `/en/blog` and
on every post, and the globally-mounted instance's values won — so each post
served the blog index's canonical, title and OG tags.

A route that needs values the path alone cannot supply publishes them instead:

```ts
useSeoOverride({ title, description, pathWithoutLang, image, noindex, alternates });
```

- `src/store/ui/useSeoStore.ts` holds one override; `src/hooks/useSeoOverride.ts`
  publishes it on mount and clears it on unmount.
- The override records the pathname it was published for, and `<SEO />` ignores
  one whose pathname is not current. That is what stops a stale title surviving
  the gap between the old page's cleanup and the new page's effect.
- `alternates: false` suppresses the hreflang block, for routes whose locale
  variants are not derivable.
- `noindex: true` adds `<meta name="robots" content="noindex, follow">`.

**Do not mount a second `<SEO />` to fix a wrong value.** That has been tried,
and a values-only fix there did not hold.

### Titles

`<title>` carries `seo.{page}.title` — the query-shaped string written for
search results. It previously carried `KiwiCV - {common.pages.*}`, a navigation
label, while the real title went out only as `og:title`.

Two traps that produced that state:

- **`t()` returns the key path on a miss, which is truthy.** So
  `t('seo.x.title') || t('seo.landing.title')` never reaches its fallback and
  ships the literal `seo.x.title` as the page title. The guard is a
  `startsWith('seo.')` check, not `||`.
- **Nothing else may write `document.title`.** `Viewer.tsx` used to, won by
  writing last, and shipped `KiwiCV Resume of Resume` on `/dashboard` — a
  sitemapped route, so a visitor's own name would have become crawled title
  text. (`preview.tab_title` itself is still live: it is the **PDF document
  metadata title**, via `cvTitle` in `themes/shared/translations.ts`.)

⚠️ **The spine stays on _resume_ / _Lebenslauf_, and does not follow the hero.**
Settled 2026-09-08 — `history/DECISIONS.md` § The SEO Spine Stays on
Resume/Lebenslauf. When the landing hero broadened from "CV" to
"application", `seo.ts` deliberately did **not** move with it: the meta
title is what earns the click from a results page and is built on the term
people type, while the hero converts someone who already arrived. The two
surfaces are allowed to differ.

So a sweep that finds _resume_ in `seo.*` while the hero says _application_ has
found the decision, not an oversight. Broadening the spine is an owner call, not
a tidy-up. Cover-letter searches ("Anschreiben Vorlage", "cover letter
generator") get no page and no `seo.*` keys either: `history/DECISIONS.md`
§ No Cover-Letter SEO Pages (2026-10-12).

### Unknown paths

`AppRoutes.tsx` routes `*` inside the language layout to `src/pages/NotFound.tsx`,
which publishes a self-canonical, `noindex, follow`, and no alternates.
`BlogPost`'s `!post` branch does the same. Before 2026-07-23 both rendered the
landing page or the blog index under HTTP 200 with the homepage canonical, so
every typo and stale inbound link became an indexable duplicate of `/`.

**The status code is still 200.** Netlify's SPA rewrite serves `index.html` for
every path and cannot tell a real route from a typo without enumerating the
route table; `noindex` is what removes the indexing risk.

### English URL form

**English is served unprefixed at the origin root; every other locale keeps its
`/xx` prefix.** `/blog` is the English blog; `/de/blog` is the German one.
`localizedPath` in `src/utils/localeRouting.ts` is the single source of that
rule, `scripts/localized-url.cjs` mirrors it for the CJS build scripts, and
`x-default` points at the unprefixed English URL.

Two supersessions, because the intermediate state still reads as plausible:

- Until 2026-07-23 English canonicalized to the bare form while the router,
  every internal `<Link>` and the sitemap emitted `/en/blog` — each page
  disavowing the exact URL everything else pointed at. The fix then was
  to move the canonical to `/en`, matching the links.
- **On 2026-08-16 all of them moved to the bare form together**, which is
  the current state. What made the old state a defect was the disagreement, not
  the bare URL; a canonical of `/blog` is only wrong when the links say `/en/blog`.

⚠️ The `/en/*` 301 is enforced **twice**, and the duplication is the fix, not
sloppiness. The `[[redirects]]` rules in `netlify.toml` never reached
crawlers: the prerender extension is an edge function, edge functions run
before redirects in Netlify's request chain (and that ordering is not
configurable), so bots got a prerendered `200` at the retired URL while
browsers got the `301` — measured 2026-08-30, `x-prerendered: true` on the bot
response. `netlify/edge-functions/en-redirect.js`, declared in `netlify.toml`,
now returns the 301 for every user agent. ⚠️ The prerenderer's edge function
runs even before toml-declared ones — the documented declaration-order rules do
not apply to it (measured on deploy-preview-688) — but it rewrites the bot's
request to `/netlify-prerender-function?url=<original>` and continues the
chain, so `en-redirect` recovers the original URL from that `url` param and its
returned 301 still wins before the rewritten request is fetched. The
`[[redirects]]` rules stay as the browser-facing backstop.
`tests/lint/en-redirect-edge.test.mjs` pins all of it, including the rewritten
shape. Verify with a bot UA, not only a browser one:

```bash
curl -s -o /dev/null -w "%{http_code}\n" -A "Googlebot/2.1" https://kiwicv.kiwicanopy.com/en/blog
```

### Blog posts: alternates and canonicals come from Sanity

Two rules here are the opposite of every other route's, and both look like bugs
to anyone who has read the rest of this page first.

**1. The alternate set is not derived from the locale registry.** Every other
route has the same path in all 15 locales, so `<SEO />` builds its hreflang
block by prefixing one `pathWithoutLang` with each locale. A blog post cannot:
its translations are separate Sanity documents with unrelated slugs
(`kiwicv-origin` / `kiwicv-ursprung`), and it exists only in the languages it
was actually written in. The set is read from the `translation.metadata`
documents that `@sanity/document-internationalization` maintains, and
`BlogPost.tsx` publishes it through `SeoOverride.alternates` as an explicit
array. Looping `LANGUAGES` here would advertise 13 URLs that serve English.

⚠️ **A `translation.metadata` reference can dangle, and GROQ hides it.** The
plugin writes weak references while the target is a draft and strengthens them
on publish; a discarded draft leaves one pointing at nothing. `defined(value)`
is still true for those — the reference object exists — and only `value->`
returns the null slug that gives it away, so both `src/lib/sanity.ts` and
`scripts/generate-sitemap.cjs` filter **after** the dereference. Three such
orphans sat in the production dataset from 2026-05-09 until 2026-08-30, during
which the blog emitted zero hreflang and nothing noticed.

**2. A post's canonical is its own language's URL, never the served URL's.**
`getPosts` falls back to English for any locale with no posts of its own, and
the overview links what it lists, so `/fr/blog/kiwicv-origin` renders the
English article — as do 12 other prefixes. Before 2026-08-30 each of those
self-canonicalized, making 39 URLs claim to be independent copies of 3
articles. `SeoOverride.canonicalLang` pins the canonical to `post.language`, so
they all consolidate onto the 3 real posts. The reader-facing fallback stays:
an empty French blog is worse than an English one.

⚠️ **The pin cannot apply before the fetch resolves.** A post's language is not
knowable until Sanity answers, so between mount and response `/fr/blog/<en-slug>`
still canonicalizes to itself. The route deliberately does not go `noindex`
there either — a prerender snapshot catching that would de-index a live article.
Measurement so far says the prerenderer waits for content (it returned the full
42 KB article), so this window is believed unobservable to crawlers, but it is a
belief about dashboard-side behaviour, not something this repo can assert.

hreflang rides on the canonical view alone — a set published from a page that
canonicalizes elsewhere is ignored — so a fallback view emits `alternates:
false`.

**Reciprocity is the correctness bar.** Google discards a non-reciprocal set
entirely, so each variant names itself and its counterpart.
`tests/lint/sitemap-hreflang.test.mjs` enforces that on the committed sitemap,
along with self-reference, coverage and x-default membership.

## Sitemap

`scripts/generate-sitemap.cjs` runs automatically during `npm run build` and
writes `public/sitemap.xml` under `https://kiwicv.kiwicanopy.com`.

- Static routes include every supported language and full hreflang alternates.
- **`/dashboard`, `/login`, `/account`, `/settings` and `/json` are excluded**
  (2026-07-23). They emit `noindex, follow` instead — see below. The
  sitemap went from 171 URLs to 96.
- The home page is listed **once per language** (`/en`, `/de`, …). It used to
  emit a bare `/` block as well, so identical content appeared under two
  `<loc>` values and neither matched the canonical the page declared.
- `x-default` points at `/{DEFAULT_LANG}{route}`, matching what `<SEO />` emits.
- Blog entries carry no hreflang, matching the pages: a post's translations are
  separate Sanity documents with unrelated slugs, so no alternate set is
  derivable. Per-post hreflang needs a translation-group field in the Sanity
  schema first.
- Sanity blog posts use their published language, slug, and `_updatedAt` value.
- Static `<lastmod>` values remain stable unless
  `npm run sitemap:generate:update-dates` is requested.
- If Sanity is unavailable, the generator preserves existing blog blocks and
  rewrites a former origin to the KiwiCV origin. An offline build must not
  silently remove published posts.
- Published blog slugs were renamed to the KiwiCV brand on 2026-07-22. The
  former `cvcanvas` slugs no longer exist in Sanity, so `brand:check` no longer
  allows them in `public/sitemap.xml`.

### Keeping the sitemap fresh

The committed `public/sitemap.xml` is the only copy that is guaranteed to ship,
so it drifts whenever Sanity content changes without a regeneration commit:

- The generator needs `VITE_SANITY_PROJECT_ID`. Without it, and on any Sanity
  fetch error, it silently reuses the committed blog blocks — a build can
  therefore "succeed" while publishing stale URLs.
- `netlify.toml` only builds production for tagged commits, so a Sanity-side
  slug rename does not reach the deployed sitemap until the next release.

Regenerate and commit `public/sitemap.xml` whenever blog slugs are added,
removed, or renamed in Sanity:

```bash
npm run sitemap:generate
```

Verify the resulting `<loc>` slugs against the live dataset before committing;
`getPostBySlug` matches `slug.current` exactly, so a stale slug is a 404.

## Noindex routes

`NOINDEX_PAGES` in `src/components/ui/SEO.tsx` lists routes that resolve a real
title and description but must stay out of the index: `/login`, `/account`,
`/settings`, `/json` and `/dashboard`. They keep their `<title>` for the browser
tab and for shared links; only the robots directive changes.

⚠️ **Three files have to move together**, and nothing about them is obviously
coupled:

| File                           | Role                                          |
| ------------------------------ | --------------------------------------------- |
| `src/components/ui/SEO.tsx`    | `NOINDEX_PAGES` emits `noindex, follow`       |
| `scripts/generate-sitemap.cjs` | the route must be absent from `STATIC_ROUTES` |
| `public/robots.txt`            | the route must **not** be `Disallow`ed        |

A sitemap entry is a request to index, so listing a `noindex` URL asks Google
for two contradictory things. And `Disallow` is worse than it looks: it blocks
the crawl that would read the `noindex`, leaving the page indexable on inbound
links alone with no snippet. `tests/lint/noindex-sitemap.test.mjs` fails on any
of the three drifting.

`/dashboard` was added on the owner's decision: a crawler received 184 KB of
editor chrome whose only headings were `Edit` and the placeholder `John Doe`,
at sitemap priority 0.7. Reverse it only together with real above-the-fold copy
for logged-out visitors.

## Structured data (JSON-LD)

| Block                                            | Where                     | Emitted by                 |
| ------------------------------------------------ | ------------------------- | -------------------------- |
| `Organization`, `WebSite`, `SoftwareApplication` | site-wide, in an `@graph` | **static** in `index.html` |
| `FAQPage`                                        | landing page              | `<JsonLd />` via Helmet    |
| `Article`, `BreadcrumbList`                      | blog posts                | `<JsonLd />` via Helmet    |

The site-wide three are static **on purpose**: they describe the site rather
than a route, so they need no localization, and raw HTML survives a crawler
that never executes JavaScript — the shell-only failure above. The per-page blocks
have no such option, since their content is per-route.

- Values are always taken from what the page already renders (`faqItems`, the
  fetched `post`), so the structured data cannot drift from what a reader sees.
- Run text through `toPlainText` (`src/utils/structured-data.ts`). Google reads
  the JSON, not the rendered page, so markup left in a value appears verbatim
  in the snippet — FAQ `q1` carries an `<a>` and paragraph breaks.
- `<JsonLd />` escapes `<` so a `</script>` inside a string cannot close the tag
  early and spill the payload into the document as markup.
- ⚠️ `sameAs` must never name a former-brand profile. It was only safe to add
  after the handle moved to `x.com/kiwicvapp`.

⚠️ **The Rich Results Test cannot validate any of this yet** —
it fetches as Googlebot, which currently receives an empty SPA shell.

⚠️ **Sanity's CDN is unreachable from the agent sandbox**, so blog posts render
their not-found branch locally and the `Article` block never mounts. Verify it
on a deploy preview, where Sanity resolves.

## Maintenance

When adding a route:

1. Add it to `VALID_SEO_PAGES` in `src/components/ui/SEO.tsx`.
2. Add localized `title` and `description` values in every locale's `seo.ts`.
3. Add the route to `STATIC_ROUTES` in `scripts/generate-sitemap.cjs` when it
   should be indexed.
4. Run `npm run sitemap:generate`, `npm run brand:check`, and `npm run build`.

Brand-name-only substitutions may be mechanical in every locale. If an SEO
sentence changes semantically, author English first and take the remaining
locales through the translation packet (`.claude/rules/i18n.md`).

## Verification

Fetch with `curl -A Twitterbot` — see the prerender warning above; it is the
agent that has stayed on the rendered side of the allow-list, which `Googlebot`
has not. Check `/`, `/de`, `/blog`, a blog post, and an
unknown path, and confirm every one of these (not `/en/*` — the
retired form 301s for every user agent, browser and bot alike, so there is no
head to count there; confirm the 301 itself with both a browser and a bot UA
instead):

- **exactly one** `<title>`, **one** `<link rel="canonical">`, and one hreflang
  set — a count of two means a second `<SEO />` got mounted somewhere;
- the canonical equals the URL fetched **and** that URL's `<loc>` in
  `public/sitemap.xml`;
- 16 hreflang entries on static routes (`x-default` + 15 locales), 0 on posts,
  0 on the 404;
- `noindex` on an unknown path and on a dead post slug, and nowhere else;
- no title beginning `seo.` and none containing `Resume of Resume`;
- hreflang is reciprocal: `/de/blog`'s `hreflang="en"` href is a page whose
  `hreflang="de"` points back.
- Confirm the single OG image resolves at its canonical absolute URL.
- Validate the sitemap contains the canonical origin and retains Sanity posts
  during an offline build.

**Production only deploys on tagged commits** (`netlify.toml:3`), so merged is
not live — verify against the Netlify deploy preview.

`src/components/ui/__tests__/SEO.test.tsx` covers the tag-count, canonical
form, override, `noindex` and stale-override cases in jsdom, where no network
is involved.

- After Phase 4 deployment, use Search Console and social-preview inspectors on
  the new hostname; do not switch production provider settings in Phase 3.
