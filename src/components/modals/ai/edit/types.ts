import { type CoverLetterControlState } from '@/components/modals/ai/template/coverLetterControlTypes';
import {
  type AIChangeDetails,
  type AIRunStage,
  type AIStatus,
  type CoverLetterOutcome,
} from '@/components/modals/ai/template/statusTypes';
import { type LocaleCode } from '@/locales';
import { type Profile } from '@/providers/AuthContext';
import { type AIPromptMode } from '@/store/ui/useFlowStore';
import { type AITargetKey } from '@/utils/aiTarget';

/**
 * The cover-letter block of an improve request. The backend draws the
 * letter from a second call on the CV call 1 just tailored, so this rides along
 * with a whole-CV `job_description` run rather than starting one of its own.
 *
 * Built by `buildCoverLetterRequest`, which returns `null` for every reason not
 * to ask — an empty ad server-side means no letter was REQUESTED, not one that
 * failed.
 */
export interface CoverLetterRequest {
  /** The ad, verbatim — not the `instructions` sentence built around it. */
  jobDescription: string;
  /** The letter's language, a `PROMPT_LANGUAGES` key. */
  targetLang: string;
  /**
   * The length target, in whichever unit `targetLang` uses: words as
   * `countCoverLetterWords` counts them, or characters as
   * `countCoverLetterCharacters` does for `zh` and `ja`. The name is
   * kept for the wire format; `coverLetterLengthUnit(targetLang)` says which.
   */
  wordTarget: number;
  tone?: string;
  /** The user's own prose, for manner only. Capped again server-side. */
  styleSample?: string;
}

export interface AIEditContext {
  activeTarget: AITargetKey | null;
  isTranslationMode: boolean;
  mode: AIPromptMode | null;
  setMode: (mode: AIPromptMode | null) => void;
  jobDescription: string;
  setJobDescription: (val: string) => void;
  customPrompt: string;
  setCustomPrompt: (val: string) => void;
  translateToAnotherLanguage: boolean;
  setTranslateToAnotherLanguage: (val: boolean) => void;
  targetLang: LocaleCode;
  setTargetLang: (val: LocaleCode) => void;
  cvLanguage: LocaleCode;
  isLoading: boolean;
  status: AIStatus;
  setStatus: (status: AIStatus) => void;
  errorMessage: string;
  isUpgradeModalOpen: boolean;
  setIsUpgradeModalOpen: (val: boolean) => void;
  monetizationMode: 'generic' | 'limit';
  setMonetizationMode: (val: 'generic' | 'limit') => void;
  needsUpgrade: boolean;
  isResolvingUsage: boolean;
  isDailyLimitReached: boolean;
  isWholeCV: boolean;
  /**
   * This run writes the cover letter and nothing else: call 1 is skipped, the
   * CV is untouched, one request is billed rather than two. Every CV-shaped
   * control on the config screen is absent under it — translation, skill
   * reorganisation, and the cover-letter tick itself, which is implied by
   * having opened this dialog at all.
   */
  isLetterOnly: boolean;
  isReorgEligible: boolean;
  /** A whole-CV translation past `AI_TRANSLATION_MAX_CHARS`: the run is refused. */
  translationTooLong: boolean;
  allowReorg: boolean;
  setAllowReorg: (val: boolean) => void;
  coverLetter: CoverLetterControlState;
  profile: Profile | null;
  isPremium: boolean;
  closeAIModal: () => void;
  resetState: () => void;
  handleGenerate: () => Promise<void>;
  /** Re-runs call 2 alone, against the CV a completed run already tailored. */
  handleCoverLetterRetry: () => Promise<void>;
  syncUsageStatus: () => Promise<{ proRequestsToday: number; isDailyLimitReached: boolean }>;
  changeDetails?: AIChangeDetails;
  coverLetterOutcome: CoverLetterOutcome | null;
  runStage: AIRunStage | null;
}
