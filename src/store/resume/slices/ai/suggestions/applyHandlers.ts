import { areValuesEqual, matchResponseEntry } from '@/store/resume/slices/ai/utils';
import { type ResumeStore } from '@/store/resume/types';
import { type ResumeData } from '@/types/resume';
import { type AISection, aiItemScope, resolveAISection } from '@/utils/aiSection';
import { type AITargetKey, itemTarget, parseAITarget, sectionTarget } from '@/utils/aiTarget';
import { customSectionToken, findCustomSection } from '@/utils/layout/customSections';

type Fields = Record<string, unknown>;

/** The fields of `incoming` whose value differs from `current`. */
const changedFieldsOf = (current: Fields, incoming: Fields): Fields =>
  Object.entries(incoming).reduce((acc, [key, val]) => {
    if (!areValuesEqual(current[key], val)) {
      acc[key] = val;
    }
    return acc;
  }, {} as Fields);

/**
 * Records a proposal for the fields that MOVED — not everything the model
 * returned: on a real run the model echoed `subject` byte-identical, and a diff
 * row saying "no change" is worse than no row.
 *
 * Onto a proposal still pending under `key`, it merges: a field keeps the
 * user's side it already had, since `current` holds the earlier AI text, and a
 * field only the earlier proposal moved stays pending. A field moved back to the
 * user's side is no longer a proposal.
 */
const recordProposal = (
  state: ResumeStore,
  key: AITargetKey,
  current: Fields,
  changedFields: Fields,
  now: number,
) => {
  const pending = state.ai.suggestions[key];
  const improvedValue = { ...pending?.improvedValue, ...changedFields };
  const originalValue: Fields = {};
  for (const field of Object.keys(improvedValue)) {
    originalValue[field] =
      pending && field in pending.originalValue ? pending.originalValue[field] : current[field];
    if (areValuesEqual(originalValue[field], improvedValue[field])) {
      delete originalValue[field];
      delete improvedValue[field];
    }
  }
  if (Object.keys(improvedValue).length === 0) {
    delete state.ai.suggestions[key];
    return;
  }
  // `onDecline` describes the user's original, which a follow-up run does not change.
  state.ai.suggestions[key] = {
    originalValue,
    improvedValue,
    timestamp: now,
    ...(pending?.onDecline && { onDecline: pending.onDecline }),
  };
};

/**
 * Writes `incoming` onto a section that is ONE object — `basics`, the cover
 * letter, and a custom section's own heading — recording the proposal
 * under `key`.
 *
 * ⚠️ Replaced through `patchObject`, never mutated in place. A `section:`
 * proposal can hold the same draft as its `originalValue`, so writing through
 * it would overwrite the original the Discard path restores from.
 */
const applyObjectFields = (
  state: ResumeStore,
  section: Extract<AISection, { object: unknown }>,
  key: AITargetKey,
  incoming: Fields,
  skipSuggestions: boolean,
  now: number,
  updatedTargets: AITargetKey[],
) => {
  const changedFields = changedFieldsOf(section.object, incoming);
  if (Object.keys(changedFields).length === 0) return;

  if (!skipSuggestions) recordProposal(state, key, section.object, changedFields, now);
  section.patchObject(changedFields);
  updatedTargets.push(key);
};

/** Writes `incoming` onto `items[index]`, recording the proposal under `key`. */
const applyListItemFields = (
  state: ResumeStore,
  items: Fields[],
  index: number,
  key: AITargetKey,
  incoming: Fields,
  skipSuggestions: boolean,
  now: number,
  updatedTargets: AITargetKey[],
) => {
  const current = items[index];
  const changedFields = changedFieldsOf(current, incoming);
  if (Object.keys(changedFields).length === 0) return;

  if (!skipSuggestions) recordProposal(state, key, current, changedFields, now);
  items[index] = { ...current, ...changedFields };
  updatedTargets.push(key);
};

/**
 * One custom section's response — `{ title?, items }` — applied onto it.
 * The heading arrives only from a translation; its proposal key is
 * `item:custom:<uuid>`, the object-shaped spelling `isItemKeyOf` counts.
 */
