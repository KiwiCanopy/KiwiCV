import { useResumeStore } from '@/store/resume/useResumeStore';
import { type ResumeData } from '@/types/resume';
import { type AITargetKey } from '@/utils/aiTarget';
import { beforeEach, describe, expect, it } from 'vitest';

/**
 * A run landing on an entry whose proposal is still pending merges into it
 * rather than replacing it. The entry's Improve button is refused while
 * a proposal pends, but a whole-CV run from the composer still reaches here.
 */

const TARGET = 'item:work:w1';
const MINE = { position: 'Developer', summary: 'My summary', name: 'Acme' };

const seed = () =>
  useResumeStore.setState((state) => ({
    resume: { ...state.resume, work: [{ _vId: 'w1', ...MINE }] as ResumeData['work'] },
    ai: { ...state.ai, suggestions: {} },
  }));

const store = () => useResumeStore.getState();
const proposal = () => store().ai.suggestions[TARGET];
const entry = () => store().resume.work[0] as unknown as Record<string, unknown>;
const run = (target: AITargetKey, improvedFields: Record<string, unknown>) => {
  if (target === 'cv') {
    store().applyAISuggestion('cv', { work: [{ _vId: 'w1', improvedFields }] });
  } else {
    store().applyAISuggestion(target, { improvedFields });
  }
};

beforeEach(seed);

describe.each<AITargetKey>(['item:work:w1', 'cv'])(
  'a second run via %s over a pending proposal',
  (second) => {
    beforeEach(() => {
      run(TARGET, { position: 'Engineer', summary: 'AI summary' });
      run(second, { summary: 'Second AI summary', name: 'Acme Corp' });
    });

    it("keeps the user's own wording as the side Keep mine restores", () => {
      expect(proposal().originalValue).toEqual(MINE);
      expect(proposal().improvedValue).toEqual({
        position: 'Engineer',
        summary: 'Second AI summary',
        name: 'Acme Corp',
      });
    });

    it('keeps a field only the first run moved pending, so it stays locked', () => {
      expect(entry().position).toBe('Engineer');
      expect(proposal().improvedValue).toHaveProperty('position');
    });

    it('declining every field restores what the user wrote', () => {
      store().declineAISuggestion(TARGET);
      expect(entry()).toMatchObject(MINE);
      expect(proposal()).toBeUndefined();
    });
  },
);

describe('a run with nothing pending', () => {
  it('records a fresh proposal, the user side read from the entry', () => {
    run(TARGET, { summary: 'AI summary' });
    expect(proposal().originalValue).toEqual({ summary: 'My summary' });
    expect(proposal().improvedValue).toEqual({ summary: 'AI summary' });
  });
});

describe('a second run that moves a field back to the user wording', () => {
  it('drops that field, since it is no longer a proposal', () => {
    run(TARGET, { position: 'Engineer', summary: 'AI summary' });
    run(TARGET, { summary: 'My summary' });
    expect(proposal().improvedValue).toEqual({ position: 'Engineer' });
    expect(proposal().originalValue).toEqual({ position: 'Developer' });
  });

  it('drops the proposal once nothing differs', () => {
    run(TARGET, { summary: 'AI summary' });
    run(TARGET, { summary: 'My summary' });
    expect(proposal()).toBeUndefined();
    expect(entry().summary).toBe('My summary');
  });
});
