import { COVER_LETTER_COMPOSITION, CUSTOM_SECTIONS_KEY, WHOLE_CV_SECTIONS } from './definitions.js';
import { isCustomSectionKey } from './target.js';

/**
 * Recursively removes sensitive, large, or unnecessary UI fields from resume data.
 * This saves tokens and keeps the AI focused on content.
 */
export function sanitizeResumeData(data) {
  if (!data || typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(sanitizeResumeData);
  }

  const sanitized = { ...data };
  // The recipient entry is a cover letter addressee: a THIRD PARTY name, company
  // and postal address. A cv-target run sends the whole resume, so it left the
  // browser on every Improve, tailor and translate; no mode can return it, since
  // no composition names those fields.
  //
  // Keep comments ABOVE the array below, and out of its opening line. The parity
  // guard finds that array by text and reads quoted words out of it, so an
  // apostrophe placed inside becomes a phantom key, and repeating the guard own
  // anchor text in a comment makes it lock onto the comment instead.
  const keysToStrip = [
    'image',
    'email',
    'phone',
    'url',
    'profiles',
    'references',
    'visible',
    'imageVisible',
    '_imageVId',
    '_isNew',
    'recipient',
    'location',
    'passthrough',
    'roles',
    'keywords',
  ];

  for (const key of keysToStrip) {
    if (!(key in sanitized)) continue;
    // ⚠️ Two different fields share the name. `basics.location` is the postal
    // address, an OBJECT that no run reaching this sanitizer can return;
    // an entry's is a STRING city that translation runs DO return, as
    // `entryLocation`. The shape tells them apart, as `FIELD_DEFS` already does.
    if (key === 'location' && typeof sanitized[key] === 'string') continue;
    // Skills and interests show their `keywords`; a project, the one item with a
    // `description`, does not, and the AI sees only what the CV shows.
    if (key === 'keywords' && !('description' in sanitized)) continue;
    delete sanitized[key];
  }

  // Recurse into nested objects
  for (const key in sanitized) {
    if (sanitized[key] && typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeResumeData(sanitized[key]);
    }
  }

  return sanitized;
}

const pickFields = (record, fields) =>
  Object.fromEntries(fields.filter((key) => key in record).map((key) => [key, record[key]]));

/**
 * The reduced CV the cover-letter call reads: the sections and fields
 * `COVER_LETTER_COMPOSITION` names and nothing else, with empty sections
 * dropped. Runs AFTER `sanitizeResumeData`, on the tailored CV that call 1
 * produced, so the letter echoes the wording the user is about to see.
 */
export function projectForCoverLetter(resumeData) {
  const projection = {};
  for (const [section, fields] of Object.entries(COVER_LETTER_COMPOSITION)) {
    const value = resumeData?.[section];
    if (Array.isArray(value)) {
      const items = value
        .filter((item) => item && typeof item === 'object')
        .map((item) => pickFields(item, fields))
        .filter((item) => Object.keys(item).length > 0);
      if (items.length > 0) projection[section] = items;
    } else if (value && typeof value === 'object') {
      const picked = pickFields(value, fields);
      if (Object.keys(picked).length > 0) projection[section] = picked;
    }
  }
  return projection;
}

/**
 * A whole-CV run's input turn: the `WHOLE_CV_SECTIONS` the CV carries and
 * nothing else, so the letter's prose — data the schema cannot return — is not
 * billed as input (measured on AI_LOGIC.md § Three response shapes).
 */
export function projectForWholeCv(resumeData) {
  if (!resumeData || typeof resumeData !== 'object' || Array.isArray(resumeData)) {
    return resumeData;
  }
  return Object.fromEntries(
    WHOLE_CV_SECTIONS.filter((section) => section in resumeData).map((section) => [
      section,
      resumeData[section],
    ]),
  );
}

/**
 * The `{ _vId, improvedFields }` response entry that answers `sourceItems[index]`:
 * the entry naming its `_vId`, else — only when the response is as long as the
 * source — the entry at its position if that entry names no item. A shorter or
 * longer id-less list cannot say which entry it answers, so it answers none.
 * The grade, `mergeImprovedIntoCv` and the store all match through this rule; the
 * store's twin is `matchResponseEntry` in `src/store/resume/slices/ai/utils.ts`,
 * and `cvMergeParity.test.ts` pins the two.
 */
export const matchResponseEntry = (entries, sourceItems, index) => {
  if (!Array.isArray(entries) || !Array.isArray(sourceItems)) return null;
  const item = sourceItems[index];
  const vId = item && typeof item === 'object' ? item._vId : undefined;
  const byId = vId
    ? entries.find((entry) => entry && typeof entry === 'object' && entry._vId === vId)
    : undefined;
  if (byId) return byId;
  if (entries.length !== sourceItems.length) return null;
  const positional = entries[index];
  return positional && typeof positional === 'object' && !positional._vId ? positional : null;
};

