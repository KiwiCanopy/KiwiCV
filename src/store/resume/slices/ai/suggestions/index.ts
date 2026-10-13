import * as applyHandlers from '@/store/resume/slices/ai/suggestions/applyHandlers';
import {
  cvText,
  markUnsourcedKeywords,
} from '@/store/resume/slices/ai/suggestions/unsourcedKeywords';
import { type AIApplyOptions } from '@/store/resume/slices/ai/types';
import { type ResumeStore } from '@/store/resume/types';
import { type AITargetKey, isItemTarget, isSectionTarget } from '@/utils/aiTarget';

export const applyAISuggestion = (
  state: ResumeStore,
  target: AITargetKey,
  improvedData: Record<string, unknown> & {
    items?: Array<Record<string, unknown>>;
    improvedFields?: Record<string, unknown>;
  },
  options?: AIApplyOptions,
) => {
  const now = Date.now();
  const skipSuggestions = options?.skipSuggestions || false;
  const updatedTargets: AITargetKey[] = [];
  // Read before the apply below writes the proposal into the CV.
  const sourceText = options?.markUnsourced && !skipSuggestions ? cvText(state.resume) : null;

  if (target === 'cv') {
    applyHandlers.applyCvSuggestion(
      state,
      improvedData,
      skipSuggestions,
      now,
      updatedTargets,
      target,
    );
  } else if (isSectionTarget(target)) {
    applyHandlers.applySectionSuggestion(
      state,
      target,
      improvedData,
      skipSuggestions,
      now,
      updatedTargets,
    );
  } else if (isItemTarget(target)) {
    applyHandlers.applyItemSuggestion(
      state,
      target,
      improvedData,
      skipSuggestions,
      now,
      updatedTargets,
    );
  }

  if (target === 'cv' && updatedTargets.length > 0) {
    updatedTargets.push('cv');
  }

  if (sourceText !== null) markUnsourcedKeywords(state, sourceText, updatedTargets);

  state.ai.lastUpdatedTargets = updatedTargets;
};

export * from '@/store/resume/slices/ai/suggestions/lifecycle';
