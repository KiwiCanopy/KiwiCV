const path = require('node:path');
const ts = require('typescript');

const { DYNAMIC_CALL_ALLOWLIST, DYNAMIC_PREFIXES, ROOT_DIR } = require('./config.cjs');
const { englishKeys } = require('./check-locales.cjs');
const { dynamicPrefix, forEachTranslatorCall } = require('./translator-calls.cjs');

function hasEnglishPath(keys, requested, objectCall) {
  if (keys.has(requested) || keys.has(`${requested}_one`) || keys.has(`${requested}_other`)) {
    return true;
  }
  return objectCall && [...keys].some((key) => key.startsWith(`${requested}.`));
}

function isAllowlisted(file, expression) {
  return DYNAMIC_CALL_ALLOWLIST.some(
    (entry) => entry.file === file && entry.expression === expression,
  );
}

function checkUsage(srcDir = path.join(ROOT_DIR, 'src')) {
  const keys = englishKeys();
  const errors = [];

  forEachTranslatorCall(srcDir, ({ callee, argument, sourceFile, relativeFile, line }) => {
    if (ts.isStringLiteral(argument) || ts.isNoSubstitutionTemplateLiteral(argument)) {
      if (!hasEnglishPath(keys, argument.text, callee.endsWith('Object'))) {
        errors.push(`${relativeFile}:${line}: ${callee} references missing ${argument.text}`);
      }
      return;
    }

    const prefix = dynamicPrefix(argument, sourceFile);
    if (prefix) {
      if (!DYNAMIC_PREFIXES.includes(prefix)) {
        errors.push(`${relativeFile}:${line}: unregistered dynamic prefix ${prefix}`);
      }
      return;
    }

    const expression = argument.getText(sourceFile);
    if (!isAllowlisted(relativeFile, expression)) {
      errors.push(`${relativeFile}:${line}: unregistered dynamic call ${callee}(${expression})`);
    }
  });

  return errors;
}

module.exports = { checkUsage };
