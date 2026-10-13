#!/usr/bin/env node

const path = require('node:path');

const { TRANSLATOR_DIR } = require('./i18n/config.cjs');
const { importHandoff } = require('./i18n/import-handoff.cjs');

const apply = process.argv.includes('--apply');
const check = process.argv.includes('--check');

if (apply === check) {
  console.error('Choose exactly one mode: --check or --apply');
  process.exit(64);
}

async function main() {
  const prettier = await import('prettier');

  // `prettier.format()` never reads `.prettierrc` — only `resolveConfig()`
  // does — and passing a bare basename left it no directory to walk up from
  // either. So every applied file came back with prettier's defaults: double
  // quotes against the repo's `singleQuote: true`, and width 80 against 100.
  // The import then looked like it had rewritten all 255 locale files, and the
  // real change only reappeared after a manual `prettier --write` on top.
  const configPath = path.join(__dirname, '..', 'src/locales/en/common.ts');
  const prettierOptions = (await prettier.resolveConfig(configPath)) ?? {};

  const result = await importHandoff({
    apply,
    translatorDir: TRANSLATOR_DIR,
    formatSource: (source, filePath) =>
      prettier.format(source, { ...prettierOptions, filepath: filePath, parser: 'typescript' }),
  });

  if (result.errors.length) {
    console.error(`Translation handoff failed with ${result.errors.length} error(s):`);
    for (const error of result.errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log(
    apply
      ? `Applied the complete ${result.staged.size}-file translation handoff atomically.`
      : `Translation handoff is valid; ${result.staged.size} locale source files are ready to update.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
