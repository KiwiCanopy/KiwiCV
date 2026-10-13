// @vitest-environment jsdom
// The property is about what the real persist middleware writes and reads, so
// the real `localStorage` has to be the one under test.
import { useResumeStore } from '@/store/resume/useResumeStore';
import { buildSingleItemResume } from '@/test/singleItemResume';
import { beforeEach, describe, expect, it } from 'vitest';

/**
 * **The AI run dialog is not data, and must not be persisted.**
 *
 * `isModalOpen`, `autoRun` and `activeTarget` fell into `partialize`'s
 * `...persistentAI` rest, so they reached `localStorage`. A run that hung left
 * the dialog open with `autoRun: true`; reloading restored it open AND re-fired
 * the run, so the one action a stuck user takes re-armed the thing they were
 * escaping. `suggestions` and `reorgSuggestion` stay persistent — those are
 * pending proposals nobody has answered.
 */

const STORAGE_KEY = 'resume-storage';
const PERSISTED_VERSION = useResumeStore.persist.getOptions().version as number;

beforeEach(() => {
  localStorage.clear();
});

describe('AI modal state and persistence', () => {
  it('keeps the open dialog out of what is written to storage', () => {
    useResumeStore.getState().openAIModal('cv', { autoRun: true, translateTo: 'de' });
    expect(useResumeStore.getState().ai.isModalOpen).toBe(true);

    // Drive a real write rather than reading `partialize` directly, so deleting
    // the exclusion is what fails and not a restatement of it.
    useResumeStore.setState({ resume: buildSingleItemResume('lunar') });

    const written = JSON.parse(localStorage.getItem(STORAGE_KEY) as string);
    expect(written.state.ai).toBeDefined();
    expect(written.state.ai.isModalOpen).toBeUndefined();
    expect(written.state.ai.autoRun).toBeUndefined();
    expect(written.state.ai.activeTarget).toBeUndefined();
    // The half that must survive a reload.
    expect(written.state.ai.suggestions).toEqual({});
  });

  /**
   * ⚠️ `partialize` governs writes only. Without the rehydrate repair, a browser
   * that already stored `isModalOpen: true` — every browser that hit this before
   * the fix, including the one that reported it — reopens the dialog on every
   * load and can never get out by reloading.
   */
  it('repairs a store that already persisted an open dialog', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: {
          resume: buildSingleItemResume('lunar'),
          ai: {
            suggestions: {},
            reorgSuggestion: null,
            isModalOpen: true,
            autoRun: true,
            activeTarget: 'cv',
          },
        },
        version: PERSISTED_VERSION,
      }),
    );

    await useResumeStore.persist.rehydrate();

    const { ai } = useResumeStore.getState();
    expect(ai.isModalOpen).toBe(false);
    expect(ai.autoRun).toBe(false);
    expect(ai.activeTarget).toBeNull();
  });

  it('consumes autoRun so a remount cannot re-fire the run', () => {
    useResumeStore.getState().openAIModal('cv', { autoRun: true });
    expect(useResumeStore.getState().ai.autoRun).toBe(true);

    useResumeStore.getState().consumeAutoRun();

    expect(useResumeStore.getState().ai.autoRun).toBe(false);
    // Consuming the trigger must not close the dialog the run is showing in.
    expect(useResumeStore.getState().ai.isModalOpen).toBe(true);
  });
});

describe('a pending proposal from an older store', () => {
  /** Through the real persist middleware, from a v9 store as a browser holds it. */
  it('rehydrates without the retired toggle flag', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: {
          resume: buildSingleItemResume('lunar'),
          ai: {
            suggestions: {
              'item:basics': {
                originalValue: { summary: 'Mine' },
                improvedValue: { summary: 'Theirs' },
                isOriginalActive: { summary: false },
                timestamp: 1,
              },
            },
            reorgSuggestion: null,
          },
        },
        version: 9,
      }),
    );

    await useResumeStore.persist.rehydrate();

    expect(PERSISTED_VERSION).toBeGreaterThan(9);
    expect(useResumeStore.getState().ai.suggestions['item:basics']).toEqual({
      originalValue: { summary: 'Mine' },
      improvedValue: { summary: 'Theirs' },
      timestamp: 1,
    });
  });
});

describe('stored proposal keys', () => {
  /** The slice types its keys `AITargetKey`; storage hands back any `string`. */
  it('keeps every key a build writes and drops the rest at rehydration', async () => {
    const entry = { originalValue: { a: 1 }, improvedValue: { a: 2 }, timestamp: 1 };
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: {
          resume: buildSingleItemResume('lunar'),
          ai: {
            suggestions: {
              cv: entry,
              'section:work': entry,
              'item:work:v1': entry,
              'section:custom:abc': entry,
              'item:custom:abc': entry,
              'item:custom:abc:v2': entry,
              'item:coverLetter': entry,
              reorg: entry,
              CV: entry,
              work: entry,
            },
            reorgSuggestion: null,
          },
        },
        version: PERSISTED_VERSION,
      }),
    );

    await useResumeStore.persist.rehydrate();

    expect(Object.keys(useResumeStore.getState().ai.suggestions).sort()).toEqual([
      'cv',
      'item:coverLetter',
      'item:custom:abc',
      'item:custom:abc:v2',
      'item:work:v1',
      'section:custom:abc',
      'section:work',
    ]);
  });
});
