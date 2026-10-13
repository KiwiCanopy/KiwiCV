// @vitest-environment jsdom
import { MemoryRouter } from 'react-router-dom';

import { BasicsForm } from '@/components/editor/BasicsForm';
import { CoverLetterForm } from '@/components/editor/CoverLetterForm';
import { LanguageForm } from '@/components/editor/LanguageForm';
import { SkillsForm } from '@/components/editor/SkillsForm';
import { WorkForm } from '@/components/editor/WorkForm';
import { en } from '@/locales/en/index';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { type ResumeData, createDefaultCoverLetter } from '@/types/resume';
import { type AITargetKey } from '@/utils/aiTarget';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, profile: null, isPremium: false, session: null }),
}));

/**
 * The lock, driven through every real `EntryDiffPanel` mount rather than the
 * primitives: a field a pending proposal names is read-only and says why, its
 * neighbours stay editable, and deciding in the panel unlocks it in place.
 * `components/ui/__tests__/lockedField.test.tsx` pins what a locked primitive
 * refuses; this pins that each form passes the lock at all.
 */

const REASON = en.ai.diff_field_locked;

afterEach(() => {
  cleanup();
  useResumeStore.setState((state) => ({ ai: { ...state.ai, suggestions: {} } }));
});

const seed = (
  patch: Partial<ResumeData>,
  target: string,
  originalValue: Record<string, unknown>,
  improvedValue: Record<string, unknown>,
) =>
  useResumeStore.setState((state) => ({
    resume: { ...state.resume, ...patch },
    ai: {
      ...state.ai,
      reorgSuggestion: null,
      suggestions: { [target]: { originalValue, improvedValue, timestamp: 1 } },
    },
  }));

/**
 * Seeds `patch` as the user's own version and records the proposal through the
 * store's writer (`applyAISuggestion`), so the key each form reads is the key the
 * store writes rather than one this file spells.
 */
const record = (
  patch: Partial<ResumeData>,
  sectionTarget: AITargetKey,
  response: Parameters<ReturnType<typeof useResumeStore.getState>['applyAISuggestion']>[1],
) => {
  useResumeStore.setState((state) => ({
    resume: { ...state.resume, ...patch },
    ai: { ...state.ai, reorgSuggestion: null, suggestions: {} },
  }));
  useResumeStore.getState().applyAISuggestion(sectionTarget, response);
};

const describedText = (element: HTMLElement) =>
  (element.getAttribute('aria-describedby') ?? '')
    .split(' ')
    .map((id) => document.getElementById(id)?.textContent ?? '')
    .join(' ');

const expectLocked = (field: HTMLElement) => {
  expect(field.getAttribute('aria-disabled')).toBe('true');
  expect(field.hasAttribute('disabled')).toBe(false);
  expect(describedText(field)).toContain(REASON);
};

const expectEditable = (field: HTMLElement) => {
  expect(field.hasAttribute('aria-disabled')).toBe(false);
  expect(field.hasAttribute('readonly')).toBe(false);
  expect(describedText(field)).not.toContain(REASON);
};

/** Opens an accordion entry by its header, which is how a user reaches the fields. */
const openEntry = (title: string) => {
  const header = screen
    .getAllByRole('button', { name: new RegExp(title) })
    .find((button) => button.hasAttribute('aria-expanded'));
  if (!header) throw new Error(`no accordion header for ${title}`);
  fireEvent.click(header);
};

