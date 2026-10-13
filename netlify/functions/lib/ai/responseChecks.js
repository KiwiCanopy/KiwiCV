import { CUSTOM_SECTIONS_KEY } from './definitions.js';
import { areValuesEqual, isReorgResponse, matchResponseEntry } from './utils.js';

/**
 * Failures of a response Vertex did return: the workers fail the job unbilled
 * and warn rather than log a fault. The client shows its generic error.
 */
export const RESPONSE_FAILURES = ['AI_RESPONSE_TRUNCATED', 'TRANSLATION_INCOMPLETE'];

/** Whether Vertex stopped at the output cap: the one test every call reads. */
export const isTruncated = (candidate) => candidate?.finishReason === 'MAX_TOKENS';

/**
 * Throws `AI_RESPONSE_TRUNCATED` when Vertex stopped at the output cap. Such a
 * response is cut mid-JSON, or worse, parses with its tail sections missing.
 * Run before `JSON.parse` and before billing, so a truncated run costs nothing.
 */
export function assertNotTruncated(candidate) {
  if (isTruncated(candidate)) {
    throw new Error('AI_RESPONSE_TRUNCATED');
  }
}

const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

/** How many of `sourceItems` the response list answers, by `matchResponseEntry`. */
const countMatched = (sourceItems, responseItems) =>
  sourceItems.filter((_, index) => matchResponseEntry(responseItems, sourceItems, index)).length;

/**
 * Per-section coverage of a whole-CV translation: `{ section, matched, total }`
 * for every section the call input carries — every list entry answered, every
 * object section present, every custom section and its entries answered. A
 * reorganised skills list covers a source skill when some item's `_sourceVIds`
 * names it.
 */
export function translationCoverage({ source, improved, allowReorg }) {
  const response = isObject(improved) ? improved : {};
  const coverage = [];

  for (const [section, value] of Object.entries(isObject(source) ? source : {})) {
    const answer = response[section];

    if (section === CUSTOM_SECTIONS_KEY) {
      const answered = Array.isArray(answer) ? answer : [];
      for (const custom of Array.isArray(value) ? value : []) {
        const match = answered.find((entry) => isObject(entry) && entry.id === custom?.id);
        const items = Array.isArray(custom?.items) ? custom.items : [];
        coverage.push({
          section: CUSTOM_SECTIONS_KEY,
          matched: (match ? 1 : 0) + (match ? countMatched(items, match.items) : 0),
          total: 1 + items.length,
        });
      }
      continue;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      if (section === 'skills' && allowReorg && isReorgResponse(answer)) {
        const covered = new Set(answer.flatMap((item) => item?._sourceVIds || []));
        coverage.push({
          section,
          matched: value.filter((item) => covered.has(item?._vId)).length,
          total: value.length,
        });
        continue;
      }
      coverage.push({ section, matched: countMatched(value, answer), total: value.length });
      continue;
    }

    if (isObject(value)) {
      coverage.push({ section, matched: isObject(answer?.improvedFields) ? 1 : 0, total: 1 });
    }
  }

  return coverage;
}

/**
 * Throws `TRANSLATION_INCOMPLETE` unless a whole-CV translation answered every
 * entry it was sent: a run that returns a handful of items with `STOP` is as
 * partial as a truncated one, and must fail before it is billed. Logs counts
 * per section, never content.
 */
export function assertTranslationComplete({ source, improved, allowReorg }) {
  const coverage = translationCoverage({ source, improved, allowReorg });
  const short = coverage.filter(({ matched, total }) => matched !== total);
  if (short.length === 0) return;
  console.warn(
    `[Translation] incomplete: ${short.map(({ section, matched, total }) => `${section} ${matched}/${total}`).join(', ')}`,
  );
  throw new Error('TRANSLATION_INCOMPLETE');
}

/**
 * The facts whole-CV tailoring may not change: object sections by field, list
 * sections by entry field. The prompt names them and does not hold them
 * (ops/AI_LOGIC.md § Tailoring names its facts).
 */
export const TAILORING_FACT_FIELDS = {
  basics: ['label'],
  work: ['name', 'position', 'startDate', 'endDate'],
};

/**
 * Removes every `TAILORING_FACT_FIELDS` field from a whole-CV response, so the
 * grade, the letter's merge and the store all see the source value. Returns
 * how many of the removed fields carried a change. Mutates `improved`.
 */
