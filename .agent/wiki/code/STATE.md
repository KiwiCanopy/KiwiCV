# State Management

> **Last Updated: 2026-08-09**

## Overview

KiwiCV uses **Zustand** for state management. The state is split into two primary stores: **Resume Store** (Domain logic) and **UI Store** (Interface state).

## Resume Store (`src/store/resume/`)

This is the heart of the application, managing all resume data and settings. It is built using modular slices.

### Slices (`src/store/resume/slices/`)

- `dataSlice.ts`: Core resume data (basics, work, education, etc.).
- `layoutSlice.ts`: Theme selection, palette choice, and layout parameters.
- `visibilitySlice.ts`: Hidden sections and individual hidden item IDs.
- `aiSlice.ts`: State for AI improvements and suggestions. A pending proposal (`ai.suggestions`, persisted) is `{ originalValue, improvedValue, timestamp }`, answered by accept and decline only — the per-field preview toggle and its `isOriginalActive` flag were retired unused; a preview affordance would rebuild that state, not revive it.
- `syncSlice.ts`: Tracking synchronization status (Google/GitHub).
- `statusSlice.ts`: General app status (saving, loading).

### Modular Pattern

The slices are merged into a central hook: `useResumeStore.ts`.
Each slice defines its own actions and state, ensuring a clean separation of concerns.

## UI Store (`src/store/ui/`)

Manages transient interface state:

- `useUIStore.ts`: Sidebar visibility, active modals, and mobile state. Also
  `editorRailCollapsed`, which is `boolean | null` and persisted — ⚠️ `null` is not
  "expanded", it means _no explicit choice_, so the editor rail follows the measured
  workspace width until the user toggles it.
- `useToastStore.ts`: Global notification system.
- `useConfirmStore.ts`: Imperative confirmation dialogs.
- `useFlowStore.ts`: Onboarding and feature tour state, plus the global sign-in
  dialogs. Which one is open is `auth.authSurface: AuthSurface | null` —
  one field, so two auth dialogs at once is unrepresentable; a third surface is a
  new member, never a new boolean. ⚠️ The store is `sessionStorage`-persisted
  to survive the OAuth redirect, so it also survives a deploy: a change to a
  persisted shape bumps `version` and extends `migrateFlowState`.
- `useImportModalStore.ts`: State for the resume import flow.
- `useImportWarningsStore.ts`: Tracks warnings from data imports.
- `useSeoStore.ts`: Backs the SEO override system (per-route metadata pushed to the single `<SEO />` instance).

## CV Library Store (`src/store/library/useCvLibraryStore.ts`)

The cache of discovered cloud backups behind `/:lang/cvs`, and the home of the
`BackupFile` / `BackupSource` / `BackupDiscoveryMap` vocabulary the whole cloud
layer speaks. It replaced `useBackupSelectorStore` on 2026-08-09.

- `status`: `idle | loading | ready | error | unconfigured`. A failed load stays
  failed until the user presses Retry, so the explanation is not replaced by a
  spinner on every navigation.
- `discoveryData`: the `locale -> source -> files` map, flattened for display by
  the pure `features/cv-library/flattenDiscovery.ts`.
- `githubPaths`: `locale -> backups/<locale> | backup/<locale>`. ⚠️ It lives
  here, not in a `useRef` inside `useCloudDiscovery`. `useCloudOperations`
  builds every GitHub file path from it, and the old aliasing only worked
  because both hooks were constructed in the same render — a page that remounts
  needs it to survive.
- `loadedAt`: a cold load is one `getLastCommit` request per GitHub file, so a
  cache younger than five minutes is re-rendered rather than re-fetched.
- `failedSources`: providers that threw. Every attempted provider failing is
  `status: 'error'`; one of two is an inline warning beside real results.

The store the page replaced was **also a dialog protocol** — `openManagement`
returned a promise the modal resolved. Nothing in the store resolves anything
now; restoring is `useCloudRestoreAction`, called from a row.

## Auth & Persistence (`AuthProvider.tsx`)

To bypass mobile-specific library hangs and improve startup performance, we utilize an **Optimistic Persistence Layer**.

### Caching Strategy