/**
 * Whether a list-section response is a reorg proposal: at least one item
 * carrying `_sourceVIds`, the field the reorg schema requires. An empty list is
 * not one, so it is graded, merged and applied as no change.
 */
export const isReorgResponse = (items) =>
  Array.isArray(items) &&
  items.some((entry) => entry && typeof entry === 'object' && Array.isArray(entry._sourceVIds));

/**
 * Whether a call-1 response is a skills reorganisation the client should route
 * to `applyReorgSuggestion`. The job result's `isReorg` is this and nothing
 * else, so the client's routing, the grade and the letter's merge read one rule:
 * a request that allowed a reorg but got an item-shaped answer is an item edit.
 */
export const isReorgResult = ({ granularity, id, improved, allowReorg }) => {
  if (!allowReorg || !improved || typeof improved !== 'object') return false;
  if (granularity === 'cv') return isReorgResponse(improved.skills);
  if (granularity === 'section' && id === 'skills') return isReorgResponse(improved.items);
  return false;
};

/**
 * Call 1's response written back onto the CV it improved, so the cover-letter
 * call reads the wording the user is about to see rather than the wording they
 * sent. Beside `hasActualChanges` because both answer one question — how
 * a call-1 response maps onto the CV it came from.
 *
 * Item sections are matched by `matchResponseEntry`, the rule the grade and the
 * store share.
 *
 * ⚠️ **The reorg branch is NOT what the store does, and cannot be.** A whole-CV
 * reorg response never reaches `applyCvSuggestion`: `useAIGeneration` splits
 * `skills` out to `applyReorgSuggestion`, which mints a fresh `_vId` per item
 * and strips `_sourceVIds`. Minting ids server-side would put a second
 * generator on the wrong side of the boundary, so this keeps the response's own
 * items. Invisible to the letter — `COVER_LETTER_COMPOSITION.skills` reads
 * `name` and `keywords` — and confined here, since nothing downstream sees ids.
 * `cvMergeParity.test.ts` runs this against the store and pins the carve-outs.
 */
export function mergeImprovedIntoCv(source, improved, { isReorg } = {}) {
  if (!source || typeof source !== 'object' || !improved || typeof improved !== 'object') {
    return source;
  }

  const merged = { ...source };

  for (const [sectionKey, value] of Object.entries(improved)) {
    if (!value) continue;
    const current = merged[sectionKey];

    if (Array.isArray(current) && Array.isArray(value)) {
      // ⚠️ Reorg is recognised by the marker it actually carries, `_sourceVIds`,
      // not by the ABSENCE of `improvedFields`. Read the other way round, an
      // item-shaped response that merely omitted the wrapper would replace the
      // section with the model's stubs and draft the letter from a CV with no
      // job history — silently, since the projection just drops empty items.
      // Only skills can be reorganised; the worker passes the one decision it
      // also sends the client (`isReorgResult`).
      const reorg = sectionKey === 'skills' && (isReorg ?? isReorgResponse(value));
      merged[sectionKey] = reorg
        ? value
        : current.map((item, index) => {
            const fields = matchResponseEntry(value, current, index)?.improvedFields;
            return fields && typeof fields === 'object' ? { ...item, ...fields } : item;
          });
      continue;
    }

    if (
      current &&
      typeof current === 'object' &&
      !Array.isArray(current) &&
      value.improvedFields &&
      typeof value.improvedFields === 'object'
    ) {
      merged[sectionKey] = { ...current, ...value.improvedFields };
    }
  }

  return merged;
}

/**
 * How long a base64 string may be for a file of `bytes`.
 *
 * base64 inflates by 4/3 and pads to a multiple of 4, so the encoded length is
 * what a guard can measure without decoding — and decoding to measure would
 * allocate the very payload the cap exists to refuse. The slack covers the
 * padding and any `data:` prefix a client prepends.
 */
export function maxBase64CharsFor(bytes) {
  return Math.ceil((bytes * 4) / 3) + 128;
}

/**
 * Whether a returned field equals its source, for No-Op grading.
 *
 * ⚠️ Twin of `areValuesEqual` in `src/store/resume/slices/ai/utils.ts`, which
 * decides what the client writes back: a run billed here as a change must write
 * there. `areValuesEqualParity.test.ts` drives both over one table.
 */
export const areValuesEqual = (a, b) => {
  if (a === b) return true;

  const normA = a === null || a === undefined ? '' : a;
  const normB = b === null || b === undefined ? '' : b;

  // ⚠️ 0 is "Not specified" on both level scales, the only numeric fields, and
  // the schema makes the model return one for every entry — so an absent level
  // came back as 0 and an untouched skill read as changed (#26).
  if ((normA === '' && normB === 0) || (normA === 0 && normB === '')) return true;

  if (typeof normA === 'string' && typeof normB === 'string') {
    return normA.trim() === normB.trim();
  }

  if (Array.isArray(normA) && Array.isArray(normB)) {
    if (normA.length !== normB.length) return false;
    return normA.every((val, i) => areValuesEqual(val, normB[i]));
  }

  if (normA && normB && typeof normA === 'object' && typeof normB === 'object') {
    return JSON.stringify(normA) === JSON.stringify(normB);
  }

  return normA === normB;
};

