// @vitest-environment jsdom
import { useCoverLetterForm } from '@/components/editor/CoverLetterForm/useCoverLetterForm';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { createDefaultCoverLetter } from '@/types/resume';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

const outdated = () => useResumeStore.getState().resume.coverLetter.outdated;

beforeEach(() =>
  useResumeStore.setState((state) => ({
    resume: {
      ...state.resume,
      coverLetter: { ...createDefaultCoverLetter(), paragraphs: ['Dear team,'], outdated: true },
    },
  })),
);

describe('useCoverLetterForm clears the outdated flag', () => {
  it.each([
    ['the body', (f: ReturnType<typeof useCoverLetterForm>) => f.setParagraphs(['Hello'])],
    ['the subject', (f: ReturnType<typeof useCoverLetterForm>) => f.setSubject('Application')],
    [
      'the recipient',
      (f: ReturnType<typeof useCoverLetterForm>) => f.setRecipientField('company', 'Acme'),
    ],
  ])('on an edit to %s', (_, edit) => {
    const { result } = renderHook(() => useCoverLetterForm());
    act(() => edit(result.current));
    expect(outdated()).toBe(false);
  });

  it('keeps it on a layout or on/off change, which is not reading the letter', () => {
    const { result } = renderHook(() => useCoverLetterForm());
    act(() => result.current.setLayoutField('textAlign', 'justify'));
    act(() => result.current.setEnabled(false));
    expect(outdated()).toBe(true);
  });
});
