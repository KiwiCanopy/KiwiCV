const fs = require('node:fs');
const path = require('node:path');

const { LOCALES, ROOT_DIR } = require('./config.cjs');
const catalog = require('./handoff-catalog.cjs');
const { validateHandoff } = require('./handoff-validation.cjs');
const { catalogId, flattenExports, updateModuleSource } = require('./locale-ast.cjs');

function groupCatalogByModule() {
  const grouped = new Map();
  for (const entry of catalog) {
    const entries = grouped.get(entry.module) || [];
    entries.push(entry);
    grouped.set(entry.module, entries);
  }
  return grouped;
}

function validateStagedSources(staged, errors) {
  const byModule = groupCatalogByModule();
  for (const [moduleName, entries] of byModule) {
    const englishPath = [...staged.keys()].find(
      (filePath) =>
        filePath.endsWith(`/en/${moduleName}.ts`) || filePath.endsWith(`\\en\\${moduleName}.ts`),
    );
    if (!englishPath) continue;
    const englishShape = flattenExports(englishPath, staged.get(englishPath));

    for (const locale of LOCALES) {
      const filePath = [...staged.keys()].find(
        (candidate) =>
          candidate.endsWith(`/${locale}/${moduleName}.ts`) ||
          candidate.endsWith(`\\${locale}\\${moduleName}.ts`),
      );
      if (!filePath) continue;
      const shape = flattenExports(filePath, staged.get(filePath));
      for (const entry of entries) {
        const key = catalogId(entry);
        if (shape.get(key)?.kind !== 'string') {
          errors.push(`${locale}/${moduleName}.ts did not stage ${key} as a string`);
        }
        if (englishShape.get(key)?.kind !== 'string') {
          errors.push(`en/${moduleName}.ts did not stage ${key} as a string`);
        }
      }
    }
  }
}

async function stageSources(packets, localesDir, formatSource) {
  const staged = new Map();
  for (const locale of LOCALES) {
    for (const entry of catalog) {
      const filePath = path.join(localesDir, locale, `${entry.module}.ts`);
      if (!fs.existsSync(filePath)) throw new Error(`${filePath} does not exist`);
      const id = catalogId(entry);
      const value = locale === 'en' ? entry.source : packets.get(locale)[id].translation;
      const current = staged.get(filePath) ?? fs.readFileSync(filePath, 'utf8');
      staged.set(
        filePath,
        updateModuleSource(filePath, current, entry.exportName ?? entry.module, entry.path, value),
      );
    }
  }

  if (formatSource) {
    for (const [filePath, source] of staged) {
      staged.set(filePath, await formatSource(source, filePath));
    }
  }
  return staged;
}

function commitStagedSources(staged) {
  const originals = new Map();
  const temporaryFiles = [];

  try {
    for (const [filePath, source] of staged) {
      originals.set(filePath, fs.readFileSync(filePath, 'utf8'));
      const temporaryPath = `${filePath}.kiwicv-i18n-${process.pid}.tmp`;
      fs.writeFileSync(temporaryPath, source, 'utf8');
      temporaryFiles.push(temporaryPath);
    }
    for (const [filePath] of staged) {
      fs.renameSync(`${filePath}.kiwicv-i18n-${process.pid}.tmp`, filePath);
    }
  } catch (error) {
    for (const [filePath, source] of originals) {
      try {
        fs.writeFileSync(filePath, source, 'utf8');
      } catch {
        // Preserve the original error; rollback is best effort for filesystem failures.
      }
    }
    throw error;
  } finally {
    for (const temporaryPath of temporaryFiles) {
      if (fs.existsSync(temporaryPath)) fs.unlinkSync(temporaryPath);
    }
  }
}

async function importHandoff({
  apply = false,
  formatSource,
  localesDir = path.join(ROOT_DIR, 'src/locales'),
  translatorDir,
}) {
  const validation = validateHandoff(translatorDir);
  if (validation.errors.length) return { errors: validation.errors, staged: null };

  let staged;
  try {
    staged = await stageSources(validation.packets, localesDir, formatSource);
  } catch (error) {
    return { errors: [error.message], staged: null };
  }

  const stagedErrors = [];
  validateStagedSources(staged, stagedErrors);
  if (stagedErrors.length) return { errors: stagedErrors, staged: null };
  if (apply) commitStagedSources(staged);
  return { errors: [], staged };
}

module.exports = { importHandoff };
