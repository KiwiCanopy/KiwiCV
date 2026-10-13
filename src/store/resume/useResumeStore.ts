import { migrateResumeStore } from '@/store/resume/migrations';
import { reencodeStoredPhoto } from '@/store/resume/reencodeStoredPhoto';
import { type AISuggestionEntry } from '@/store/resume/slices/ai/types';
import { createAISlice } from '@/store/resume/slices/aiSlice';
import { createCustomSectionsSlice } from '@/store/resume/slices/customSectionsSlice';
import { createDataSlice } from '@/store/resume/slices/dataSlice';
import { createLayoutSlice } from '@/store/resume/slices/layoutSlice';
import { createStatusSlice } from '@/store/resume/slices/statusSlice';
import { createSyncSlice } from '@/store/resume/slices/syncSlice';
import { createVisibilitySlice } from '@/store/resume/slices/visibilitySlice';
import { type ResumeStore } from '@/store/resume/types';
import { sanitizePageBreaks } from '@/store/resume/utils';
import { isAITargetKey } from '@/utils/aiTarget';
import { sanitizeResumeData } from '@/utils/validation';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export type { ResumeStore };
export const EMPTY_ARRAY: never[] = [];

// Wrap localStorage so the store's saveStatus reflects real persistence instead
// of a hardcoded "saved" label. saveStatus/lastSavedAt are excluded from
// persistence, so the serialized value only changes on genuine content edits;
// status-only rewrites are ignored to avoid a set → persist → set loop, and the
// status update is deferred out of the persist write (which runs inside a set()).
let lastPersistedValue: string | null = null;
const statusTrackingStorage = createJSONStorage(() => ({
  getItem: (name: string) => localStorage.getItem(name),
  setItem: (name: string, value: string) => {
    if (value === lastPersistedValue) return;
    // Record the attempt regardless of outcome: the deferred setSaveStatus below
    // is itself a store set() that re-enters this writer, and without advancing
    // lastPersistedValue a failing write would retry — and re-fail — forever.
    lastPersistedValue = value;
    try {
      // No Web Storage at all (vitest's node environment) is not a failed save;
      // inside the try because a blocked-storage getter throws on this access.
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(name, value);
      queueMicrotask(() => useResumeStore.getState().setSaveStatus('saved'));
    } catch (error) {
      console.error('Persist to localStorage failed:', error);
      queueMicrotask(() => useResumeStore.getState().setSaveStatus('error'));
    }
  },
  removeItem: (name: string) => localStorage.removeItem(name),
}));

