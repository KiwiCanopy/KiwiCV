const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { exportedObjects, parseSource, removeModuleProperty } = require('./i18n/locale-ast.cjs');

/**
 * Removes locale keys from all fifteen locales.
 *
 *   node scripts/remove-keys.cjs <module>.<path> [<module>:<export>.<path> ...]
 *
 * `<module>` is the file (`editor` → `editor.ts`); `:<export>` names a second
 * export in it, the catalog's spelling (`themes:theme_translations.sections.x`).
 * A bare export name also resolves to the file that declares it
 * (`theme_translations.sections.x`). Edits go through the TypeScript AST, so a
 * file with two exports or a `satisfies` clause is cut, never re-serialized.
 */
const LOCALES_DIR = path.join(__dirname, '..', 'src', 'locales');

const localeDirs = () =>
  fs.readdirSync(LOCALES_DIR).filter((f) => fs.lstatSync(path.join(LOCALES_DIR, f)).isDirectory());

/** `{ file, exportName, keyPath }` for a spec, resolved against the English modules. */
function resolveSpec(spec) {
  const dot = spec.indexOf('.');
  if (dot <= 0 || dot === spec.length - 1) return null;
  const head = spec.slice(0, dot);
  const keyPath = spec.slice(dot + 1);
  const [file, exportName = file] = head.split(':');

  const enDir = path.join(LOCALES_DIR, 'en');
  if (fs.existsSync(path.join(enDir, `${file}.ts`))) return { file, exportName, keyPath };

  // A bare export name: find the module that declares it.
  for (const candidate of fs.readdirSync(enDir).filter((f) => f.endsWith('.ts'))) {
    const filePath = path.join(enDir, candidate);
    const exports = exportedObjects(parseSource(filePath, fs.readFileSync(filePath, 'utf8')));
    if (exports.has(file))
      return { file: candidate.replace(/\.ts$/, ''), exportName: file, keyPath };
  }
  return null;
}

/**
 * The file and export a resolved spec edits in one locale. `changelog.ts` only
 * spreads `changelog/meta.ts`'s `meta`, so a `changelog.*` key lives there.
 */
function moduleTarget(locale, { file, exportName }) {
  const subModule = path.join(LOCALES_DIR, locale, file, 'meta.ts');
  if (exportName === file && fs.existsSync(subModule)) {
    return { filePath: subModule, exportName: 'meta' };
  }
  const direct = path.join(LOCALES_DIR, locale, `${file}.ts`);
  return fs.existsSync(direct) ? { filePath: direct, exportName } : null;
}

function main(specs) {
  if (specs.length === 0) {
    console.log('Usage: node scripts/remove-keys.cjs <module>[:<export>].<key.path>...');
    console.log('Example: node scripts/remove-keys.cjs themes:theme_translations.sections.x');
    process.exit(1);
  }

  const touched = new Set();
  let failed = false;
  for (const spec of specs) {
    const resolved = resolveSpec(spec);
    if (!resolved) {
      console.error(`❌ ${spec}: no module or export by that name`);
      failed = true;
      continue;
    }
    let removed = 0;
    for (const locale of localeDirs()) {
      const target = moduleTarget(locale, resolved);
      if (!target) continue;
      const { filePath } = target;
      let next;
      try {
        next = removeModuleProperty(
          filePath,
          fs.readFileSync(filePath, 'utf8'),
          target.exportName,
          resolved.keyPath,
        );
      } catch (error) {
        console.error(`❌ ${error.message} — left untouched`);
        failed = true;
        continue;
      }
      if (next === null) continue;
      fs.writeFileSync(filePath, next);
      touched.add(filePath);
      removed += 1;
    }
    console.log(`${removed ? '✂️' : '❌'} ${spec}: removed from ${removed} locale(s)`);
    // A spec that matched nothing is a typo, not a success.
    if (removed === 0) failed = true;
  }

  if (touched.size > 0)
    execFileSync('npx', ['prettier', '--write', ...touched], { stdio: 'ignore' });
  if (failed) process.exit(1);
}

if (require.main === module) main(process.argv.slice(2));

module.exports = { moduleTarget, resolveSpec };
