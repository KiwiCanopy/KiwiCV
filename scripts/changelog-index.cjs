const fs = require('fs');
const path = require('path');

/**
 * Rebuilds every locale's `changelog/index.ts` from the version files actually
 * present on disk.
 *
 * Shared by `sync-changelog.cjs` and `changelog-deps.cjs`. Both can create a
 * version file, and a version file that no index imports is invisible to the
 * app — `src/data/changelog.ts` would advertise an id that resolves to nothing.
 * Keeping one copy of this means a second writer cannot forget the step.
 *
 * The listing is the source of truth, not an accumulated list: a deleted
 * version file drops out of the index on the next run.
 */
function regenerateChangelogIndexes(basePath, locales) {
  locales.forEach((locale) => {
    const targetDir = path.join(basePath, locale, 'changelog');
    if (!fs.existsSync(targetDir)) return;

    const allVersionFiles = fs
      .readdirSync(targetDir)
      .filter((f) => f.startsWith('v_') && f.endsWith('.ts'))
      .sort((a, b) => b.localeCompare(a));

    let indexImports = '';
    let indexExports =
      locale === 'en'
        ? 'export const changelog_entries = {\n'
        : "export const changelog_entries: Translations['changelog']['entries'] = {\n";

    allVersionFiles.forEach((f) => {
      const v = f.replace('.ts', '');
      indexImports += `import { ${v} } from './${v}';\n`;
      indexExports += `  ${v},\n`;
    });
    indexExports += '};\n';

    const finalIndex =
      locale === 'en'
        ? `${indexImports}\n${indexExports}`
        : `import type { Translations } from '@/locales/en';\n\n${indexImports}\n${indexExports}`;
    fs.writeFileSync(path.join(targetDir, 'index.ts'), finalIndex);
  });
}

module.exports = { regenerateChangelogIndexes };