describe('Basics', () => {
  const renderBasics = () => {
    record(
      {
        basics: {
          ...useResumeStore.getState().resume.basics,
          name: 'Ada Lovelace',
          label: 'Mathematician',
          summary: 'My summary',
        },
      },
      'section:basics',
      { improvedFields: { label: 'Analyst ', summary: 'AI summary ' } },
    );
    render(
      <MemoryRouter>
        <BasicsForm defaultCollapsed={false} />
      </MemoryRouter>,
    );
  };

  it('locks the headline and summary the proposal names, and nothing else', async () => {
    const user = userEvent.setup();
    renderBasics();
    const summary = screen.getByLabelText<HTMLTextAreaElement>('Summary');

    expectLocked(screen.getByLabelText('Professional Title'));
    expectLocked(summary);
    expect(screen.getAllByText(REASON)).toHaveLength(2);
    expectEditable(screen.getByLabelText('Full Name'));

    await user.click(summary);
    await user.keyboard(' typed');
    await user.tab();
    expect(useResumeStore.getState().resume.basics.summary).toBe('AI summary ');
  });

  /** A trim would turn the proposal into a "later edit" that Keep mine then leaves in place. */
  it('does not trim a locked field on blur', () => {
    renderBasics();

    for (const label of ['Professional Title', 'Summary']) {
      const field = screen.getByLabelText(label);
      fireEvent.focus(field);
      fireEvent.blur(field);
    }

    expect(useResumeStore.getState().resume.basics.label).toBe('Analyst ');
    expect(useResumeStore.getState().resume.basics.summary).toBe('AI summary ');
  });

  /** `useLockedFields` returns `null` before any run, so the region is already mounted. */
  it('announces a lock that lands on the focused summary', () => {
    const basics = useResumeStore.getState().resume.basics;
    seed({ basics: { ...basics, name: 'Ada Lovelace', summary: 'My summary' } }, 'none', {}, {});
    render(
      <MemoryRouter>
        <BasicsForm defaultCollapsed={false} />
      </MemoryRouter>,
    );
    const before = screen.getAllByRole('status');
    act(() => screen.getByLabelText('Summary').focus());

    act(() =>
      seed(
        { basics: { ...basics, name: 'Ada Lovelace', summary: 'AI summary' } },
        'item:basics',
        { summary: 'My summary' },
        { summary: 'AI summary' },
      ),
    );

    const announcing = screen.getAllByRole('status').filter((r) => r.textContent === REASON);
    expect(announcing).toHaveLength(1);
    expect(before).toContain(announcing[0]);
  });

  /** Same invariant as `trimOnBlur`: what Keep mine writes back is trimmed. */
  it('trims a summary typed before the lock when Keep mine restores it', async () => {
    const user = userEvent.setup();
    const basics = useResumeStore.getState().resume.basics;
    seed({ basics: { ...basics, name: 'Ada Lovelace', summary: 'My summary' } }, 'none', {}, {});
    render(
      <MemoryRouter>
        <BasicsForm defaultCollapsed={false} />
      </MemoryRouter>,
    );
    const summary = screen.getByLabelText('Summary');
    fireEvent.focus(summary);
    fireEvent.change(summary, { target: { value: '  My typed summary  ' } });

    act(() =>
      seed(
        { basics: { ...basics, name: 'Ada Lovelace', summary: 'AI summary' } },
        'item:basics',
        { summary: 'My summary' },
        { summary: 'AI summary' },
      ),
    );
    fireEvent.blur(summary);
    await user.click(screen.getByRole('button', { name: en.ai.diff_keep_mine }));

    expect(useResumeStore.getState().resume.basics.summary).toBe('My typed summary');
  });

  it('unlocks a field in place once the user keeps their wording', async () => {
    const user = userEvent.setup();
    renderBasics();
    const summary = screen.getByLabelText('Summary');
    summary.focus();

    // Two rows, so the per-field "Keep mine" for summary is the second.
    await user.click(screen.getAllByRole('button', { name: en.ai.diff_keep_mine })[1]);

    expect(screen.getByLabelText('Summary')).toBe(summary);
    expectEditable(summary);
    expect(useResumeStore.getState().resume.basics.summary).toBe('My summary');
    expectLocked(screen.getByLabelText('Professional Title'));
  });
});