export function dropTailoringFactChanges({ source, improved }) {
  if (!isObject(improved)) return 0;
  let dropped = 0;
  const strip = (fields, sourceItem, keys) => {
    if (!isObject(fields)) return;
    for (const key of keys) {
      if (!(key in fields)) continue;
      if (!areValuesEqual(sourceItem?.[key], fields[key])) dropped += 1;
      delete fields[key];
    }
  };

  for (const [section, keys] of Object.entries(TAILORING_FACT_FIELDS)) {
    const answer = improved[section];
    const sourceSection = source?.[section];
    if (Array.isArray(answer)) {
      const sourceItems = Array.isArray(sourceSection) ? sourceSection : [];
      const stripped = new Set();
      sourceItems.forEach((item, index) => {
        const match = matchResponseEntry(answer, sourceItems, index);
        if (!match || stripped.has(match)) return;
        stripped.add(match);
        strip(match.improvedFields, item, keys);
      });
      // An entry that answers no source item merges nowhere; strip it anyway.
      answer
        .filter((entry) => isObject(entry) && !stripped.has(entry))
        .forEach((entry) => strip(entry.improvedFields, undefined, keys));
    } else if (isObject(answer)) {
      strip(answer.improvedFields, sourceSection, keys);
    }
  }
  return dropped;
}

const keywordKey = (keyword) => (typeof keyword === 'string' ? keyword.trim().toLowerCase() : '');

/** `source` keywords absent from `kept`, compared trimmed and case-insensitively. */
const missingKeywords = (source, kept) => {
  const present = new Set(kept.map(keywordKey));
  return (Array.isArray(source) ? source : []).filter(
    (keyword) => keywordKey(keyword) && !present.has(keywordKey(keyword)),
  );
};

/** Appends to `fields.keywords` the `source` keywords it lacks; returns how many. */
const restoreInto = (fields, source) => {
  if (!isObject(fields) || !Array.isArray(fields.keywords)) return 0;
  const missing = missingKeywords(source?.keywords, fields.keywords);
  fields.keywords = [...fields.keywords, ...missing];
  return missing.length;
};

/** Item-shaped skills: each matched entry gets its own missing keywords back, at the end. */
const restoreItemKeywords = (sourceItems, entries) =>
  sourceItems.reduce(
    (restored, item, index) =>
      restored + restoreInto(matchResponseEntry(entries, sourceItems, index)?.improvedFields, item),
    0,
  );

/** Whether any item carries `name` as its name or a keyword. */
const namedIn = (items, name) =>
  items.some(
    (entry) =>
      keywordKey(entry?.name) === keywordKey(name) ||
      (Array.isArray(entry?.keywords) &&
        entry.keywords.some((k) => keywordKey(k) === keywordKey(name))),
  );

/**
 * A reorganised skills list: a keyword is kept if any item carries it, since a
 * reorg moves keywords between groups by design. A missing one goes back on the
 * first item naming its source in `_sourceVIds`. A source group no item names —
 * which the store's reorg would delete — comes back as its own item carrying the
 * keywords no other item kept; a keyword-less group (the name is the skill)
 * comes back when no item carries its name.
 */
const restoreReorgKeywords = (sourceItems, items) => {
  let restored = 0;
  for (const item of sourceItems) {
    const missing = missingKeywords(
      item?.keywords,
      items.flatMap((entry) => (Array.isArray(entry?.keywords) ? entry.keywords : [])),
    );
    const owner = items.find(
      (entry) => Array.isArray(entry?._sourceVIds) && entry._sourceVIds.includes(item?._vId),
    );
    if (owner) {
      if (missing.length === 0) continue;
      owner.keywords = [...(Array.isArray(owner.keywords) ? owner.keywords : []), ...missing];
      restored += missing.length;
    } else if (
      item?._vId &&
      (missing.length > 0 ||
        (missingKeywords(item.keywords, []).length === 0 && !namedIn(items, item.name)))
    ) {
      const { _vId, ...fields } = item;
      items.push({ ...fields, keywords: missing, _sourceVIds: [_vId] });
      restored += missing.length;
    }
  }
  return restored;
};

/**
 * Puts back every skill keyword a tailoring response dropped: tailoring may
 * rename a keyword (`Postgres` → `PostgreSQL`) but never remove one. "Kept" is
 * a trimmed, case-insensitive match and nothing looser, so a renamed keyword
 * comes back beside its new name (`k8s` and `Kubernetes`) — a duplicate the
 * user can delete, where a dropped skill is one they would not notice.
 * Returns how many keywords were restored. Mutates `improved`.
 *
 * @param {{ granularity: 'cv' | 'section' | 'item', sectionKey: string,
 *   source: unknown, improved: unknown, allowReorg: boolean }} run
 */
export function restoreDroppedSkillKeywords({
  granularity,
  sectionKey,
  source,
  improved,
  allowReorg,
}) {
  if (!isObject(improved)) return 0;
  if (granularity === 'item') {
    // The store applies an item run to the target's entry and ignores the echoed `_vId`.
    if (sectionKey !== 'skills' || !isObject(source)) return 0;
    return restoreInto(improved.improvedFields, source);
  }

  const sourceItems = granularity === 'cv' ? source?.skills : source;
  const answer = granularity === 'cv' ? improved.skills : improved.items;
  if (granularity === 'section' && sectionKey !== 'skills') return 0;
  if (!Array.isArray(sourceItems) || !Array.isArray(answer)) return 0;
  return allowReorg && isReorgResponse(answer)
    ? restoreReorgKeywords(sourceItems, answer)
    : restoreItemKeywords(sourceItems, answer);
}
