# JSON Export & Import System

> **Last Updated: 2026-10-12**

## Overview

Two independent paths, often confused:

- **Export tiers** (`getFilteredResumeData`) shape `ResumeData` for the Raw JSON page; `getPublicBackupData` — the `reduced` tier plus the design — is what a GitHub repo anyone can read receives.
- **Import sanitization** (`sanitizeResumeData`) coerces untrusted JSON back into `ResumeData`.

`getFilteredResumeData` is read by `src/pages/RawJsonData.tsx` and by `getPublicBackupData`, which `src/hooks/sync/githubSync.ts` writes to a repo that is public, published by Pages, or of unreadable visibility. Every other export path — download, ZIP, Drive, a private unpublished GitHub repo — serializes the whole store through `stringifyResume`.

## The export package: `buildExportArtifacts`

`src/hooks/export/buildExportArtifacts.ts` is the single place an export's deliverables are
produced — `stringifyResume(resume)`, the themed HTML, and the Typst PDF. Every
destination consumes its `ExportArtifacts`; none of them compiles, renders or serializes on
its own. That is a hard requirement, not a tidy-up: all three used to do it themselves, and
all three go through one Typst worker that handles a single request at a time, so a run
targeting three destinations paid the compile three times. See
[ops/SYNC_FLOWS.md § 1b](../ops/SYNC_FLOWS.md) for the run itself.

The snapshot in an export is the **store object as `stringifyResume` writes it**
(`src/utils/passthrough.ts`), unfiltered — except to a GitHub repo anyone can read,
which gets the `reduced` tier (below). `stringifyResume` differs from
`JSON.stringify(resume)` in one way: the `passthrough` block is unpacked back to the
top level, so a file imported with unknown blocks exports with the same keys.
Every JSON writer — `getExportFiles`, `buildExportArtifacts`, Drive and GitHub sync,
the Raw Data `full` tab — goes through it; a new writer must too, or it exports a
`passthrough` key no other tool understands.

Two deliberate exceptions. The **GitHub** backup writes the full store only when
`repos.get` confirms the repo is private and not published by Pages; any other repo
gets the `reduced` tier, because git history outlives any later removal (DECISIONS.md 2026-10-05). The public backup is that tier plus the design (`meta`
without `hiddenIds`, `getPublicBackupData`), so restoring from it brings back what the CV
showed, in its look — no hidden entries, cover letter or pass-through blocks. A `full`
export there also pushes its PDF without the cover letter. The **migration backup** (`migration-backup.ts`)
dumps the raw stored store, nested `passthrough` and all: it is a rescue copy, and
`collectPassthrough` reads the nested form back on import.

`getExportFiles` in `src/utils/export.ts` still describes the ZIP's three-file manifest and
is covered by its own tests, but nothing in `src/` reads it any more: the ZIP is written
from `ExportArtifacts` directly.

`normalizeHostingPath` (same file) turns the user's GitHub Pages target path into a
repository file path. The stored default `'/docs'` is truthy, so the old
`|| 'docs/index.html'` fallback in the hosting push never fired and the literal `/docs`
reached the Contents API as a `path`.

## Export tiers: `getFilteredResumeData`

`src/utils/resume-export.ts`. Signature takes `'standard' | 'reduced'`; **`full` is not a value it accepts** — the page renders `toResumeJson(resume)` for that tab.

| Tab in `RawJsonData` | Produced by                           | Filename           | Contents                                        |
| :------------------- | :------------------------------------ | :----------------- | :---------------------------------------------- |
| `full`               | `toResumeJson(resume)`                | `{name}_full.json` | Everything, `meta` included. Backups, restores. |
| `standard`           | `getFilteredResumeData(r,'standard')` | `{name}.json`      | Drops `meta`. Third-party parsers.              |
| `reduced`            | `getFilteredResumeData(r,'reduced')`  | `{name}.json`      | The public tier — see below.                    |

### What `reduced` actually removes

More than "internal metadata". In order (`getFilteredResumeData`):

1. **`meta`** — inherited from the `standard` step it builds on.
2. **`passthrough`, entirely** — blocks KiwiCV does not model stay out of
   public JSON; `standard` and `full` keep them at the top level,
   since third-party parsers and restores are their audience.
3. **`coverLetter`, entirely**. Deliberate: a letter targets one company and carries recipient PII, so it has no place in a publicly hostable export. `standard` and `full` keep it.
4. **Every hidden item and every entry of a hidden section**: the twelve hideable array sections, **plus** `basics.profiles`, which is filtered separately because it is nested under `basics`. The test is the renderers' own `isVisible` (`src/utils/visibility.ts`): the section in `meta.content.hiddenSections`, or the item's hash in `hiddenIds`. The export once kept its own copy that ignored `hiddenSections`, so a hidden built-in section stayed in public JSON.
5. **`basics.image`**, blanked to `''` when the photo is hidden — `isImageVisible`, i.e. `basics:image` in `hiddenIds`, the one store for it. A legacy `basics.imageVisible: false` becomes `basics:image` on import or store migration, so the export reads nothing else.
6. **Address parts the CV does not print**: with a custom `addressSchema`, the `location` fields it does not declare are blanked — except `city` and `countryCode` while the footer prints them (`shownLocationFields`, pinned against `formatFullAddress` and `getTypstFooterParts`).
7. **`projects[]` / `privateProjects[]` `roles` and `keywords`** — imported-only: no theme renders them and the editor cannot show them.
8. **Internal fields**, recursively: `visible`, `imageVisible`, `_vId`, `_imageVId` (`stripInternalFields`).

