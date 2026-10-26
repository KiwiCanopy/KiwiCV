import { useCallback } from 'react';

import { useResumeStore } from '@/store/resume/useResumeStore';
import type { ResumeCoverLetter } from '@/types/resume';

type Recipient = ResumeCoverLetter['recipient'];
type Layout = ResumeCoverLetter['layout'];

/**
 * State + update helpers for the cover-letter editor. Thin over the store's
 * `updateCoverLetter` (a shallow merge), so nested `recipient`/`layout` patches
 * are re-spread here before they are handed over.
 */
export function useCoverLetterForm() {
  const coverLetter = useResumeStore((state) => state.resume.coverLetter);
  const updateCoverLetter = useResumeStore((state) => state.updateCoverLetter);

  const setEnabled = useCallback(
    (enabled: boolean) => updateCoverLetter({ enabled }),
    [updateCoverLetter],
  );

  // A content edit means the user has looked at the letter, which is all the
  // `outdated` warning asks for.
  const setSubject = useCallback(
    (subject: string) => updateCoverLetter({ subject, outdated: false }),
    [updateCoverLetter],
  );

  const setDate = useCallback((date: string) => updateCoverLetter({ date }), [updateCoverLetter]);

  // Read the nested block fresh from the store rather than from this render's
  // snapshot: `updateCoverLetter` replaces `recipient`/`layout` wholesale, so a
  // second toggle fired before React re-renders would otherwise spread a stale
  // copy and clobber the first.
  const setRecipientField = useCallback(
    (field: keyof Recipient, value: string) => {
      const current = useResumeStore.getState().resume.coverLetter.recipient;
      updateCoverLetter({ recipient: { ...current, [field]: value }, outdated: false });
    },
    [updateCoverLetter],
  );

  const setLayoutField = useCallback(
    <K extends keyof Layout>(field: K, value: Layout[K]) => {
      const current = useResumeStore.getState().resume.coverLetter.layout;
      updateCoverLetter({ layout: { ...current, [field]: value } });
    },
    [updateCoverLetter],
  );

  const setParagraphs = useCallback(
    (paragraphs: string[]) => updateCoverLetter({ paragraphs, outdated: false }),
    [updateCoverLetter],
  );

  return {
    coverLetter,
    setEnabled,
    setSubject,
    setDate,
    setRecipientField,
    setLayoutField,
    setParagraphs,
  };
}
