const assert = require('node:assert/strict');
const test = require('node:test');

const {
  findUntranslated,
  untranslatedAllowlist,
} = require('../../scripts/i18n/check-untranslated.cjs');

// Three keys shipped English in all fourteen locales during the 4.2.0 redesign
// — `cvs.*`, `editor.rail.*`, `preview.fits_pages_*` — and every gate stayed
// green each time. The handoff generator is catalog-driven, so a key with no
// `handoff-catalog.cjs` row is never offered for translation and is never
// reported missing: from the tooling's view it does not exist. Renaming an
// English value fails the same way from the other direction, stranding the old
// English where it looks like a translation.
//
// The owner found all three by eye, in the browser, after the release branch
// had merged. This is the check that would have found them first.

test('no key is still English in every non-English locale', () => {
  const findings = findUntranslated();

  const detail = findings
    .map(({ key, source }) => `  ${key}\n      ${JSON.stringify(source)}`)
    .join('\n');

  assert.equal(
    findings.length,
    0,
    `${findings.length} key(s) hold the English source in every locale.\n\n${detail}\n\n` +
      'Either the key has no row in scripts/i18n/handoff-catalog.cjs, so no packet\n' +
      'ever asked for it, or its English was reworded after the last packet and the\n' +
      'stale value is still sitting there. Register it, regenerate the packet, and\n' +
      'have it translated. If it is genuinely a name or a URL, add it to\n' +
      'untranslated-allowlist.cjs with a reason.',
  );
});

test('every allowlisted key is still doing work', () => {
  // A stale allowlist entry is as misleading as a stale baseline: it exempts a
  // key that has since been translated or deleted, and nothing says so. Running
  // the same scan with the allowlist ignored tells us which keys it is actually
  // suppressing, so an entry that has stopped mattering fails here. The list
  // can then only shrink on its own.
  const suppressed = new Set(findUntranslated({ ignoreAllowlist: true }).map((f) => f.key));

  assert.ok(
    suppressed.size > 0,
    'the allowlist-ignored scan found nothing at all, which means it is not looking ' +
      'at the locales any more — the check below would pass vacuously.',
  );

  for (const key of untranslatedAllowlist) {
    assert.ok(
      suppressed.has(key),
      `untranslated-allowlist.cjs lists ${key}, but it is no longer identical across ` +
        'every locale, or no longer exists. Remove the entry.',
    );
  }
});

test('no allowlisted key is a catalog row', () => {
  // A catalogued key that is the same in every locale is declared in VERBATIM,
  // which the generator, the importer and the drift test all read.
  const catalog = require('../../scripts/i18n/handoff-catalog.cjs');
  const { catalogId } = require('../../scripts/i18n/locale-ast.cjs');
  const ids = new Set(catalog.map(catalogId));
  assert.deepEqual(
    untranslatedAllowlist.filter((key) => ids.has(key)),
    [],
    'Move these from untranslated-allowlist.cjs to VERBATIM in scripts/i18n/handoff-catalog.cjs.',
  );
});
