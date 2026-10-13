import { pruneReorgHiddenIds } from '@/store/resume/slices/ai/reorgActions';
import { areValuesEqual } from '@/store/resume/slices/ai/utils';
import { type ResumeStore } from '@/store/resume/types';
import { aiItemScope, resolveAISection } from '@/utils/aiSection';
import {
  type AITargetKey,
  isItemKeyOf,
  isItemTarget,
  isSectionTarget,
  parseAITarget,
  sectionTarget,
} from '@/utils/aiTarget';

/**
 * Which of a proposal's fields may be written back over the live value.
 *
 * ⚠️ **"Keep mine" must never overwrite a later write.** The editor locks a
 * field while its proposal is pending, but other writers still reach the store —
 * a whole-section `setResume` without `clearAI`, a second Improve run — and a
 * blind write-back of `originalValue` would silently discard what they wrote. A
 * field that no longer holds the proposal only loses its marker.
 */
const isStillTheProposal = (
  live: Record<string, unknown>,
  suggestion: { improvedValue: Record<string, unknown> },
  field: string,
) => areValuesEqual(live[field], suggestion.improvedValue[field]);

/**
 * Makes `value` the user's side of one pending field, so "Keep mine" restores
 * it. For text typed into a field before its proposal arrived: the live value —
 * the proposal — is left alone, and a field the proposal does not carry is
 * ignored.
 */
export const keepTypedAsMine = (
  state: ResumeStore,
  target: AITargetKey,
  field: string,
  value: unknown,
) => {
  const suggestion = state.ai.suggestions[target];
  if (!suggestion || !(field in suggestion.improvedValue)) return;
  suggestion.originalValue[field] = value;
};

const cleanupContainerSuggestions = (state: ResumeStore, sectionKey: string) => {
  const keys = Object.keys(state.ai.suggestions);

  // Check if there are any remaining item suggestions for this specific section
  const hasItemSuggestionsForSection = keys.some((key) => isItemKeyOf(key, sectionKey));

  if (!hasItemSuggestionsForSection) {
    delete state.ai.suggestions[sectionTarget(sectionKey)];
  }

  // Check if there are any item suggestions remaining across the entire CV
  const hasAnyItemSuggestions = keys.some(isItemTarget);
  if (!hasAnyItemSuggestions) {
    delete state.ai.suggestions['cv'];
  }
};

export const acceptAISuggestion = (state: ResumeStore, target: AITargetKey, field?: string) => {
  if (!field) {
    delete state.ai.suggestions[target];
    if (isItemTarget(target)) {
      const { sectionKey } = parseAITarget(target);
      cleanupContainerSuggestions(state, sectionKey);
    }
    return;
  }

  const suggestion = state.ai.suggestions[target];
  if (suggestion) {
    delete suggestion.originalValue[field];
    delete suggestion.improvedValue[field];
    if (Object.keys(suggestion.improvedValue).length === 0) {
      delete state.ai.suggestions[target];
      if (isItemTarget(target)) {
        const { sectionKey } = parseAITarget(target);
        cleanupContainerSuggestions(state, sectionKey);
      }
    }
  }
};

export const acceptAllSuggestions = (state: ResumeStore, target: AITargetKey) => {
  // Handle reorg suggestions first
  const reorg = state.ai.reorgSuggestion;
  if (reorg) {
    let shouldAcceptReorg = false;
    if (target === 'cv') {
      shouldAcceptReorg = true;
    } else if (isSectionTarget(target)) {
      shouldAcceptReorg = parseAITarget(target).sectionKey === reorg.sectionKey;
    }

    if (shouldAcceptReorg) {
      pruneReorgHiddenIds(state);
      state.ai.reorgSuggestion = null;
    }
  }

  // Handle standard suggestions
  if (target === 'cv') {
    state.ai.suggestions = {};
    return;
  }

  if (isSectionTarget(target)) {
    const { sectionKey } = parseAITarget(target);
    delete state.ai.suggestions[sectionTarget(sectionKey)];
    Object.keys(state.ai.suggestions).forEach((key) => {
      if (isItemKeyOf(key, sectionKey)) {
        delete state.ai.suggestions[key];
      }
    });
    return;
  }

  if (isItemTarget(target)) {
    delete state.ai.suggestions[target];
    return;
  }
};