/** Whether any source item's `matchResponseEntry` answer differs from it. */
const itemsChanged = (sourceItems, improvedItems) =>
  (Array.isArray(sourceItems) ? sourceItems : []).some((sourceItem, index) => {
    const fields = matchResponseEntry(improvedItems, sourceItems, index)?.improvedFields;
    if (!fields || typeof fields !== 'object') return false;
    return Object.entries(fields).some(([key, val]) => !areValuesEqual(sourceItem?.[key], val));
  });

/**
 * A custom section's response against its `{ id, title, items }` source: the
 * heading (translation only) or any entry moved.
 */
const customSectionChanged = (source, improved) =>
  ('title' in (improved || {}) && !areValuesEqual(source?.title, improved.title)) ||
  itemsChanged(source?.items, improved?.items);

/**
 * Checks if the AI response actually changed any content.
 */
export const hasActualChanges = ({ granularity, source, improved, allowReorg, id }) => {
  if (granularity === 'item') {
    const fields = improved.improvedFields || {};
    return Object.entries(fields).some(([key, val]) => !areValuesEqual(source[key], val));
  }
  if (granularity === 'section') {
    if (isCustomSectionKey(id)) return customSectionChanged(source, improved);

    // Reorg mode: structural changes (different count, new items) = has changes
    if (isReorgResult({ granularity, id, improved, allowReorg })) {
      const items = improved.items;
      const sourceArr = Array.isArray(source) ? source : [];
      if (items.length !== sourceArr.length) return true;
      const origVIds = new Set(sourceArr.map((s) => s._vId));
      if (items.some((i) => !(i._sourceVIds || []).some((vid) => origVIds.has(vid)))) return true;
      // Also check if any field content actually changed
      return items.some((item) => {
        const sourceVIds = item._sourceVIds || [];
        if (sourceVIds.length !== 1) return true; // merged or new
        const orig = sourceArr.find((s) => s._vId === sourceVIds[0]);
        if (!orig) return true;
        return (
          !areValuesEqual(orig.name, item.name) ||
          !areValuesEqual(orig.keywords, item.keywords) ||
          !areValuesEqual(orig.level, item.level)
        );
      });
    }
    // A section that is ONE object — the cover letter, and `basics`. Both
    // answer with `improvedFields` and no `items`, so the array walk below sees
    // `[]` and reports a no-op however good the response was. That is what made
    // the cover letter spend a request to say "No changes"; `section:basics`
    // has done the same since it existed.
    if (improved.improvedFields && !Array.isArray(source)) {
      const fields = improved.improvedFields;
      const sourceObject = source || {};
      return Object.entries(fields).some(([key, val]) => !areValuesEqual(sourceObject[key], val));
    }

    return itemsChanged(source, improved.items);
  }
  if (granularity === 'cv') {
    return Object.entries(improved).some(([sectionKey, sectionValue]) => {
      if (sectionKey === CUSTOM_SECTIONS_KEY) {
        const sourceSections = Array.isArray(source[sectionKey]) ? source[sectionKey] : [];
        return (Array.isArray(sectionValue) ? sectionValue : []).some((section) => {
          const sourceSection = sourceSections.find((s) => s?.id === section?.id);
          return Boolean(sourceSection) && customSectionChanged(sourceSection, section);
        });
      }

      // A section that is ONE object, such as `basics`. Read off the SOURCE's shape, so the
      // grade and the write cannot disagree about which sections exist. The
      // frontend twin also excludes `meta`; this one needs no such bound because
      // improve-cv-background.mjs strips `meta` before the sanitizer runs.
      const sourceSection = source[sectionKey];
      if (
        sectionValue &&
        sourceSection &&
        typeof sourceSection === 'object' &&
        !Array.isArray(sourceSection)
      ) {
        const fields = sectionValue.improvedFields || {};
        return Object.entries(fields).some(
          ([key, val]) => !areValuesEqual(sourceSection[key], val),
        );
      }
      if (Array.isArray(sectionValue)) {
        // Reorg mode for skills within full CV
        if (
          sectionKey === 'skills' &&
          isReorgResult({ granularity: 'cv', improved: { skills: sectionValue }, allowReorg })
        ) {
          const sourceArr = source[sectionKey] || [];
          if (sectionValue.length !== sourceArr.length) return true;
          return sectionValue.some((item) => {
            const sourceVIds = item._sourceVIds || [];
            if (sourceVIds.length !== 1) return true;
            const orig = sourceArr.find((s) => s._vId === sourceVIds[0]);
            if (!orig) return true;
            return (
              !areValuesEqual(orig.name, item.name) ||
              !areValuesEqual(orig.keywords, item.keywords) ||
              !areValuesEqual(orig.level, item.level)
            );
          });
        }
        return itemsChanged(source[sectionKey], sectionValue);
      }
      return false;
    });
  }
  return true;
};
