// @vitest-environment jsdom
import { CoverLetterRow } from '@/components/modals/export/CoverLetterRow';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { createDefaultCoverLetter } from '@/types/resume';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const seed = (patch: Partial<ReturnType<typeof createDefaultCoverLetter>>) =>
  useResumeStore.setState((state) => ({
    resume: { ...state.resume, coverLetter: { ...createDefaultCoverLetter(), ...patch } },
  }));

const OUTDATED = 'sync.export_dialog.letter_outdated';

beforeEach(() => seed({}));

describe('CoverLetterRow', () => {
  it('renders nothing while there is no letter', () => {
    const { container } = render(<CoverLetterRow disabled={false} />);
    expect(container.innerHTML).toBe('');
  });

  it('writes the same enabled flag the editor toggles', async () => {
    seed({ enabled: true, paragraphs: ['Dear team,'] });
    render(<CoverLetterRow disabled={false} />);

    await userEvent.click(screen.getByRole('switch', { name: 'sync.export_dialog.letter_toggle' }));

    expect(useResumeStore.getState().resume.coverLetter.enabled).toBe(false);
    expect(screen.getByText('sync.export_dialog.letter_excluded')).toBeTruthy();
  });

  it('warns about an outdated letter only while it is included', async () => {
    seed({ enabled: true, paragraphs: ['Dear team,'], outdated: true });
    render(<CoverLetterRow disabled={false} />);
    expect(screen.getByText(OUTDATED)).toBeTruthy();

    await userEvent.click(screen.getByRole('switch'));
    expect(screen.queryByText(OUTDATED)).toBeNull();
  });

  it('does not warn about a current letter', () => {
    seed({ enabled: true, paragraphs: ['Dear team,'] });
    render(<CoverLetterRow disabled={false} />);
    expect(screen.queryByText(OUTDATED)).toBeNull();
  });
});