describe('a list entry (Work)', () => {
  const renderWork = () => {
    record(
      {
        work: [
          {
            _vId: 'w1',
            name: 'Acme',
            position: 'Developer',
            startDate: '2019-01',
            summary: 'My summary',
            highlights: ['My bullet'],
          },
        ] as ResumeData['work'],
      },
      'section:work',
      {
        items: [
          {
            _vId: 'w1',
            improvedFields: {
              position: 'Engineer',
              startDate: '2020-01',
              summary: 'AI summary',
              highlights: ['AI bullet'],
            },
          },
        ],
      },
    );
    render(
      <MemoryRouter>
        <WorkForm defaultCollapsed={false} />
      </MemoryRouter>,
    );
    openEntry('Acme');
  };

  it('locks the text, date and bullet fields the proposal names, and nothing else', () => {
    renderWork();

    expectLocked(screen.getByLabelText('Position'));
    expectLocked(screen.getByLabelText('Summary'));
    expectLocked(screen.getByLabelText('Start Date'));
    expectLocked(screen.getByLabelText('Highlights'));
    expectEditable(screen.getByLabelText('Company Name'));
    expectEditable(screen.getByLabelText('End Date'));

    const bulletControls = screen.getAllByRole('button', {
      name: /^(Move|Edit|Delete) “AI bullet”/,
    });
    // The grip, up, down, edit and delete.
    expect(bulletControls).toHaveLength(5);
    for (const control of bulletControls) {
      expect(control.getAttribute('aria-disabled')).toBe('true');
      expect(control.tabIndex).toBe(-1);
    }
  });

  /** Binds `keepTyped` at this mount: the store, not the primitive, is what Keep mine reads. */
  it('keeps text typed before the lock as the user side, restored by Keep mine', async () => {
    const user = userEvent.setup();
    seed(
      { work: [{ _vId: 'w1', name: 'Acme', position: 'Developer' }] as ResumeData['work'] },
      'none',
      {},
      {},
    );
    render(
      <MemoryRouter>
        <WorkForm defaultCollapsed={false} />
      </MemoryRouter>,
    );
    openEntry('Acme');
    const position = screen.getByLabelText<HTMLInputElement>('Position');
    fireEvent.focus(position);
    fireEvent.change(position, { target: { value: 'Developer, half typed' } });

    act(() =>
      seed(
        { work: [{ _vId: 'w1', name: 'Acme', position: 'Engineer' }] as ResumeData['work'] },
        'item:work:w1',
        { position: 'Developer' },
        { position: 'Engineer' },
      ),
    );
    fireEvent.blur(position);
    expect(useResumeStore.getState().resume.work[0].position).toBe('Engineer');
    expectLocked(position);

    await user.click(screen.getByRole('button', { name: en.ai.diff_keep_mine }));

    expect(useResumeStore.getState().resume.work[0].position).toBe('Developer, half typed');
    expectEditable(screen.getByLabelText('Position'));
  });

  it('adds a bullet typed before the lock to the user side, restored by Keep mine', async () => {
    const user = userEvent.setup();
    const entry = { _vId: 'w1', name: 'Acme', position: 'Engineer' };
    seed({ work: [{ ...entry, highlights: ['My bullet'] }] as ResumeData['work'] }, 'none', {}, {});
    render(
      <MemoryRouter>
        <WorkForm defaultCollapsed={false} />
      </MemoryRouter>,
    );
    openEntry('Acme');
    const add = screen.getByLabelText('Highlights');
    fireEvent.change(add, { target: { value: 'Typed bullet' } });

    act(() =>
      seed(
        { work: [{ ...entry, highlights: ['AI bullet'] }] as ResumeData['work'] },
        'item:work:w1',
        { highlights: ['My bullet'] },
        { highlights: ['AI bullet'] },
      ),
    );
    fireEvent.keyDown(add, { key: 'Enter' });
    expect(useResumeStore.getState().resume.work[0].highlights).toEqual(['AI bullet']);

    await user.click(screen.getByRole('button', { name: en.ai.diff_keep_mine }));

    expect(useResumeStore.getState().resume.work[0].highlights).toEqual([
      'My bullet',
      'Typed bullet',
    ]);
  });

  it('refuses a bullet delete while locked, and allows it once decided', async () => {
    const user = userEvent.setup();
    renderWork();

    await user.click(screen.getByRole('button', { name: /^Delete “AI bullet”/ }));
    expect(useResumeStore.getState().resume.work[0].highlights).toEqual(['AI bullet']);

    await user.click(
      screen.getByRole('button', { name: en.ai.diff_replace_all.replace('{{count}}', '4') }),
    );
    const remove = screen.getByRole('button', { name: /^Delete “AI bullet”/ });
    expect(remove.hasAttribute('aria-disabled')).toBe(false);
    await user.click(remove);
    expect(useResumeStore.getState().resume.work[0].highlights).toEqual([]);
  });
});

