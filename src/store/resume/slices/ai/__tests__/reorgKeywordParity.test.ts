import { useResumeStore } from '@/store/resume/useResumeStore';
import { type ResumeData } from '@/types/resume';
import { spawnSync } from 'node:child_process';
import { beforeEach, describe, expect, it } from 'vitest';

/**
 * A tailoring reorg loses no skill keyword end to end: the backend's
 * `restoreDroppedSkillKeywords` runs over the response, and the store's
 * `applyReorgSuggestion` — which deletes a group no item names — writes what it
 * returns. The backend is spawned, as in `cvMergeParity.test.ts`.
 */

type Fields = Record<string, unknown>;

const SOURCE_SKILLS = [
  { _vId: 's1', name: 'Data', level: 0, keywords: ['Postgres', 'k8s', 'Photo Editing'] },
  { _vId: 's2', name: 'Cloud', level: 0, keywords: ['Cloud Governance'] },
  { _vId: 's3', name: 'Go', level: 0, keywords: [] },
];

/** Drops `Photo Editing`, and names neither `s2` nor `s3`. */
const REORG_RESPONSE = [
  { name: 'Platform', level: 0, keywords: ['PostgreSQL', 'k8s'], _sourceVIds: ['s1'] },
];

const restoreOnBackend = (): Fields[] => {
  const lib = new URL('../../../../../../netlify/functions/lib/ai/', import.meta.url).href;
  const script = `
    import { restoreDroppedSkillKeywords } from '${lib}responseChecks.js';
    const { source, response } = JSON.parse(process.env.REORG_FIXTURE);
    const improved = { items: response };
    restoreDroppedSkillKeywords({
      granularity: 'section', sectionKey: 'skills', source, improved, allowReorg: true,
    });
    process.stdout.write(JSON.stringify(improved.items));
  `;
  const run = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
    encoding: 'utf8',
    env: {
      ...process.env,
      REORG_FIXTURE: JSON.stringify({ source: SOURCE_SKILLS, response: REORG_RESPONSE }),
    },
  });
  if (run.status !== 0) throw new Error(`the backend restore could not be run:\n${run.stderr}`);
  return JSON.parse(run.stdout) as Fields[];
};

/** Every source keyword, and every keyword-less skill's name, the store's skills lack. */
const lostFromStore = () => {
  const skills = useResumeStore.getState().resume.skills as unknown as Fields[];
  const held = new Set(
    skills.flatMap((skill) => [
      String(skill.name).toLowerCase(),
      ...((skill.keywords as string[]) ?? []).map((keyword) => keyword.toLowerCase()),
    ]),
  );
  return SOURCE_SKILLS.flatMap((skill) =>
    skill.keywords.length > 0 ? skill.keywords : [skill.name],
  ).filter((keyword) => !held.has(keyword.toLowerCase()));
};

beforeEach(() => {
  useResumeStore.setState((state) => ({
    resume: { ...state.resume, skills: structuredClone(SOURCE_SKILLS) } as unknown as ResumeData,
    ai: { ...state.ai, suggestions: {}, reorgSuggestion: null },
  }));
});

describe('a tailoring reorg through the backend restore and the store', () => {
  it('keeps every source keyword in the store', () => {
    useResumeStore.getState().applyReorgSuggestion('skills', restoreOnBackend());
    expect(lostFromStore()).toEqual([]);
  });

  /** Non-vacuity: the raw response really does lose them. */
  it('the unrestored response loses them', () => {
    useResumeStore.getState().applyReorgSuggestion('skills', structuredClone(REORG_RESPONSE));
    expect(lostFromStore()).toEqual(['Postgres', 'Photo Editing', 'Cloud Governance', 'Go']);
  });
});
