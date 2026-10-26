// @vitest-environment jsdom
import { AIEditModal } from '@/components/modals/ai/edit/AIEditModal';
import {
  AI_TRANSLATION_MAX_CHARS,
  COVER_LETTER_DEFAULT_LENGTH,
  COVER_LETTER_DEFAULT_TONE,
} from '@/constants/ai';
import { en } from '@/locales/en/index';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useFlowStore } from '@/store/ui/useFlowStore';
import { type ResumeData } from '@/types/resume';
import { wholeCvTranslationChars } from '@/utils/ai';
import { fireEvent, render, screen } from '@testing-library/react';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * A whole-CV translation past `AI_TRANSLATION_MAX_CHARS` is refused on the
 * config screen before a request is spent, and the size the client measures is
 * the size the worker refuses. Rendered through `AIEditModal` with only the
 * network (`useAIGeneration`) stubbed, so the flag's path from the store to the
 * button is the real one.
 */

const handleGenerate = vi.fn();

vi.mock('@/components/modals/ai/edit/useAIGeneration', () => ({
  useAIGeneration: () => ({
    isLoading: false,
    status: 'idle',
    setStatus: vi.fn(),
    errorMessage: '',
    changeDetails: undefined,
    coverLetterOutcome: null,
    runStage: null,
    handleGenerate,
  }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user-1' },
    profile: {},
    session: { access_token: 'token' },
    isPremium: true,
    refreshProfile: async () => {},
  }),
}));

vi.mock('@/utils/ai', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/utils/ai')>()),
  fetchAIUsageStatus: vi.fn(async () => ({ proRequestsToday: 0, isDailyLimitReached: false })),
}));

vi.mock('@/components/modals/InsufficientPremiumAccessModal', () => ({
  InsufficientPremiumAccessModal: () => null,
}));

const BASE = useResumeStore.getState().resume;

/** The store's CV with one work summary sized so the projection is `chars` long. */
const cvOf = (chars: number): ResumeData => {
  const withSummary = (summary: string) =>
    ({
      ...BASE,
      work: [{ ...(BASE.work[0] ?? {}), _vId: 'w1', summary }],
      meta: { ...BASE.meta, theme: { ...BASE.meta.theme, locale: 'en' } },
    }) as ResumeData;
  const padding = chars - wholeCvTranslationChars(withSummary(''));
  return withSummary('x'.repeat(padding));
};

const OVER = cvOf(AI_TRANSLATION_MAX_CHARS + 1);

/** The text an element's `aria-describedby` resolves to. */
const describedText = (element: HTMLElement) =>
  (element.getAttribute('aria-describedby') ?? '')
    .split(' ')
    .filter(Boolean)
    .map((id) => document.getElementById(id)?.textContent ?? '')
    .join(' ');

beforeEach(() => {
  handleGenerate.mockClear();
  localStorage.clear();
  useFlowStore.setState({
    prompt: {
      mode: 'professional',
      jobDescription: '',
      customPrompt: '',
      allowReorg: false,
      draftCoverLetter: false,
      coverLetterLength: COVER_LETTER_DEFAULT_LENGTH,
      coverLetterTone: COVER_LETTER_DEFAULT_TONE,
      coverLetterMatchStyle: false,
      coverLetterToneChosen: false,
    },
  });
});

const open = (resume: ResumeData, translateTo: string | null) => {
  useResumeStore.setState({ resume });
  useResumeStore.getState().openAIModal('cv', translateTo ? { translateTo } : undefined);
  render(<AIEditModal />);
};

describe('the whole-CV translation cap', () => {
  it('refuses the run with the reason, and a click spends nothing', async () => {
    open(OVER, 'de');
    const button = await screen.findByRole('button', { name: en.ai.suggest });

    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.hasAttribute('disabled')).toBe(false);
    const reasonId = button.getAttribute('aria-describedby');
    expect(reasonId && document.getElementById(reasonId)?.textContent).toBe(
      en.ai.translate_too_long,
    );

    fireEvent.click(button);
    expect(handleGenerate).not.toHaveBeenCalled();
  });

  it('reads the reason with the translation toggle too', async () => {
    open(OVER, 'de');
    await screen.findByRole('button', { name: en.ai.suggest });

    const toggle = screen.getByRole('checkbox', { name: en.ai.translate_toggle_label });
    expect(describedText(toggle)).toBe(en.ai.translate_too_long);
  });

  it('runs the same CV when it is not being translated', async () => {
    open(OVER, null);
    const button = await screen.findByRole('button', { name: en.ai.suggest });

    expect(button.getAttribute('aria-disabled')).toBeNull();
    expect(screen.queryByText(en.ai.translate_too_long)).toBeNull();
    expect(
      screen
        .getByRole('checkbox', { name: en.ai.translate_toggle_label })
        .getAttribute('aria-describedby'),
    ).toBeNull();
    fireEvent.click(button);
    expect(handleGenerate).toHaveBeenCalledTimes(1);
  });

  it('runs a translation at the cap', async () => {
    open(cvOf(AI_TRANSLATION_MAX_CHARS), 'de');
    const button = await screen.findByRole('button', { name: en.ai.suggest });

    expect(button.getAttribute('aria-disabled')).toBeNull();
    expect(screen.queryByText(en.ai.translate_too_long)).toBeNull();
  });

  it('measures the size the worker measures', () => {
    // jsdom serves `import.meta.url` over http, so the path is rooted at the repo.
    const lib = `${pathToFileURL(path.resolve('netlify/functions/lib/ai')).href}/`;
    // Over stdin: the fixture is past the 128 KiB a single environment string may hold.
    const script = `
      import { readFileSync } from 'node:fs';
      import { wholeCvProjectedChars } from '${lib}request.js';
      process.stdout.write(String(wholeCvProjectedChars(JSON.parse(readFileSync(0, 'utf8')))));
    `;
    // Every top-level key the store has, so a section only one side projects shows here.
    const fixture = {
      ...OVER,
      coverLetter: { ...OVER.coverLetter, paragraphs: ['Dear team,', 'A long letter.'] },
    };
    const run = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
      encoding: 'utf8',
      input: JSON.stringify(fixture),
    });
    expect(run.status, run.stderr).toBe(0);
    expect(Number(run.stdout)).toBe(wholeCvTranslationChars(fixture));
    expect(Number(run.stdout)).toBe(AI_TRANSLATION_MAX_CHARS + 1);
  });
});
