const assert = require('node:assert/strict');
const test = require('node:test');

const catalog = require('../../scripts/i18n/handoff-catalog.cjs');
const { checkHandoffCatalog } = require('../../scripts/i18n/check-handoff-catalog.cjs');
const { catalogId } = require('../../scripts/i18n/locale-ast.cjs');

/**
 * The handoff-catalog check, wrapped for `npm test` like the other three checks.
 *
 * `i18n:check` runs this via lint-staged on a locale or catalog edit; this file
 * keeps it in `npm test` too, so a change that skips the hook still gets caught.
 * The two triggers are not redundant and neither subsumes the other — the hook
 * fires on the commit that breaks the pairing, this fires on every push.
 *
 * See `scripts/i18n/check-handoff-catalog.cjs` for what the check asserts and
 * why a stale `source` is worse than an ordinary duplicated constant
 * (`handoff-validation.cjs` *enforces* it as a protected field at import time).
 *
 * Verified by mutation from a clean tree, each independently:
 *
 * | mutation | before | after |
 * | --- | --- | --- |
 * | edit an English value, catalog untouched | passed | **fails, naming the key** |
 * | point a catalog row's `path` at a key that does not exist | passed | **fails** |
 * | point a catalog row's `module` at a file that does not exist | passed | **fails** |
 */
test('every handoff-catalog row matches the live English string', () => {
  assert.deepEqual(
    checkHandoffCatalog(),
    [],
    'A handoff-catalog row names a key English does not have, or stores a ' +
      'source string that no longer matches it. Translators receive the ' +
      'catalog’s copy, and handoff-validation enforces it as a protected ' +
      'field — so a stale row sends the wrong English out and then validates ' +
      'the reply against it.',
  );
});

/**
 * A protected token is a string the translator must reproduce verbatim, which
 * is right for a product name and wrong for a word the locales translate.
 *
 * Sixteen rows protected the bare token `AI`. `handoff-validation.cjs` enforces
 * protected tokens, so the packet *required* the English acronym in every
 * locale — and German had been standardised on **KI**. The next packet
 * therefore reported twelve shipped German strings as invalid, "fixed" them
 * back to AI, and `--apply` reverted that across `ai.ts`, `editor.ts`,
 * `landing.ts`, `monetization.ts` and `roadmap.ts` in one atomic write.
 * `--check` was green at every step: it validates the reply against the rule,
 * and the rule was the bug.
 *
 * Nothing else caught it. `i18n:check` compares English to English,
 * `untranslated.test.cjs` only sees strings identical in *all fifteen* locales,
 * and the apply is one commit-sized diff that reads like a translation update.
 *
 * A genuine product name is protected as the whole string — `'Vertex AI'`,
 * `'Google Drive'` — never as the acronym inside it, so this stays narrow.
 */
test('no catalog row protects the bare token AI', () => {
  const offenders = catalog
    .filter((entry) => (entry.protectedTokens || []).includes('AI'))
    .map((entry) => catalogId(entry));

  assert.deepEqual(
    offenders,
    [],
    'These rows protect "AI" as if it were a product name. It is the concept, ' +
      'and the locales localise it (de: KI, es/fr/it/pt: IA) — protecting it ' +
      'makes the importer demand the English acronym and silently revert ' +
      'those translations. Protect the full product name instead, or nothing:' +
      `\n  ${offenders.join('\n  ')}`,
  );
});
