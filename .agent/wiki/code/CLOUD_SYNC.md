# Cloud Sync and Google Drive Compatibility

> **Last Updated: 2026-08-29**

## Overview

KiwiCV keeps Google Drive backups compatible without automatically moving or
renaming user folders. Discovery is read-only across the canonical `KiwiCV`
root and the supported legacy `CVCanvas` root. Every new folder and upload is
restricted to `KiwiCV`.

The older `CV-Canvas` root has completed its compatibility period. KiwiCV does
not scan, rename, merge, copy, or delete it automatically; any existing remote
data remains untouched.

> [!IMPORTANT]
> The canonical write path, the two write guards and file-identity-by-Drive-ID
> are in `.claude/rules/cloud-sync.md`, which loads on the sync function and its
> libs.

## Folder Contract

- Canonical write path: `KiwiCV/backups/{locale}/`
- Read roots, in priority order: `KiwiCV`, then `CVCanvas`
- Retired, unscanned root: `CV-Canvas`
- File identity: Google Drive file ID, never filename alone

Duplicate roots and same-name files are preserved. Discovery responses attach
`driveRoot` provenance so the management UI can show both `resume.json` files
and delete only the exact file selected by the user.

## Write Guards

`netlify/functions/google-drive-sync.mjs` rejects uploads and folder resolution
when the first path segment is not `KiwiCV`. Client-supplied `parentId` uploads
are rejected because they could bypass the canonical-root rule. Explicit
restore and delete actions use a Drive file ID.

## Implementation

- Shared roots: `src/constants/cloud.ts` and
  `netlify/functions/lib/brand-config.js`
- Read-only discovery: `netlify/functions/lib/google-drive-discovery.js`
- Folder creation and upload helpers: `netlify/functions/lib/google-drive.js`
- Request guards and routing: `netlify/functions/google-drive-sync.mjs`
- Frontend discovery: `src/hooks/cloud/useCloudDiscovery.ts`
- Restore/delete behavior: `src/hooks/cloud/useCloudOperations.ts`
- Discovered-backup cache and collision-safe UI identity:
  `src/store/library/useCvLibraryStore.ts` — it carries an explicit `status`
  machine and owns `githubPaths`, which was a `useRef` inside `useCloudDiscovery`
  until a refactor moved it, and only
  worked because both hooks were constructed in the same render
- Restore action, shared by the library page and the language-switch prompt:
  `src/hooks/cloud/useCloudRestoreAction.ts`

## Validation

Function tests cover both supported roots, retired-root exclusion, same-name
collisions, missing roots, API failures, legacy write rejection, and arbitrary
parent-ID rejection. Use a dedicated Google account for final pre-cutover
validation.
