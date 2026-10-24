/**
 * `areValuesEqual` grades nullish as equal to 0 because 0 is "Not specified"
 * on both level scales (#26). That is sound only while the levels are the only
 * numeric fields: a count or a year where 0 is a real value would have its
 * change graded away. A new one fails here first.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { FIELD_DEFS } from '../../netlify/functions/lib/ai/definitions.js';

test('the only numeric AI fields are the two level scales', () => {
  const numeric = Object.entries(FIELD_DEFS)
    .filter(([, def]) => def.type === 'INTEGER' || def.type === 'NUMBER')
    .map(([key]) => key)
    .sort();
  assert.deepEqual(numeric, ['languageLevel', 'skillLevel']);
});
