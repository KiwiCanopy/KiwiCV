import { type ResumeStore } from '@/store/resume/types';
import { applySectionPlacement, sanitizePageBreaks } from '@/store/resume/utils';
import { useImportWarningsStore } from '@/store/ui/useImportWarningsStore';
import { type ResumeData, createDefaultCoverLetter, initialResumeState } from '@/types/resume';
import { createEmptyItem } from '@/utils/items';
import { detectBrowserLanguage } from '@/utils/language';
import { ALL_SECTION_KEYS } from '@/utils/layout/constants';
import {
  type SectionKey,
  clearUnusedLayoutMetadata,
  migrateLayoutMetadata,
  migrateToNewLayoutStructure,
  sanitizeLayoutMetadata,
} from '@/utils/layoutMetadata';
import {
  type ImportWarning,
  isMeaningfullyEmpty,
  sanitizeResumeData,
  validateSkills,
} from '@/utils/validation';
import { type StateCreator } from 'zustand';

export interface DataSlice {
  resume: ResumeData;
  setResume: (
    data: Partial<ResumeData> | Record<string, unknown>,
    /**
     * `warnings`: raised before the call, by `preProcessResumeData`.
     * `clearImage`: the import dropped its photo, so the current one must not stick.
     */
    options?: {
      silent?: boolean;
      clearAI?: boolean;
      warnings?: ImportWarning[];
      clearImage?: boolean;
    },
  ) => {
    warnings: ImportWarning[];
    languageMismatch?: boolean;
    importedLanguage?: string;
  };
  updateBasics: (basics: Partial<ResumeData['basics']>) => void;
  updateCoverLetter: (coverLetter: Partial<ResumeData['coverLetter']>) => void;
  updateMeta: (meta: Partial<ResumeData['meta']>) => void;
  /** Deletes one pass-through block; a no-op for a key that is not kept. */
  removePassthroughBlock: (key: string) => void;
  syncVersion: () => void;
  resetResume: () => void;
  initializeSection: (section: SectionKey) => void;
}

export const EMPTY_ARRAY: never[] = [];

const getInitialState = () => {
  const detectedLang = detectBrowserLanguage();
  return {
    ...initialResumeState,
    passthrough: {},
    meta: {
      ...initialResumeState.meta,
      theme: {
        ...initialResumeState.meta.theme,
        locale: detectedLang,
      },
    },
  };
};

export const createDataSlice: StateCreator<
  ResumeStore,
  [['zustand/immer', never]],
  [],
  DataSlice
