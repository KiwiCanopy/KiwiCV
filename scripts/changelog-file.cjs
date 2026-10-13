const fs = require('fs');

/**
 * Reading and writing one locale's changelog entry file.
 *
 * Shared by `sync-changelog.cjs`, `changelog-deps.cjs`, `changelog-fold.cjs`,
 * `release.cjs` and `remove-changelog-key.cjs`. Before this existed the
 * serializer had three copies and the reader eight, and they had already
 * drifted apart in three separate ways — each one a fix that landed in one
 * copy and not the others:
 *
 * - the `isVersionFile` guard was in `sync-changelog.cjs` only.
 *   `changelog-deps.cjs` was correct purely because it happens to write `v_*`
 *   files exclusively — a behavioural coincidence holding two files together.
 * - the nested-object branch was missing from `changelog-fold.cjs`, so a
 *   `_highlights` block serialized to the string `'[object Object]'`.
 * - backslash escaping was fixed in `changelog-fold.cjs` only, so `'C:\Users'`
 *   still round-tripped to `C:Users` through the other two.
 *
 * `changelog-index.cjs` states the precedent for exactly this: it was
 * extracted because two writers could both create a version file, and keeping
 * one copy means a second writer cannot forget the step. Same reasoning, one
 * layer down — this is the file both of those writers write.
 *
 * ⚠️ The `eval`-based reader is inherited, not introduced here. Replacing it
 * with the TypeScript AST (`scripts/i18n/locale-ast.cjs`, already used by the
 * i18n tooling) is the better end state and is deliberately staged after the
 * deduplication — it is easier to swap one implementation than seven.
 */

/**
 * A released version file is `v_004_003_000.ts`, and only that shape.
 *
 * Anchored, rather than the `id.startsWith('v_')` the sync script used: the
 * distinction decides whether the file gets a `Translations[…][id]` annotation,
 * and annotating something that is not in `changelog/index.ts` fails `tsc -b`
 * in all fourteen non-English locales.
 */
const VERSION_ID_PATTERN = /^v_[0-9_]+$/;

/** @param {string} id an entry id, e.g. `v_004_003_000` or `feat_x` — not a filename. */
const isVersionFile = (id) => VERSION_ID_PATTERN.test(id);

/**
 * A changelog directory holds exactly `index.ts`, `meta.ts` and `v_*.ts`.
 * Anything else in it is a staged entry — the complement of the rule
 * `changelog-index.cjs` already owns.
 *
 * ⚠️ **Deliberately not an allowlist of prefixes.** The first version of this
 * listed `feat_`, `ui_`, `fix_`… and missed `highlight_`, which
 * `add-changelog.cjs` emits for a highlight entry — so highlights would have
 * gone unfolded, unindexed and unread, which is the exact bug the fold exists
 * to kill. A complement cannot be outgrown by a new prefix.
 */
const RESERVED = new Set(['index.ts', 'meta.ts']);

/** @param {string} fileName a bare filename, e.g. `feat_x.ts` — not a path. */
const isStagedEntryFile = (fileName) =>
  fileName.endsWith('.ts') &&
  !RESERVED.has(fileName) &&
  !isVersionFile(fileName.replace(/\.ts$/, ''));

/**
 * An entry id has to be spellable as a JavaScript identifier, because it becomes
 * one: `serializeEntry` writes `export const <id>`, and for a version file
 * `changelog-index.cjs` then writes `import { <id> } from './<id>'`. Across the
 * whole `changelog/` directory one convention holds — **id = filename =
 * binding** — and this is the rule that keeps it true.
 *
 * `add-changelog.cjs` calls this to reject a bad slug at input, where the author
 * can still fix it; `serializeEntry` asserts it, so no other path can mint one.
 * The rule lives here, next to the emission that creates the requirement, rather
 * than in the CLI three files away.
 *
 * ⚠️ **Narrower than the ECMAScript grammar on purpose.** `$` is a legal
 * identifier character but `sort-locales.cjs` matches `export const (\w+)`, and
 * `\w` excludes `$` — a `$` in an id makes that script skip the file silently.
 * The alphabet is what the whole toolchain can parse, not what `eval` accepts.
 */
const ENTRY_ID_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

const isValidEntryId = (id) => ENTRY_ID_PATTERN.test(id);

/**
 * The nearest id the tooling would accept — quoted back in error messages.
 *
 * Never returns something the rule would itself reject: an id that reduces to
 * nothing falls back to a placeholder. `--key _highlights` strips to the empty
 * string upstream, which produced the message `Invalid highlight slug "". Use
 * "" instead.` — a fix-it that names an unusable form is worse than none.
 */
const suggestEntryId = (id) => {
  const cleaned = String(id)
    .replace(/[^A-Za-z0-9_]/g, '_')
    .replace(/^(?=[0-9])/, '_');
  return isValidEntryId(cleaned) ? cleaned : 'entry_name';
};

