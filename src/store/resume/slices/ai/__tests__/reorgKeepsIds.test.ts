import { useResumeStore } from '@/store/resume/useResumeStore';
import { type ResumeData } from '@/types/resume';
import { beforeEach, describe, expect, it } from 'vitest';

/**
 * A skills reorg keeps the id of every entry it carries over, so a hidden
 * skill stays hidden — `hiddenIds` addresses entries by `_vId`.
 */

const skill = (vId: string, name: string, keywords: string[] = []) => ({
  name,
  level: 2,
  keywords,
  visible: true,
  _vId: vId,
});

const SKILLS = [
  skill('s1', 'Frontend', ['React']),
  skill('s2', 'Backend', ['Node']),
  skill('s3', 'Databases', ['Postgres']),
  skill('s4', 'Cloud', ['AWS']),
] as unknown as ResumeData['skills'];

const store = () => useResumeStore.getState();
const skillIds = () => store().resume.skills.map((item) => item._vId);
const hiddenIds = () => store().resume.meta.content.hiddenIds ?? [];

describe('a skills reorg and entry ids', () => {
  beforeEach(() => {
    useResumeStore.setState((state) => ({
      resume: {
        ...state.resume,
        skills: structuredClone(SKILLS),
        meta: {
          ...state.resume.meta,
          content: { ...state.resume.meta.content, hiddenIds: ['skills:s2', 'skills:s4'] },
        },
      },
      ai: { ...state.ai, reorgSuggestion: null, suggestions: {} },
    }));
  });

  const PROPOSAL = [
    // s1 unchanged, s2 modified: both keep their ids.
    { name: 'Frontend', level: 2, keywords: ['React'], _sourceVIds: ['s1'] },
    { name: 'Backend Development', level: 3, keywords: ['Node'], _sourceVIds: ['s2'] },
    // s3 and s4 merged into one new entry.
    { name: 'Infrastructure', level: 2, keywords: ['Postgres', 'AWS'], _sourceVIds: ['s3', 's4'] },
    // Added from nothing.
    { name: 'Testing', level: 2, keywords: ['Vitest'], _sourceVIds: [] },
  ];

  it('keeps single-source ids, so a hidden skill stays hidden, and mints ids only for new entries', () => {
    store().applyReorgSuggestion('skills', PROPOSAL);

    const ids = skillIds();
    expect(ids.slice(0, 2)).toEqual(['s1', 's2']);
    expect(ids[2]).not.toMatch(/^s[34]$/);
    expect(ids[3]).not.toMatch(/^s\d$/);
    expect(hiddenIds()).toContain('skills:s2');
    expect(store().resume.skills[1].name).toBe('Backend Development');
  });

  it('a split entry is two new entries, not two copies of one id', () => {
    store().applyReorgSuggestion('skills', [
      { name: 'React', level: 2, keywords: ['React'], _sourceVIds: ['s1'] },
      { name: 'Vue', level: 2, keywords: ['Vue'], _sourceVIds: ['s1'] },
    ]);
    const ids = skillIds();
    expect(new Set(ids).size).toBe(2);
    expect(ids).not.toContain('s1');
  });

  it('accepting drops the hashes of entries merged away; Discard restores them, hashes intact', () => {
    store().applyReorgSuggestion('skills', PROPOSAL);
    store().declineReorg();
    expect(skillIds()).toEqual(['s1', 's2', 's3', 's4']);
    expect(hiddenIds()).toEqual(['skills:s2', 'skills:s4']);

    store().applyReorgSuggestion('skills', PROPOSAL);
    store().acceptReorg();
    expect(hiddenIds()).toEqual(['skills:s2']);
  });

  it('accept-all prunes the same way', () => {
    store().applyReorgSuggestion('skills', PROPOSAL);
    store().acceptAllSuggestions('cv');
    expect(store().ai.reorgSuggestion).toBeNull();
    expect(hiddenIds()).toEqual(['skills:s2']);
  });

  it('a hidden skill split in two stays hidden in both halves, and Discard drops their hashes', () => {
    store().applyReorgSuggestion('skills', [
      { name: 'REST', level: 2, keywords: ['Node'], _sourceVIds: ['s2'] },
      { name: 'GraphQL', level: 2, keywords: ['Apollo'], _sourceVIds: ['s2'] },
    ]);
    const halves = store().resume.skills.map((item) => `skills:${item._vId}`);
    expect(hiddenIds()).toEqual(expect.arrayContaining(halves));

    store().declineReorg();
    expect(hiddenIds()).toEqual(['skills:s2', 'skills:s4']);
  });

  it('a merged item naming a kept entry too does not cost that entry its id', () => {
    store().applyReorgSuggestion('skills', [
      { name: 'Backend', level: 2, keywords: ['Node'], _sourceVIds: ['s2'] },
      { name: 'Full stack', level: 2, keywords: ['React', 'Node'], _sourceVIds: ['s1', 's2'] },
    ]);
    expect(skillIds()[0]).toBe('s2');
    expect(hiddenIds()).toContain('skills:s2');
  });

  it('a merge of hidden and visible entries is visible; a merge of hidden ones is hidden', () => {
    store().applyReorgSuggestion('skills', [
      { name: 'Mixed', level: 2, keywords: [], _sourceVIds: ['s1', 's2'] },
      { name: 'Hidden pair', level: 2, keywords: [], _sourceVIds: ['s2', 's4'] },
    ]);
    const [mixed, pair] = skillIds();
    expect(hiddenIds()).not.toContain(`skills:${mixed}`);
    expect(hiddenIds()).toContain(`skills:${pair}`);
  });

  it('repeated and unknown source ids still count as one source', () => {
    store().applyReorgSuggestion('skills', [
      { name: 'Backend', level: 2, keywords: ['Node'], _sourceVIds: ['s2', 's2'] },
      { name: 'Frontend', level: 2, keywords: ['React'], _sourceVIds: ['s1', 'bogus'] },
    ]);
    expect(skillIds()).toEqual(['s2', 's1']);
  });

  it('a kept entry keeps its own visible flag', () => {
    useResumeStore.setState((state) => ({
      resume: {
        ...state.resume,
        skills: state.resume.skills.map((item) =>
          item._vId === 's2' ? { ...item, visible: false } : item,
        ),
      },
    }));
    store().applyReorgSuggestion('skills', PROPOSAL);
    expect(store().resume.skills[1].visible).toBe(false);
  });

  it('accepting all on the skills section prunes too', () => {
    store().applyReorgSuggestion('skills', PROPOSAL);
    store().acceptAllSuggestions('section:skills');
    expect(store().ai.reorgSuggestion).toBeNull();
    expect(hiddenIds()).toEqual(['skills:s2']);
  });
});
