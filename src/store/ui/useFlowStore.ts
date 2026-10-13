import { BRAND_STORAGE_KEYS } from '@/config/brand';
import {
  COVER_LETTER_DEFAULT_LENGTH,
  COVER_LETTER_DEFAULT_TONE,
  type CoverLetterLengthPreset,
  type CoverLetterTone,
} from '@/constants/ai';
import { type FlowFocusAnchorId } from '@/constants/focusAnchors';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export type AIImportStep = 'upload' | 'style' | 'processing';
export type AIPromptMode = 'professional' | 'job_description' | 'custom' | 'translate_close';
export type AuthTriggerSource =
  | 'welcome'
  | 'import'
  | 'sync'
  | 'manage'
  | 'ai_suggest'
  | 'settings'
  | 'translation_invite'
  | 'cloud_source'
  | 'landing_try_ai'
  | 'import_after_tour'
  | 'import_editor'
  | 'import_raw_json'
  | 'login_page'
  | 'account_guest';

/** Which sign-in dialog is open. One field, so two at once is unrepresentable. */
export type AuthSurface = 'google' | 'github';

interface FlowStore {
  // Magic AI Import State
  import: {
    step: AIImportStep;
    fileContent: { text?: string; base64?: string } | null;
    fileName: string | null;
    fileType: string | null;
    customInstructions: string;
    allowReorg: boolean;
    sourceLanguage: string;
    /**
     * The free-text language name typed when `sourceLanguage` is the `other`
     * sentinel — a language KiwiCV's interface does not ship in, but the model
     * can still read. Empty for every supported locale.
     */
    sourceLanguageOther: string;
    targetLanguage: string;
    isTranslationEnabled: boolean;
  };
  setImportStep: (step: AIImportStep) => void;
  setImportSourceLanguage: (lang: string) => void;
  setImportSourceLanguageOther: (name: string) => void;
  setImportTargetLanguage: (lang: string) => void;
  setImportIsTranslationEnabled: (enabled: boolean) => void;
  setImportFile: (
    content: { text?: string; base64?: string } | null,
    name: string | null,
    type: string | null,
  ) => void;
  setImportCustomInstructions: (instructions: string) => void;
  setImportAllowReorg: (allow: boolean) => void;
  resetImport: () => void;

  // AI Prompt Modal (Edit with AI) State
  prompt: {
    mode: AIPromptMode | null;
    jobDescription: string;
    customPrompt: string;
    allowReorg: boolean;
    /**
     * Draft a cover letter alongside the tailoring run. One field, two
     * chromes — the composer band's add-ons strip and the AI modal — exactly as
     * `allowReorg` above already is.
     *
     * ⚠️ This is the ASK, not the outcome. `resume.coverLetter.enabled` is
     * flipped by `useAIGeneration` on a letter that actually arrived, never by
     * this tick.
     */
    draftCoverLetter: boolean;
    coverLetterLength: CoverLetterLengthPreset;
    coverLetterTone: CoverLetterTone;
    /**
     * The writing sample replaces the tone preset rather than joining it: the
     * prompt takes one voice block or the other. So the tone select
     * stays visible and disabled while this is on, never a fifth value in it.
     */
    coverLetterMatchStyle: boolean;
  };
  setPromptMode: (mode: AIPromptMode | null) => void;
  setJobDescription: (desc: string) => void;
  setCustomPrompt: (prompt: string) => void;
  setAllowReorg: (allow: boolean) => void;
  setDraftCoverLetter: (draft: boolean) => void;
  setCoverLetterLength: (length: CoverLetterLengthPreset) => void;
  setCoverLetterTone: (tone: CoverLetterTone) => void;
  setCoverLetterMatchStyle: (match: boolean) => void;
  resetPrompt: () => void;

  // Global Auth Modals
  auth: {
    authSurface: AuthSurface | null;
    description: string | null;
    allowGitHub: boolean;
    source: AuthTriggerSource | null;
    syncMode: 'sync' | 'push' | 'manage' | null;
    isPendingRedirect: boolean;
    requireDrive: boolean;
    /**
     * Where focus goes when this modal closes and the control that opened it is
     * gone — because the caller closed the surface that control lived on, in the
     * same state update that opened this one. An id rather than a getter,
     * for the reason `_AuthIsSerializable` below states.
     */
    restoreFocusToId: FlowFocusAnchorId | null;
  };
  openGoogleLogin: (options?: {
    description?: string;
    allowGitHub?: boolean;
    source?: AuthTriggerSource;
    syncMode?: 'sync' | 'push' | 'manage';
    requireDrive?: boolean;
    restoreFocusToId?: FlowFocusAnchorId;
  }) => void;
  closeGoogleLogin: () => void;
  openGitHubLogin: (
    options?:
      | AuthTriggerSource
      | {
          source?: AuthTriggerSource;
          allowBack?: boolean;
          syncMode?: 'sync' | 'push' | 'manage';
          restoreFocusToId?: FlowFocusAnchorId;
        },
  ) => void;
  closeGitHubLogin: () => void;
  setPendingRedirect: (pending: boolean) => void;
  setAuthSource: (source: AuthTriggerSource | null) => void;
  resetAuth: () => void;
}

