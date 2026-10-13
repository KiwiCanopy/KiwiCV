// @vitest-environment jsdom
import { ResumeLanguageSelector } from '@/components/editor/ResumeLanguageSelector';
import { useUIStore } from '@/store/ui/useUIStore';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services/analytics', () => ({
  ANALYTICS_EVENTS: { RESUME_LANGUAGE_CHANGED: 'resume_language_changed' },
  analytics: { track: vi.fn() },
}));
vi.mock('@/hooks/useCloudRestorePrompt', () => ({
  useCloudRestorePrompt: () => ({ checkAndRestoreLocale: vi.fn() }),
}));
vi.mock('@/hooks/useTranslationInvite', () => ({
  useTranslationInvite: () => ({ inviteToTranslate: vi.fn(), modals: null }),
}));

const HELP =
  'This sets the language for automatic generated headings, dates and formatting in the generated CV. This is independent of the App UI language.';

/** WCAG 4.1.2 / 1.3.1: a short name for the help button, the hint as its description. */
describe('the CV language help trigger in the dashboard header', () => {
  beforeEach(() => useUIStore.setState({ appLanguage: 'en' }));

  it('is named briefly and described by the hint', () => {
    render(<ResumeLanguageSelector variant="compact" showHelp />);
    const trigger = screen.getByRole('button', { name: 'About the language of your CV' });

    fireEvent.mouseEnter(trigger);

    const describedBy = trigger.getAttribute('aria-describedby');
    expect(describedBy && document.getElementById(describedBy)?.textContent).toBe(HELP);
    expect(screen.queryByRole('button', { name: HELP })).toBeNull();
  });
});