export const useResumeStore = create<ResumeStore>()(
  persist(
    immer((...a) => ({
      ...createDataSlice(...a),
      ...createCustomSectionsSlice(...a),
      ...createLayoutSlice(...a),
      ...createVisibilitySlice(...a),
      ...createSyncSlice(...a),
      ...createStatusSlice(...a),
      ...createAISlice(...a),
    })),
    {
      name: 'resume-storage',
      version: 10,
      storage: statusTrackingStorage,
      partialize: (state: ResumeStore) => {
        // Exclude transient states and functions from persistence
        const {
          isGeneratingPDF: _isGen,
          setIsGeneratingPDF: _setIsGen,
          isSyncingData: _isSync,
          setIsSyncingData: _setIsSync,
          isPdfRenderError: _isErr,
          setIsPdfRenderError: _setIsErr,
          saveStatus: _saveStatus,
          lastSavedAt: _lastSavedAt,
          setSaveStatus: _setSaveStatus,
          syncVersion: _syncVer,
          // ⚠️ `isModalOpen`, `autoRun` and `activeTarget` belong HERE, with the
          // other transient AI state — they describe a dialog that is on screen
          // right now, not data. Persisted, a reload restored the run dialog and
          // re-fired the run, so refreshing to escape a stuck run re-armed it.
          // `suggestions` and `reorgSuggestion` stay persistent: those are
          // pending proposals the user has not answered yet.
          ai: {
            isGenerating: _isAIGen,
            isTranslationMode: _isTransMode,
            translationTargetLang: _transLang,
            lastUpdatedTargets: _lastTargets,
            isModalOpen: _isModalOpen,
            autoRun: _autoRun,
            activeTarget: _activeTarget,
            presetCoverLetter: _presetCL,
            coverLetterOnly: _coverLetterOnly,
            ...persistentAI
          },
          setAIGenerating: _setAIGen,
          ...persistentState
        } = state;
        return { ...persistentState, ai: persistentAI };
      },
      migrate: migrateResumeStore,
      onRehydrateStorage: () => (state) => {
        if (state) {
          // ⚠️ **The rehydration boundary.** `sanitizeResumeData` runs on
          // the `setResume` paths only — JSON import, Drive/GitHub sync pull, AI
          // apply — so until this line everything already in `localStorage`
          // reached the renderers with no validation at all. That is how the
          // `addressSchema` and `separator` defects were reachable, and it meant
          // a value stored by an older build kept its old shape
          // forever. Measured through `setResume`, injecting a non-string into
          // the `ResumeData` handed to each theme — i.e. what rehydration
          // produces — `basics.url` threw on **12 of 12 HTML previews and 12 of
          // 12 PDF serializers** (`basics.url.replace is not a function`), and
          // `work[].highlights`, `basics.name`/`label`/`email`/`phone`/
          // `summary`, `basics.image` and the five `coverLetter` fields threw on
          // most or all of the same twenty-four.
          //
          // ⚠️ **`sanitizeResumeData` itself, not a narrower coercion pass**, and
          // all three arguments that pointed at "narrower" were measured dead:
          //
          // - *`_vId` churn.* The worry was that reusing the full function would
          //   mint a fresh id for a legacy item on **every** load, so `hiddenIds`
          //   (keyed `${section}:${_vId}`) would never stick. It does not hold —
          //   but ⚠️ **not for the reason the original comment gave.** That comment
          //   says a mutation made here "reaches `localStorage`, with no user
          //   action". Measured against the real `statusTrackingStorage`,
          //   counting writes to `resume-storage`, it does not: rehydration
          //   performs **zero** writes, because zustand's `hydrate()` calls
          //   `set()` and *then* runs this callback, so what is mutated here was
          //   never what the persist subscription serialized. The repair rides
          //   along on the **next** persisted state change instead.
          //
          //   The objection still fails, for a stronger reason: `_vId` and
          //   everything keyed on it live in this same `resume` blob and are
          //   written by the same write, so they cannot diverge. A re-mint on a
          //   boot that never writes is unobservable, because no `hiddenIds`
          //   entry naming the new id can exist until a write that stores both
          //   has happened.
          //
          //   ⚠️ Which also means the `sanitizePageBreaks` line below has never
          //   written at load either. Inherited, not introduced — but do not
          //   read either line as a migration that runs itself.
          // - *Sync-dirty on first load.* The chain is **not** hash-stable on a
          //   clean fixture (13 diffs on `single`, 96 on `real`) but **is
          //   idempotent on its own output**, and 13/13 and 86/96 of those diffs
          //   are purely additive defaults being filled in (`_vId`, `visible`,
          //   `location: ''`, `imageVisible`, `_imageVId`). So the hash changes
          //   at most **once per store**, on the first load after this ships,
          //   then never again — not "every unchanged CV reports itself as
          //   modified".
          // - *Undeclared-key stripping.* The last one standing, and it is not a
          //   behaviour change at all: `useArrayForm` passes `{ ...resume,
          //   [sectionKey]: items }` to `setResume`, so the **whole** résumé
          //   already goes through this function on every list add/edit/delete.
          //   Measured on the `real` fixture: the paths it carries that
          //   `ResumeData` does not declare (`languages[].fluency` ×3,
          //   `meta.export.config`) are stripped by **one ordinary list edit
          //   today**. This moves that stripping earlier; it does not add it.
          //   (`projects[].keywords`/`roles` are declared now.)
          //
          // What remains is the rule this file keeps re-learning: a second
          // normaliser would be one more copy of the drift family.
          // This is the same function or it is nothing.
          //
          // ⚠️ **The warnings are deliberately discarded**, which is a decision
          // and not something the mechanism forces. `setResume` returns its
          // warnings on **both** paths — `{ silent: true }` governs whether the
          // *caller* displays them, it does not suppress them — so they are
          // available here. They are dropped because the only surface this app
          // has is `useImportWarningsStore.showWarnings`, which couples the list
          // to `isOpen`: using it would put a modal on app load for a file the
          // user never imported, which is worse than saying nothing about a
          // one-time repair of data they did not type. Measured: a clean store
          // raises **zero** warnings on either fixture, so this is silent for
          // everyone whose storage is well-formed.
          //
          // ⚠️ Runs **before** `sanitizePageBreaks`, and the order is load-bearing
          // in one direction only: that function's own docblock notes
          // `cb.oneColumn` holds "arbitrary JSON on the same rehydration path",
          // and after this line the array branch has already filtered those ids
          // to strings. Sanitizing second would hand it raw storage.
          //
          // ⚠️ It does **not** run `validateSkills`, which `setResume` applies
          // after this function — so a stored `skills[].level` of `90` keeps the
          // 0–100 spelling until the first list edit migrates it. That is a
          // value migration rather than a type guard, and `level` is a number on
          // both scales; nothing in either renderer throws on it.
          state.resume = sanitizeResumeData(state.resume).sanitized;

          // Restore page breaks after rehydration
          state.resume.meta.content.pageBreaks = sanitizePageBreaks(state.resume);

          // The stripper above fails open; a photo stored by an older build in another
          // format keeps its metadata until this async pass re-encodes it.
          void reencodeStoredPhoto(state.resume.basics.image, () => useResumeStore.getState());

          // ⚠️ Repairs a store written before those three joined the transient
          // list. `partialize` governs writes only, so without this a browser
          // already holding `isModalOpen: true` reopens the run dialog on every
          // load — and `autoRun` fires it again — which is the state this fix
          // exists to end. Costs nothing on a clean store.
          state.ai.isModalOpen = false;
          state.ai.autoRun = false;
          state.ai.activeTarget = null;
          state.ai.presetCoverLetter = false;
          state.ai.coverLetterOnly = false;

          // Stored proposal keys come back as `string`: keep the ones a build writes,
          // so the slice's `AITargetKey` keys hold from here on.
          const stored: Record<string, AISuggestionEntry> = state.ai.suggestions ?? {};
          state.ai.suggestions = Object.fromEntries(
            Object.entries(stored).filter(([key]) => isAITargetKey(key)),
          );

          // Restore localStorage keys for GitHub if they exist in the store but not in storage
          if (state.sync?.github?.repo && !localStorage.getItem('github_repo')) {
            localStorage.setItem('github_repo', state.sync.github.repo);
          }
        }
      },
    },
  ),
);