/**
 * ⚠️ **Everything persisted here has to survive `JSON.stringify`.** For `auth`
 * that holds even if someone adds a `partialize`: its whole job is to outlive
 * the OAuth **redirect**, a full page navigation, so it is reconstructed from
 * serialized text every time the user comes back signed in. For `prompt` and
 * `import` it holds because the `persist` config below has **no** `partialize`,
 * so the entire store is written — a narrower assertion covering only `auth`
 * left a function field in `prompt` compiling green (measured).
 *
 * `JSON.stringify` drops a function **without an error**, so the failure mode is
 * a field that is simply absent on the far side and nothing that says so — which
 * is why `restoreFocusToId` is an id and not the getter every other focus anchor
 * in this codebase is.
 *
 * The alias below is a build error the next time a non-serializable field is
 * added here, which the paragraph above is not.
 */
type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
type AssertJson<T extends Json> = T;
export type _PersistedStateIsSerializable = AssertJson<
  Pick<FlowStore, 'auth' | 'prompt' | 'import'>
>;

/**
 * ⚠️ **Do not answer a failure here with `any`.** `any` is the one shape this
 * alias cannot reject, and it puts the dropped-function defect straight back.
 * It also false-positives on an `interface` — TypeScript only synthesises an
 * implicit index signature for anonymous and aliased object types — so a data
 * field typed by one is spelled as a `type` alias here, not widened.
 */

/**
 * v0 → v1: `isGoogleModalOpen` / `isGitHubModalOpen` become `authSurface`.
 * Google wins a legacy pair that is both true — it is the one opened last.
 */
export function migrateFlowState(persisted: unknown, version: number): unknown {
  const state = persisted as { auth?: Record<string, unknown> } | null;
  if (version < 1 && state?.auth) {
    const { isGoogleModalOpen, isGitHubModalOpen, ...auth } = state.auth;
    const authSurface: AuthSurface | null = isGoogleModalOpen
      ? 'google'
      : isGitHubModalOpen
        ? 'github'
        : null;
    return { ...state, auth: { ...auth, authSurface } };
  }
  return persisted;
}

