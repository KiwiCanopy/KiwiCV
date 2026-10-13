const fs = require('node:fs');
const path = require('node:path');

const { ROOT_DIR } = require('./config.cjs');
const { catalogId, flattenExports } = require('./locale-ast.cjs');
const { placeholderOrderError } = require('./text-validation.cjs');

const LOCALES_DIR = path.join(ROOT_DIR, 'src', 'locales');
const CATALOG_PATH = path.join(__dirname, 'handoff-catalog.cjs');

/**
 * **The handoff catalog stores a second copy of every English string it hands to
 * the translator, and nothing used to compare the two.**
 *
 * `scripts/i18n/handoff-catalog.cjs` carries a `source` per row; `src/locales/en/`
 * carries the same string. `check-i18n.cjs` never `require`d the catalog — only
 * `generate-i18n-handoff.cjs`, `import-handoff.cjs` and `handoff-validation.cjs`
 * did — and the generator's docblock states the split as a design choice: *"the
 * catalog owns the English and `src/locales/` owns the translations."*
 *
 * Measured on a review pass, each mutation from a clean tree:
 *
 * | mutation | `npm run i18n:check` |
 * | --- | --- |
 * | rename a value in `locales/en/themes.ts`, catalog untouched | **passed** |
 * | delete the matching catalog row, locale untouched | **passed** |
 * | point a catalog row at a path that does not exist | **passed**, and `i18n:handoff:generate` produced 15 packets without complaint |
 *
 * ⚠️ **Worse than an ordinary duplicated constant**, which is why this is a
 * check rather than a cleanup: `handoff-validation.cjs` treats `source` as a
 * **protected field** at import time. A stale catalog English is not merely
 * ignored, it is *enforced* — the wrong source goes out to the translator and
 * the reply is validated against that wrong source.
 *
 * ⚠️ **Here rather than in a vitest file, which is what was
 * first proposed.** `i18n:check` is what `.lintstagedrc.cjs` runs on a locale edit, so
 * living here means a drifting rename fails on *the commit that causes it*
 * rather than at the next push. Reusing `flattenExports` is what makes that
 * possible from a `.cjs` checker — it is the same AST reader `check-locales.cjs`
 * uses, so this check reads English exactly the way parity does.
 *
 * ⚠️ The lint-staged rule is widened to the catalog itself for the other
 * direction: editing `handoff-catalog.cjs` alone is just as able to break the
 * pairing, and the `src/locales/**` glob never saw it. `tests/i18n/` wraps this
 * for `npm test` the same way it wraps the other three, so neither trigger
 * has to be complete on its own.
 *
 * ⚠️ **No exemption list, and that is measured rather than assumed.** The open question
 * was whether any `source` is *deliberately* different from the live English — a key
 * edited after its packet went out — in which case this would need a recorded
 * exemption per entry in the `bare-literal-baseline.js` style. Measured:
 * **222 rows, 0 missing, 0 drifted.** So the check starts from a
 * clean tree and every future divergence is a real one. (222, not the ~700
 * first estimated.)
 *
 * The catalog is a curated *subset* of English, so this deliberately checks one
 * direction only here; whether an export has any row at all is
 * `tests/i18n/handoff-catalog-coverage.test.cjs`.
 *
 * ⚠️ **A row's `protectedTokens` are held against the SHIPPED values too**
 * `handoff-validation.cjs` enforces them only on packet import, so a
 * locale file edited by hand could drop a class-1 name with every runner green
 * — which is how `auth` reached `Google Диск` in three locales. Measured:
 * 48 rows carry tokens, 0 shipped violations.
 */
function checkHandoffCatalog() {
  const errors = [];
  const catalog = require(CATALOG_PATH);
  const moduleCache = new Map();

  const entriesFor = (moduleName, locale = 'en') => {
    const cacheKey = `${locale}/${moduleName}`;
    if (!moduleCache.has(cacheKey)) {
      const filePath = path.join(LOCALES_DIR, locale, `${moduleName}.ts`);
      moduleCache.set(
        cacheKey,
        fs.existsSync(filePath)
          ? flattenExports(filePath, fs.readFileSync(filePath, 'utf8'))
          : null,
      );
    }
    return moduleCache.get(cacheKey);
  };

  const otherLocales = fs
    .readdirSync(LOCALES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== 'en')
    .map((entry) => entry.name);

  for (const [index, row] of Object.entries(catalog)) {
    const where = `handoff-catalog[${index}] ${catalogId(row)}`;
    const entries = entriesFor(row.module);

    if (!entries) {
      errors.push(`${where}: no such module — src/locales/en/${row.module}.ts does not exist`);
      continue;
    }

    // `flattenExports` keys are `<exportName>.<path>`; `catalogId` names the
    // row's export, the module's own unless the row says otherwise.
    const entry = entries.get(catalogId(row));

    if (!entry) {
      errors.push(`${where}: key does not exist in English`);
      continue;
    }
    if (entry.kind !== 'string') {
      errors.push(`${where}: English value is ${entry.kind}, not a string`);
      continue;
    }
    if (entry.value !== row.source) {
      errors.push(
        `${where}: catalog source has drifted from English\n` +
          `    catalog: ${JSON.stringify(row.source)}\n` +
          `    English: ${JSON.stringify(entry.value)}`,
      );
    }

    if (row.orderedPlaceholders) {
      for (const locale of otherLocales) {
        const shipped = entriesFor(row.module, locale)?.get(catalogId(row));
        if (shipped?.kind !== 'string') continue;
        const orderError = placeholderOrderError(row, locale, row.source, shipped.value);
        if (orderError)
          errors.push(
            `${where}: ${locale} ${orderError}\n    ${locale}: ${JSON.stringify(shipped.value)}`,
          );
      }
    }

    for (const token of row.protectedTokens || []) {
      for (const locale of otherLocales) {
        const shipped = entriesFor(row.module, locale)?.get(catalogId(row));
        if (shipped?.kind === 'string' && !shipped.value.includes(token)) {
          errors.push(
            `${where}: ${locale} drops the protected token ${JSON.stringify(token)}\n` +
              `    ${locale}: ${JSON.stringify(shipped.value)}`,
          );
        }
      }
    }
  }

  return errors;
}

module.exports = { checkHandoffCatalog };