describe('Skills and Languages', () => {
  it('locks a proposed skill name, level and keywords, and names the level in the panel', () => {
    record(
      {
        skills: [{ _vId: 's1', name: 'Web', level: 2, keywords: ['JS'] }] as ResumeData['skills'],
      },
      'section:skills',
      {
        items: [
          { _vId: 's1', improvedFields: { name: 'Frontend', level: 3, keywords: ['React'] } },
        ],
      },
    );
    render(
      <MemoryRouter>
        <SkillsForm defaultCollapsed={false} />
      </MemoryRouter>,
    );
    openEntry('Frontend');

    expectLocked(screen.getByLabelText('Skill Name'));
    expectLocked(screen.getByLabelText('Level'));
    expectLocked(screen.getByLabelText('Keywords'));
    // The panel the reason points at, naming levels as the picker does.
    const panel = screen.getByRole('region', { name: /fields the AI rewrote/ });
    expect(within(panel).getByText('Intermediate')).toBeTruthy();
    expect(within(panel).getByText('Advanced')).toBeTruthy();
  });

  it('restores and unlocks a skill once the user keeps their version', async () => {
    const user = userEvent.setup();
    seed(
      {
        skills: [
          { _vId: 's1', name: 'Frontend', level: 3, keywords: ['React'] },
        ] as ResumeData['skills'],
      },
      'item:skills:s1',
      { name: 'Web', level: 2, keywords: ['JS'] },
      { name: 'Frontend', level: 3, keywords: ['React'] },
    );
    render(
      <MemoryRouter>
        <SkillsForm defaultCollapsed={false} />
      </MemoryRouter>,
    );
    openEntry('Frontend');

    await user.click(
      screen.getByRole('button', { name: en.ai.diff_keep_all.replace('{{count}}', '3') }),
    );

    expect(useResumeStore.getState().resume.skills[0]).toMatchObject({
      name: 'Web',
      level: 2,
      keywords: ['JS'],
    });
    expectEditable(screen.getByLabelText('Skill Name'));
    expectEditable(screen.getByLabelText('Keywords'));
    const level = screen.getByLabelText('Level');
    expect(level.hasAttribute('aria-disabled')).toBe(false);
    expect(describedText(level)).not.toContain(REASON);
  });

  /** Two panels in one list must not share one accessible name. */
  it('names each language panel after its entry', () => {
    record(
      {
        languages: [
          { _vId: 'l1', language: 'German', level: 3, certificate: '' },
          { _vId: 'l2', language: 'French', level: 2, certificate: '' },
        ] as ResumeData['languages'],
      },
      'section:languages',
      {
        items: [
          { _vId: 'l1', improvedFields: { level: 4 } },
          { _vId: 'l2', improvedFields: { level: 3 } },
        ],
      },
    );
    render(
      <MemoryRouter>
        <LanguageForm defaultCollapsed={false} />
      </MemoryRouter>,
    );

    const names = screen
      .getAllByRole('region', { name: /field the AI rewrote/ })
      .map((region) => region.getAttribute('aria-labelledby'))
      .map((ids) =>
        (ids ?? '')
          .split(' ')
          .map((id) => document.getElementById(id)?.textContent)
          .join(' '),
      );
    expect(names).toEqual(['1 field the AI rewrote German', '1 field the AI rewrote French']);
  });

  it('locks a proposed language and fluency level, and leaves the certificate editable', () => {
    record(
      {
        languages: [
          { _vId: 'l1', language: 'Deutsch', level: 3, certificate: '' },
        ] as ResumeData['languages'],
      },
      'section:languages',
      { items: [{ _vId: 'l1', improvedFields: { language: 'German', level: 4 } }] },
    );
    render(
      <MemoryRouter>
        <LanguageForm defaultCollapsed={false} />
      </MemoryRouter>,
    );
    openEntry('German');

    const level = screen.getByLabelText<HTMLSelectElement>('Fluency Level');
    expectLocked(level);
    fireEvent.change(level, { target: { value: '1' } });
    expect(useResumeStore.getState().resume.languages[0].level).toBe(4);
    expectLocked(screen.getByLabelText('Language'));
    expectEditable(screen.getByLabelText('Certificate'));
    const panel = screen.getByRole('region', { name: /fields the AI rewrote/ });
    expect(within(panel).getByText('Professional')).toBeTruthy();
    expect(within(panel).getByText('Fluent')).toBeTruthy();
  });
});

