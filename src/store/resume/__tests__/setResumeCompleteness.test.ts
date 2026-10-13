import { useResumeStore } from '@/store/resume/useResumeStore';
import { buildSingleItemResume } from '@/test/singleItemResume';
import { type ResumeData, initialResumeState } from '@/types/resume';
import { describe, expect, it } from 'vitest';

/**
 * `setResume` merges each top-level key by hand over `...currentResume`, so a
 * key it forgets keeps the open CV's value and silently drops the imported one.
 * Driven from `initialResumeState`'s keys — the inventory pass-through is
 * defined against — so a new top-level field fails here until it is merged.
 */

const changed = (key: keyof ResumeData, value: unknown): unknown => {
  if (Array.isArray(value)) return [];
  if (key === 'basics') return { ...(value as object), name: 'Imported Name' };
  if (key === 'coverLetter') return { ...(value as object), subject: 'Imported subject' };
  if (key === 'passthrough') return { imported: true };
  throw new Error(`No distinct import value for "${key}": add one here.`);
};

const KEYS = (Object.keys(initialResumeState) as Array<keyof ResumeData>).filter(
  (key) => key !== 'meta',
);

describe('every top-level key an import carries reaches the store', () => {
  it.each(KEYS)('%s', (key) => {
    const current = { ...buildSingleItemResume('lunar'), passthrough: { current: true } };
    useResumeStore.setState({ resume: current });

    const file = { ...structuredClone(current), [key]: changed(key, current[key]) };
    useResumeStore.getState().setResume(file as ResumeData, { silent: true });

    expect(useResumeStore.getState().resume[key]).not.toEqual(current[key]);
  });
});
