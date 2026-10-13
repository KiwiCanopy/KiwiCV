const fs = require('fs');
const path = require('path');

const moduleName = process.argv[2];

if (!moduleName) {
  console.error(
    '❌ Please provide a module name (e.g., node scripts/add-modular-module.cjs landing)',
  );
  process.exit(1);
}

const localesDir = path.join(__dirname, '..', 'src', 'locales');
const languages = fs
  .readdirSync(localesDir)
  .filter((f) => fs.statSync(path.join(localesDir, f)).isDirectory());

languages.forEach((lang) => {
  const indexPath = path.join(localesDir, lang, 'index.ts');
  const modulePath = path.join(localesDir, lang, `${moduleName}.ts`);

  // 1. Create the module file if it doesn't exist
  if (!fs.existsSync(modulePath)) {
    const content =
      lang === 'en'
        ? `export const ${moduleName} = {\n};\n`
        : `import type { Translations } from '@/locales/en';\n\nexport const ${moduleName}: Translations['${moduleName}'] = {\n};\n`;
    fs.writeFileSync(modulePath, content);
    console.log(`✅ Created ${lang}/${moduleName}.ts`);
  } else {
    console.log(`ℹ️  ${lang}/${moduleName}.ts already exists, skipping creation.`);
  }

  // 2. Update index.ts to include the new module
  if (fs.existsSync(indexPath)) {
    let indexContent = fs.readFileSync(indexPath, 'utf8');

    // Add import if missing
    if (!indexContent.includes(`import { ${moduleName} }`)) {
      // Find the last import and add after it
      const importMatches = [...indexContent.matchAll(/import \{ .* \} from '@\/locales\/.*';/g)];
      if (importMatches.length > 0) {
        const lastImportMatch = importMatches[importMatches.length - 1];
        const insertPos = lastImportMatch.index + lastImportMatch[0].length;
        indexContent =
          indexContent.slice(0, insertPos) +
          `\nimport { ${moduleName} } from '@/locales/${lang}/${moduleName}';` +
          indexContent.slice(insertPos);
      }
    }

    // Add to export object if missing
    if (!indexContent.includes(`  ${moduleName},`)) {
      // Find the beginning of the export const [lang] = { block
      const exportMatch = indexContent.match(/export const \w+(: Translations)? = \{/);
      if (exportMatch) {
        const insertPos = exportMatch.index + exportMatch[0].length;
        indexContent =
          indexContent.slice(0, insertPos) + `\n  ${moduleName},` + indexContent.slice(insertPos);
      }
    }

    fs.writeFileSync(indexPath, indexContent);
    console.log(`✅ Updated ${lang}/index.ts`);
  } else {
    console.warn(`⚠️  ${lang}/index.ts not found, skipping registration.`);
  }
});

console.log(`\n✨ Module "${moduleName}" added to all locales!`);
console.log(`👉 Next steps:`);
console.log(`1. Define "${moduleName}" type in src/locales/en/index.ts (if not already there)`);
console.log(`2. Add keys to src/locales/en/${moduleName}.ts`);
console.log(`3. Run scripts/sync-modular-translations.cjs to propagate to other languages.`);
