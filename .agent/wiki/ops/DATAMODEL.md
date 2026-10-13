# Data Model Migration & Versioning

> **Last Updated: 2026-10-12**

## Overview

Follow this workflow whenever you make structural changes to `ResumeData` or `ResumeMeta` in `src/types/resume.ts`.

Two different "versions" are in play and they are **not** the same thing:

| Version                     | Where               | Bumped by                                          | Governs                                           |
| --------------------------- | ------------------- | -------------------------------------------------- | ------------------------------------------------- |
| **Persist version** (now 9) | `useResumeStore.ts` | You, by hand, when the stored shape changes        | Reshaping data already in a user's `localStorage` |
| **App version**             | `package.json`      | `scripts/release.cjs:145` during `npm run release` | The release, the changelog, the model snapshot    |

A structural change to `ResumeData` needs a **persist** bump plus a migration step. It does not by itself need an app-version bump — the release process handles that. See [code/STATE.md](../code/STATE.md) for the full store architecture.

> [!IMPORTANT]
> The obligations — bump the version and write a `<= N` step, add the default
> before the field, no optional top-level props — are in
> `.claude/rules/data-model.md`, which loads when you edit the types, the store
> or `validation.ts`. The seven steps below stay as the working order.

## Migration Workflow

### 1. Modify the Data Model

- Update the relevant interface in `src/types/resume.ts` (`ResumeData`, `ResumeMeta`, `WorkEntry`, etc.).
- Add/remove fields cautiously to maintain backward compatibility.
- **Avoid optional (`?`) top-level properties on `ResumeData`.** `ArraySectionKeys` in `src/components/editor/ArrayForm/types.ts` is a homomorphic mapped type over `keyof ResumeData`, so an optional property propagates `| undefined` into files that never referenced it. `coverLetter` is required-but-backfilled for exactly this reason (`src/types/resume.ts`, and the note above the declaration).

### 2. Update Initial State

- Add sensible defaults for any new fields in `initialResumeState` — it lives in **`src/types/resume.ts:278`**, next to the interfaces, not in the store.
- Prefer a **factory** (`createDefaultCoverLetter()`) over a shared const for any nested object, so two resumes never alias the same objects under immer.
- Ensure removed fields are cleaned up to prevent leaks.

### 3. Bump the persist version and write a migration step

This is the step that actually protects existing users, and the one this page omitted until 2026-07-24.

- Increment `version` in `useResumeStore.ts` (currently **10**).
- Add a step to `migrateResumeStore` in `src/store/resume/migrations.ts`. Steps are written `if (version <= N)` — **not** `=== N` — so a store several versions behind runs every step in order. The ladder today:

  | Step            | Does                                                                                        |
  | --------------- | ------------------------------------------------------------------------------------------- |
  | `version === 0` | Seeds fields missing from the earliest stores                                               |
  | `version <= 1`  | Moves `sync` from `resume.meta` to top level                                                |
  | `version <= 2`  | Moves `meta.ui` settings into theme params                                                  |
  | `version <= 4`  | Rescales skill levels from 0–100 to 1–4                                                     |
  | `version <= 5`  | Seeds the disabled default cover-letter block                                               |
  | `version <= 6`  | Seeds `passthrough` and `projects[].roles`/`keywords`                                       |
  | `version <= 7`  | Lifts `passthrough.customSections` into `customSections`, then seeds `[]`                   |
  | `version <= 8`  | Folds `basics.imageVisible: false` into `hiddenIds` as `basics:image`, then drops the field |
  | `version <= 9`  | Drops `isOriginalActive` from every pending `ai.suggestions` entry                          |

  There is deliberately **no `version <= 3` block** — v3 → v4 needed no data change. A gap in the ladder is not a missing step.

- Add a case to `src/store/resume/__tests__/migrations.test.ts`. The steps were extracted out of the store config specifically so they can be tested in isolation — use that.

### 4. Synchronize Validation (import path)

- Update `sanitizeResumeData` in `src/utils/validation.ts`. Per-section shapes live in its local `schemas` object; the `ResumeMeta` shape is `schemas.meta`, applied by the `meta:` entry of the object `sanitizeResumeData` returns (`s(data.meta, schemas.meta, 'meta')`).
- **There is no Zod.** It is not a dependency; validation is a hand-rolled, defaults-driven picker that coerces each field to the type its default has. A field with no default is silently dropped on import — that is the mechanism, so add the default first.
- It also strips metadata from a `basics.image` data URL (`stripImageMetadata`): a JPEG, PNG or WebP keeps an allow list of blocks — pixels, colour profile, and a JPEG's orientation rewritten as a minimal EXIF — and loses everything else, a JPEG's trailer after the end of image included. The editor's own upload loses it in a canvas re-encode; an imported file once kept it byte for byte, and the reduced tier can publish the photo. The stripper itself fails open — other formats (GIF, AVIF, HEIC, SVG) and anything it cannot parse come back unchanged — so import closes the gap before it runs: `preProcessResumeData` (`src/utils/image-processing.ts`), awaited by JSON import, AI import and cloud restore, canvas re-encodes every `data:` photo `stripImageMetadataOrNull` rejects to JPEG at 0.9, and drops one the browser cannot decode with an `editor.photo.conversion_failed` import warning (passed to `setResume` as `options.warnings`). Import therefore fails closed. A photo stored before that fix never passed through it, and rehydrate is synchronous, so `onRehydrateStorage` also fires `reencodeStoredPhoto` (`src/store/resume/reencodeStoredPhoto.ts`): an async, once-per-photo pass that re-encodes a stored `data:` photo the stripper rejects and writes it back with `updateBasics` — a normal persisted edit, so the next backup carries the clean photo; there is no dirty flag or version history for it to touch. One the browser cannot decode is **kept** with a console warning, never dropped on load. It covers the active résumé only: `useCvLibraryStore` lists cloud files and holds no photo copies, and opening one is a cloud restore, which already awaits `preProcessResumeData`. The other `setResume` callers re-submit the store's own résumé, so the guarantee holds only while every path that brings outside data in awaits `preProcessResumeData` first — a new one that skips it reopens the gap.

