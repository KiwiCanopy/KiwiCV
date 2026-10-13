import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import * as modalActions from '@/store/resume/slices/ai/modalActions';
import * as reorgActions from '@/store/resume/slices/ai/reorgActions';
import * as suggestionActions from '@/store/resume/slices/ai/suggestions/index';
import { type AISlice } from '@/store/resume/slices/ai/types';
import { type ResumeStore } from '@/store/resume/types';
import { getAITrackingParams } from '@/utils/ai';
import { type StateCreator } from 'zustand';

export const createAISlice: StateCreator<ResumeStore, [['zustand/immer', never]], [], AISlice> = (
  set,
) => ({
  ai: {
    suggestions: {},
    reorgSuggestion: null,
    isGenerating: false,
    activeTarget: null,
    isModalOpen: false,
    autoRun: false,
    presetCoverLetter: false,
    coverLetterOnly: false,
    isTranslationMode: false,
    translationTargetLang: null,
    lastUpdatedTargets: [],
  },

  setAIGenerating: (generating) => set((state) => modalActions.setAIGenerating(state, generating)),

  openAIModal: (target, options) =>
    set((state) => modalActions.openAIModal(state, target, options)),

  openTranslationModal: (targetLang) =>
    set((state) => modalActions.openTranslationModal(state, targetLang)),

  consumeAutoRun: () => set((state) => modalActions.consumeAutoRun(state)),

  closeAIModal: () => set((state) => modalActions.closeAIModal(state)),

  clearUpdatedTargets: () => set((state) => modalActions.clearUpdatedTargets(state)),

  applyAISuggestion: (target, improvedData, options) =>
    set((state) => suggestionActions.applyAISuggestion(state, target, improvedData, options)),

  acceptAISuggestion: (target, field) => {
    analytics.track(ANALYTICS_EVENTS.AI_SUGGESTION_ACCEPTED, {
      field: field || null,
      method: field ? 'single_field' : 'accept_all',
      ...getAITrackingParams(target),
    });
    set((state) => suggestionActions.acceptAISuggestion(state, target, field));
  },

  acceptAllSuggestions: (target) => {
    analytics.track(ANALYTICS_EVENTS.AI_SUGGESTION_ACCEPTED, {
      field: null,
      method: 'accept_all',
      ...getAITrackingParams(target),
    });
    set((state) => suggestionActions.acceptAllSuggestions(state, target));
  },

  declineAISuggestion: (target, field) => {
    analytics.track(ANALYTICS_EVENTS.AI_SUGGESTION_DECLINED, {
      field: field || null,
      method: field ? 'single_field' : 'decline_all',
      ...getAITrackingParams(target),
    });
    set((state) => suggestionActions.declineAISuggestion(state, target, field));
  },

  keepTypedAsMine: (target, field, value) =>
    set((state) => suggestionActions.keepTypedAsMine(state, target, field, value)),

  applyReorgSuggestion: (sectionKey, proposedItems) =>
    set((state) => reorgActions.applyReorgSuggestion(state, sectionKey, proposedItems)),

  acceptReorg: () => set((state) => reorgActions.acceptReorg(state)),

  declineReorg: () => set((state) => reorgActions.declineReorg(state)),
  resetAI: () =>
    set((state) => {
      state.ai = {
        suggestions: {},
        reorgSuggestion: null,
        isGenerating: false,
        activeTarget: null,
        isModalOpen: false,
        autoRun: false,
        presetCoverLetter: false,
        coverLetterOnly: false,
        isTranslationMode: false,
        translationTargetLang: null,
        lastUpdatedTargets: [],
      };
    }),
});

export * from '@/store/resume/slices/ai/types';
