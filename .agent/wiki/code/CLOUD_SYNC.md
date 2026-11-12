# Cloud Sync and Google Drive Compatibility

> **Last Updated: 2026-11-12**

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

## Deliberately Not Synced: the Signature

The document signature (`code/STATE.md` § Signature Store) is device-only. It is never in
`resume.json` on Drive or GitHub, never in the JSON export, never in an AI payload. The PDF
carries it — that is the document — **except in a repo anyone can read** (public, internal or
Pages-published): there `githubSync.ts` recompiles without it, as it already did without the
cover letter, because a public signature image is an easy forgery source. Drive and private-repo
PDFs keep it by owner ruling (#108): the user's own document in the user's own storage.
`buildExportArtifacts` takes the signature as a required parameter so every caller decides
(`githubSyncSignature.test.ts`). **Opt-in backup (#106).** "Also save a copy to Google Drive / GitHub" in the signature dialog,
off by default, writes a separate `signature.json` (`src/features/signature/signatureBackup.ts`):
Drive at `KiwiCV/signature/` (outside `backups/`, so discovery never lists it as a CV; the hidden
app-data folder would need the `drive.appdata` scope and a fresh consent from every user), GitHub at
`signature/signature.json` behind `isPrivateBackupRepo` (`src/services/githubRepoAccess.ts`, the
same gate as the full backup). Remove and switching it off delete the copy; GitHub history keeps
earlier versions, and the dialog says so. A device with no signature is offered the saved one,
never given it silently. The signature is still never in `resume.json` or any sync payload.

- **Writes** go only to a destination switched on in the sync settings and, for GitHub, a repo
  passing `isPrivateBackupRepo`. **Deletes** skip both checks (`forDelete`): deleting leaks
  nothing, and a repo made public since must still lose the file. One queue runs backup jobs in
  order and each reads the store when it starts, so a Remove is never undone by a slower upload.
- **Withdrawal works on every device.** Remove always sweeps the connected destinations (quietly
  when this device never opted in), and a restored signature arrives with the box ticked, so
  unticking it deletes the copy. While a copy exists but cannot be written, the box stays: the
  policy names unticking as the way to withdraw consent.
- ⚠️ **A named exception to "identity is the Drive file id"** (`rules/cloud-sync.md`): delete
  removes every file named `signature.json` in `KiwiCV/signature/`, KiwiCV's own folder that holds
  nothing else. Known limit: with duplicate `KiwiCV` roots, `ensureFolderPath` takes the first
  match, so a copy under the other root survives; the failure toast names both paths to delete by
  hand.

## Validation

Function tests cover both supported roots, retired-root exclusion, same-name
collisions, missing roots, API failures, legacy write rejection, and arbitrary
parent-ID rejection. Use a dedicated Google account for final pre-cutover
validation.