### 5. Create a Snapshot

`npm run model:snapshot` updates the `meta.version` of the latest example and saves it as `examples/resume_{version}.json`.

You normally **do not run this by hand**: `scripts/release.cjs:222` runs it as part of `npm run release`, after `release.cjs:145` has written the new `package.json` version. Run it manually only when you want the snapshot ahead of a release. See [RELEASE_PROCESS.md](RELEASE_PROCESS.md).

### 6. Audit Theme Serializers

- If the prop structure changed, audit all 12 themes — each is an HTML component plus a Typst serializer. See [code/THEME_SYSTEM.md](../code/THEME_SYSTEM.md).
- Ensure section components receive and handle the new props.

### 7. Final Verification

- Run `npm run lint` and `npm run build` (`npm run build` is what runs the real `tsc -b`).
- Verify the new snapshot in the Dashboard import process.
- Verify an **old** store migrates: the migration steps are the only thing standing between a returning user and a corrupt editor.

## Custom sections

`ResumeData.customSections: CustomSection[]` — `{ id (crypto.randomUUID), title,
items: { name, startDate, endDate, url, summary, highlights, visible?, _vId? }[],
visible? }`, exported under the same top-level key (the format shared with
KiwiTalents). The layout refers to a section as `custom:<id>`
(`utils/layout/customSections.ts`: `LayoutSectionId = SectionKey | CustomSectionToken`)
in `order`, `hiddenSections`, `pageBreaks` and `hiddenIds` (`custom:<id>:<vId>`).

- `CustomSection.visible` is round-tripped, not read: visibility is
  `hiddenSections`, as for every section.
- `sanitizeResumeData` re-mints a missing or duplicate `id`, runs entries through
  the same `s()` coercion, and keeps order tokens only for sections that exist.
- `removeCustomSection` deletes every layout reference to the token
  (`customSectionsSlice.ts`).
- `customSections` is not in `ALL_SECTION_KEYS` or `EMPTY_ITEM_FIELDS` — it holds
  sections, not entries — and is excluded from `ArraySectionKeys` explicitly.

## Pass-through: a holding area, not a destination

`ResumeData.passthrough` holds the top-level blocks of an imported file that
KiwiCV does not model — another tool's extension block, a `$schema` key — so an
import followed by an export returns them unchanged. Rules:

- **Never rendered, never sent to AI.** `'passthrough'` is in both `keysToStrip`
  lists; `aiSanitizerParity.test.ts` and `passthroughNotRendered.test.ts` pin it.
- **Capped at 256 KB** (`PASSTHROUGH_MAX_BYTES`). Over-cap keys are dropped with
  a named import warning, never silently.
- **Exported flat.** `toResumeJson` puts the blocks back at the top level; every
  JSON writer goes through it. The public `reduced` tier drops them — see
  [code/JSON_EXPORT.md](../code/JSON_EXPORT.md).
- **Viewable and removable on the Raw Data page.** `PassthroughPanel`
  (`features/raw-json/`) is collapsed and absent while the block is empty
  (owner, 2026-10-05: no export-time warning or toggle). Removal goes through
  `removePassthroughBlock`, never `setResume`, which replaces the block wholesale.
- **Removing a block touches nothing but the store.** The sync hashes are
  one-way digests (see [SYNC_FLOWS.md § 3b](SYNC_FLOWS.md#3b-change-detection-sync-hashes)),
  so none holds a copy of the block, and the changed store makes the next sync
  push. The success notice says earlier snapshots and versions in Drive and
  GitHub still hold the block — do not shorten it to "removed".
- **When KiwiCV learns a block, it leaves pass-through.** The modelled inventory
  is `Object.keys(initialResumeState)`, so adding the field is what makes the key
  "known". `liftModelledFromPassthrough` moves any stored copy out, called from
  `sanitizeResumeData` (imports, rehydration, library restores) **and** from the
  persist migration step for that version. Do not leave a modelled key in
  pass-through, and do not read a modelled field from it.
- ⚠️ **That step lifts first and seeds the default only when the key is still
  absent.** Seeding `[]` before lifting makes the top-level default win over the
  lifted copy — at both lift sites — and the user's data is gone, with every test
  green. v7 had nothing to lift (no v6 store has a pass-through block); the
  `customSections` step is the first real one.

## Versioning Policy

Applies to the **app** version in `package.json`:

- **Minor (x.Y.z)**: Additive changes, new features, new theme params.
- **Patch (x.y.Z)**: Bug fixes, UI adjustments, no schema changes.
- **Major (X.y.z)**: Breaking schema changes or fundamental architectural shifts.
