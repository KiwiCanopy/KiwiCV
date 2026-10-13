const fs = require('node:fs');
const path = require('node:path');

const { LOCALES } = require('./config.cjs');
const catalog = require('./handoff-catalog.cjs');
const { catalogId } = require('./locale-ast.cjs');
const {
  extractPlaceholders,
  fingerprint,
  placeholderOrderError,
  richTextSignature,
  sameStringSet,
  validateRichText,
} = require('./text-validation.cjs');

const rowsById = new Map(catalog.map((row) => [catalogId(row), row]));

function canonicalEntry(entry, locale) {
  return {
    module: entry.module,
    path: entry.path,
    source: entry.source,
    translation: locale === 'en' ? entry.source : '',
    context: entry.context,
    placeholders: extractPlaceholders(entry.source),
    protectedTokens: entry.protectedTokens,
    kind: entry.source.includes('<') ? 'rich' : 'plain',
    fingerprint: fingerprint(entry.source),
  };
}

function canonicalEntries(locale) {
  return Object.fromEntries(
    catalog.map((entry) => [catalogId(entry), canonicalEntry(entry, locale)]),
  );
}

function parsePacket(filePath, errors) {
  if (!fs.existsSync(filePath)) {
    errors.push(`${path.basename(filePath)} is missing`);
    return null;
  }
  try {
    const packet = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!packet || Array.isArray(packet) || typeof packet !== 'object') {
      errors.push(`${path.basename(filePath)} must contain a JSON object`);
      return null;
    }
    return packet;
  } catch (error) {
    errors.push(`${path.basename(filePath)} is invalid JSON: ${error.message}`);
    return null;
  }
}

function validateMetadata(locale, id, actual, expected, errors) {
  const label = `${locale}.json:${id}`;
  if (!actual || Array.isArray(actual) || typeof actual !== 'object') {
    errors.push(`${label} must be an object`);
    return;
  }

  for (const field of ['module', 'path', 'source', 'context', 'kind', 'fingerprint']) {
    if (actual[field] !== expected[field]) errors.push(`${label} changed protected field ${field}`);
  }
  for (const field of ['placeholders', 'protectedTokens']) {
    if (
      !Array.isArray(actual[field]) ||
      !sameStringSet([...actual[field]].sort(), [...expected[field]].sort())
    ) {
      errors.push(`${label} changed protected field ${field}`);
    }
  }
}

function validateTranslation(locale, id, entry, errors) {
  const label = `${locale}.json:${id}`;
  if (typeof entry.translation !== 'string' || !entry.translation.trim()) {
    errors.push(`${label} translation is empty`);
    return;
  }
  if (locale === 'en' && entry.translation !== entry.source) {
    errors.push(`${label} English translation must equal the approved source`);
  }
  // The marker claims all fourteen; a locale that needs its own value drops it.
  if (rowsById.get(id)?.verbatim && entry.translation !== entry.source) {
    errors.push(`${label} is marked verbatim and must equal the approved source`);
  }

  const placeholders = extractPlaceholders(entry.translation);
  if (!sameStringSet(placeholders, [...entry.placeholders].sort())) {
    errors.push(`${label} placeholders [${placeholders}] do not match [${entry.placeholders}]`);
  }
  const orderError = placeholderOrderError(
    rowsById.get(id),
    locale,
    entry.source,
    entry.translation,
  );
  if (orderError) errors.push(`${label} ${orderError}`);
  for (const token of entry.protectedTokens) {
    if (!entry.translation.includes(token)) errors.push(`${label} must preserve ${token}`);
  }
  for (const richTextError of validateRichText(entry.translation)) {
    errors.push(`${label} ${richTextError}`);
  }
  if (
    entry.kind === 'rich' &&
    !sameStringSet(richTextSignature(entry.translation), richTextSignature(entry.source))
  ) {
    errors.push(`${label} must preserve the approved rich-text tags`);
  }
}

function validateHandoff(translatorDir) {
  const errors = [];
  const packets = new Map();

  for (const locale of LOCALES) {
    const packet = parsePacket(path.join(translatorDir, `${locale}.json`), errors);
    if (!packet) continue;
    packets.set(locale, packet);
    const expected = canonicalEntries(locale);
    const expectedIds = Object.keys(expected).sort();
    const actualIds = Object.keys(packet).sort();

    for (const id of expectedIds.filter((candidate) => !actualIds.includes(candidate))) {
      errors.push(`${locale}.json is missing ${id}`);
    }
    for (const id of actualIds.filter((candidate) => !expectedIds.includes(candidate))) {
      errors.push(`${locale}.json contains unexpected ${id}`);
    }
    for (const id of expectedIds.filter((candidate) => actualIds.includes(candidate))) {
      validateMetadata(locale, id, packet[id], expected[id], errors);
      if (packet[id] && typeof packet[id] === 'object') {
        validateTranslation(locale, id, packet[id], errors);
      }
    }
  }

  return { errors, packets };
}

module.exports = { canonicalEntries, validateHandoff };
