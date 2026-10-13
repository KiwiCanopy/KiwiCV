const crypto = require('node:crypto');

const VOID_TAGS = new Set(['br', 'hr', 'img', 'input', 'meta', 'link']);

function fingerprint(source) {
  return crypto.createHash('sha256').update(source, 'utf8').digest('hex');
}

/** Placeholder names in order of first appearance, deduplicated. */
function placeholderSequence(value) {
  const placeholders = new Set();
  const pattern = /{{\s*([\w.-]+)\s*}}|(?<!{){([A-Z_][A-Z0-9_]*|[a-z][\w.-]*)}(?!})/g;
  let match;
  while ((match = pattern.exec(value))) placeholders.add(match[1] || match[2]);
  return [...placeholders];
}

function extractPlaceholders(value) {
  return placeholderSequence(value).sort();
}

/**
 * `extractPlaceholders` is a sorted set, so a translation that swaps two
 * placeholders states the reverse of the English and passes. A row opts in with
 * `orderedPlaceholders` where the sequence carries the meaning ("{{used}} of
 * {{limit}}"). Languages that reorder legitimately (ja "{{total}} 件中
 * {{done}} 件") are declared per locale in `acceptedReorders`, so a reorder is
 * always an explicit, reviewable fact, never a silent one.
 *
 * Returns an error string, or '' when the order is fine or the row is not ordered.
 */
function placeholderOrderError(row, locale, source, translation) {
  if (!row || !row.orderedPlaceholders) return '';
  const expected = (row.acceptedReorders || {})[locale] || placeholderSequence(source);
  const actual = placeholderSequence(translation);
  if (sameSequence(actual, expected)) return '';
  const declared = (row.acceptedReorders || {})[locale] ? ' (declared for this locale)' : '';
  return (
    `placeholder order [${actual}] differs from the expected [${expected}]${declared}; ` +
    'a swapped placeholder states the reverse of the English. If this locale truly ' +
    'reorders, declare it in the row’s acceptedReorders'
  );
}

function sameSequence(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function richTextSignature(value) {
  const signature = [];
  const pattern = /<\/?([a-zA-Z][\w-]*)\b[^>]*>/g;
  let match;
  while ((match = pattern.exec(value))) {
    const raw = match[0];
    const tag = match[1].toLowerCase();
    if (!raw.startsWith('</') && !raw.endsWith('/>') && !VOID_TAGS.has(tag)) {
      signature.push(tag);
    }
  }
  return signature.sort();
}

function validateRichText(value) {
  const errors = [];
  const stack = [];
  const pattern = /<\/?([a-zA-Z][\w-]*)\b[^>]*>/g;
  let match;

  while ((match = pattern.exec(value))) {
    const raw = match[0];
    const tag = match[1].toLowerCase();
    if (raw.endsWith('/>') || VOID_TAGS.has(tag)) continue;
    if (!raw.startsWith('</')) {
      stack.push(tag);
      continue;
    }
    const expected = stack.pop();
    if (expected !== tag) errors.push(`expected </${expected || 'none'}> before </${tag}>`);
  }

  if (stack.length) errors.push(`unclosed tag(s): ${stack.join(', ')}`);
  return errors;
}

function sameStringSet(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

module.exports = {
  extractPlaceholders,
  fingerprint,
  placeholderOrderError,
  placeholderSequence,
  richTextSignature,
  sameStringSet,
  validateRichText,
};