- **Key**: `sb_profile_{userId}_{version}` (current version: `v1`).
- **Storage**: `localStorage` (filtered to remove sensitive internal IDs).
- **Initialization**: On page load, the app instantly reads the cache to unlock the UI, while performing a background fetch to verify fresh data.

### Resume Store Migration (Schema v6)

The Resume Store is persisted under the key `resume-storage` at **`version: 6`** (see `src/store/resume/useResumeStore.ts`).

- **Dedicated Migration Module**: Migration logic lives in `src/store/resume/migrations.ts` (`migrateResumeStore`), wired into the store via the persist middleware's `migrate` option. It is no longer inline in `useResumeStore.ts`, so each version step can be unit-tested in isolation.
- **Sequential Steps**: Each block is guarded by `if (version <= N)` so a store several versions behind runs every step in order:
  - **v1**: Seed `resume.privateProjects` and `meta.content.hiddenIds`.
  - **v2**: Move `sync` from `resume.meta` to the top level and backfill default GitHub / Google Drive config.
  - **v3**: Move `meta.ui` settings into theme params (staging the rest in a temporary migration key for the UI store).
  - **v5**: Rescale skill levels from a 0-100 range to a 1-4 scale.
  - **v6**: Seed a default (disabled) `coverLetter` block.

### Mobile Safety Fuse

- All profile fetching is wrapped in a **5-second safety fuse**. If the network or library hangs, the loader is forced to close, preventing the "Infinite Spinner" on unstable connections.

### Future Enhancements

- **Cross-Tab Sync**: A `storage` event listener (currently commented out) could ensure that logging out in one tab instantly triggers a refresh/logout in all other open tabs, pending further testing of checkout edge cases.

### Legal Re-consent Gate (`LegalUpdateModal`)

When legal terms change, signed-in users are forced to re-accept before continuing. The gate is driven off the auth/profile state described above.

- **Trigger constant**: `LAST_LEGAL_UPDATE` in `src/constants/auth.ts`, set by `npm run release -- --legal`. Bump it whenever the terms/privacy policy materially change.
- **Component**: `src/components/modals/LegalUpdateModal.tsx`, rendered app-wide via `src/app/GlobalOverlays.tsx`.
- **Consent check**: reads `profile.accepted_terms_at` and `profile.accepted_privacy_at`. Consent is required when either is missing or older than `LAST_LEGAL_UPDATE`. It renders only when `firstTimeLanguageSelected` is set and both `user` and `profile` exist.
- **Blocking**: the modal is non-dismissible (`dismissible={false}`) — no close button, Escape and outside-click are blocked — so the user must accept to proceed.
- **Excluded routes**: `location.pathname` is lowercased and split on `/`, then matched **per segment** via `includes()` against `privacy`, `terms`, `legal-notice`, `account`, and `blog`. This lets users read the policies, manage or delete their account, and read the blog without being blocked. Because matching is per-segment, locale-prefixed paths (e.g. `/de/privacy`) are also excluded.
- **Acceptance**: writes `accepted_terms`, `accepted_terms_at`, `accepted_privacy`, `accepted_privacy_at` (all set to the current timestamp) to the `profiles` table, then calls `refreshProfile()`.

### Theme Params Schema

- **addressSchema**: The `addressSchema` property inside `meta.theme.params` controls the address block layout and separators.
  - `mode`: `'default'` (CV locale-dependent) | `'preset'` (country template) | `'custom'` (drag-and-drop order and custom separators).
  - `presetCountry`?: A country code (e.g. `'DE'` for European style, `'US'` for North American style).
  - `customFields`?: An array specifying custom render order and separators: `Array<{ field: 'address' | 'postalCode' | 'city' | 'region' | 'countryCode', separator: ',' | ' ' | '' }>`.

1. **Defensive Access**: Always use optional chaining (`?.`) when accessing resume data, as the schema is highly partial.
2. **Immutable Updates**: Never mutate state directly; always use the provided setter actions or `set((state) => ...)` in Zustand.
3. **Selector Usage**: Prefer granular selectors (`useResumeStore(s => s.data)`) to prevent unnecessary re-renders.
4. **Data Integrity**: Use `ResumeData` and `ResumeMeta` types from `src/types/resume.ts` as the single source of truth for typing.