describe('the cover letter', () => {
  const MINE = ['Dear team,', 'My body.', 'Kind regards'];
  const PROPOSAL = ['Dear team,', 'AI body.', 'Kind regards'];

  const renderLetter = () => {
    record(
      {
        coverLetter: {
          ...createDefaultCoverLetter(),
          enabled: true,
          subject: 'My subject',
          paragraphs: MINE,
        },
      },
      'section:coverLetter',
      { improvedFields: { subject: 'AI subject', paragraphs: PROPOSAL } },
    );
    render(<CoverLetterForm />);
  };

  it('locks the subject and body, and refuses typing and the toolbar', async () => {
    const user = userEvent.setup();
    renderLetter();
    const body = screen.getByLabelText<HTMLTextAreaElement>('Letter body');

    expectLocked(screen.getByLabelText('Subject'));
    expectLocked(body);
    expect(body.hasAttribute('readonly')).toBe(true);
    expectEditable(screen.getByLabelText('Date'));

    await user.click(body);
    await user.keyboard(' typed');
    await user.click(screen.getByRole('button', { name: 'Bold' }));
    fireEvent.keyDown(body, { key: 'b', ctrlKey: true });
    await user.tab();

    expect(body.value).toBe(PROPOSAL.join('\n\n'));
    expect(useResumeStore.getState().resume.coverLetter.paragraphs).toEqual(PROPOSAL);
  });

  it('keeps a body buffer typed before the lock as the user side, not the letter', async () => {
    const user = userEvent.setup();
    useResumeStore.setState((state) => ({
      resume: {
        ...state.resume,
        coverLetter: { ...createDefaultCoverLetter(), enabled: true, paragraphs: MINE },
      },
      ai: { ...state.ai, suggestions: {} },
    }));
    render(<CoverLetterForm />);
    const body = screen.getByLabelText<HTMLTextAreaElement>('Letter body');
    fireEvent.focus(body);
    fireEvent.change(body, { target: { value: 'half typed' } });

    act(() =>
      seed(
        { coverLetter: { ...useResumeStore.getState().resume.coverLetter, paragraphs: PROPOSAL } },
        'item:coverLetter',
        { paragraphs: MINE },
        { paragraphs: PROPOSAL },
      ),
    );
    // The proposal is what shows, not the stale buffer.
    expect(body.value).toBe(PROPOSAL.join('\n\n'));
    fireEvent.blur(body);

    expect(useResumeStore.getState().resume.coverLetter.paragraphs).toEqual(PROPOSAL);
    expectLocked(body);

    await user.click(screen.getByRole('button', { name: en.ai.diff_keep_mine }));

    expect(useResumeStore.getState().resume.coverLetter.paragraphs).toEqual(['half typed']);
    expect(body.value).toBe('half typed');
  });

  it('closes a link popover the lock arrives under, and reads the toolbar from the letter', async () => {
    useResumeStore.setState((state) => ({
      resume: {
        ...state.resume,
        coverLetter: { ...createDefaultCoverLetter(), enabled: true, paragraphs: MINE },
      },
      ai: { ...state.ai, suggestions: {} },
    }));
    render(<CoverLetterForm />);
    const body = screen.getByLabelText<HTMLTextAreaElement>('Letter body');
    act(() => body.focus());
    fireEvent.change(body, { target: { value: '**bold**' } });
    body.setSelectionRange(2, 6);
    fireEvent.select(body);
    expect(screen.getByRole('button', { name: 'Bold' }).getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: en.editor.coverLetter.insert_link }));
    expect(document.getElementById('cover-letter-link-url')).not.toBeNull();
    expect(document.activeElement).toBe(document.getElementById('cover-letter-link-url'));

    act(() =>
      seed(
        { coverLetter: { ...useResumeStore.getState().resume.coverLetter, paragraphs: PROPOSAL } },
        'item:coverLetter',
        { paragraphs: MINE },
        { paragraphs: PROPOSAL },
      ),
    );

    expect(document.getElementById('cover-letter-link-url')).toBeNull();
    // Not <body>: the user is put back in the field the lock explains.
    await waitFor(() => expect(document.activeElement).toBe(body));
    expect(screen.getByRole('button', { name: 'Bold' }).getAttribute('aria-pressed')).toBe('false');
    for (const name of ['Bold', 'Italic', en.editor.coverLetter.insert_link]) {
      expect(describedText(screen.getByRole('button', { name }))).toBe(REASON);
    }
  });

  /** Focus alone is not typing; a normalised copy of the user's side must not replace it. */
  it('leaves the user side alone when the lock lands on a focused, untouched body', () => {
    const mine = ['Dear team, ', 'My body.'];
    useResumeStore.setState((state) => ({
      resume: {
        ...state.resume,
        coverLetter: { ...createDefaultCoverLetter(), enabled: true, paragraphs: mine },
      },
      ai: { ...state.ai, suggestions: {} },
    }));
    render(<CoverLetterForm />);
    const body = screen.getByLabelText<HTMLTextAreaElement>('Letter body');
    fireEvent.focus(body);

    act(() =>
      seed(
        { coverLetter: { ...useResumeStore.getState().resume.coverLetter, paragraphs: PROPOSAL } },
        'item:coverLetter',
        { paragraphs: mine },
        { paragraphs: PROPOSAL },
      ),
    );
    fireEvent.blur(body);

    expect(
      useResumeStore.getState().ai.suggestions['item:coverLetter'].originalValue.paragraphs,
    ).toEqual(mine);
  });

  /** The shortcut writes the hidden buffer, which would surface the moment the lock lifts. */
  it('leaves no shortcut edit behind to surface once unlocked', () => {
    renderLetter();
    const body = screen.getByLabelText<HTMLTextAreaElement>('Letter body');
    fireEvent.focus(body);
    body.setSelectionRange(0, 4);
    fireEvent.select(body);

    fireEvent.keyDown(body, { key: 'b', ctrlKey: true });
    act(() => useResumeStore.getState().acceptAISuggestion('item:coverLetter'));

    expect(body.value).toBe(PROPOSAL.join('\n\n'));
  });

  it('unlocks the body once the proposal is used', async () => {
    const user = userEvent.setup();
    renderLetter();
    const body = screen.getByLabelText('Letter body');

    await user.click(
      screen.getByRole('button', { name: en.ai.diff_replace_all.replace('{{count}}', '2') }),
    );

    expect(screen.getByLabelText('Letter body')).toBe(body);
    expectEditable(body);
    expectEditable(screen.getByLabelText('Subject'));
  });
});
