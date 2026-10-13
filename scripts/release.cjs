const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { findUntranslatedPaths, formatVersionId, readEntryObject } = require('./changelog-file.cjs');
const { foldStagedEntries } = require('./changelog-fold.cjs');

/**
 * Automated Release Script
 * Usage: npm run release [patch|minor|major|x.x.x]
 */

const PACKAGE_JSON_PATH = path.join(__dirname, '..', 'package.json');
const CHANGELOG_TS_PATH = path.join(__dirname, '..', 'src', 'data', 'changelog.ts');

function bumpVersion(current, type) {
  const parts = current.split('.').map(Number);
  if (type === 'patch') parts[2]++;
  else if (type === 'minor') {
    parts[1]++;
    parts[2] = 0;
  } else if (type === 'major') {
    parts[0]++;
    parts[1] = 0;
    parts[2] = 0;
  } else if (/^\d+\.\d+\.\d+$/.test(type)) return type;
  else
    throw new Error(
      'Invalid version type. Use patch, minor, major, or a specific version like 1.2.3',
    );
  return parts.join('.');
}

function validateChangelogKeys(targetVersionId) {
  const LOCALES = require('./languages.cjs');
  const basePath = path.join(__dirname, '..', 'src', 'locales');
  const VALID_PREFIXES = [
    'feat_',
    'ui_',
    'perf_',
    'fix_',
    'refactor_',
    'chore_',
    'docs_',
    'other_',
  ];
  let hasError = false;

  LOCALES.forEach((locale) => {
    const changelogFile = path.join(basePath, locale, 'changelog', `${targetVersionId}.ts`);
    if (!fs.existsSync(changelogFile)) return;

    // A file the validator cannot read is a failed validation, not a passed
    // one: skipping it would let an invalid key ship because the check that
    // would have caught it could not open the file.
    const obj = readEntryObject(changelogFile);
    if (!obj) {
      console.error(`❌ Failed to parse the entry object in ${changelogFile}`);
      hasError = true;
      return;
    }

    Object.keys(obj).forEach((key) => {
      if (key === '_highlights') return;
      const isValid = VALID_PREFIXES.some((prefix) => key.startsWith(prefix));
      if (!isValid) {
        console.error(
          `❌ Invalid changelog key "${key}" found in ${path.relative(
            path.join(__dirname, '..'),
            changelogFile,
          )}`,
        );
        console.error(
          `   Keys must start with one of: ${VALID_PREFIXES.join(', ')} (or be exactly '_highlights')`,
        );
        hasError = true;
      }
    });
  });

  if (hasError) {
    throw new Error('Changelog validation failed. Correct the invalid keys before releasing.');
  }
}

/**
 * Validates that non-English changelog entries are translated and not 1:1 English placeholders.
 */
function validateChangelogTranslations(targetVersionId, allowUntranslated = false) {
  const LOCALES = require('./languages.cjs');
  const basePath = path.join(__dirname, '..', 'src', 'locales');
  const enFile = path.join(basePath, 'en', 'changelog', `${targetVersionId}.ts`);
  if (!fs.existsSync(enFile)) return;

  const enObj = readEntryObject(enFile);
  if (!enObj) return;

  const untranslatedReport = {};

  LOCALES.filter((l) => l !== 'en').forEach((locale) => {
    const localeFile = path.join(basePath, locale, 'changelog', `${targetVersionId}.ts`);
    if (!fs.existsSync(localeFile)) return;

    const localeObj = readEntryObject(localeFile);
    if (!localeObj) return;

    // Recursive, so an English `_highlights` block halts the release too.
    const untranslated = findUntranslatedPaths(enObj, localeObj);
    if (untranslated.length) untranslatedReport[locale] = untranslated;
  });

  const localesWithUntranslated = Object.keys(untranslatedReport);
  if (localesWithUntranslated.length > 0) {
    console.warn('\n⚠️ Warning: Untranslated changelog entries detected (matching English 1:1):');
    localesWithUntranslated.forEach((locale) => {
      console.warn(`   - ${locale}: [${untranslatedReport[locale].join(', ')}]`);
    });

    if (!allowUntranslated) {
      console.error('\n🛑 Release halted. Please run the translation pass before releasing.');
      console.error(
        '   (Or pass --allow-untranslated if releasing with English placeholders intentional).',
      );
      throw new Error('Changelog translation check failed.');
    }
  }
}

