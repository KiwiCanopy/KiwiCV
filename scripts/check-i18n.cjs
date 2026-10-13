#!/usr/bin/env node

const { checkHandoffCatalog } = require('./i18n/check-handoff-catalog.cjs');
const { checkLocales } = require('./i18n/check-locales.cjs');
const { checkScripts } = require('./i18n/check-scripts.cjs');
const { checkUsage } = require('./i18n/check-usage.cjs');

const errors = [...checkLocales(), ...checkUsage(), ...checkScripts(), ...checkHandoffCatalog()];

if (errors.length) {
  console.error(`i18n validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(
    'i18n validation passed: locale parity, keys, plurals, placeholders, rich text, scripts, ' +
      'and handoff-catalog sources.',
  );
}
