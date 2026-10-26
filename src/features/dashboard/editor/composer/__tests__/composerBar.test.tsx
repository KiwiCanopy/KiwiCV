// @vitest-environment jsdom
import { MemoryRouter } from 'react-router-dom';

import { AI_MAX_CHAR_LIMIT } from '@/constants/ai';
import { AIComposerBar } from '@/features/dashboard/editor/composer/AIComposerBar';
import { en } from '@/locales/en/index';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useFlowStore } from '@/store/ui/useFlowStore';
import { useUIStore } from '@/store/ui/useUIStore';
import { fireEvent, render as rtlRender, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * ⚠️ Mutable, not a frozen literal. The default (signed out) is what almost
 * every case here wants, but the access chip's load-bearing state is the one
 * where it renders *nothing* — and that needs a Pass holder. A frozen mock made
 * that branch unreachable, which is how an unconditional `aria-describedby`
 * passed this file while pointing at an id no element carried.
 */
const auth = vi.hoisted(() => ({
  current: {
    user: null as { id: string } | null,
    profile: null as Record<string, unknown> | null,
    session: null as { access_token: string } | null,
    isPremium: false,
    refreshProfile: async () => {},
  },
}));

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => auth.current }));

vi.mock('@/utils/ai', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/utils/ai')>()),
  fetchAIUsageStatus: vi.fn(async () => ({ proRequestsToday: 0, isDailyLimitReached: false })),
}));

const SIGNED_OUT = {
  user: null,
  profile: null,
  session: null,
  isPremium: false,
  refreshProfile: async () => {},
};

/**
 * ⚠️ Router-wrapped: the bar mounts `InsufficientPremiumAccessModal`, whose
 * `PricingDialog` calls `useNavigate` even while closed. In production the bar
 * lives inside `DashboardLayout`, well under the router.
 */
const render = (ui: React.ReactElement) => rtlRender(<MemoryRouter>{ui}</MemoryRouter>);

beforeEach(() => {
  auth.current = { ...SIGNED_OUT };
  useFlowStore.getState().resetPrompt();
  useResumeStore.getState().closeAIModal();
  // ⚠️ Persisted, so it leaks between tests: one test collapsing the band left
  // the next one starting closed and hunting for controls that were not drawn.
  useUIStore.setState({ aiComposerCollapsed: false });
});

/**
 * ⚠️ The modes are `SegmentedToggle` buttons carrying `aria-pressed`, not
 * radios. `getByRole('radio')` here is a stale spelling, not a missing control.
 */
const mode = (name: string) => screen.getByRole('button', { name });

/**
 * ⚠️ The caution is the field's **placeholder while it is empty**, and only
 * becomes text below the box once something has been typed. "Paste the text,
 * not a link" has to reach the user *before* they paste a URL, and a note under
 * the box arrives after the mistake — so while the box is empty it lives inside
 * it. Assertions therefore read the placeholder, not the document text.
 *
 * It is a pre-existing translated key. A key invented for this slot went stale
 * within the hour — rewording its English left all fourteen locales holding the
 * previous English, which every check read as a translation.
 */
const CAUTION = 'Paste the text of the ad, not a link — the AI cannot browse the web.';

const field = () => screen.getByRole('textbox', { name: /Job Description/ });
const runButton = () => screen.getByRole('button', { name: 'Improve my CV' });
const runContainer = () => runButton().closest('[data-composer-run]');

/**
 * The add-ons modify a run, so they only appear once one is possible. Every
 * options assertion therefore has to supply a draft first — which is the
 * behaviour, not a workaround for it.
 */
// The field is a plain textarea now — there is no button to open first.
const fillDraft = () => {
  fireEvent.change(field(), { target: { value: 'Senior React engineer, remote' } });
};