const applyCustomSectionResponse = (
  state: ResumeStore,
  resume: ResumeData,
  sectionKey: string,
  response: { title?: unknown; items?: unknown },
  skipSuggestions: boolean,
  now: number,
  updatedTargets: AITargetKey[],
) => {
  const section = resolveAISection(resume, sectionKey);
  if (section?.kind !== 'custom') return;

  if (Array.isArray(response.items)) {
    applyListEntries(
      state,
      section.items,
      sectionKey,
      response.items,
      skipSuggestions,
      now,
      updatedTargets,
    );
  }
  if (typeof response.title === 'string') {
    applyObjectFields(
      state,
      section,
      itemTarget(sectionKey),
      { title: response.title },
      skipSuggestions,
      now,
      updatedTargets,
    );
  }
};

/**
 * `{ _vId, improvedFields }` entries applied onto the stored items they answer,
 * matched by `matchResponseEntry` — the rule the server grades by.
 */
const applyListEntries = (
  state: ResumeStore,
  items: Fields[],
  sectionKey: string,
  improvedItems: unknown[],
  skipSuggestions: boolean,
  now: number,
  updatedTargets: AITargetKey[],
) => {
  items.forEach((currentItem, index) => {
    const fields = matchResponseEntry(improvedItems, items, index)?.improvedFields;
    if (!fields) return;
    // `sanitizeArray` gives every stored entry a `_vId`; inventing one here
    // would be an id `hiddenIds` never saw.
    applyListItemFields(
      state,
      items,
      index,
      itemTarget(sectionKey, currentItem._vId as string),
      fields,
      skipSuggestions,
      now,
      updatedTargets,
    );
  });
};

export const applyCvSuggestion = (
  state: ResumeStore,
  improvedData: Record<string, unknown>,
  skipSuggestions: boolean,
  now: number,
  updatedTargets: AITargetKey[],
  target: AITargetKey,
) => {
  const nextResume = JSON.parse(JSON.stringify(state.resume)) as ResumeData;
  const changedSections: Record<string, unknown> = {};

  Object.entries(improvedData).forEach(([sectionKey, sectionValue]) => {
    if (!sectionValue) return;

    // Every custom section, matched by `id`: a section has no `_vId`.
    if (sectionKey === 'customSections') {
      if (!Array.isArray(sectionValue)) {
        console.error('[ai] whole-CV run returned customSections that is not a list');
        return;
      }
      sectionValue.forEach((entry) => {
        const response = entry as { id?: unknown; title?: unknown; items?: unknown };
        // Loud, as for any section this path cannot write.
        if (
          typeof response?.id !== 'string' ||
          !findCustomSection(nextResume, customSectionToken(response.id))
        ) {
          console.error('[ai] whole-CV run returned a custom section this resume does not have');
          return;
        }
        applyCustomSectionResponse(
          state,
          nextResume,
          customSectionToken(response.id),
          response,
          skipSuggestions,
          now,
          updatedTargets,
        );
      });
      return;
    }

    const section = resolveAISection(nextResume, sectionKey);

    /**
     * A section that is ONE object — `basics`, and the cover letter once a whole-CV
     * run may carry it. Chosen from the STORE's shape, never from the name
     * `basics` this branch used to test: a second inventory here could disagree
     * with `applySectionSuggestion`'s, and the symptom of that is silence.
     */
    if (section?.kind === 'object') {
      const fields = (sectionValue as { improvedFields?: Fields }).improvedFields;
      if (!fields) {
        console.error(`[ai] whole-CV run returned ${sectionKey} with no improvedFields`);
        return;
      }
      applyObjectFields(
        state,
        section,
        itemTarget(sectionKey),
        fields,
        skipSuggestions,
        now,
        updatedTargets,
      );
      return;
    }

    if (section?.kind !== 'list' || !Array.isArray(sectionValue)) {
      // ⚠️ Loud, because it is a programming error and not a user state.
      // This was a bare `return` inside a `forEach`, so a section the apply path
      // could not write vanished while the run reported success.
      console.error(`[ai] whole-CV run returned ${sectionKey}, which this path cannot write`);
      return;
    }

    applyListEntries(
      state,
      section.items,
      sectionKey,
      sectionValue,
      skipSuggestions,
      now,
      updatedTargets,
    );
  });

  (Object.keys(nextResume) as Array<keyof ResumeData>).forEach((sectionKey) => {
    if (sectionKey === 'meta') return;
    if (JSON.stringify(state.resume[sectionKey]) !== JSON.stringify(nextResume[sectionKey])) {
      (state.resume as unknown as Record<string, unknown>)[sectionKey] = nextResume[sectionKey];
      changedSections[sectionKey] = nextResume[sectionKey];
      updatedTargets.push(sectionTarget(sectionKey));
    }
  });

  if (!skipSuggestions && Object.keys(changedSections).length > 0) {
    state.ai.suggestions[target] = {
      originalValue: {}, // We don't need a full resume clone here
      improvedValue: changedSections,
      timestamp: now,
    };
  }
};

