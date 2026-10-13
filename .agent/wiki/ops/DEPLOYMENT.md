# Deployment & Environment

> **Last Updated: 2026-10-12** (Sanity CORS admits netlify dev only)

## Contents

- [Overview](#overview)
- [Redirect Configuration](#redirect-configuration)
- [A Tab Left Open Across a Release](#a-tab-left-open-across-a-release)
- [Environments](#environments)
- [Required Environment Variables](#required-environment-variables)
- [Deployment Workflow](#deployment-workflow)
- [CI/CD Pipeline](#cicd-pipeline)
- [`deno.lock` is not ours](#denolock-is-not-ours)
- [Local `netlify build` / `netlify dev` fails installing plugins](#local-netlify-build-netlify-dev-fails-installing-plugins)
- [Monitoring](#monitoring)

## Overview

KiwiCV is a static web application hosted on **Netlify**, with a **Supabase** backend for authentication and database services.

## Redirect Configuration

For Supabase authentication redirects, ensure the following are added to your Supabase project's "Allowed Redirect URLs":

- `http://localhost:5173/**` (Local development, Vite)
- `http://127.0.0.1:5173/**` (Local development, Vite — **the URL Vite actually
  prints**)
- `http://localhost:8888/**` (Local development, `netlify dev` — the port that
  serves the functions)
- `http://127.0.0.1:8888/**` (Local development, `netlify dev`, same reason)

⚠️ **Both loopback spellings are needed, and the IP one is the one a developer
lands on.** `vite.config.ts` pins `host: '127.0.0.1'` — deliberately, because
under Node ≥17 `localhost` resolves to `::1` first — so `npm run dev` advertises
the IP form. Supabase matches redirect URLs as strings, so a `localhost` entry
does not cover `127.0.0.1`: an OAuth round trip started at the printed URL
returns to an address that is not on the list and is dropped at the site URL
instead of back in the app.

This was long invisible, because `127.0.0.1` rendered the migration
gateway rather than the app, so nobody could reach a sign-in button there.

- `https://kiwicv.kiwicanopy.com/**` (Canonical production hostname)
- `https://kiwicv.netlify.app/**` (Default Netlify hostname)
- `https://**--kiwicv.netlify.app/**` (Deploy previews, subject to the exact
  stable Netlify hostname shown by the retained project)

Keep old allow-list entries through the migration window. Phase 4 adds and
tests the KiwiCV hostname before any canonical provider switch.

## A Tab Left Open Across a Release

Every deploy replaces the hashed chunks under `/assets/`, so a tab still running
the previous build asks for files that no longer exist. Two pieces handle it:

- **`netlify.toml` answers a missing `/assets/*` with `404`**, ahead of the SPA
  catch-all. Before, the catch-all served the HTML shell as `200`, and
  `_headers` marked it immutable, so the import died on a MIME error.
  `tests/lint/assets-404.test.mjs` pins the order.
  ⚠️ The 404 still carries `immutable` (`_headers` cannot match on status), so
  a browser that hit a chunk during a rollback keeps that 404 if the same build
  is republished with identical hashes. Accepted: narrower than the old 200, and
  fixing it needs an edge function.
- **`src/utils/staleChunkReload.ts`** listens for Vite's `vite:preloadError`
  (every lazy route import goes through Vite's preload wrapper; measured in the
  build output) and reloads once onto the new build. A second failure within
  10 s surfaces as a real error rather than looping, and offline it never
  reloads. It also covers non-route lazy imports, such as the HEIC converter in
  `PhotoEditor`: a stale tab reloads there too, and the picked photo has to be
  chosen again.

A service worker (offline) must not reintroduce a cache that serves an
old shell pointing at chunks the current deploy no longer has.

## Environments

- **Production**: Hosted on Netlify (linked to `main` branch).
- **Staging/Preview**: Netlify deploy previews for each Pull Request.
- **Local**: `npm run dev` (Vite dev server).

### Local dev servers, and which one serves the functions

⚠️ **Vite does not serve Netlify functions.** On **5173**, every
`/.netlify/functions/*` request is a **404**, so the AI runs fail with
`Could not start background job` and the Google Drive permission check throws
`HANDSHAKE_ERROR` — which in turn leaves `hasDrivePermission` at `null`, so
Drive can never read as active there however the credentials look. Nothing is
broken when that happens; it is the wrong server. Use **8888** for anything
that touches a function.

`.claude/launch.json` is the one file in `.claude/` that is **tracked**
(`.gitignore` uses `.claude/*` plus a `!.claude/launch.json` negation — the
trailing-slash form `.claude/` would silently defeat that negation, because git
will not re-include a file whose parent directory is excluded). It holds no
secrets and is the only record of how to start this project.

It defines three configurations:

- `kiwicv-dev` — port **5173**. The default, and Vite alone: fine for UI work,
  useless for anything that calls a function (see the warning above).
- `kiwicv-netlify` — port **8888**, via `npx netlify dev --offline`. Serves the
  app **and** `netlify/functions/`, so AI, Drive and Stripe flows only work
  here. Allow-listed in Supabase, so OAuth round-trips work too — but it is a
  different origin from 5173, so sessions and any `localStorage`-backed
  credentials do not carry across.
- `kiwicv-dev-alt` — port **5199**, via `--port 5199 --strictPort`. For a second
  concurrent session, e.g. two agents verifying different areas at once.
  OAuth callbacks will **not** work here unless 5199 is added to the allow-list
  above; everything that does not leave the app does.

Vite does not read `PORT` from the environment, so the port has to be passed as
a CLI flag — an `autoPort`-style mechanism that sets `PORT` will not move it.
Add a further entry rather than editing `kiwicv-dev` if you need a third.

## Required Environment Variables

These variables must be set in the Netlify dashboard for the app and functions to work.
For a local checkout, `.env.example` carries the same names with placeholders; a
variable added here is added there too.

> This list is exhaustive as of 2026-07-24, derived from source, not from memory.
> Regenerate it with `git grep -ohE "import\.meta\.env\.[A-Z_]+" -- src/` and
> `git grep -ohE "process\.env\.[A-Z_]+" -- netlify/`. Three variables that had
> never existed in the codebase were listed here until then — see the note below.

### Frontend (Vite)

- `VITE_SUPABASE_URL`: Supabase project URL. (`src/lib/supabase.ts`)
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Supabase anon/public key.
- `VITE_POSTHOG_KEY`: PostHog project key. **Analytics is gated on it** — with no
  key, PostHog never initializes, even in production (`PostHogProvider.tsx:6,8`).
- `VITE_SANITY_PROJECT_ID` / `VITE_SANITY_DATASET`: Sanity CMS for the blog and
  the landing testimonials (`src/lib/sanity.ts`). Without a project ID no client
  is created and every fetcher returns nothing: the blog shows its "no posts"
  state, a post URL its not-found page, the landing no testimonials.
  ⚠️ Sanity's CORS allow-list
  admits `localhost:8888` (`netlify dev`, the `kiwicv-netlify` launch config) but
  not Vite's `5173`, so locally both stay empty under plain `npm run dev`.

### Backend (Netlify Functions)

- `SUPABASE_SERVICE_ROLE_KEY`: Secret key for administrative database access.
- `STRIPE_SECRET_KEY`: Private key for Stripe API calls.
- `STRIPE_WEBHOOK_SECRET`: Secret for validating Stripe webhooks. Read via
  `getStripeWebhookSecrets()` (`lib/stripe-webhook-signature.js:3-4`), not directly.
- `STRIPE_WEBHOOK_SECRET_KIWICV`: Phase 4 signing secret for the additional
  KiwiCV webhook endpoint. Keep the legacy secret until its endpoint retires.
- `GOOGLE_SERVICE_ACCOUNT_KEY`: JSON string of the GCP service account key, used
  for the Vertex AI JWT exchange (`lib/ai/vertex.js:10`).
- `GOOGLE_PROJECT_ID`: GCP project ID for Vertex AI (`lib/ai/vertex.js:206`);
  optional, falls back to `project_id` in the service-account key.
  The **region, model, and API host are hardcoded**, not environment-driven —
  `eu` (multi-region REP endpoint `aiplatform.eu.rep.googleapis.com`) /
  `gemini-3.1-flash-lite` in `lib/ai/constants.js`'s `VERTEX_CONFIG`.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: Google OAuth credentials used to
  refresh Drive access tokens server-side (`lib/google-drive.js:5-10`). They must
  be the client configured as Supabase's Google provider, which issued the
  refresh token. `VITE_GOOGLE_CLIENT_ID` is accepted as a fallback name for the
  ID; nothing in `src/` reads it.

> **Removed 2026-07-24 — these were never real.** `VITE_GITHUB_CLIENT_ID`
> (GitHub sync uses a user-supplied fine-grained PAT, `src/services/github.ts:14-22`,
> not OAuth), `VITE_STRIPE_PUBLISHABLE_KEY` (checkout is a server-side redirect via
> `create-checkout.mjs`; there is no `loadStripe` in `src/`), and
> `GOOGLE_VERTEX_AI_PROJECT_ID` / `_LOCATION` / `_CREDENTIALS` (wrong names — see
> the real `GOOGLE_*` pair above). None of the five appeared anywhere outside this
> page. Setting them in Netlify does nothing.

### Stripe deploy-context isolation

Production uses Stripe live credentials. Netlify Deploy Previews must override
`STRIPE_SECRET_KEY` with a Stripe sandbox value; never expose live Stripe
credentials to a preview. (There is no publishable key to override — the browser
never talks to Stripe directly; `src/services/purchase.ts:26-29` calls
`create-checkout.mjs`, which returns a redirect URL.) After the stable PR preview
URL exists, register its sandbox webhook endpoint and store that endpoint's
signing secret as the Deploy Preview value of
`STRIPE_WEBHOOK_SECRET_KIWICV`. Keep production webhook secrets scoped to
production.

## Deployment Workflow

We maintain a strict separation of build concerns between **local releases** and **remote Netlify deployments** to optimize build times, reduce external dependency failures (e.g. `npx` packages), and ensure absolute type safety and fresh dynamic content.

### Build Command Breakdown

1. **Production Build (`npm run build`)** — _Executed by Netlify and local verification_

   ```bash
   npm run sitemap:generate && tsc -b && vite build
   ```

   - **`npm run sitemap:generate`**: **Critical on Netlify.** Fetches the latest blog posts from Sanity via the API and writes a fresh `public/sitemap.xml` at build time. `VITE_SANITY_PROJECT_ID` and `VITE_SANITY_DATASET` are both set on the site, so this really does run against Sanity rather than falling back to the preserved blog blocks in `generate-sitemap.cjs`.
     - ⚠️ **There is no Sanity deploy webhook.** This page claimed one until 2026-08-29 — "when a content creator publishes a new blog post in Sanity, it triggers a Netlify deploy webhook … always 100% in sync without needing a code release". `netlify api listSiteBuildHooks` returns **zero build hooks**. Publishing a post triggers nothing.
     - **What is true:** blog pages fetch Sanity **client-side at runtime** (`BlogOverview.tsx`, `BlogPost.tsx`), so a new post is visible to readers the moment it is published, with no deploy. It is the **sitemap** that lags, because that is built, not fetched. A post published between releases is live and absent from `sitemap.xml` until the next production deploy — a crawler-visibility gap, not a broken page.
     - ⚠️ **Adding the missing hook would not fix it on its own.** A build hook builds `main`'s HEAD, and the `ignore` gate cancels unless that commit carries an exact tag; between releases it does not. Content-triggered deploys and the tag gate are mutually exclusive as things stand — worth knowing before anyone "restores" the webhook and watches every one of its builds cancel.
   - **`tsc -b`**: Acts as a strict CI gatekeeper. Vite compiles extremely quickly using `esbuild` by stripping types without checking them. Running `tsc -b` on Netlify prevents type-broken code (e.g., from faulty merges) from ever going live.
   - **`vite build`**: Bundles the code into the production `dist/` folder.

2. **Automated Release (`npm run release`)** — _Executed locally only_

   ```bash
   node scripts/release.cjs
   ```

   - Handles version bumping, changelog localization sync, and pre-flight checks.
   - **`npm run check-licenses`**: Runs `npx -y license-checker-rseidelsohn` to scan dependency licenses and outputs `src/assets/licenses.json`. Since dependency changes only happen via code modifications (committed to git), this step is **local-only**. This saves valuable Netlify build minutes and prevents build failures caused by downloading external `npx` tools during remote deploys.

## CI/CD Pipeline

- **Husky**: The pre-commit hook refuses commits on `main`, then runs Prettier and ESLint (and
  `i18n:check` for locale edits) on staged files. There is no pre-push hook.
- **GitHub Actions**: `ci.yml` runs `Lint & Test` and `TypeScript & Vite Build` on every PR to
  `main` and on each push to `main`; both are required checks. `cla.yml` runs the CLA check.
- **Netlify**: Auto-deploys previews for Pull Requests. ⚠️ **Production builds only from a
  tagged commit** — a push to `main` on its own deploys nothing. `netlify.toml`'s build `ignore`
  cancels the build unless the commit is a deploy preview or carries an exact tag:

  ```
  ignore = '[ "$CONTEXT" != "deploy-preview" ] && [ -z "$(git describe --tags --exact-match)" ]'
  ```

  So merging a fix to `main` does **not** put it in front of users. This page said "Tag/Main
  pushes" until 2026-08-29, which reads as _either_ and led to a fix being called shipped when it
  had not built.

  ⚠️ **And pushing the tag does not build either.** Netlify triggers on **branch** pushes, never on
  tag refs — so the automatic build fires on the merge, when the commit still has no tag, and
  cancels itself. Adding or moving the tag afterwards triggers nothing at all. **A deploy has to be
  triggered by hand once the tag is in place** (Netlify UI -> Trigger deploy, or
  `npx netlify deploy --build --prod`).

  ⚠️ An ignored build is reported as state **`error`**, not "cancelled", with
  `Canceled build due to no content change`. That is the gate working, not a broken build — every
  untagged `main` push leaves one in the deploy list. Judge production by the newest deploy that is
  `ready` with `published: yes`, never by the absence of red.

  See [RELEASE_PROCESS.md](RELEASE_PROCESS.md) — the tag plus the manual trigger is the deploy, not
  bookkeeping.

## `deno.lock` is not ours

A `deno.lock` sat tracked at the repo root and drifted whenever local Netlify
workflows ran. It is untracked and gitignored as of 2026-07-21, because **this
is not a Deno project**:

- there is no `deno.json` or `deno.jsonc`;
- the one edge function, `netlify/edge-functions/en-redirect.js`, is
  deliberately import-free — web APIs only — so Deno has no remote modules to
  lock; `tests/lint/en-redirect-edge.test.mjs` pins the import-freeness;
- `netlify.toml` declares `[functions]` with `node_bundler = "esbuild"` for the
  Node functions, and `[[edge_functions]]` only for `en-redirect`;
- the lockfile's `remote` block contained nothing but
  `https://edge.netlify.com/bootstrap/*` — the CLI's own edge runtime, never
  application code.

**The writer was not reproducible on Netlify CLI 26.2.0.** With the file deleted,
none of `netlify build --offline --context deploy-preview`, `netlify dev
--offline`, or an online `netlify dev` recreated it. Older CLI versions
bootstrapped the Deno edge runtime unconditionally; that is the likeliest
origin, and the file is vestigial.

If a future change gives an edge function real imports, Netlify will regenerate
the lockfile. Remove the `.gitignore` entry and commit it deliberately at that
point — do not let it drift back in as a side effect.

## Local `netlify build` / `netlify dev` fails installing plugins

**Remote builds are unaffected. This is purely local**, and there are _two_
stacked causes. Which one you see depends on your npm version.

The site runs the Netlify **Prerender extension**, which is delivered as a URL
tarball and depends on puppeteer. The extension appears in neither
`netlify.toml` nor the site's `plugins` array — only in the build log, as
`Installing extensions: - prerender`.

### 1. npm 12: `EALLOWREMOTE`

```
npm error code EALLOWREMOTE
npm error Fetching packages of type "remote" have been disabled
npm error Refusing to fetch "https://***.netlify.app/packages/buildhooks.tgz"
```

npm 12 changed its defaults to `allow-remote = "none"` and
`allow-git = "none"` as supply-chain hardening. Tarballs sharing a hostname with
the configured registry still install; Netlify serves its extensions from
`*.netlify.app`, a different host, so npm refuses. Nothing in this repository
causes it, and no `.npmrc` is involved.

Ranked responses:

1. **Do not run `netlify dev` locally.** `npm run dev` (plain Vite, in
   `.claude/launch.json`) covers everything except local function testing, and
   deploy previews cover the rest.
2. Opt in per command, persisting nothing:
   ```
   npm_config_allow_remote=root npx netlify dev
   ```
   `root` is the narrowest value that works — URL tarballs as direct
   dependencies only, which is exactly what `buildhooks.tgz` is. Accepted
   values are `all`, `none`, `root`.
3. Use an older toolchain for Netlify commands only (`nvm use 22`, npm 10),
   leaving npm 12's defaults intact everywhere else.

**Do not put `allow-remote=all` in the project `.npmrc`.** That weakens the
default for every install in this repository, for everyone, to work around one
vendor's tarball hosting.

### 2. npm 10 and earlier: puppeteer `EACCES`

Past the first blocker, the next one appears:

```
  npm error path <repo>/.netlify/plugins/node_modules/puppeteer
  Error: ERROR: Failed to set up chrome v143...!
  [cause]: [Error: EACCES: permission denied, open '~/.cache/puppeteer/chrome/....zip']
```

**`~/.cache/puppeteer` can end up owned by `root`** (a one-off `sudo` is
enough). Puppeteer cannot write its Chrome
download there. The giveaway is a `.netlify/plugins/package.json` with no
sibling `node_modules` — the install has never once completed.

Either fix the ownership:

```
sudo chown -R $(whoami) ~/.cache/puppeteer
```

or skip the download, which is enough for build verification and needs no
elevation:

```
PUPPETEER_SKIP_DOWNLOAD=true npx netlify build --context deploy-preview
```

The second was verified on 2026-07-21 under Node 24.18.0 with npm 10.9.4: full
pipeline, real environment variables, functions bundling, exit 0 in 23.6 s.

## Monitoring

- **Netlify Logs**: Used for monitoring backend function performance and errors.
- **Supabase Dashboard**: Used for managing users, database records, and authentication settings.
- **Stripe Dashboard**: Used for tracking payments and customer interactions.