> **This tier is what a public GitHub repo receives** (`githubSync.ts`), so it **fails closed**: `reducedExportPublic.test.ts` snapshots every key path `getPublicBackupData` emits — item fields and `meta` included, every optional theme param filled — and a new one fails the test until someone decides whether the CV shows it.

> There is no hand-written section list to keep in step any more: `visibleSections` (`src/utils/visibility.ts`) derives the built-in sections from `ALL_SECTION_KEYS`, and both `getVisibleData` and the reduced export spread it. Before that, two hand-written lists drifted — `privateProjects` was once unfiltered here and leaked hidden private projects. `resume-export.test.ts` and `reducedExportVisibility.test.ts` loop over `ALL_SECTION_KEYS`.

#### Why `privateProjects` stays in the public tier

Settled 2026-07-24, after the leak above was fixed. The name invites the opposite conclusion, so: **`privateProjects` is a display grouping, not a confidentiality tier.**

It is a peer of `projects` everywhere in the code — `getVisibleData` filters it identically (`themes/shared/sections.ts:110-115`), both render under the same `Projects` heading and differ only by icon (`RENDERING.md`, `CONVENTIONS.md`: `'rocket'`), and it sits in `ALL_SECTION_KEYS` and every theme's column defaults alongside the other eleven. Its content is already printed in the PDF the user hands to an employer.

The only privacy control it has is the per-item hide, which is exactly what the fix wired up. Dropping the whole section from `reduced` would silently delete content the user chose to show, and would make it the one section the export treats differently — reintroducing the asymmetry the fix removed. If a user wants a private project out of the public JSON, they hide it, the same as anywhere else.

## Import: `sanitizeResumeData`

`customSections` is a modelled top-level key, exported as is; the
`reduced` tier keeps it minus hidden sections and hidden entries.

Unknown top-level keys are not stripped: they are held in `ResumeData.passthrough`
and the import-warnings dialog lists each one as kept (or dropped over the 256 KB
cap). The rules are in [ops/DATAMODEL.md](../ops/DATAMODEL.md) § Pass-through.
The Raw Data page lists each kept block and can remove one (`PassthroughPanel`);
the next sync replaces the current backup, while earlier snapshots and Drive/GitHub
versions keep it.
`languages[].fluency` (JSON Resume's free-text level) is still copied into
`certificate` and not re-emitted; deliberately out of scope for the pass-through.

`src/utils/validation.ts:293`, wired into `setResume` (`src/store/resume/slices/dataSlice.ts:76`). It is **not Zod** (not a dependency) — it is a defaults-driven picker that coerces each field to the type of its default, so a field with no default is silently dropped. Add the default first. `sanitizeCoverLetter` (`validation.ts:255`) is exported separately for direct testing.

**An import replaces `coverLetter` wholesale** rather than merging (`dataSlice.ts:172-180`), matching how content sections behave; a JSON without one yields the disabled default. UI lives in `src/components/modals/import/`.

See [ops/DATAMODEL.md](../ops/DATAMODEL.md) for the workflow when the shape itself changes.

## The Safety Net (Migration Gateway)

`MigrationGateway.tsx:19` bypasses the Zustand store and reads `localStorage` directly through `buildMigrationBackup(localStorage)`, so a user can still download a backup when the store fails to hydrate.

The logic now lives in `src/utils/migration-backup.ts:20` and is **scoped to the `resume-storage` key only** (`migration-backup.ts:6-18`). This is a security fix, not a refactor: the old version fell back to serializing the whole `Storage` object, and `JSON.stringify` walks every key — so it wrote `github_pat`, `github_repo`, and the sync hashes into a file the user was then told to upload to the new domain. Never widen that scope. It returns `null` when there is nothing to back up, so the caller can hide the affordance entirely.

## Key Files

- [resume-export.ts](../../../src/utils/resume-export.ts) — export tiers
- [resume-export.test.ts](../../../src/utils/__tests__/resume-export.test.ts) — tier coverage
- [validation.ts](../../../src/utils/validation.ts) — import sanitization
- [passthrough.ts](../../../src/utils/passthrough.ts) — pass-through collection, `toResumeJson`, `stringifyResume`
- [RawJsonData.tsx](../../../src/pages/RawJsonData.tsx) — the only consumer of the tiers
- [export.ts](../../../src/utils/export.ts) — naming, and `normalizeHostingPath`
- [buildExportArtifacts.ts](../../../src/hooks/export/buildExportArtifacts.ts) — the one place an export package is built
- [destinationAdapters.ts](../../../src/hooks/export/destinationAdapters.ts) — what each destination does with it
- [migration-backup.ts](../../../src/utils/migration-backup.ts) — the safety net