export const applySectionSuggestion = (
  state: ResumeStore,
  target: AITargetKey,
  improvedData: Record<string, unknown> & {
    items?: Array<Record<string, unknown>>;
    improvedFields?: Record<string, unknown>;
  },
  skipSuggestions: boolean,
  now: number,
  updatedTargets: AITargetKey[],
) => {
  const { sectionKey } = parseAITarget(target);
  const section = resolveAISection(state.resume, sectionKey);
  const improvedFields = improvedData.improvedFields || {};
  const items = improvedData.items;

  // A custom section answers `{ title?, items }` and keeps no `section:` container.
  if (section?.kind === 'custom') {
    updatedTargets.push(target);
    applyCustomSectionResponse(
      state,
      state.resume,
      sectionKey,
      improvedData,
      skipSuggestions,
      now,
      updatedTargets,
    );
    return;
  }

  if (!skipSuggestions && Object.keys(improvedFields).length > 0) {
    state.ai.suggestions[target] = {
      originalValue: (section?.kind === 'list'
        ? { items: section.items }
        : section?.object) as Fields,
      improvedValue: improvedFields,
      timestamp: now,
    };
  }

  updatedTargets.push(target);

  if (items && Array.isArray(items)) {
    if (section?.kind === 'list') {
      applyListEntries(
        state,
        section.items,
        sectionKey,
        items,
        skipSuggestions,
        now,
        updatedTargets,
      );
    }
  } else if (section?.kind === 'object') {
    /**
     * A section that is ONE object — `basics`, and the cover letter. It
     * arrives as `improvedFields` with no `items` to walk. The `item:` target is
     * what the diff panel reads, which is also what keeps the rail's count
     * at one (`getAISuggestionBreakdown` suppresses the `section:` container once
     * an `item:` key for it exists).
     *
     * ⚠️ The shape is read off the store, not off a list of section names.
     * A second inventory here could disagree with `SINGLETON_SECTIONS` on the
     * backend, and the symptom of that disagreement is silence.
     */
    applyObjectFields(
      state,
      section,
      itemTarget(sectionKey),
      improvedFields,
      skipSuggestions,
      now,
      updatedTargets,
    );
  }
};

export const applyItemSuggestion = (
  state: ResumeStore,
  target: AITargetKey,
  improvedData: Record<string, unknown>,
  skipSuggestions: boolean,
  now: number,
  updatedTargets: AITargetKey[],
) => {
  const { sectionKey, vId } = parseAITarget(target);
  const section = aiItemScope(resolveAISection(state.resume, sectionKey), vId);
  if (!section) return;

  // An `item:` run is always a list entry. A vId-less `item:` key (`basics`, the
  // letter, a custom heading) is a proposal key for review, never a run.
  if (section.kind !== 'list') {
    console.error(`[ai] item run on ${target}, which is not a list entry`);
    return;
  }

  const index = section.items.findIndex((item) => item._vId === vId);
  if (index === -1) return;
  applyListItemFields(
    state,
    section.items,
    index,
    target,
    (improvedData.improvedFields || {}) as Fields,
    skipSuggestions,
    now,
    updatedTargets,
  );
};
