import { type AIPromptMode } from '@/store/ui/useFlowStore';

/**
 * The three things the composer can ask for. A subset of `AIPromptMode`:
 * `translate_close` is reachable from the bar too, but as the translate add-on
 * rather than as a fourth mode — translating is a different job from improving,
 * and the design puts it beside the modes, not among them.
 */
export type ComposerMode = Extract<AIPromptMode, 'professional' | 'job_description' | 'custom'>;

export const COMPOSER_MODES: ComposerMode[] = ['job_description', 'professional', 'custom'];

/**
 * ⚠️ `Record<ComposerMode, …>`, not a lookup with a fallback: a fourth mode is
 * `TS2741` here rather than an unlabelled button at runtime.
 */
export const COMPOSER_MODE_LABEL_KEYS: Record<ComposerMode, string> = {
  professional: 'ai.composer_mode_professional',
  job_description: 'ai.composer_mode_job',
  custom: 'ai.composer_mode_custom',
};

/** Why a run will bounce. `null` — a valid Pass — renders nothing at all. */
export type AccessChipState = 'limit' | 'blocked';