export const declineAISuggestion = (state: ResumeStore, target: AITargetKey, field?: string) => {
  const suggestion = state.ai.suggestions[target];
  if (!suggestion) return;

  if (isItemTarget(target)) {
    const { sectionKey, vId } = parseAITarget(target);
    const section = aiItemScope(resolveAISection(state.resume, sectionKey), vId);

    /**
     * A section that is ONE object — `basics`, the cover letter, and
     * a custom section's heading. Keyed on the store's own shape rather
     * than on the name `basics`, which is what this branch tested until the
     * letter arrived and fell through it.
     */
    if (section?.kind === 'object') {
      const current = section.object;

      if (field) {
        // ⚠️ A field the proposal does not carry would restore `undefined` —
        // writing an absent key straight into the letter. Unreachable while the
        // diff panel only offers `Object.keys(improvedValue)`, and one line.
        if (!(field in suggestion.improvedValue)) return;

        if (isStillTheProposal(current, suggestion, field)) {
          section.patchObject({ [field]: suggestion.originalValue[field] });
        }
        delete suggestion.originalValue[field];
        delete suggestion.improvedValue[field];
        if (Object.keys(suggestion.improvedValue).length === 0) {
          delete state.ai.suggestions[target];
          cleanupContainerSuggestions(state, sectionKey);
        }
      } else {
        const restorable = Object.keys(suggestion.improvedValue)
          .filter((key) => isStillTheProposal(current, suggestion, key))
          .reduce(
            (acc, key) => {
              acc[key] = suggestion.originalValue[key];
              return acc;
            },
            {} as Record<string, unknown>,
          );

        section.patchObject(restorable);
        delete state.ai.suggestions[target];
        cleanupContainerSuggestions(state, sectionKey);
      }
    } else if (section?.kind === 'list') {
      const index = section.items.findIndex((item) => item._vId === vId);
      if (index !== -1) {
        const live = section.items[index];
        if (field) {
          if (isStillTheProposal(live, suggestion, field)) {
            live[field] = suggestion.originalValue[field];
          }
          delete suggestion.originalValue[field];
          delete suggestion.improvedValue[field];
          if (Object.keys(suggestion.improvedValue).length === 0) {
            delete state.ai.suggestions[target];
            cleanupContainerSuggestions(state, sectionKey);
          }
        } else {
          for (const key of Object.keys(suggestion.improvedValue)) {
            if (isStillTheProposal(live, suggestion, key)) {
              live[key] = suggestion.originalValue[key];
            }
          }
          delete state.ai.suggestions[target];
          cleanupContainerSuggestions(state, sectionKey);
        }
      }
    }
  } else {
    /**
     * ⚠️ An object-shaped section restores; everything else here only forgets.
     *
     * A `section:` key survives the run only for a section that is ONE object
     * (`applySectionSuggestion`'s third branch) — a list section spends
     * its proposal on `item:` keys, which the branch above restores from, and
     * `usePendingProposals.discardAll` declines those first. So without this,
     * the cover letter would be the only section in the CV where Discard threw
     * the proposal away and kept the AI's wording.
     *
     * Field by field, from the keys actually proposed: a wholesale write-back
     * of `originalValue` would also undo edits the user made after the run.
     */
    const { sectionKey } = parseAITarget(target);
    const section = resolveAISection(state.resume, sectionKey);

    if (isSectionTarget(target) && section?.kind === 'object') {
      // `field` narrows the revert to one proposed key, the way the `item:`
      // branch above does. Ignoring it would make a per-field Reject restore the
      // whole letter and drop the rest of the proposal with it.
      const fields = field ? [field] : Object.keys(suggestion.improvedValue);

      const restored = fields.reduce(
        (acc, key) => {
          acc[key] = suggestion.originalValue[key];
          return acc;
        },
        {} as Record<string, unknown>,
      );

      section.patchObject(restored);

      if (field) {
        delete suggestion.originalValue[field];
        delete suggestion.improvedValue[field];
        if (Object.keys(suggestion.improvedValue).length > 0) return;
      }
    }

    delete state.ai.suggestions[target];
  }
};
