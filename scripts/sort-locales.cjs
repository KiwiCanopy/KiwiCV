const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const LOCALES_DIR = path.join(__dirname, '..', 'src', 'locales');

/**
 * Robust stringification that avoids quoting keys where possible and SORTS keys.
 */
function customStringify(obj, indent = '') {
  if (typeof obj === 'string') {
    return `'${obj.replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`;
  }
  if (typeof obj !== 'object' || obj === null) return String(obj);

  if (Array.isArray(obj)) {
    const items = obj.map((v) => customStringify(v, indent + '  '));
    return `[\n${indent}  ${items.join(',\n' + indent + '  ')}\n${indent}]`;
  }

  const entries = Object.keys(obj)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
    .map((key) => {
      const formattedKey = /^[a-zA-Z_$][\w$]*$/.test(key) ? key : `'${key}'`;
      return `${indent}  ${formattedKey}: ${customStringify(obj[key], indent + '  ')}`;
    });
  return `{\n${entries.join(',\n')}\n${indent}}`;
}

function processFile(filePath) {
  if (!fs.existsSync(filePath) || filePath.endsWith('index.ts')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  // Match export const <name> = { ... }; or export const <name>: <type> = { ... };
  const exportRegex = /export const (\w+)(?::\s*([\w\[\]'{}]+))? = (\{[\s\S]*?\});/g;
  let match;
  let hasChanges = false;
  let newContent = content;

  while ((match = exportRegex.exec(content)) !== null) {
    const fullMatch = match[0];
    const exportName = match[1];
    const typeCast = match[2] ? `: ${match[2]}` : '';
    const objStr = match[3];

    let dataObject;
    try {
      // Basic evaluation to get the object
      dataObject = eval(`(${objStr})`);
    } catch (err) {
      console.error(`  ❌ Error parsing ${exportName} in ${filePath}:`, err.message);
      continue;
    }

    const sortedObjStr = customStringify(dataObject);
    const replacement = `export const ${exportName}${typeCast} = ${sortedObjStr};`;

    if (fullMatch !== replacement) {
      newContent = newContent.replace(fullMatch, replacement);
      hasChanges = true;
    }
  }

  if (hasChanges) {
    fs.writeFileSync(filePath, newContent);
    console.log(`  ✅ Sorted: ${path.relative(LOCALES_DIR, filePath)}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (file.endsWith('.ts')) {
      processFile(fullPath);
    }
  });
}

console.log('🚀 Starting global locale sorting...');
walkDir(LOCALES_DIR);

console.log('\n💅 Formatting with Prettier...');
try {
  execSync('npx prettier --write "src/locales/**/*.ts"', {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
  });
} catch (err) {
  console.warn('  ⚠️ Prettier failed, but files were updated.');
}

console.log('\n✨ Global sort complete!');
