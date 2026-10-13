---
paths:
  - 'netlify/functions/google-drive-sync.mjs'
  - 'netlify/functions/lib/google-drive.js'
  - 'netlify/functions/lib/google-drive-discovery.js'
  - 'src/constants/cloud.ts'
---

# Cloud sync (Google Drive)

`code/CLOUD_SYNC.md` and `ops/SYNC_FLOWS.md` are the reference — the discovery
flow, the modal lifecycle, the management UI. This is what binds.

## The canonical write path is `KiwiCV/backups/{locale}/`

Read roots are scanned in priority order: `KiwiCV`, then `CVCanvas`. `CV-Canvas`
is **retired and unscanned** — that is deliberate, not an oversight.

Roots live in `src/constants/cloud.ts` and
`netlify/functions/lib/brand-config.js`. Both, which means a change is two edits.

## Two write guards, and neither is optional

`netlify/functions/google-drive-sync.mjs` rejects:

- any upload or folder resolution whose **first path segment is not `KiwiCV`**;
- any **client-supplied `parentId`** upload.

The second exists specifically because a caller-provided parent bypasses the
first — it is a hole in the canonical-root rule, not a convenience. Restore and
delete are the exception and take a Drive **file ID**.

## File identity is the Drive file ID, never the filename

Duplicate roots and same-name files are preserved on purpose, and discovery
attaches `driveRoot` provenance so the management UI can show two `resume.json`
files and delete exactly the one the user picked.

Matching on filename deletes the wrong user's backup in precisely the case this
design exists to handle.
