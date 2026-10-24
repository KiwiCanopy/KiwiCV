import { useResumeStore } from '@/store/resume/useResumeStore';
import { type ResumeData } from '@/types/resume';
import { beforeEach, describe, expect, it } from 'vitest';

/**
 * Skills whose only "change" is an absent level coming back as 0. The schema
 * requires a level on every entry and 0 means "Not specified", so a measured
 * Vertex run (2026-10-24) answered 0 for every skill stored without one —
 * and the review showed untouched skills as changed (#26).
 */

const SKILLS = [
  { _vId: 's1', name: 'Frontend', level: 3, keywords: ['React', 'TypeScript'] },
  { _vId: 's2', name: 'Testing', keywords: ['Vitest', 'Playwright'] },
] as unknown as ResumeData['skills'];

const store = () => useResumeStore.getState();

beforeEach(() => {
  useResumeStore.setState((state) => ({
    resume: { ...state.resume, skills: structuredClone(SKILLS) },
    ai: { ...state.ai, suggestions: {}, reorgSuggestion: null },
  }));
});

describe('an AI run that returns a stored skill unchanged', () => {
  it('records no proposal when an absent level comes back as 0', () => {
    store().applyAISuggestion('cv', {
      skills: [
        {
          _vId: 's1',
          improvedFields: { name: 'Frontend', level: 3, keywords: ['React', 'TypeScript'] },
        },
        {
          _vId: 's2',
          improvedFields: { name: 'Testing', level: 0, keywords: ['Vitest', 'Playwright'] },
        },
      ],
    });

    expect(Object.keys(store().ai.suggestions)).toEqual([]);
  });

  it('still records a real level', () => {
    store().applyAISuggestion('cv', {
      skills: [
        {
          _vId: 's2',
          improvedFields: { name: 'Testing', level: 2, keywords: ['Vitest', 'Playwright'] },
        },
      ],
    });

    expect(store().ai.suggestions['item:skills:s2']?.improvedValue).toEqual({ level: 2 });
  });

  it('still offers a restructure that renames a skill, and grades the 0 level as unchanged', () => {
    store().applyReorgSuggestion('skills', [
      { name: 'Frontend', level: 3, keywords: ['React', 'TypeScript'], _sourceVIds: ['s1'] },
      { name: 'Quality', level: 0, keywords: ['Vitest', 'Playwright'], _sourceVIds: ['s2'] },
    ]);

    expect(store().ai.reorgSuggestion?.classification).toEqual({
      proposed_0: 'unchanged',
      proposed_1: 'modified',
    });
  });

  // A reorder is a change the server offers, so its entries read as changed too (#32).
  it('marks a moved skill as modified', () => {
    store().applyReorgSuggestion('skills', [
      { name: 'Testing', keywords: ['Vitest', 'Playwright'], _sourceVIds: ['s2'] },
      { name: 'Frontend', level: 3, keywords: ['React', 'TypeScript'], _sourceVIds: ['s1'] },
    ]);

    expect(store().ai.reorgSuggestion?.classification).toEqual({
      proposed_0: 'modified',
      proposed_1: 'modified',
    });
  });
});