describe('the AI composer bar', () => {
  // At the row's end the run button sat right under the header's Export (#27).
  it('puts the run button before the mode toggle on row 1', () => {
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);
    fireEvent.click(mode('Professional'));

    const modes = screen.getByRole('group', { name: 'What should the AI do?' });
    expect(
      runContainer()!.compareDocumentPosition(modes) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('offers the three modes, and the run action once a run is possible', () => {
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);

    expect(mode('Professional')).toBeTruthy();
    expect(mode('Job tailoring')).toBeTruthy();
    expect(mode('Custom')).toBeTruthy();

    fillDraft();
    expect(screen.getByRole('button', { name: 'Improve my CV' })).toBeTruthy();
  });

  it('names the mode group, which plain buttons do not do for themselves', () => {
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);

    expect(screen.getByRole('group', { name: 'What should the AI do?' })).toBeTruthy();
  });

  it('starts on the job mode, the reason people open the composer', () => {
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);

    expect(mode('Job tailoring').getAttribute('aria-pressed')).toBe('true');
    expect(field().getAttribute('placeholder')).toBe(CAUTION);
  });

  it('drops the text field on Professional, because there is nothing to ask', () => {
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);

    fireEvent.click(mode('Professional'));

    expect(mode('Professional').getAttribute('aria-pressed')).toBe('true');
    expect(screen.queryByRole('textbox', { name: /Job Description/ })).toBeNull();
  });

  it('keeps the run action available in a mode with no field at all', () => {
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);

    fireEvent.click(mode('Professional'));

    expect(
      (screen.getByRole('button', { name: 'Improve my CV' }) as HTMLButtonElement).disabled,
    ).toBe(false);
  });

  /**
   * ⚠️ Choosing a mode that takes text is a request for the field, so it also
   * reopens a closed band. Without that, `Job tailoring` on a collapsed band is
   * a dead end: `canRun` is false with no draft and there is nowhere to type.
   */
  it('reveals the job-ad field on Job tailoring, reopening the band if it is shut', () => {
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);
    fireEvent.click(screen.getByRole('button', { name: 'Improve with AI' }));
    expect(screen.queryByRole('textbox', { name: /Job Description/ })).toBeNull();

    fireEvent.click(mode('Job tailoring'));

    expect(field()).toBeTruthy();
    expect(field().getAttribute('rows')).toBe('6');
  });

  /**
   * ⚠️ Absent, not disabled. A button that cannot be pressed is clutter on a row
   * whose whole job is to stay one line, and the thing the user actually has to
   * do next — supply the ad — takes its slot instead.
   */
  it('offers no run action for a job-description rewrite with no job description', () => {
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);
    fireEvent.click(mode('Job tailoring'));
    fireEvent.click(screen.getByRole('button', { name: 'Improve with AI' }));

    expect(screen.queryByRole('button', { name: 'Improve my CV' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Job Description' })).toBeTruthy();
  });

  /**
   * `professional` needs no draft, so it can always run — the rule "the action
   * appears once it is possible" produces the right answer without a special
   * case, and it never offers a text entry it would not honour.
   */
  it('keeps the run action on Professional, which needs nothing typed', () => {
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);
    fireEvent.click(mode('Professional'));
    fireEvent.click(screen.getByRole('button', { name: 'Improve with AI' }));

    expect(screen.getByRole('button', { name: 'Improve my CV' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Job Description' })).toBeNull();
  });

  /**
   * The row has one loud thing, and which one it is follows what still has to
   * be done — so the primary fill moves to the entry control while the draft is
   * missing, rather than sitting on a button that cannot be pressed.
   */
  it('gives the primary fill to whichever step is next', () => {
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);
    fireEvent.click(screen.getByRole('button', { name: 'Improve with AI' }));

    const entry = screen.getByRole('button', { name: 'Job Description' });
    expect(entry.className).toContain('bg-primary');
    // Nothing else on the row is competing for the eye while the step is undone.
    expect(screen.queryByRole('button', { name: 'Improve my CV' })).toBeNull();

    fireEvent.click(entry);
    fireEvent.change(field(), { target: { value: 'Senior React engineer, remote' } });
    expect(screen.getByRole('button', { name: 'Improve my CV' }).className).toContain('bg-primary');

    // ⚠️ Folded with a draft, the run does not come along: it would use an ad
    // the user cannot see (#27). The entry control is the one way back to it.
    fireEvent.click(screen.getByRole('button', { name: 'Improve with AI' }));
    expect(screen.queryByRole('button', { name: 'Improve my CV' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Job Description' }).className).toContain(
      'bg-primary',
    );
  });

  /**
   * ⚠️ Guests get the login prompt rather than a paywall or a silent no-op —
   * the same order `AISuggestButton` uses, so the two entry points cannot
   * disagree about what happens when nobody is signed in.
   */
  it('sends a signed-out visitor to sign-in rather than to the modal', () => {
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);

    // Professional, so the run button is enabled with nothing typed — the
    // job mode is the default and refuses to run on an empty ad.
    fireEvent.click(mode('Professional'));
    fireEvent.click(screen.getByRole('button', { name: 'Improve my CV' }));

    expect(useFlowStore.getState().auth.authSurface).toBe('google');
    expect(useResumeStore.getState().ai.isModalOpen).toBe(false);
  });

  it('hands off to the dialog on phones instead of running from an off-screen setting', () => {
    render(<AIComposerBar isPhone={true} workspaceWidth={390} />);

    expect(screen.queryByRole('button', { name: 'Professional' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Improve with AI' })).toBeTruthy();
  });
});

/**
 * The bar lives above the editor all day, so its resting height is a feature —
 * and that is now the *band's* job, not the field's.
 *
 * ⚠️ These tests used to describe a field with two heights whose resting state
 * was a `button` showing the value. That is gone: a summary you press is not a
 * field, so a click could only ever open it, never put the caret where it was
 * aimed. The band's own chevron took over keeping the bar short, which left the
 * field's two-state doing a job already done — and propping up a deferred
 * collapse timer, a blur handler that had to skip its own bar, and an
 * `autoFocus` racing an unmount. One real textarea replaces all of it.
 */
describe("the composer's field", () => {
  it('shows no field at all while the band rests', () => {
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);

    fireEvent.click(screen.getByRole('button', { name: 'Improve with AI' }));

    expect(screen.queryByRole('textbox', { name: /Job Description/ })).toBeNull();
  });

  it('offers a labelled way into the text rather than only a chevron', () => {
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);
    fireEvent.click(screen.getByRole('button', { name: 'Improve with AI' }));

    // Named for what the user wants to do, not for the region it happens to open.
    fireEvent.click(screen.getByRole('button', { name: 'Job Description' }));

    expect(field().getAttribute('rows')).toBe('6');
  });

  it('is a real six-row textarea the moment it appears, with no second control', () => {
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);

    expect(field().getAttribute('rows')).toBe('6');
    // No Collapse inside the field: the band's chevron is the only disclosure.
    expect(screen.queryByRole('button', { name: /^Collapse/ })).toBeNull();
  });

  it('keeps the ad and its length when the band closes and opens again', async () => {
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);
    fireEvent.change(field(), { target: { value: 'Senior React engineer, remote' } });

    const toggle = screen.getByRole('button', { name: 'Improve with AI' });
    fireEvent.click(toggle);
    await waitFor(() =>
      expect(screen.queryByRole('textbox', { name: /Job Description/ })).toBeNull(),
    );
    fireEvent.click(toggle);

    // ⚠️ The value lives in `useAIComposer`, so hiding the band is never an
    // unmount of the draft — the paste survives the round trip.
    expect((field() as HTMLTextAreaElement).value).toBe('Senior React engineer, remote');
    expect(screen.getByText(`29 / ${AI_MAX_CHAR_LIMIT.toLocaleString()}`)).toBeTruthy();
  });

  it('does not offer a text entry for the mode that takes no text', () => {
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);
    fireEvent.click(screen.getByRole('button', { name: 'Improve with AI' }));
    fireEvent.click(screen.getByRole('button', { name: 'Professional' }));

    expect(screen.queryByRole('button', { name: 'Job Description' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Custom Instructions' })).toBeNull();
  });
});

describe("the composer's options row", () => {
  it('offers restructure before translate, and pins the run button beside them', () => {
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);
    fillDraft();

    const options = screen.getByRole('checkbox', { name: 'Restructure Skills' });
    const translate = screen.getByRole('checkbox', { name: 'Also translate my CV' });

    // Restructure first: the common add-on leads.
    expect(options.compareDocumentPosition(translate) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(runContainer()).toBeTruthy();
  });

  /**
   * ⚠️ The invariant a later refactor is most likely to break. The run button is
   * the primary action; nothing elsewhere in the bar may move it.
   *
   * It used to live in the row-2 div in one shape and the row-3 div in the
   * other, so React unmounted and remounted it across the switch — the ruling
   * said it must not and the in-file comment claimed it did not. It now sits on
   * row 1, which the add-ons cannot reach at all, so the guarantee is
   * structural rather than a promise about how a flex row wraps.
   *
   * The old assertion here was `row.children.length === 2`, which encoded the
   * options row's shape. That is why it is gone: the row it counted is no
   * longer the row the button is in.
   */
  it('never moves the run button when translate is ticked', () => {
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);
    fillDraft();

    const before = runContainer();
    const row = before!.parentElement!;
    const indexBefore = Array.from(row.children).indexOf(before!);

    fireEvent.click(screen.getByRole('checkbox', { name: 'Also translate my CV' }));

    expect(screen.getByRole('combobox', { name: 'Also translate my CV' })).toBeTruthy();
    expect(runContainer()).toBe(before);
    expect(runContainer()!.parentElement).toBe(row);
    expect(Array.from(row.children).indexOf(runContainer()!)).toBe(indexBefore);

    // The add-ons are not even siblings of the run button any more.
    const translateRow = screen
      .getByRole('checkbox', { name: 'Also translate my CV' })
      .closest('div')!;
    expect(translateRow.contains(runContainer())).toBe(false);
  });

  /**
   * The collapse is a region toggle, so the run button has to survive it in
   * the mode that takes no text — there is nothing hidden for it to use.
   */
  it('keeps the run button on the resting row when the bar is collapsed', () => {
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);
    fireEvent.click(mode('Professional'));

    const before = runContainer();
    // ⚠️ Found by role, not by a "Show"/"Hide" label. The toggle is named for
    // the region it discloses and carries the state in `aria-expanded`, which
    // is what a screen reader announces — and is why it needs no new string.
    const toggle = screen.getByRole('button', { name: 'Improve with AI' });
    expect(toggle.getAttribute('aria-expanded')).toBe('true');

    fireEvent.click(toggle);

    expect(screen.queryByRole('checkbox', { name: 'Also translate my CV' })).toBeNull();
    expect(runContainer()).toBe(before);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  // A closed band in Professional runs in one click, so it names what rides
  // along — the hidden translate tick re-translated a CV unseen (#25, #31).
  describe('the closed row names the active add-ons', () => {
    const closeBand = () =>
      fireEvent.click(screen.getByRole('button', { name: 'Improve with AI' }));
    const tickTranslate = (language: string) => {
      fireEvent.click(screen.getByRole('checkbox', { name: 'Also translate my CV' }));
      fireEvent.change(screen.getByRole('combobox', { name: 'Also translate my CV' }), {
        target: { value: language },
      });
    };

    const summary = () => document.querySelector<HTMLElement>('[data-composer-addons]');

    it('names every active add-on after the run button', () => {
      render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);
      fireEvent.click(mode('Professional'));
      // Restructure is on by default (#57), so it is named without a click.
      tickTranslate('fr');
      closeBand();

      expect(summary()?.textContent).toBe('Restructure Skills · Translate → Français');
      expect(
        runContainer()!.compareDocumentPosition(summary()!) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });

    // It unmounts as the band opens; focus must not fall to the page.
    it('opens the band and leaves focus on the disclosure', () => {
      render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);
      fireEvent.click(mode('Professional'));
      tickTranslate('fr');
      closeBand();

      fireEvent.click(summary()!);
      const toggle = screen.getByRole('button', { name: 'Improve with AI' });
      expect(toggle.getAttribute('aria-expanded')).toBe('true');
      expect(document.activeElement).toBe(toggle);
    });

    it('shows nothing when no add-on is active', () => {
      render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);
      fireEvent.click(mode('Professional'));
      fireEvent.click(screen.getByRole('checkbox', { name: 'Restructure Skills' }));
      closeBand();

      expect(summary()).toBeNull();
    });

    it('shows nothing in a text mode, where the entry button stands in for the run', () => {
      render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);
      fillDraft();
      tickTranslate('fr');
      closeBand();

      expect(summary()).toBeNull();
    });
  });

  /**
   * A launched run folds the band: the result is reviewed below it, so the
   * pasted ad would only push the editor down once the proposals are handled.
   */
  it('collapses once a run launches, keeping the draft behind the entry control', () => {
    auth.current = {
      ...SIGNED_OUT,
      user: { id: 'user-1' },
      profile: {},
      session: { access_token: 'token' },
      isPremium: true,
    };
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);
    fillDraft();

    fireEvent.click(runButton());

    expect(useResumeStore.getState().ai.isModalOpen).toBe(true);
    expect(useUIStore.getState().aiComposerCollapsed).toBe(true);
    expect(screen.queryByRole('textbox', { name: /Job Description/ })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Job Description' }));
    expect((field() as HTMLTextAreaElement).value).toBe('Senior React engineer, remote');
  });

  it('stays open when the run is refused, so nothing the user was doing disappears', () => {
    render(<AIComposerBar isPhone={false} workspaceWidth={1400} />);
    fillDraft();

    // Signed out: the guard routes to sign-in and no run starts.
    fireEvent.click(runButton());

    expect(useFlowStore.getState().auth.authSurface).toBe('google');
    expect(useResumeStore.getState().ai.isModalOpen).toBe(false);
    expect(useUIStore.getState().aiComposerCollapsed).toBe(false);
  });
});

