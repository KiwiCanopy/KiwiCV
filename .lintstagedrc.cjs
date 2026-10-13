/**
 * Function form required: returning a string function prevents lint-staged
 * from appending individual staged filenames to `i18n:sort` / `i18n:check`,
 * which validate the entire locale tree as a set.
 */
module.exports = {
  '*.{js,cjs,mjs,jsx,ts,tsx}': ['prettier --write', 'eslint --fix'],
  '*.{json,md,css,html}': ['prettier --write'],
  // ⚠️ Single brace-expanded glob: prevents running i18n checks twice when both a
  // locale file and the handoff catalog are staged in the same commit.
  '{src/locales/**/*.ts,scripts/i18n/handoff-catalog.cjs}': () =>
    'npm run i18n:sort && npm run i18n:check',
};
