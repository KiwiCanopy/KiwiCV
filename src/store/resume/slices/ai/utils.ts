/**
 * Whether an AI-returned field equals the stored one — what the apply path writes.
 *
 * ⚠️ Twin of `areValuesEqual` in `netlify/functions/lib/ai/utils.js`, which grades
 * a run billable; `areValuesEqualParity.test.ts` holds the two to one table.
 */
export const areValuesEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;

  // Normalize nullish values to empty strings for comparison
  const normA = a === null || a === undefined ? '' : a;
  const normB = b === null || b === undefined ? '' : b;

  // ⚠️ 0 is "Not specified" on both level scales, the only numeric fields, and
  // the schema makes the model return one for every entry — so an absent level
  // came back as 0 and an untouched skill read as changed (#26).
  if ((normA === '' && normB === 0) || (normA === 0 && normB === '')) return true;

  // Trim strings to ignore insignificant whitespace changes
  if (typeof normA === 'string' && typeof normB === 'string') {
    return normA.trim() === normB.trim();
  }

  // Handle arrays recursively (highlights, skills, etc.)
  if (Array.isArray(normA) && Array.isArray(normB)) {
    if (normA.length !== normB.length) return false;
    return normA.every((val, i) => areValuesEqual(val, normB[i]));
  }

  // Fallback to JSON stringify for other objects
  if (normA && normB && typeof normA === 'object' && typeof normB === 'object') {
    return JSON.stringify(normA) === JSON.stringify(normB);
  }

  return normA === normB;
};

/** A list entry of an AI response, as the item and whole-CV schemas shape it. */
export interface AIResponseEntry {
  _vId?: unknown;
  improvedFields?: Record<string, unknown>;
}

/**
 * The response entry that answers `items[index]`: the entry naming its `_vId`,
 * else — only when the response is as long as `items` — the entry at its position
 * if that entry names no item. A shorter or longer id-less list answers none.
 *
 * ⚠️ Twin of `matchResponseEntry` in `netlify/functions/lib/ai/utils.js`, which the
 * grade and the server merge match through; `cvMergeParity.test.ts` pins the two.
 */
export const matchResponseEntry = (
  entries: readonly unknown[],
  items: readonly { _vId?: unknown }[],
  index: number,
): AIResponseEntry | null => {
  const isEntry = (entry: unknown): entry is AIResponseEntry =>
    Boolean(entry) && typeof entry === 'object';
  const vId = items[index]?._vId;
  const byId = vId ? entries.find((entry) => isEntry(entry) && entry._vId === vId) : undefined;
  if (isEntry(byId)) return byId;
  if (entries.length !== items.length) return null;
  const positional = entries[index];
  return isEntry(positional) && !positional._vId ? positional : null;
};