/** `4.3.0` → `v_004_003_000`, the id both the locale files and `src/data/changelog.ts` use. */
function formatVersionId(version) {
  const [major, minor, patch] = version.split('.').map((v) => v.padStart(3, '0'));
  return `v_${major}_${minor}_${patch}`;
}

/** Deeply sorts object keys alphabetically, so a re-serialized file has a stable diff. */
function sortObjectKeys(obj) {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const sortedKeys = Object.keys(obj).sort((a, b) => a.localeCompare(b));
  const newObj = {};
  for (const key of sortedKeys) newObj[key] = sortObjectKeys(obj[key]);
  return newObj;
}

/**
 * Reads `export const x = { … };` back into an object, or `null` if it cannot.
 *
 * **`null` means "did not read", never "was empty".** Every caller has to treat
 * it as a refusal: `readEntryObject(f) || {}` turns an unreadable file into an
 * empty base, and writing that back deletes every key the file held. The fold
 * learned this the expensive way — its unlink used to be unconditional, which
 * deleted a staged entry and its fourteen translations while reporting them
 * folded.
 *
 * ⚠️ The regex stops at the first `};`, so a value containing that sequence is
 * enough to fail. That is the inherited limitation the AST reader would remove.
 */
function readEntryObject(filePath) {
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }

  const match = content.match(/=\s*(\{[\s\S]*?\});/);
  if (!match) return null;

  let parsed = {};
  try {
    eval(`parsed = ${match[1]}`);
  } catch {
    return null;
  }
  return parsed;
}

/**
 * The top-level keys of an entry file, or `null` if it cannot be read.
 *
 * Callers want the keys far more often than the values, and deriving them from
 * the parsed object rather than a second regex is the point of this module: the
 * regex variant this replaces matched `^\s*([a-zA-Z0-9_]+):` line by line, so it
 * read whatever the object's shape happened to indent that way rather than the
 * object's actual keys.
 */
function readEntryKeys(filePath) {
  const obj = readEntryObject(filePath);
  return obj && Object.keys(obj);
}

/**
 * Renders one entry file's contents.
 *
 * Only released version files are typed against the English tree. A staged
 * entry (`feat_*`, `highlight_*`, …) is not in `changelog/index.ts` until the
 * release folds it into a version file, so `Translations[…][id]` does not
 * resolve yet and an annotation fails `tsc -b` in all fourteen non-English
 * locales.
 */
function serializeEntry(id, obj, locale) {
  // Asserted at the emission, not only at the CLI that usually supplies the id:
  // this is the line that turns the id into a binding, so this is the only place
  // that can guarantee no caller mints one that will not compile.
  if (!isValidEntryId(id)) {
    throw new Error(
      `Refusing to write "export const ${id}" — an entry id must match ${ENTRY_ID_PATTERN} ` +
        `so it can be a binding and an import name. Use "${suggestEntryId(id)}" instead.`,
    );
  }

  const sortedObj = sortObjectKeys(obj);
  const body = Object.keys(sortedObj)
    .map((key) => {
      const val = sortedObj[key];
      // A `_highlights` block is a nested object. Without this branch the whole
      // block round-trips to the string '[object Object]' — valid TypeScript,
      // and the release's entire highlights tour destroyed.
      if (Array.isArray(val) || (typeof val === 'object' && val !== null)) {
        return `  ${key}: ${JSON.stringify(val, null, 2)},`;
      }
      // Backslash first, or the escapes this adds get escaped in turn. Without
      // it 'C:\Users' round-trips to 'C:Users'.
      const escaped = String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
      return `  ${key}: '${escaped}',`;
    })
    .join('\n');

  if (locale === 'en' || !isVersionFile(id)) {
    return `export const ${id} = {\n${body}\n};\n`;
  }

  return (
    `import type { Translations } from '@/locales/en';\n\n` +
    `export const ${id}: Translations['changelog']['entries']['${id}'] = {\n${body}\n};\n`
  );
}

/** Writes one entry file. The counterpart of `readEntryObject`. */
function writeEntryFile(filePath, id, obj, locale) {
  fs.writeFileSync(filePath, serializeEntry(id, obj, locale), 'utf8');
}

/**
 * Dotted paths of the non-empty strings `localeObj` still holds verbatim from
 * `enObj`, walking nested objects such as `_highlights`.
 */
function findUntranslatedPaths(enObj, localeObj, prefix = '') {
  return Object.keys(enObj).flatMap((key) => {
    const en = enObj[key];
    const local = localeObj?.[key];
    const keyPath = prefix + key;
    if (en && typeof en === 'object') {
      return findUntranslatedPaths(en, local, `${keyPath}.`);
    }
    return typeof en === 'string' && en.trim() !== '' && local === en ? [keyPath] : [];
  });
}

module.exports = {
  ENTRY_ID_PATTERN,
  findUntranslatedPaths,
  formatVersionId,
  isStagedEntryFile,
  isValidEntryId,
  isVersionFile,
  readEntryKeys,
  readEntryObject,
  serializeEntry,
  sortObjectKeys,
  suggestEntryId,
  writeEntryFile,
};
