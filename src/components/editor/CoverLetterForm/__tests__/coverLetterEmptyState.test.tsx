// @vitest-environment jsdom
import { CoverLetterForm } from '@/components/editor/CoverLetterForm';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { createDefaultCoverLetter } from '@/types/resume';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: {}, profile: {}, isPremium: true, session: {} }),
}));

const seed = (paragraphs: string[], enabled = true) =>
  useResumeStore.setState((state) => ({
    resume: {
      ...state.resume,
      coverLetter: { ...createDefaultCoverLetter(), enabled, paragraphs },
    },
  }));

const panel = () => screen.queryByText('editor.coverLetter.empty_title');
const textarea = () => screen.queryByPlaceholderText('editor.coverLetter.body_placeholder');

beforeEach(() => seed([]));

describe('the cover letter’s empty state', () => {
  it('points at the one thing the section is for', () => {
    render(<CoverLetterForm />);
    expect(panel()).toBeTruthy();
  });

  /**
   * ⚠️ ABOVE the textarea, never instead of it. Replacing it would put an AI
   * panel between the user and a box to type in — the zero-AI path is the
   * approachable default.
   */
  it('leaves the plain typing route open beside it', () => {
    render(<CoverLetterForm />);

    const box = textarea();
    expect(box).toBeTruthy();
    expect(panel()!.compareDocumentPosition(box!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  /**
   * ⚠️ Reads nothing from `coverLetter.enabled`. That switch means "include this
   * in my PDF", not "I am allowed to write one" — and the letter call flips it on after
   * a successful draft, so gating the panel on it puts a switch between the user
   * and the thing they came for.
   */
  it('shows while the letter is switched off', () => {
    seed([], false);
    render(<CoverLetterForm />);

    expect(panel()).toBeTruthy();
  });

  it('steps aside once there is a letter', () => {
    seed(['Dear Hiring Team,']);
    render(<CoverLetterForm />);

    expect(panel()).toBeNull();
    expect(textarea()).toBeTruthy();
  });
});
