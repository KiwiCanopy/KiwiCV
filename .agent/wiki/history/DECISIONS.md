# Architecture Decisions

> **Last Updated: 2026-10-12**

## Contents

- [[2026-10-12] One Rule for All Four AI Character Counters](#2026-10-12-one-rule-for-all-four-ai-character-counters)
- [[2026-10-12] No Cover-Letter SEO Pages](#2026-10-12-no-cover-letter-seo-pages)
- [[2026-10-12] A 1-Day Pass Replaces the 90-Day Pass](#2026-10-12-a-1-day-pass-replaces-the-90-day-pass)
- [[2026-10-11] Copyright, Licenses and Contributor Notice After the AGPL Relicense](#2026-10-11-copyright-licenses-and-contributor-notice-after-the-agpl-relicense)
- [[2026-10-08] No Sign-Up Trial, New Pass Prices](#2026-10-08-no-sign-up-trial-new-pass-prices)
- [[2026-10-05] Public GitHub Repos Get Only What the CV Shows](#2026-10-05-public-github-repos-get-only-what-the-cv-shows)
- [[2026-10-05] Privacy Policy Names Pass-Through and GitHub Deletion Scope](#2026-10-05-privacy-policy-names-pass-through-and-github-deletion-scope)
- [[2026-10-05] The pt Locale Is European Portuguese, Informal](#2026-10-05-the-pt-locale-is-european-portuguese-informal)
- [[2026-09-08] The SEO Spine Stays on Resume/Lebenslauf](#2026-09-08-the-seo-spine-stays-on-resumelebenslauf)
- [[2026-07-03] Migration from react-pdf to Typst PDF Engine](#2026-07-03-migration-from-react-pdf-to-typst-pdf-engine)
- [[2026-05-23] Claim-Check Pattern for AI Background Jobs](#2026-05-23-claim-check-pattern-for-ai-background-jobs)
- [[2026-05-15] Shift to Time-Based Free Trial (2 Days)](#2026-05-15-shift-to-time-based-free-trial-2-days)
- [[2026-05-15] Automated Onboarding Transition (Tour -> Modal -> Editor)](#2026-05-15-automated-onboarding-transition-tour---modal---editor)
- [[2026-05-15] Auth UI Globalization & Logic Centralization (v3.3.2)](#2026-05-15-auth-ui-globalization-logic-centralization-v332)
- [[2026-05-14] Unified Version Tracking & Deprecation of `has_visited_intro`](#2026-05-14-unified-version-tracking-deprecation-of-has_visited_intro)
- [[2026-05-14] Dynamic Data-Driven Version Tracking](#2026-05-14-dynamic-data-driven-version-tracking)
- [[2026-05-01] Dual-Naming Architecture for Backups & Exports](#2026-05-01-dual-naming-architecture-for-backups-exports)
- [[2026-05-01] Unified Cloud Operation Feedback & API Hardening](#2026-05-01-unified-cloud-operation-feedback-api-hardening)
- [[2026-05-01] Unified Cloud Sync Gateway & Tactile 3D Aesthetics](#2026-05-01-unified-cloud-sync-gateway-tactile-3d-aesthetics)
- [[2026-04-27] Mobile Resilience & Optimistic Auth Strategy](#2026-04-27-mobile-resilience-optimistic-auth-strategy)
- [[2026-04-24] Deprecation of "Clean JSON" Export Option](#2026-04-24-deprecation-of-clean-json-export-option)
- [[2026-04-24] Berlin-Aligned Premium Calculations](#2026-04-24-berlin-aligned-premium-calculations)
- [[2026-04-24] Universal Background AI Processing (Asynchronous First)](#2026-04-24-universal-background-ai-processing-asynchronous-first)
- [[2026-04-20] Marketing-Driven "What's New" Highlights & Tour System](#2026-04-20-marketing-driven-whats-new-highlights-tour-system)
- [[2026-04-19] Standardized Responsive Layout Architecture (Globalized)](#2026-04-19-standardized-responsive-layout-architecture-globalized)
- [[2026-04-19] Wiki-First Documentation System](#2026-04-19-wiki-first-documentation-system)
- [[2026-03-15] TailwindCSS v4 Adoption](#2026-03-15-tailwindcss-v4-adoption)
- [[2026-02-10] Custom i18n System (No i18next)](#2026-02-10-custom-i18n-system-no-i18next)
- [[2026-01-20] Unified Theme Architecture (Modular)](#2026-01-20-unified-theme-architecture-modular)
- [[2025-12-05] Vertex AI (Gemini 3 Flash) via Netlify Functions](#2025-12-05-vertex-ai-gemini-3-flash-via-netlify-functions)
- [[2025-11-15] Zustand for State Management](#2025-11-15-zustand-for-state-management)
- [[2025-10-01] JSON Resume Schema Adoption](#2025-10-01-json-resume-schema-adoption)

This document is a historical record of the major architectural decisions taken during the **CVCanvas** era (the project has since rebranded to **KiwiCV**). It preserves the context for _why_ things ended up the way they are; entries describe the reasoning at the time they were made and are not rewritten to match later branding.

## [2026-10-12] One Rule for All Four AI Character Counters

- **Decision** (owner, 2026-10-12): every AI character counter (job ad, custom instructions, composer, cover-letter writing sample) uses the writing sample's three zones and speaks the count to screen readers. A polite live region announces only when an edit changes the zone, and every counter is in its field's description. The shared keys have neutral names: `ai.chars_used` (renamed from `ai.composer_chars_used`), `ai.char_limit_near` and `ai.char_limit_reached` (which replace the writing-sample-only `ai.style_sample_*_limit`).
- **Rationale**: the per-site props `warnNearLimit` and `spokenCount`, kept when the four hand-written counters became one component, were left over from those copies, not rulings. Red at 90% says "error" before anything is dropped, and a cap that silently stops input needs the same feedback in every field.
- **Consequence**: `CharCounter` takes no per-site behaviour props. `useCharCapNotice` supplies all of its required props (`id`, `length`, `limit`, `notice`) and wraps the field's `onChange`. The types stop a site from giving the counter a limit the announcer did not use; they do not stop a site from skipping `track` or `aria-describedby`, which `CharCounter.test.tsx` checks at the four sites it lists. The convention lives in [code/UI_PATTERNS.md](../code/UI_PATTERNS.md) § CharCounter.
- **Status**: Active.

## [2026-10-12] No Cover-Letter SEO Pages

- **Decision** (owner): cover-letter search demand gets **no** indexed page and **no** new `seo.*` keys. The spine entry below left this open; it is now closed as "nothing".
- **Rationale**: the letter is written inside the editor's Cover Letter section, needs a Premium Pass and a job ad, and a page ranking for _"free cover letter generator"_ would land a visitor on a paywall, the kind of claim `landing.sections.faq.q6` commits KiwiCV against. A key without a route has nothing to rank.
- **Consequence**: `STATIC_ROUTES` and `SEO.tsx` stay as they are. Letter-writing advice may still appear as blog posts, which are sitemapped per post and need no route; a post is content, not a reversal of this entry.
- **Status**: Active.

## [2026-10-12] A 1-Day Pass Replaces the 90-Day Pass

- **Decision** (owner): the Passes are 1, 7 and 30 days. A 1-day Pass (`pro_1_days`) is added at a low price, and the 90-day Pass is removed. Amounts in `priceCents` in `src/components/monetization/pricing/catalog.tsx`. The 7-day Pass moves to €13.99 so the per-day steps read €2.99 / €2.00 / €1.00.
- **Rationale**: with no trial, the cheapest way to try the AI was the 7-day Pass. The 1-day Pass is priced to make trying it an easy decision, not for margin. Three cards are simpler than four, and a long search is covered by stacking 30-day Passes.
- **Consequence**: the owner created the `pro_1_days` Stripe price. `pro_90_days` stays active in Stripe (owner, 2026-10-12): checkout accepts any `pro_` lookup key, so a crafted request can still buy 90 days at the old price, and gets exactly what it paid for.

## [2026-10-11] Copyright, Licenses and Contributor Notice After the AGPL Relicense

- **Decision** (owner, all as recommended in the relicense discussion):
  1. **Footer**: `© {year} Maikel Hajiabadi · Open source (AGPL-3.0)`, the license part linking to the public repository (`BRAND_CONFIG.external.source`). "All rights reserved" is gone: under the AGPL the rights are licensed, and the holder is the person, not the product.
  2. **Templates and exports**: templates are `AGPL-3.0-only`. An additional permission under AGPL § 7 (`LICENSE-EXCEPTION.md`, README § License) makes generated CVs and cover letters, including template code embedded in an HTML export, the user's to use under any terms.
  3. **Logos**: the files stay in the repository; `TRADEMARKS.md` states that the KiwiCV and KiwiCanopy names and logos are not under the AGPL and that forks must rebrand.
  4. **Contributor privacy notice**: a short section in `CLA.md`, linked from the CLA bot comment. It stays out of the app's privacy policy, which would force a re-consent prompt on users the processing does not touch.
  5. **CLA under German law**: risk accepted for now (KiwiDesk runs the same CLA); counsel before merging the first substantial outside contribution.
- **Rationale**: the footer link doubles as the AGPL § 13 source offer, so the app needs no separate "source code" link; the Open Source Licenses dialog carries the same label and URL (owner, 2026-10-12). The owner, as sole copyright holder, is not bound by § 13, but the README promises the source.
- **Consequence**: `common.footer.copyright` was removed; the footer renders the year and `RESPONSIBLE_NAME` directly and translates only `common.footer.open_source`, so the holder's name lives in one constant rather than fifteen locale strings; the sign-in page's © line uses the same constant. It ships with the next `--legal` release, together with the repository going public, since the link is a 404 until then.
- **Status**: Implemented.

## [2026-10-08] No Sign-Up Trial, New Pass Prices

- **Decision** (owner): new accounts no longer receive the 2-day Pro trial, and the Pass prices are raised (amounts in `priceCents` in `src/components/monetization/pricing/catalog.tsx`).
- **Rationale**: the trial was retired as an owner product call.
- **Consequence**: `handle_new_user` no longer writes `used_freebies` or `premium_until`. With no trial left to protect, the stored email hashes had no purpose (GDPR Art. 5(1)(e)), so the table, its cleanup cron and privacy policy §7 "Preventing Trial Abuse" go too; account deletion now has no exception. At release the live `handle_new_user` is replaced, the `cleanup_old_used_freebies` cron job is unscheduled and the table is dropped, all by hand (`schema.sql` is never applied). The sign-in trial banner and the landing hero's "try the AI free" claim are gone. Stripe prices are matched by lookup key, so the owner swaps the prices in Stripe; the code holds the amounts in `catalog.tsx`, which must match the Stripe price behind each lookup key.
- **Supersedes**: [2026-05-15] Shift to Time-Based Free Trial (2 Days).

## [2026-10-05] Public GitHub Repos Get Only What the CV Shows

- **Decision**: A GitHub backup writes the full store only to a repository that is confirmed private **and** not published through Pages (`repoInfo?.private === true && repoInfo.has_pages !== true`, `src/hooks/sync/githubSync.ts`). Every other repository, including one whose visibility cannot be read, gets `getPublicBackupData`: the `reduced` tier plus the design. The GitHub sync settings warn that making a repository public later exposes its whole history.
- **Rationale**:
  1. Anyone can read a public repository, and Pages can publish a private one. The full store would add hidden entries and the cover-letter recipient — third-party personal data — to that.
  2. A private, unpublished repo is the user's own storage, on a par with localStorage and Drive, which already hold everything.
  3. Git history cannot be erased by a later fix, so the default has to be the safe one.
- **"What the CV shows" means what the user has not hidden**, independent of the theme: fields a two-column sidebar does not print ("main column only") stay in. A layout-tied projection would change the public file on every theme switch.
- **Address**: the parts the CV prints anywhere stay — the contact line follows the custom `addressSchema`, and the footer prints `City, CC` whatever the schema says, so those two stay while the footer is on (`shownLocationFields`).
- **References stay**, though they are third-party data: they are on the CV by the user's choice, and Pages already publishes them rendered. The public-repo warning names them.
- **The design travels** (owner, on review): `meta` comes along so a restore keeps theme, layout and labels — minus `hiddenIds`, a hidden section's renamed heading, and a footer location while the footer is off. Accepted exposure: `order` and `hiddenSections` still name a hidden custom section's id, which carries no content.
- **The exported PDF leaves the cover letter out** in such a repo (owner, on review) — its recipient is a third party. Only when the user exported a PDF at all; it costs one extra Typst compile. The downloaded PDF is unchanged.
- **Fail closed**: `reducedExportPublic.test.ts` snapshots every key path a public repo receives, with every optional theme param filled, so a new field cannot reach one unexamined.
- **Consequence**: a public-repo backup cannot restore hidden entries, the cover letter or pass-through blocks. Accepted.
- **Status**: Implemented. The policy change re-prompts users only when the release is cut with `npm run release <type> -- --legal`.

## [2026-10-05] Privacy Policy Names Pass-Through and GitHub Deletion Scope

- **Decision**: Amend `legal.ts` §4 to state that unused imported blocks (pass-through) are kept to keep the file intact for other tools, and travel to Drive and to the private GitHub backups that receive the full store; amend §7 "Scope of Deletion" to name GitHub backups next to localStorage and Drive. One `LAST_LEGAL_UPDATE` bump, shipped together with the public-repo rule above.
- **Rationale**: the current text is not wrong but incomplete — Art. 13 GDPR asks for purpose and recipients, and a §7 list that names two untouched stores reads as exhaustive.
- **Status**: Implemented; ships with a `--legal` release.

## [2026-10-05] The pt Locale Is European Portuguese, Informal

- **Decision**: `pt` is European Portuguese addressing the user with informal _tu_, matching German _du_. The Brazilian strings (`Excluir`, `seção`, `Tem certeza`, _você_/_seu_/_sua_ forms) are brought in line by one consistency pass through the handoff packet. The working rule lives in `.claude/rules/i18n.md` § Voice.
- **Status**: Decided; the consistency pass is still open.

## [2026-09-08] The SEO Spine Stays on Resume/Lebenslauf

- **Decision**: When the landing hero broadens from "CV" to "application" (unblocked now that the cover-letter epic has shipped), `src/locales/*/seo.ts` does **not** move with it. Meta titles and descriptions stay built on _resume_ / _Lebenslauf_.
- **Rationale**:
  1. **The hero and the meta title are different surfaces with different jobs.** The meta title is what earns the click from a search results page; the hero converts a visitor who has already arrived. There is no cost to them differing, and no requirement that a copy sweep move both.
  2. **"Resume" / "Lebenslauf" is the query; "application" / "Bewerbung" is a category.** Broadening the spine trades a term people type for one that competes against job boards and application-advice sites rather than against CV builders.
- **Consequence**: `seo.ts` is an explicit out-of-scope for the hero copy sweep, recorded so a later "tidy the CV wording" sweep does not pick it up as an oversight. The English titles stay exactly as `src/locales/en/seo.ts` ships them, quoted here verbatim so a sweep told to "restore the recorded values" cannot shorten one:
  - `dashboard.title` — _KiwiCV - Free Resume Templates & AI Optimization_
  - `extras.title` — _KiwiCV - Resume Features & Philosophy_
  - `json.title` — _KiwiCV - JSON Resume Export | Your Resume as Raw Data_
  - `cvs.title` — _KiwiCV - My CVs | Every Saved Resume Version_

  ⚠️ **The spine is not uniform across all thirteen page keys, and this decision does not make it so.** `notice`, `terms` and `withdrawal` carry no _resume_ term at all, and three descriptions already say _application_ (`blog` "modern application strategies", `notice` "the application process", `settings` "full control over your application"). Those are correct as they are: the decision protects the **searched term in the titles that compete for it**, not a word count. `de` is the same shape — 10 of 13 titles on _Lebenslauf_.

- **Cover-letter pages**: settled separately as "none", see § No Cover-Letter SEO Pages (2026-10-12).
- **Status**: Active.

## [2026-07-03] Migration from react-pdf to Typst PDF Engine

- **Decision**: Replace `@react-pdf/renderer` with a Typst-based engine that compiles resume templates directly to PDF in the browser via WebAssembly (`@myriaddreamin/typst.ts`). Typst becomes the **sole** PDF engine; `react-pdf` is removed as a dependency.
- **Rationale**:
  1. **One Source, Two Outputs**: A single self-hostable Typst source produces both the layout logic and a high-fidelity, print-quality PDF, removing the drift between the HTML preview and the exported PDF.
  2. **In-Browser WASM**: Compilation runs client-side in a Web Worker via the Typst WASM compiler, so no server round-trip is needed and no PDF rendering credentials/infrastructure are required.
  3. **Fidelity & Constraints**: The former react-pdf path carried unique constraints (hex-only colors, zero inline styles, disabled hyphenation to avoid "noglyph" errors). Typst delivers richer typography and layout control without those workarounds.
- **Consequence**: All themes (one-column: Elegant, JavaScript, Plain, Plain2, StackOverflow, Timeless; two-column: Foggy, Lunar, Misty, Skyline, Soft, Swiss-Grid) render through Typst. The legacy engine doc is archived at `.agent/wiki/history/PDF_ENGINE_REACT_PDF.md`; the current engine is documented in `.agent/wiki/code/PDF_ENGINE_TYPST.md`. No `react-pdf` code or comments remain in the codebase.
- **Status**: Implemented (react-pdf dropped from `package.json` in the same commit); react-pdf engine formally archived 2026-07-23.

## [2026-05-23] Claim-Check Pattern for AI Background Jobs

- **Decision**: Store heavy AI request data (raw CV file text/base64, options) in a `payload` `jsonb` column on `public.ai_jobs` before invoking a Netlify background function, and pass only the lightweight job id in the HTTP request. The worker reads the payload back from the database.
- **Rationale**: Netlify background functions enforce a strict **256 KB** request payload limit. An uploaded PDF or DOCX easily produces a base64/raw-text payload that exceeds this, so Netlify rejected the HTTP request before the function ever ran. Because the client did not check the HTTP status, it then polled the database indefinitely ("CV Import loading forever"). The Claim-Check pattern keeps the request tiny while the bulk data travels through the database out-of-band.
- **Consequence**: `ai_jobs` gained a `payload jsonb` column; background workers (`parse-cv-background.mjs`, `improve-cv-background.mjs`) select it on start and clear it (`payload: null`) on completion so the temporary document data is not retained. The privacy policy's `privacy.sections.8.temporary_storage` block was updated across all 14 locales to disclose this temporary storage.
- **Status**: Implemented.

## [2026-05-15] Shift to Time-Based Free Trial (2 Days)

- **Decision**: Replace the legacy "5 Welcome Credits" bonus with a mandatory **2-day Pro Trial** for all new users upon registration.
- **Rationale**:
  1. **Cognitive Ease**: New users often find "credits" abstract. A "2-day free trial" is a universally understood value proposition.
  2. **Feature Discovery**: By granting full Pro access, users can explore all premium features (Full AI Match, Section Optimization, Theme Export) without feeling "metered" or afraid to waste limited credits.
  3. **Marketing Strength**: A time-based trial creates a stronger sense of urgency and perceived value compared to a fixed credit amount.
- **Legacy Note**: The previous system granted 5 credits (initially 3) via the `handle_new_user` trigger. This has been deprecated in favor of the `add_timepass` logic which rounds expiration up to the end of the next day (Berlin time).
- **Status**: Superseded on 2026-10-08 — new accounts get no trial.

## [2026-05-15] Automated Onboarding Transition (Tour -> Modal -> Editor)

- **Decision**: Implement an automated, zero-friction transition from the "Welcome Tour" completion to the "Upload Modal," and force navigation to the "Dashboard Editor" after any successful resume import (manual, paste, or AI).
- **Rationale**:
  1. **UX Momentum**: New users who finish the tour are primed to start their CV. By automatically opening the import modal, we eliminate the need for them to "find" the next step, significantly reducing bounce rates during onboarding.
  2. **Predictable Navigation**: Regardless of where a user starts an import (Landing page, Dashboard, or Settings), successful completion should land them exactly where they can see and edit the result: the Editor. This ensures a consistent and rewarding outcome for the primary user action.
  3. **Non-Intrusive Redirection**: Using React Router's search params (`?tab=editor`) allows the app to switch views without a full page reload, maintaining the "premium app" feel.
- **Status**: Implemented in `MainLayout.tsx`, `ImportModal.tsx`, and `AIImportModal.tsx`.

## [2026-05-15] Auth UI Globalization & Logic Centralization (v3.3.2)

- **Decision**: Centralize all authentication UI and logic into a single `AuthView` component and migrate all duplicate localization strings to a dedicated `auth` namespace.
- **Rationale**:
  1. **UX Consistency**: Auth UI was fragmented across the Login page, Account page, and Google Auth modal. Unifying them ensures that marketing benefits, legal checkboxes, and button states are identical everywhere.
  2. **Reduced Debt**: Eliminated 50+ duplicate strings across 14 languages. Centralizing these keys prevents "translation drift" where one login entry point says something different than another.
  3. **High Agency Development**: By making `AuthView` fully self-contained (managing its own checkbox states and sign-in handlers), we simplified the parent pages from ~150 lines down to ~20 lines, making them easier to maintain.
- **Status**: Implemented in `AuthView.tsx`, `Login.tsx`, and `GoogleAuthModal.tsx`.

## [2026-05-14] Unified Version Tracking & Deprecation of `has_visited_intro`

- **Decision**: Consolidate all onboarding and update-tracking logic into a single `cv_canvas_last_seen_version` localStorage key, removing the redundant and legacy `has_visited_intro` flag.
- **Rationale**:
  1. **Source of Truth**: Managing multiple flags for "first visit" vs "onboarding completed" vs "last seen version" created complex and error-prone logic in `MainLayout.tsx`.
  2. **Simplified Onboarding**: A missing version key now explicitly identifies a "New User" (triggering the Welcome Tour), while an existing but older version key identifies a "Returning User" (triggering the What's New modal).
  3. **Robust Analytics**: `APP_FIRST_VISIT` events are now tied directly to the absence of a version history, ensuring more accurate tracking of new platform entries.
- **Status**: Implemented in `MainLayout.tsx`.

## [2026-05-14] Dynamic Data-Driven Version Tracking

- **Decision**: Implement a purely data-driven "What's New" fallback for legacy users and remove hardcoded version fallbacks (like `0.0.0`).
- **Rationale**: Instead of magic strings, we use the `changelog` data as the source of truth. Legacy users default to `changelog[1].version` (ensuring they see the current release), and the app's `currentVersion` defaults to `changelog[0].version` if Vite injection fails. This makes the system fully self-healing and data-consistent.
- **Status**: Implemented in `MainLayout.tsx`.

## [2026-05-01] Dual-Naming Architecture for Backups & Exports

- **Decision**: Implement a strict separation of concerns for project naming: Internal JSON backups preserve full structural metadata (`_position_`, `_company_`, etc.), while user-facing exports (folders, ZIPs) strip these keys for clean presentation.
- **Rationale**:
  1. **Zero Data Loss**: Embedding metadata directly into the JSON filename ensures that tags (Company, Position, Theme) are never lost during cloud syncing across different devices or if a user manually manages files on Drive/GitHub.
  2. **File System Safety**: Users expect clean, professional folder names (e.g. `MyResume_Engineer_Google`). Forcing the raw metadata schema string into export folders created ugly paths and triggered false-positive collision warnings on Google Drive.
  3. **UI Elegance**: The split allows the Cloud Management UI to parse the metadata string back into beautiful, color-coded badges without compromising the actual file structure exported to the user.
- **Status**: Implemented via `constructBackupFilename`, `parseBackupFilename`, and `getCleanProjectName` in `src/utils/export.ts`.

## [2026-05-01] Unified Cloud Operation Feedback & API Hardening

- **Decision**: Standardize all cloud-interactive operations (Push, Sync, Restore, Delete) to follow a high-fidelity "Loading → Success/Error" modal sequence and force strict GitHub API versioning (`2026-03-10`).
- **Rationale**:
  1. **UX Integrity**: Background cloud operations were previously inconsistent; some were silent while others used modals. Standardizing on the `useConfirmStore` implementation ensures that users always receive immediate visual confirmation of destructive or high-impact cloud actions.
  2. **API Stability**: GitHub's REST API is moving towards explicit versioning snapshots. By centralizing the version header in `src/constants/cloud.ts` and injecting it globally via `GitHubService.ts`, we shield the application from breaking upstream changes and ensure consistent behavior across all repositories.
  3. **Prevention of Accidental Data Loss**: Forced a two-stage confirmation for all restorations, ensuring that users must explicitly acknowledge that local data will be overwritten before the process starts.
- **Status**: Implemented in `useSyncWorkflow.ts`, `useCloudRestorePrompt.tsx`, and `GitHubService.ts`.

## [2026-05-01] Unified Cloud Sync Gateway & Tactile 3D Aesthetics

- **Decision**: Centralize all cloud-authentication and setup logic into a reusable `useSyncAuthGateway` hook and deepen the system-wide 3D tactile effects for premium buttons.
- **Rationale**:
  1. **Gateway Logic**: As cloud-interactive buttons moved into multiple locations (Export Modal, Dashboard Header, Settings), the logic for checking PATs, Drive permissions, and user sessions became fragmented. Abstracting this into a single "Ensure Connected" gateway ensures perfect consistency and easier maintenance.
  2. **Proactive Setup**: By enabling "Save" buttons even for empty resumes, we transition from a "reactive" (show only when needed) to a "proactive" (guide the user to setup early) onboarding model.
  3. **Visual Depth**: Calibrating 3D shadow depth to 4px (default) and 5px (hover) provides a more expensive, tactile feel that better distinguishes primary actions from flat UI elements.
- **Status**: Implemented in `useSyncAuthGateway.ts`, `CloudBackupManagement.tsx`, and `index.css`.

## [2026-04-27] Mobile Resilience & Optimistic Auth Strategy

- **Decision**: Implement a dual-layer authentication initialization using an optimistic `localStorage` cache and a mandatory 5-second "Safety Fuse" on all profile fetching.
- **Rationale**: A critical bug in the Supabase library was causing infinite hangs and automatic logouts on mobile browsers (specifically iOS Safari/Chrome). By reading a versioned (`v1`) profile cache instantly on startup, we unlock the UI without waiting for the database. The 5-second safety fuse ensures that even if the library locks up, the loader is forced to close, allowing the user to proceed with cached data.
- **Security**: Cached data is filtered to remove sensitive internal identifiers (e.g., Stripe IDs) and is explicitly wiped upon logout to prevent data leakage on shared devices.
- **Status**: Implemented in `AuthProvider.tsx`.

## [2026-04-24] Deprecation of "Clean JSON" Export Option

- **Decision**: Remove the "Clean JSON" (`clean`) export option from the platform and state.
- **Rationale**: The "Clean JSON" option (stripping internal metadata like `_vId` and visibility flags) was intended for external compatibility but created friction during "round-trip" synchronization (export -> re-import). By standardizing on the full JSON schema for all exports, we ensure 100% state restoration and reduce UI complexity. The `sanitizeResumeData` logic was updated to strip this legacy field during import/restoration to maintain state integrity.
- **Status**: Implemented.

## [2026-04-24] Berlin-Aligned Premium Calculations

- **Decision**: Align `premium_until` timestamps in the database with the **Europe/Berlin** timezone and the **00:00:00** daily limit reset boundary.
- **Rationale**: Previously, premium was calculated as an absolute 24-hour interval from the moment of purchase in UTC. This caused two issues:
  1. **Daily Limit Gaps**: Users could have remaining "Pro requests" for the day but be unable to use them if their premium expired mid-day.
  2. **DST Inconsistency**: Absolute intervals could result in wall-clock shifts during Daylight Saving transitions.
- **Implementation**: Modified `add_timepass` to use `AT TIME ZONE 'Europe/Berlin'` and round expiration UP to the end of the day (midnight), ensuring consistency with the `get_ai_usage_status` RPC.
- **Status**: Implemented.

## [2026-04-24] Universal Background AI Processing (Asynchronous First)

- **Decision**: Transition ALL AI content generation tasks (Full CV, Sections, and individual Items) to a background worker pattern using Supabase-based job tracking and frontend polling.
- **Rationale**: Synchronous Netlify functions have a 10s timeout limit. Slow AI responses (especially for high-density sections) were causing frequent 500 errors. Moving to a background flow decoupled from the HTTP request life-cycle ensures 100% reliability even for slow generations.
- **Status**: Implemented. Redundant synchronous `improve-cv.js` deleted.

## [2026-04-20] Marketing-Driven "What's New" Highlights & Tour System

- **Decision**: Replace the simple version update alert with a premium, marketing-driven `WhatNewModal` and an integrated feature tour that aggregates missed highlights across versions.
- **Rationale**: As CVCanvas evolves, major features (like Cloud Sync or AI Import) need prominent visibility to drive engagement. A simple text list was insufficient. The new system uses version-specific metadata (`_highlights`) to generate interactive badges and triggers a targeted walkthrough using existing `data-tour` IDs, ensuring users never miss critical platform upgrades.
- **Status**: Implemented.

## [2026-04-19] Standardized Responsive Layout Architecture (Globalized)

- **Decision**: Implement a mandatory `ModalContainer` and an enhanced `PageContainer` with a centralized 80% responsive height constraint on mobile, managed via CSS variables (`--h-responsive-mobile`) and semantic utilities (`h-responsive`).
- **Rationale**: Previously, height constraints were fragmented (75vh vs 80vh vs 90vh). Centralizing these values in `index.css` and using semantic props in components ensures a premium "app-like" feel with consistent scrolling behavior across all overlays and settings pages. It also allows for instant global adjustments if the viewport requirements change.
- **Status**: Implemented.

## [2026-04-19] Wiki-First Documentation System

- **Decision**: Migrate from scattered `.agent/workflows/` to a centralized `.agent/wiki/` system.
- **Rationale**: Workflows were becoming fragmented. A centralized wiki with 300-line modular limits ensures agents always have the most relevant, up-to-date context without being overwhelmed.
- **Status**: Implemented.

## [2026-03-15] TailwindCSS v4 Adoption

- **Decision**: Use TailwindCSS v4 for all new styling.
- **Rationale**: v4 offers significant performance improvements, a zero-runtime engine, and better developer experience.
- **Status**: Active.

## [2026-02-10] Custom i18n System (No i18next)

- **Decision**: Implement a custom modular locale system instead of using `i18next`.
- **Rationale**: Reduced bundle size and simplified integration with the modular theme system. TypeScript's native type checking for locale keys provides better safety than third-party libraries.
- **Status**: Active.

## [2026-01-20] Unified Theme Architecture (Modular)

- **Decision**: Split themes into `helpers/HTML/`, `helpers/PDF/`, and `helpers/shared/`.
- **Rationale**: Previously, HTML and PDF logic were often tangled. This modular split ensures that PDF-specific constraints (like hex-only colors and no inline styles) don't bleed into HTML, while shared logic (like date formatting) is DRY.
- **Status**: Active (Foggy is the reference implementation).

## [2025-12-05] Vertex AI (Gemini 3 Flash) via Netlify Functions

- **Decision**: Use Google Vertex AI (Gemini 3 Flash) for the "Improve with AI" feature.
- **Rationale**: Flash offers the best balance of speed, cost, and quality for text refinement tasks. Netlify Functions provide a secure, serverless bridge to the API.
- **Status**: Active.

## [2025-11-15] Zustand for State Management

- **Decision**: Use Zustand with modular slices for resume data and UI state.
- **Rationale**: Zustand is significantly more lightweight than Redux and avoids the "prop drilling" and re-render issues of standard React Context for complex, fast-changing states like real-time resume editing.
- **Status**: Active.

## [2025-10-01] JSON Resume Schema Adoption

- **Decision**: Use the [JSON Resume](https://jsonresume.org/schema/) schema as the core data model.
- **Rationale**: Interoperability with other resume tools and a battle-tested structure for resume data.
- **Status**: Core requirement.