function legalUpdateModalText(source) {
  const start = source.indexOf('  update: {');
  if (start === -1) return null;
  return source.slice(start, source.indexOf('\n  },\n', start));
}

function assertLegalUpdateTextChanged(currentVersion) {
  const enLegal = 'src/locales/en/legal.ts';
  try {
    execSync('git fetch --tags --quiet origin', { stdio: 'inherit' });
  } catch {
    // Offline: a local tag, if present, still decides below.
  }
  let previous;
  try {
    previous = execSync(`git show v${currentVersion}:${enLegal}`, { encoding: 'utf8' });
  } catch {
    throw new Error(
      `--legal: cannot read ${enLegal} at tag v${currentVersion} to confirm the re-consent modal text changed — is v${currentVersion} tagged and pushed?`,
    );
  }
  const current = fs.readFileSync(path.join(__dirname, '..', enLegal), 'utf8');
  if (legalUpdateModalText(previous) === legalUpdateModalText(current)) {
    throw new Error(
      '--legal: legal.update (intro, changes_desc) is unchanged since the last release, so the ' +
        're-consent modal would describe the previous update. Rewrite it in all 15 locales for ' +
        'this change and sync scripts/i18n/handoff-catalog.cjs.',
    );
  }
}

try {
  const args = process.argv.slice(2);
  const hasLegalUpdate = args.includes('--legal');

  // ⚠️ `--legal` re-prompts every signed-in user with `legal.update.intro` and
  // `changes_desc`. 4.4.2 was first cut with both still describing the previous
  // update — the release skill said so in prose, and the session had not loaded it.
  // Checked before the dependency updates so a stale modal fails in seconds.
  if (hasLegalUpdate) {
    const { version } = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
    assertLegalUpdateTextChanged(version);
  }

  // ⚠️ Minor updates run by DEFAULT; `--no-update-deps` opts out. It was
  // opt-in via `--update-deps` until 2026-08-28, and opt-in meant it almost
  // never ran — so the tree drifted until a routine bump became a large,
  // risky jump.
  //
  // Safe to default because of the ordering below: the full gate runs after
  // this and BEFORE anything is written or tagged, so a breaking bump fails
  // the release rather than shipping inside one. There is no half-released
  // state to unpick.
  //
  // ⚠️ What the gate cannot tell you: it proves nothing CRASHED, not that
  // nothing CHANGED. A `lucide-react` bump can reshape an icon and a
  // `posthog-js` bump can shift event semantics, and both pass every test.
  // After a release that moved a UI-visible package, look at the app.
  const skipDepUpdate = args.includes('--no-update-deps');

  if (skipDepUpdate) {
    console.log('⏭️  Skipping minor dependency updates (--no-update-deps).');
  } else {
    console.log('🔄 Running minor dependency updates first...');
    execSync('node scripts/update-minor.cjs --no-update-licenses', { stdio: 'inherit' });
  }

  // 1. Determine new version
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
  const currentVersion = pkg.version;
  const FLAGS = new Set(['--legal', '--no-update-deps', '--update-deps']);
  // `--update-deps` is still accepted and ignored: it is now the default, and
  // silently treating it as the version type would cut a `--update-deps` release.
  const type = args.filter((arg) => !FLAGS.has(arg))[0] || 'patch';
  const newVersion = bumpVersion(currentVersion, type);
  const newId = formatVersionId(newVersion);

  console.log(`🚀 Starting release for version ${newVersion} (from ${currentVersion})...`);

  // 2. Pre-flight checks
  console.log('🔍 Running pre-flight checks...');

  console.log('  - Running lint (warnings treated as errors)...');
  execSync('npm run lint -- --max-warnings=0', { stdio: 'inherit' });

  console.log('  - Checking AI constants sync...');
  execSync('npm run ai:check-sync', { stdio: 'inherit' });

  // Runs after --update-deps, so a dependency bump is tested before anything is
  // written or tagged. `npm test` is four runners; `npx vitest run` alone would
  // silently skip locale integrity and the lint baseline.
  console.log('  - Running the full test suite...');
  execSync('npm test', { stdio: 'inherit' });

  // ⚠️ The changelog checks do NOT belong here, and used to.
  //
  // Both return early when `en/changelog/<newId>.ts` is absent — and at
  // pre-flight it always is, because the entries are still staged `feat_*.ts`
  // files until the fold at step 5.5. So both validated nothing, on every
  // release. `check-untranslated.cjs` skips `changelog/` by design, which made
  // the translation gate the only automated guard against shipping fourteen
  // locales of English placeholders — and it was dead. They now run at step
  // 5.6, once the version file exists.
  const allowUntranslated = args.includes('--allow-untranslated');

  console.log('✅ Pre-flight checks passed!');

  // 2.5 Update LAST_LEGAL_UPDATE constant if --legal flag is passed
  if (hasLegalUpdate) {
    console.log('⚖️ Updating LAST_LEGAL_UPDATE timestamp...');
    const AUTH_TS_PATH = path.join(__dirname, '..', 'src', 'constants', 'auth.ts');
    let authContent = fs.readFileSync(AUTH_TS_PATH, 'utf8');
    const now = new Date().toISOString();
    authContent = authContent.replace(
      /(export const LAST_LEGAL_UPDATE = ')([^']+)(';)/,
      `$1${now}$3`,
    );
    fs.writeFileSync(AUTH_TS_PATH, authContent);
    console.log(`✅ Updated LAST_LEGAL_UPDATE to ${now}`);
  }

  // 3. Update package.json
  pkg.version = newVersion;
  fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(pkg, null, 2) + '\n');
  console.log('✅ Updated package.json');

  // 4. Update package-lock.json
  console.log('🔒 Syncing package-lock.json...');
  execSync('npm install --package-lock-only', { stdio: 'inherit' });
  console.log('✅ Updated package-lock.json');

  // 4.5 Generate/update licenses with the new version
  console.log('🔍 Checking and updating licenses...');
  execSync('npm run check-licenses', { stdio: 'inherit' });

  // 5. Update src/data/changelog.ts
  let changelogContent = fs.readFileSync(CHANGELOG_TS_PATH, 'utf8');
  const today = new Date().toISOString().split('T')[0];

  const marker = 'const allChangelogs: ChangelogEntry[] = [';
  if (!changelogContent.includes(marker)) {
    throw new Error('Could not find allChangelogs array in changelog.ts');
  }

  // Check if version already exists
  const versionRegex = new RegExp(`version:\\s*'${newVersion}'`, 'g');
  if (versionRegex.test(changelogContent)) {
    console.log(`ℹ️ Version ${newVersion} already exists in changelog.ts. Updating date...`);
    // Find the entry and update the date
    // This regex looks for the entry block containing the version and replaces the date within it
    const entryRegex = new RegExp(
      `(version:\\s*'${newVersion}',\\s*date:\\s*')(\\d{4}-\\d{2}-\\d{2})(')`,
      'g',
    );
    changelogContent = changelogContent.replace(entryRegex, `$1${today}$3`);
  } else {
    console.log(`ℹ️ Version ${newVersion} not found in changelog.ts. Adding new entry...`);
    const newEntry = `  {
    version: '${newVersion}',
    date: '${today}',
    id: '${newId}',
  },`;
    changelogContent = changelogContent.replace(marker, `${marker}\n${newEntry}`);
  }

  fs.writeFileSync(CHANGELOG_TS_PATH, changelogContent);
  console.log('✅ Updated src/data/changelog.ts');

  // 5.4. Empty the `CHANGELOG_UPDATES` inbox before anything reads the release's
  // entries. An inbox entry lands in the version file, or as a staged file the
  // fold below picks up; synced only at step 6, it reached neither the highlight
  // registration nor the validation, and 4.5.0 shipped without its highlight.
  console.log('📥 Applying the CHANGELOG_UPDATES inbox before the fold...');
  execSync('npm run changelog:sync', { stdio: 'inherit' });

  // 5.5. Fold the staged entries into this release's version file.
  //
  // Must run before the step-6 sync, which rebuilds every locale's
  // `changelog/index.ts` from the `v_*` files on disk — so the version file has
  // to exist and carry its entries by then.
  //
  // ⚠️ Without this, `npm run changelog:add` wrote entries nothing ever read:
  // the index only imports `v_*`, and the structural sync only walks `v_*`.
  // `feat_heic_photo_upload` was staged before 4.2.4 and `v_004_002_004.ts`
  // shipped with only the dependency line.
  console.log('📎 Folding staged changelog entries into the release...');
  const { folded } = foldStagedEntries(
    path.join(__dirname, '..', 'src', 'locales'),
    require('./languages.cjs'),
    newId,
  );
  if (folded.length) {
    console.log(`   Folded into ${newId}: ${folded.join(', ')}`);
  } else {
    console.log('   No staged entries — this release carries only its dependency line.');
  }

  /**
   * 5.5b. Declare the folded highlights in the registry. Runs after 5.4 and 5.5,
   * once every source of `_highlights` is in the version file.
   *
   * ⚠️ **The registry entry is written at step 5 — BEFORE the fold — so at that
   * moment this script does not yet know what the release carries.** Highlights
   * are decoupled by design: the locale file holds the words under
   * `_highlights.<id>`, `changelog.ts` declares which ids a version has, and
   * `changelogHighlights.ts` maps each id to an icon. A highlight missing from
   * the middle one is looked up by both rendering surfaces, found nowhere, and
   * silently drawn as nothing.
   *
   * That shipped in 4.4.0: "Cover Letters, Written for You" was written,
   * translated into fifteen languages, folded in, and invisible in both the
   * What's New modal and the Changelog tab (owner, 2026-09-08).
   * `changelogHighlights.test.ts` fails on the same condition, and step 6.9
   * reruns it after the writes, so a release that misses one halts before it commits.
   */
  const highlightIds = Object.keys(
    readEntryObject(path.join(__dirname, '..', 'src', 'locales', 'en', 'changelog', `${newId}.ts`))
      ?._highlights ?? {},
  );
  if (highlightIds.length) {
    let registry = fs.readFileSync(CHANGELOG_TS_PATH, 'utf8');
    const entryAnchor = `    id: '${newId}',\n`;
    if (registry.includes(entryAnchor) && !registry.includes(`{ id: '${highlightIds[0]}' }`)) {
      const line = `    highlights: [${highlightIds.map((id) => `{ id: '${id}' }`).join(', ')}],\n`;
      registry = registry.replace(entryAnchor, entryAnchor + line);
      fs.writeFileSync(CHANGELOG_TS_PATH, registry);
      console.log(`   Declared highlight(s) in changelog.ts: ${highlightIds.join(', ')}`);
      console.log(
        '   ⚠️ Each needs an icon in changelogHighlights.ts — the gate below fails until it has one.',
      );
    }
  }

  // 5.6. Now that the version file exists, validate what it actually contains.
  console.log('  - Checking changelog keys validation...');
  validateChangelogKeys(newId);

  console.log('  - Checking changelog translation status...');
  validateChangelogTranslations(newId, allowUntranslated);

  // 6. Sync changelog locales
  console.log('🔄 Syncing changelog locales...');
  execSync('npm run changelog:sync', { stdio: 'inherit' });

  // 6.5. Automatically inject dependency updates if changes are detected in package.json compared to last release tag
  //
  // ⚠️ The previous release's tag is created **after** its PR merges, so it can
  // live only on the remote — a clone that never fetched tags has none of them
  // and this comparison silently falls into the catch below, injecting a
  // dependency entry for a release that changed no dependencies.
  try {
    execSync('git fetch --tags --quiet origin', { stdio: 'inherit' });
  } catch {
    console.warn('⚠️  Could not fetch tags from origin; the dependency check may be stale.');
  }
  try {
    const diff = execSync(`git diff v${currentVersion} -- package.json`, { encoding: 'utf8' });
    const hasDepsChanges = diff.includes('+   "') || diff.includes('+    "');
    if (hasDepsChanges) {
      console.log('📦 Dependency updates detected. Running changelog:deps...');
      execSync('npm run changelog:deps', { stdio: 'inherit' });
    } else {
      console.log('ℹ️ No dependency updates detected. Skipping changelog:deps.');
    }
  } catch (e) {
    // If the tag v${currentVersion} doesn't exist, run it just in case
    console.log('ℹ️ Running changelog:deps (pre-check skipped/failed)...');
    execSync('npm run changelog:deps', { stdio: 'inherit' });
  }

  // 6.9. Validate the locales this script just rewrote.
  //
  // Steps 6 and 6.5 write all fifteen locale files and rerun Prettier over them,
  // so the script can corrupt the locale set on its own. `i18n:check` is not part
  // of `npm test`, which is why the pre-flight run above does not cover this. It
  // has to happen after the writes, not before them.
  console.log('🌍 Validating locales after the changelog writes...');
  execSync('npm run i18n:check', { stdio: 'inherit' });

  // The pre-flight `npm test` ran before the version file existed, so it could
  // not see an undeclared or icon-less highlight in this release.
  console.log('✨ Checking the release highlights are registered...');
  execSync('npx vitest run src/data/__tests__/changelogHighlights.test.ts', { stdio: 'inherit' });

  // 7. Create model snapshot
  console.log('📸 Creating model snapshot...');
  execSync('npm run model:snapshot', { stdio: 'inherit' });

  // 8. Run build
  console.log('🛠 Running npm run build...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build complete!');

  // 9. Git commit. The tag is deliberately NOT created here — see below.
  console.log('🐙 Committing the release...');

  const tagName = `v${newVersion}`;

  // Fail early if the tag already exists, to avoid a half-committed release.
  const localTag = execSync(`git tag -l "${tagName}"`, { encoding: 'utf8' }).trim();
  if (localTag) {
    throw new Error(
      `Git tag ${tagName} already exists locally. Delete it first with: git tag -d ${tagName}`,
    );
  }

  // ⚠️ A local `git tag -l` cannot see a tag that exists only on the remote, and
  // that is now the *normal* state: tagging happens after the merge, on whichever
  // machine did the merge. Without this check a second machine would sail past
  // the local check and only discover the collision at push time, after a full
  // build.
  let remoteTag = '';
  try {
    remoteTag = execSync(`git ls-remote --tags origin "refs/tags/${tagName}"`, {
      encoding: 'utf8',
    }).trim();
  } catch {
    console.warn('⚠️  Could not reach origin to check for an existing tag; continuing.');
  }
  if (remoteTag) {
    throw new Error(`Git tag ${tagName} already exists on origin — this release has shipped.`);
  }

  // `main` is protected: nothing can be pushed to it directly, so the release
  // commit has to arrive through a PR like any other change.
  const startBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  let branch = startBranch;
  if (startBranch === 'main') {
    branch = `release/${tagName}`;
    const branchExists = execSync(`git branch --list "${branch}"`, { encoding: 'utf8' }).trim();
    execSync(`git checkout ${branchExists ? '' : '-b '}${branch}`, { stdio: 'inherit' });
    console.log(`🌿 Moved onto ${branch} — main is protected and takes PRs only.`);
  }

  execSync('git add .', { stdio: 'inherit' });
  execSync(`git commit -m "chore(release): ${newVersion}"`, { stdio: 'inherit' });
  console.log(`✅ Committed on ${branch}`);

  // ⚠️ **No `git tag` here, and this is not a convenience choice.** The commit
  // above never reaches `main` as itself: the PR is squash-merged, so `main`
  // gets a *new* commit with a different hash. A tag created now would point at
  // an object that is not an ancestor of `main` — it would still push, still
  // resolve, and still be wrong, and `git diff v<previous>` in step 6.5 would
  // then compare against a commit off the mainline. Tag the merged commit.
  console.log(`\n🎉 Release ${newVersion} is ready to go up as a PR!`);
  console.log('👉 Next steps:');
  console.log(`     git push -u origin ${branch}`);
  console.log(`     gh pr create --base main --title "chore(release): ${newVersion}"`);
  console.log('   then, once the PR is merged:');
  console.log('     git checkout main && git pull');
  console.log(`     git tag ${tagName} && git push origin ${tagName}`);
  // ⚠️ The step everyone forgets, and the only one with no feedback if skipped.
  // `netlify.toml`'s `ignore` cancels any build whose commit carries no exact
  // tag, so the automatic build on the merge cancels itself — and Netlify
  // triggers on branch pushes, never on tag refs, so pushing the tag builds
  // nothing either. Without the line below, a release sits tagged and unshipped
  // while every signal says it went fine.
  console.log('\n   ⚠️ and then TRIGGER THE DEPLOY — the tag alone ships nothing:');
  console.log('     npx netlify deploy --build --prod');
  console.log('     (or Netlify UI -> Trigger deploy. Tag first, then trigger.)');
  console.log(
    '   The build cancelled on merge shows as "error" with "no content change" — that is',
  );
  console.log(
    '   the gate working. Judge production by the newest deploy that is ready + published.',
  );
} catch (error) {
  console.error('\n❌ Release failed:', error.message);
  process.exit(1);
}
