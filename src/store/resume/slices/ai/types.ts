import { type CoverLetterStampInput } from '@/store/resume/slices/ai/coverLetterStamp';
import { type AITargetKey } from '@/utils/aiTarget';

export interface ReorgSuggestion {
  sectionKey: string;
  originalItems: Array<Record<string, unknown>>;
  proposedItems: Array<Record<string, unknown>>;
  /** Key format: "proposed_0", "proposed_1", "original_{vId}" */
  classification: Record<string, 'added' | 'removed' | 'modified' | 'unchanged'>;
  timestamp: number;
}

export interface AISuggestionEntry {
  originalValue: Record<string, unknown>;
  improvedValue: Record<string, unknown>;
  timestamp: number;
  /**
   * Per list field, the proposed values the pre-run CV never mentions.
   * Optional: absent on stores written before it and on runs that do not mark.
   */
  unsourced?: Record<string, string[]>;
  /** Written onto the object when any field of this proposal is declined (`stampCoverLetter`). */
  onDecline?: Record<string, unknown>;
}

/** Indexed like the `Record<string, …>` it replaced: a prefixed key reads as present. */
export type AISuggestions = Record<Exclude<AITargetKey, 'cv'>, AISuggestionEntry> & {
  cv?: AISuggestionEntry;
};

export interface AIApplyOptions {
  skipSuggestions?: boolean;
  /** Mark proposed skill keywords the pre-run CV never mentions (`markUnsourcedKeywords`). */
  markUnsourced?: boolean;
}

export interface AISlice {
  ai: {
    /** Pending proposals by the target they were recorded under. */
    suggestions: AISuggestions;
    reorgSuggestion: ReorgSuggestion | null;
    isGenerating: boolean;
    activeTarget: AITargetKey | null;
    isModalOpen: boolean;
    /**
     * The modal should start the run itself rather than wait for a config
     * screen. Set by the editor's composer bar, which has already collected the
     * mode and the job description and only needs the modal for progress,
     * errors and the paywall.
     */
    autoRun: boolean;
    /** KiwiCV pre-set the cover-letter tick for THIS open. Never persisted. */
    presetCoverLetter: boolean;
    /**
     * This run writes the letter and NOTHING else: call 1 is skipped, the CV is
     * left exactly as it is, and one request is billed instead of two.
     *
     * ⚠️ Per-open and never persisted, like `presetCoverLetter` beside it. It is
     * the intent of the control that opened the dialog — the cover letter
     * section's "write from the ad" — not a setting the user carries around.
     *
     * ⚠️ It does NOT change the target: the worker requires `granularity: 'cv'`
     * and an ad for the letter call, so a letter-only request travels in the
     * same shape as a whole-CV one and is told apart by this flag alone. That is
     * the shape the letter RETRY has always sent.
     */
    coverLetterOnly: boolean;
    /** True only for the translate-*only* invite, which locks the language. */
    isTranslationMode: boolean;
    /**
     * The language a run should also translate into. Set by the invite *and* by
     * a composer run with the translate add-on ticked, which keeps its own mode.
     */
    translationTargetLang: string | null;
    lastUpdatedTargets: AITargetKey[];
  };
  setAIGenerating: (generating: boolean) => void;
  openAIModal: (
    target: AITargetKey,
    options?: {
      autoRun?: boolean;
      translateTo?: string | null;
      draftCoverLetter?: boolean;
      coverLetterOnly?: boolean;
    },
  ) => void;
  openTranslationModal: (targetLang: string) => void;
  consumeAutoRun: () => void;
  closeAIModal: () => void;
  clearUpdatedTargets: () => void;
  applyAISuggestion: (
    target: AITargetKey,
    improvedData: Record<string, unknown> & {
      items?: Array<Record<string, unknown>>;
      improvedFields?: Record<string, unknown>;
    },
    options?: AIApplyOptions,
  ) => void;
  acceptAISuggestion: (target: AITargetKey, field?: string) => void;
  acceptAllSuggestions: (target: AITargetKey) => void;
  declineAISuggestion: (target: AITargetKey, field?: string) => void;
  stampCoverLetter: (input: CoverLetterStampInput) => void;
  /** Text typed before a field's proposal arrived becomes the user's side of it. */
  keepTypedAsMine: (target: AITargetKey, field: string, value: unknown) => void;
  applyReorgSuggestion: (sectionKey: string, proposedItems: Array<Record<string, unknown>>) => void;
  acceptReorg: () => void;
  declineReorg: () => void;
  resetAI: () => void;
}
