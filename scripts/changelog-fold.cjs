const fs = require('fs');
const path = require('path');

const { isStagedEntryFile, readEntryObject, writeEntryFile } = require('./changelog-file.cjs');

/**
 * Folds the staged changelog entries into the version file a release is cutting.
 *
 * `npm run changelog:add` writes one file per entry — `feat_x.ts`, `ui_y.ts` —
 * because `sync-changelog.cjs` names its output after the update's `id`, and
 * `add-changelog.cjs` sets that id to the entry key. Nothing then moved them:
 * `changelog/index.ts` is rebuilt from `v_*` files only, and the release script
 * ran `changelog:sync`, whose structural sync also only walks `v_*`. So a staged
 * entry was written, translated into fifteen locales, committed — and never
 * imported by anything.
 *
 * ⚠️ **This is not hypothetical.** `feat_heic_photo_upload` was staged in a PR
 * that merged before 4.2.4, and `v_004_002_004.ts` carries only the dependency
 * line. HEIC/HEIF photo upload shipped with no changelog entry at all, and the
 * orphan file was still sitting there two releases later. Before this existed,
 * the only entries that reached users were the ones hand-written into
 * `CHANGELOG_UPDATES` with an `id` that was already a version.
 *
 * Merging, not overwriting: a release may legitimately already have a version
 * file (a re-run, or `changelog:deps` having injected its line first), and the
 * staged entries have to join it rather than replace it.
 */

/**
 * @param {string} basePath  `src/locales`
 * @param {string[]} locales
 * @param {string} versionId e.g. `v_004_003_000`
 * @returns {{folded: string[], perLocale: number}}
 */
function foldStagedEntries(basePath, locales, versionId) {
  const enDir = path.join(basePath, 'en', 'changelog');
  if (!fs.existsSync(enDir)) return { folded: [], perLocale: 0 };

  // English is the roster: a staged entry that exists only in some other locale
  // is not something a release should invent a slot for.
  const staged = fs.readdirSync(enDir).filter(isStagedEntryFile).sort();
  if (staged.length === 0) return { folded: [], perLocale: 0 };

  for (const locale of locales) {
    const dir = path.join(basePath, locale, 'changelog');
    if (!fs.existsSync(dir)) continue;

    const targetFile = path.join(dir, `${versionId}.ts`);
    let merged = {};
    if (fs.existsSync(targetFile)) {
      // `|| {}` here would turn an unreadable file into an empty base and then
      // write it, silently deleting every key the release had already folded
      // or `changelog:deps` had injected. Refuse instead.
      merged = readEntryObject(targetFile);
      if (!merged) {
        throw new Error(
          `Cannot read ${targetFile}. Refusing to fold into it — a merge that cannot read ` +
            'its base would overwrite it. Fix the file by hand, then re-run.',
        );
      }
    }

    for (const fileName of staged) {
      const stagedFile = path.join(dir, fileName);
      if (!fs.existsSync(stagedFile)) continue;
      const entry = readEntryObject(stagedFile);
      // The unlink used to be unconditional. `readEntryObject` returns null on
      // any parse failure — and its regex stops at the first `};`, so a value
      // containing one is enough — which deleted the entry and its fourteen
      // translations while reporting them folded. Never delete content that was
      // not captured.
      if (!entry) {
        throw new Error(
          `Cannot read staged entry ${stagedFile}. Refusing to delete it. ` +
            'Fix the file by hand, then re-run.',
        );
      }
      // `_highlights` is merged a level down: a shallow assign let each staged
      // highlight replace the block, keeping only the last one folded.
      const highlights = { ...merged._highlights, ...entry._highlights };
      Object.assign(merged, entry);
      if (Object.keys(highlights).length > 0) merged._highlights = highlights;
      fs.unlinkSync(stagedFile);
    }

    if (Object.keys(merged).length > 0) {
      writeEntryFile(targetFile, versionId, merged, locale);
    }
  }

  return { folded: staged.map((f) => f.replace(/\.ts$/, '')), perLocale: staged.length };
}

module.exports = { foldStagedEntries, isStagedEntryFile };