export const useFlowStore = create<FlowStore>()(
  persist(
    immer((set) => ({
      import: {
        step: 'upload',
        fileContent: null,
        fileName: null,
        fileType: null,
        customInstructions: '',
        allowReorg: false,
        sourceLanguage: '',
        sourceLanguageOther: '',
        targetLanguage: '',
        isTranslationEnabled: false,
      },
      setImportStep: (step) =>
        set((state) => {
          state.import.step = step;
        }),
      setImportSourceLanguage: (lang) =>
        set((state) => {
          state.import.sourceLanguage = lang;
        }),
      setImportSourceLanguageOther: (name) =>
        set((state) => {
          state.import.sourceLanguageOther = name;
        }),
      setImportTargetLanguage: (lang) =>
        set((state) => {
          state.import.targetLanguage = lang;
        }),
      setImportIsTranslationEnabled: (enabled) =>
        set((state) => {
          state.import.isTranslationEnabled = enabled;
        }),
      setImportFile: (content, name, type) =>
        set((state) => {
          state.import.fileContent = content;
          state.import.fileName = name;
          state.import.fileType = type;
        }),
      setImportCustomInstructions: (instructions) =>
        set((state) => {
          state.import.customInstructions = instructions;
        }),
      setImportAllowReorg: (allow) =>
        set((state) => {
          state.import.allowReorg = allow;
        }),
      resetImport: () =>
        set((state) => {
          state.import = {
            step: 'upload',
            fileContent: null,
            fileName: null,
            fileType: null,
            customInstructions: '',
            allowReorg: false,
            sourceLanguage: '',
            sourceLanguageOther: '',
            targetLanguage: '',
            isTranslationEnabled: false,
          };
        }),

      prompt: {
        mode: null,
        jobDescription: '',
        customPrompt: '',
        allowReorg: false,
        draftCoverLetter: false,
        coverLetterLength: COVER_LETTER_DEFAULT_LENGTH,
        coverLetterTone: COVER_LETTER_DEFAULT_TONE,
        coverLetterMatchStyle: false,
      },
      setPromptMode: (mode) =>
        set((state) => {
          state.prompt.mode = mode;
        }),
      setJobDescription: (desc) =>
        set((state) => {
          state.prompt.jobDescription = desc;
        }),
      setCustomPrompt: (prompt) =>
        set((state) => {
          state.prompt.customPrompt = prompt;
        }),
      setAllowReorg: (allow) =>
        set((state) => {
          state.prompt.allowReorg = allow;
        }),
      setDraftCoverLetter: (draft) =>
        set((state) => {
          state.prompt.draftCoverLetter = draft;
        }),
      setCoverLetterLength: (length) =>
        set((state) => {
          state.prompt.coverLetterLength = length;
        }),
      setCoverLetterTone: (tone) =>
        set((state) => {
          state.prompt.coverLetterTone = tone;
        }),
      setCoverLetterMatchStyle: (match) =>
        set((state) => {
          state.prompt.coverLetterMatchStyle = match;
        }),
      /**
       * Clears the DRAFT — what this run was going to say — and deliberately
       * leaves the cover-letter settings alone.
       *
       * ⚠️ Those four are the only prompt state written from **two live
       * surfaces at once**: the composer band and the AI modal are both
       * mounted, and the modal calls this on close. Clearing them here forced
       * the band to keep private mirrors, and mirrors and store then disagreed
       * the moment a user changed something in the modal — unticking the letter
       * there and running from the band spent a second billed request the user
       * had just cancelled. Leaving them is what makes one source of
       * truth possible.
       *
       * The tick surviving a close is not a leak: `coverLetterBlocker` forces
       * it false once the letter it would overwrite exists, and it is
       * `sessionStorage`, so it dies with the tab.
       *
       * ⚠️ A tick KiwiCV pre-set is a different thing and is NOT cleared here —
       * `AIEditModal` clears it on close, reading `ai.presetCoverLetter`, which
       * is per-open state and unpersisted.
       */
      resetPrompt: () =>
        set((state) => {
          state.prompt = {
            ...state.prompt,
            mode: null,
            jobDescription: '',
            customPrompt: '',
            allowReorg: false,
          };
        }),

      auth: {
        authSurface: null,
        description: null,
        allowGitHub: true,
        source: null,
        syncMode: null,
        isPendingRedirect: false,
        requireDrive: false,
        restoreFocusToId: null,
      },
      openGoogleLogin: (options) =>
        set((state) => {
          state.auth.authSurface = 'google';
          state.auth.description = options?.description ?? null;
          state.auth.allowGitHub = options?.allowGitHub ?? true;
          // Always written: a source left by an earlier, dismissed opening would
          // otherwise steer this sign-in's post-auth redirect (e.g. to try-AI).
          state.auth.source = options?.source ?? null;
          if (options?.syncMode) state.auth.syncMode = options.syncMode;
          state.auth.requireDrive = options?.requireDrive ?? false;
          state.auth.restoreFocusToId = options?.restoreFocusToId ?? null;
        }),
      closeGoogleLogin: () =>
        set((state) => {
          if (state.auth.authSurface === 'google') state.auth.authSurface = null;
        }),
      openGitHubLogin: (options) =>
        set((state) => {
          state.auth.authSurface = 'github';
          if (typeof options === 'string') {
            state.auth.source = options;
            state.auth.allowGitHub = false;
            state.auth.restoreFocusToId = null;
          } else {
            state.auth.allowGitHub = options?.allowBack ?? false;
            if (options?.source) {
              state.auth.source = options.source;
            }
            if (options?.syncMode) {
              state.auth.syncMode = options.syncMode;
            }
            state.auth.restoreFocusToId = options?.restoreFocusToId ?? null;
          }
        }),
      closeGitHubLogin: () =>
        set((state) => {
          if (state.auth.authSurface === 'github') state.auth.authSurface = null;
        }),
      setPendingRedirect: (pending) =>
        set((state) => {
          state.auth.isPendingRedirect = pending;
        }),
      setAuthSource: (source) =>
        set((state) => {
          state.auth.source = source;
        }),
      resetAuth: () =>
        set((state) => {
          state.auth = {
            authSurface: null,
            description: null,
            allowGitHub: true,
            source: null,
            syncMode: null,
            isPendingRedirect: false,
            requireDrive: false,
            restoreFocusToId: null,
          };
        }),
    })),
    {
      name: BRAND_STORAGE_KEYS.flowState,
      storage: createJSONStorage(() => sessionStorage),
      // ⚠️ This store outlives a deploy by design — it carries the OAuth
      // redirect — so a tab mid-sign-in rehydrates v0's two booleans.
      version: 1,
      migrate: (persisted, version) => migrateFlowState(persisted, version) as FlowStore,
    },
  ),
);