> = (set, get) => ({
  resume: getInitialState(),

  setResume: (data, options) => {
    const rawData = data as unknown as Record<string, unknown>;

    // 1. Migrate metadata structure (Legacy -> Current)
    // We pass the raw meta block (casting via unknown to satisfy the helper's type)
    const migratedMeta = migrateToNewLayoutStructure(
      (rawData.meta || {}) as unknown as ResumeData['meta'],
    );

    // 2. Sanitize the full resume using the migrated meta
    const { sanitized: sanitizedData, warnings: dateWarnings } = sanitizeResumeData({
      ...rawData,
      meta: migratedMeta,
    } as unknown as ResumeData);

    const isEmpty = isMeaningfullyEmpty(rawData);

    const { validated: validatedSkills, warnings: skillWarnings } = validateSkills(
      sanitizedData.skills || [],
    );

    const totalWarnings = [...(options?.warnings ?? []), ...dateWarnings, ...skillWarnings];

    set((state) => {
      const currentResume = state.resume;

      const isSectionChanged = (key: keyof ResumeData, newData: unknown) => {
        const current = (currentResume as unknown as Record<string, unknown>)[key];
        if (current === newData) return false;
        return JSON.stringify(current) !== JSON.stringify(newData);
      };

      // ⚠️ **Driven from the canonical inventory, not from a copy of it.**
      // This was an eleven-entry `Array<keyof ResumeData>` written out inline,
      // with `skills` bolted on underneath as a twelfth.
      //
      // ⚠️ **It was a latent hazard, not a live defect, and the first draft of
      // this comment said otherwise.** The eleven plus `skills` were *exactly*
      // `ALL_SECTION_KEYS` — the two sets were equal, so nothing was being
      // discarded in 4.0.1. A reviewer pass measured it the decisive way: the new
      // guard file passes **17/17 unchanged against the pre-fix code**. What was wrong
      // was that nothing held the two lists equal, and the failure mode if they
      // ever diverged is silent data loss, because `mergedData` spreads
      // `updatedSections` over `currentResume` — a section absent from the walk
      // keeps the store's old value and the imported one is dropped, on every
      // JSON import, Drive/GitHub sync pull and AI apply. Do not read this as a
      // shipped import bug.
      //
      // ⚠️ **The census delta is not evidence of the property this closes**, and
      // that was the second wrong claim here. Adding a thirteenth key to
      // `ALL_SECTION_KEYS` produced zero errors on the old code and one `TS2345`
      // now, but a reviewer showed the same `TS2345` appears for an eleven-entry
      // inline literal annotated `readonly SectionKey[]` that *drops a key* — so
      // the delta is caused by the annotation, not by the walk being complete.
      // What actually makes completeness hold is that **there is no list left to
      // drift**: the walk *is* the inventory. The behavioural half lives in
      // `setResumeSections.test.ts`.
      const updatedSections: Partial<ResumeData> = {};
      ALL_SECTION_KEYS.forEach((key) => {
        // `skills` is the one section with an extra pass in front of it
        // (`validateSkills` normalises an out-of-range level onto the 1–4 scale
        // and emits an import warning for one it cannot explain as a migration).
        //
        // ⚠️ It does **not** drop entries or count them, which an earlier draft of
        // this comment claimed. `validateSkills` pushes *every* entry —
        // normalised if it did not already match — so the `skippedCount` it used
        // to return was hardcoded `0` and `setResume`'s `skippedSkills` was
        // always `0`. Both are deleted; the invented contract was the
        // justification for this special case, so it mattered.
        //
        // It used to be a separate block below the loop, which is what made the
        // inline list eleven long instead of twelve; folding it in is what lets
        // the walk be the whole inventory.
        const newData =
          key === 'skills'
            ? validatedSkills
            : (sanitizedData as unknown as Record<string, unknown>)[key] || EMPTY_ARRAY;
        (updatedSections as unknown as Record<string, unknown>)[key] = isSectionChanged(
          key,
          newData,
        )
          ? newData
          : (currentResume as unknown as Record<string, unknown>)[key];
      });

      const newBasics = {
        ...initialResumeState.basics,
        ...(sanitizedData.basics || {}),
        // Make image "sticky" - preserve old image if new one is missing or empty
        image: options?.clearImage
          ? ''
          : sanitizedData.basics?.image || currentResume.basics.image || '',
        profiles:
          ((sanitizedData.basics as unknown as Record<string, unknown>)
            ?.profiles as ResumeData['basics']['profiles']) || EMPTY_ARRAY,
        location: {
          ...initialResumeState.basics.location,
          ...(((sanitizedData.basics as unknown as Record<string, unknown>)
            ?.location as ResumeData['basics']['location']) || {}),
        },
      };

      if (isEmpty) {
        if (!options?.silent) {
          useImportWarningsStore.getState().showWarnings(
            [
              {
                section: 'basics',
                field: 'name',
                message: 'sync.import_empty_error',
              },
            ],
            true,
          );
        }
      } else if (totalWarnings.length > 0) {
        if (!options?.silent) {
          useImportWarningsStore.getState().showWarnings(totalWarnings as ImportWarning[], false);
        }
      }

      if (JSON.stringify(currentResume.basics) !== JSON.stringify(newBasics)) {
        updatedSections.basics = newBasics;
      } else {
        updatedSections.basics = currentResume.basics;
      }

      // Cover letter: an import replaces it wholesale (same as content sections).
      // sanitizeResumeData always returns a well-formed block, defaulting to a
      // disabled letter when the imported JSON has none.
      const newCoverLetter = sanitizedData.coverLetter || createDefaultCoverLetter();
      if (JSON.stringify(currentResume.coverLetter) !== JSON.stringify(newCoverLetter)) {
        updatedSections.coverLetter = newCoverLetter;
      } else {
        updatedSections.coverLetter = currentResume.coverLetter;
      }

      // Replaced wholesale like `coverLetter`: an import brings its own sections.
      updatedSections.customSections =
        JSON.stringify(currentResume.customSections) ===
        JSON.stringify(sanitizedData.customSections)
          ? currentResume.customSections
          : sanitizedData.customSections;

      // Replaced wholesale like `coverLetter`: an import brings its own blocks.
      updatedSections.passthrough =
        JSON.stringify(currentResume.passthrough) === JSON.stringify(sanitizedData.passthrough)
          ? currentResume.passthrough
          : sanitizedData.passthrough;

      const newMeta: ResumeData['meta'] = {
        ...initialResumeState.meta,
        ...(sanitizedData.meta || {}),
        theme: {
          ...initialResumeState.meta.theme,
          ...(sanitizedData.meta?.theme || {}),
          locale: sanitizedData.meta?.theme?.locale || currentResume.meta?.theme?.locale || 'en',
          // ⚠️ **No base spread**, and that is the second half of the fix. Spreading
          // `initialResumeState`'s params underneath is what turned "the whitelist
          // forgot a key" from *stripped on import* into *reset to the default on
          // every list edit*: the base's value wins wherever the sanitized block is
          // missing one, and this runs on every move, drag, sort, field commit and
          // delete. `sanitizeResumeData` is now the single authority — it returns
          // every declared param, defaulted from `THEME_PARAM_DEFAULTS` (and four
          // of the ten narrowed; see `sanitizeThemeParams`) — so there is nothing
          // left for a base to fill.
          //
          // ⚠️ **Nothing asserts this line, and that is not an oversight.** With the
          // whitelist complete, restoring the old base changes no observable
          // behaviour — mutation-verified: the full suite stays green with it back.
          // The bug it caused is prevented one level up, by `Required<ThemeParams>`
          // making a missing key a build error rather than by anything here. This
          // is a simplification that removes the amplifier, not a second guard;
          // treating it as one would be the "structural argument nothing asserts"
          // mistake that once shipped.
          //
          // ⚠️ Merging over `currentResume`'s params instead was tried and is
          // wrong: `updateMeta` and `persist` rehydration do not sanitize, so an
          // undeclared key sitting in the store would be carried forward forever
          // rather than dropped here — the property the whitelist exists for.
          // `themeParams.test.ts` pins that one, and it did catch this.
          //
          // The hand-rolled `imageShape` rescue that used to sit here — the scar
          // from the last time this bit, patched one field at a time — is gone; its
          // legacy `meta.ui` read moved into `sanitizeThemeParams`.
          // ⚠️ No `|| {}` fallback. `sanitizeResumeData` always returns a fully
          // populated block — `s()` returns its defaults outright for a non-object
          // input and fills every missing key — so the fallback was unreachable, and
          // the one thing it could ever produce is a zero-key `params`: exactly the
          // failure this fixes, with nothing left to catch it.
          params: sanitizedData.meta.theme.params,
        },
        // Same reasoning, and `hostingPath` was the fifth casualty of the same
        // defect. Unconditional for the same reason as `params` above; the
        // `initialResumeState.meta.export` fallback that stood here was both
        // unreachable and a shared module object heading into immer's frozen state.
        export: sanitizedData.meta.export,
        content: {
          ...initialResumeState.meta.content,
          ...(sanitizedData.meta?.content || {}),
          hiddenIds:
            ((sanitizedData.meta?.content as unknown as Record<string, unknown>)
              ?.hiddenIds as string[]) || EMPTY_ARRAY,
          hiddenSections:
            ((sanitizedData.meta?.content as unknown as Record<string, unknown>)
              ?.hiddenSections as string[]) || EMPTY_ARRAY,
        },
      };

      const mergedData = {
        ...currentResume,
        ...updatedSections,
        meta:
          JSON.stringify(currentResume.meta) === JSON.stringify(newMeta)
            ? currentResume.meta
            : newMeta,
      };

      mergedData.meta = migrateToNewLayoutStructure(mergedData.meta);
      mergedData.meta = sanitizeLayoutMetadata(mergedData.meta, mergedData);
      mergedData.meta.content.pageBreaks = sanitizePageBreaks(mergedData);
      if (options?.clearAI) {
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
      }

      state.resume = mergedData;
    });

    return {
      warnings: totalWarnings,
    };
  },

  updateBasics: (basics) =>
    set((state) => {
      Object.assign(state.resume.basics, basics);
    }),

  updateCoverLetter: (coverLetter) =>
    set((state) => {
      // Older stores may predate the block; seed a default before merging.
      if (!state.resume.coverLetter) {
        state.resume.coverLetter = createDefaultCoverLetter();
      }
      Object.assign(state.resume.coverLetter, coverLetter);
    }),

  updateMeta: (meta) =>
    set((state) => {
      const oldThemeName = state.resume.meta.theme.name;
      const newThemeName = meta.theme?.name || oldThemeName;
      const themeChanged = oldThemeName !== newThemeName;

      if (themeChanged) {
        state.resume.meta = clearUnusedLayoutMetadata(
          migrateLayoutMetadata(state.resume.meta, newThemeName, state.resume),
        );
      }

      // Merge meta
      if (meta.theme) {
        if (meta.theme.params) {
          Object.assign(state.resume.meta.theme.params, meta.theme.params);
        }
        const { params: _p, ...themeRest } = meta.theme;
        Object.assign(state.resume.meta.theme, themeRest);
      }
      if (meta.export) {
        const { ...exportRest } = meta.export;
        Object.assign(state.resume.meta.export, exportRest);
      }
      if (meta.content) Object.assign(state.resume.meta.content, meta.content);
      if (meta.version) state.resume.meta.version = meta.version;
    }),

  removePassthroughBlock: (key) => {
    if (!Object.hasOwn(get().resume.passthrough ?? {}, key)) return;
    set((state) => {
      delete state.resume.passthrough[key];
    });
  },

  syncVersion: () =>
    set((state) => {
      if (state.resume.meta.version !== __APP_VERSION__) {
        state.resume.meta.version = __APP_VERSION__;
      }
    }),

  resetResume: () =>
    set((state) => {
      state.resume = getInitialState();
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
      state.sync = {
        github: { enabled: false },
        googleDrive: { enabled: false },
      };
    }),

  initializeSection: (sectionId) => {
    set((state) => {
      const currentItems = state.resume[sectionId as keyof ResumeData];

      if (Array.isArray(currentItems) && currentItems.length === 0) {
        const newItem = createEmptyItem(sectionId);
        const typedResume = state.resume as unknown as Record<string, unknown>;
        typedResume[sectionId] = [newItem];

        const hiddenSections = state.resume.meta.content.hiddenSections || [];
        state.resume.meta.content.hiddenSections = hiddenSections.filter((s) => s !== sectionId);

        applySectionPlacement(state.resume, sectionId);
      }
    });
  },
});