/**
 * The phone shape hands off to the modal instead of running, so its single
 * button is the only thing a phone user touches — and the access chip is the
 * only thing that says the touch will bounce.
 *
 * ⚠️ This is a regression test for a real defect, not a shape assertion. The
 * button carries its own `aria-label`, and an explicit name stops the accname
 * algorithm descending into children — so the chip's `sr-only` warning was
 * announced by **nothing at all** on the one surface where it is the sole
 * signal. The `aria-describedby` link is what makes it reachable; without it
 * every check still passed, because the chip renders correctly in isolation.
 */
describe('the phone hand-off button', () => {
  const handoff = () => screen.getByRole('button', { name: 'Improve with AI' });

  it('points aria-describedby at the access chip so the blocker is announced', () => {
    render(<AIComposerBar isPhone workspaceWidth={375} />);

    const describedBy = handoff().getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();

    // The reference must resolve, and resolve to the warning — a dangling id
    // would leave the button described by nothing while looking wired up.
    //
    // ⚠️ Read from the bundle, never a literal. Asserting the English spelling
    // made a pure capitalisation edit in `en/ai.ts` fail this test, while the
    // sibling `accessChip.test.tsx` — which resolves the key — stayed green.
    // The property is "the id resolves to the chip", not "the chip says this".
    const chip = document.getElementById(describedBy as string);
    expect(chip).toBeTruthy();
    expect(chip?.textContent).toContain(en.ai.insufficient_premium_access_title);
  });

  /**
   * ⚠️ The other direction, and the one the attribute's conditional exists for.
   * A Pass holder inside their allowance gets no chip at all, so an
   * unconditional `aria-describedby` would name an id nothing carries — the
   * dangling reference the case above cannot see, because it never renders the
   * empty state.
   */
  it('carries no aria-describedby when there is no blocker to announce', () => {
    auth.current = {
      ...SIGNED_OUT,
      user: { id: 'user-1' },
      profile: {},
      session: { access_token: 'token' },
      isPremium: true,
    };

    render(<AIComposerBar isPhone workspaceWidth={375} />);

    expect(handoff().getAttribute('aria-describedby')).toBeNull();
  });
});
