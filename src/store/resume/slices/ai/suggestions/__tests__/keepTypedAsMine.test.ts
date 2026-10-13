import { useResumeStore } from '@/store/resume/useResumeStore';
import { type ResumeData } from '@/types/resume';
import { beforeEach, describe, expect, it } from 'vitest';

/** `keepTypedAsMine` rewrites only the user's side of a field still pending. */

const TARGET = 'item:work:w1';

const seed = () =>
  useResumeStore.setState((state) => ({
    resume: {
      ...state.resume,
      work: [{ _vId: 'w1', position: 'Engineer', summary: 'AI summary' }] as ResumeData['work'],
    },
    ai: {
      ...state.ai,
      suggestions: {
        [TARGET]: {
          originalValue: { position: 'Developer', summary: 'My summary' },
          improvedValue: { position: 'Engineer', summary: 'AI summary' },
          timestamp: 1,
        },
      },
    },
  }));

const suggestion = () => useResumeStore.getState().ai.suggestions[TARGET];

beforeEach(seed);

describe('keepTypedAsMine', () => {
  it('replaces the user side of a pending field and leaves the live value alone', () => {
    useResumeStore.getState().keepTypedAsMine(TARGET, 'position', 'Developer, typed');

    expect(suggestion().originalValue.position).toBe('Developer, typed');
    expect(suggestion().improvedValue.position).toBe('Engineer');
    expect(useResumeStore.getState().resume.work[0].position).toBe('Engineer');
  });

  it('does nothing for a target with no proposal', () => {
    useResumeStore.getState().keepTypedAsMine('item:work:none', 'position', 'typed');

    expect(useResumeStore.getState().ai.suggestions['item:work:none']).toBeUndefined();
    expect(suggestion().originalValue.position).toBe('Developer');
  });

  it('does nothing for a field the proposal does not carry', () => {
    useResumeStore.getState().keepTypedAsMine(TARGET, 'name', 'typed');

    expect(suggestion().originalValue).not.toHaveProperty('name');
  });

  it.each([
    ['accepted', () => useResumeStore.getState().acceptAISuggestion(TARGET, 'position')],
    ['declined', () => useResumeStore.getState().declineAISuggestion(TARGET, 'position')],
  ])('does nothing for a field already %s', (_, decide) => {
    decide();
    const live = useResumeStore.getState().resume.work[0].position;

    useResumeStore.getState().keepTypedAsMine(TARGET, 'position', 'typed');

    expect(suggestion().originalValue).not.toHaveProperty('position');
    expect(useResumeStore.getState().resume.work[0].position).toBe(live);
  });
});
