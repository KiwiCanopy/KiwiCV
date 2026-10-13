// @vitest-environment jsdom
import { CoverLetterForm } from '@/components/editor/CoverLetterForm';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useUIStore } from '@/store/ui/useUIStore';
import { createDefaultCoverLetter } from '@/types/resume';
import { importResume } from '@/utils/importResume';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, profile: null, isPremium: false, session: null }),
}));

/**
 * ⚠️ The letter comes before its addressing, unconditionally, and the diff panel
 * and master switch stay above both.
 *
 * Ordering is held by nothing but this file: an edit that only means to add a
 * field can reverse it, or sweep `EntryDiffPanel` into the now-first `Content`
 * section — which `CoverLetterForm`'s own comment explains would hide a proposal
 * inside a collapsible.
 */

const seed = (paragraphs: string[], suggestions: Record<string, unknown> = {}) => {
  useResumeStore.setState((state) => ({
    resume: {
      ...state.resume,
      coverLetter: { ...createDefaultCoverLetter(), enabled: true, paragraphs },
    },
    ai: { ...state.ai, suggestions } as typeof state.ai,
  }));
};

/** Document order of the two sub-section headings, whatever their depth. */
const orderOf = (container: HTMLElement) => {
  const content = screen.getByText('Content');
  const recipient = screen.getByText('Recipient');
  const position = content.compareDocumentPosition(recipient);
  expect(container.contains(content) && container.contains(recipient)).toBe(true);
  return position & Node.DOCUMENT_POSITION_FOLLOWING ? 'content-first' : 'recipient-first';
};

beforeEach(() => {
  useResumeStore.setState((state) => ({
    resume: { ...state.resume, coverLetter: createDefaultCoverLetter() },
  }));
  useUIStore.setState({ coverLetterRecipientCollapsed: null });
});

describe('the cover letter section leads with the letter', () => {
  it('puts Content above Recipient on an empty letter', () => {
    seed([]);
    const { container } = render(<CoverLetterForm />);
    expect(orderOf(container)).toBe('content-first');
  });

  /** The same order once there is a letter — the rejected alternative flipped here. */
  it('keeps that order once the letter has text', () => {
    seed(['Dear Hiring Team,', 'A paragraph.', 'Kind regards']);
    const { container } = render(<CoverLetterForm />);

    // ⚠️ Assert the letter is actually filled first. The order check reads only
    // DOM position, so without this a seed that stopped landing would leave this
    // case a silent duplicate of the empty one — and the empty one is not what
    // pins the rejected "reorder once `paragraphs` fills" variant.
    const body = container.querySelector<HTMLTextAreaElement>('#cover-letter-body');
    expect(body?.value).toContain('Dear Hiring Team,');
    expect(orderOf(container)).toBe('content-first');
  });

  /**
   * ⚠️ The invariants the reorder could quietly take with it. Both sit above the
   * sub-sections deliberately: the panel because a proposal inside a collapsed
   * one is invisible, the switch because it governs the whole section.
   */
  it('keeps the proposal panel and the master switch above both sub-sections', () => {
    // A pending proposal, or the panel does not render and the assertion below
    // would pass by absence — the vacuity this file is otherwise careful about.
    seed(['Dear Hiring Team,', 'A paragraph.', 'Kind regards'], {
      'item:coverLetter': {
        originalValue: { paragraphs: ['Mine.'] },
        improvedValue: { paragraphs: ['Theirs.'] },
        timestamp: 1,
      },
    });
    const { container } = render(<CoverLetterForm />);

    const panel = container.querySelector('[data-ai-pending="entry"]');
    const switchLabel = screen.getByText('Include a cover letter');
    const content = screen.getByText('Content');
    const recipient = screen.getByText('Recipient');
    const follows = (a: Element, b: Element) =>
      Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

    expect(panel, 'the proposal panel did not render, so this proves nothing').toBeTruthy();
    for (const heading of [content, recipient]) {
      expect(follows(panel as Element, heading)).toBe(true);
      expect(follows(switchLabel, heading)).toBe(true);
    }
  });
});

/**
 * ⚠️ **`Section` re-reads `defaultCollapsed` on every mount**, and from the editor
 * a remount is what finishing an AI run looks like. So Recipient is controlled:
 * collapsed only while its addressee fields are empty (owner, 2026-10-12), and
 * once the user toggles it, that choice holds across remounts for the session.
 */
describe('which sub-sections open on mount', () => {
  /** The disclosure button for a sub-section, by its heading text. */
  const header = (name: string) =>
    screen.getByText(name).closest('button') ??
    screen.getByRole('button', { name: new RegExp(name) });

  it('opens Content and leaves an empty addressee and the layout closed', () => {
    seed(['Dear Ms Muster,']);
    render(<CoverLetterForm />);

    expect(header('Content').getAttribute('aria-expanded'), 'Content is the point').toBe('true');
    expect(header('Recipient').getAttribute('aria-expanded')).toBe('false');
    expect(header('Layout').getAttribute('aria-expanded')).toBe('false');
  });

  /**
   * The panel is not rendered at all while collapsed, so this is the same claim
   * from the other side — and the side a user would notice.
   */
  it('does not render the addressing fields until the section is opened', () => {
    seed(['Dear Ms Muster,']);
    render(<CoverLetterForm />);

    expect(screen.queryByLabelText('Company')).toBeNull();
    expect(screen.queryByLabelText('Contact name')).toBeNull();
  });

  /**
   * ⚠️ Subject and date print on every letter while the addressee is off by
   * default, so they sit in `Content` and are reachable with nothing expanded.
   * Sweeping them back under the closed `Recipient` hides them on every mount.
   */
  it('shows Subject and Date without expanding Recipient', () => {
    seed(['Dear Ms Muster,']);
    render(<CoverLetterForm />);

    expect(header('Recipient').getAttribute('aria-expanded')).toBe('false');
    const subject = screen.getByLabelText('Subject');
    const date = screen.getByLabelText('Date');
    // Above the body they title, as they print.
    const body = document.querySelector('#cover-letter-body');
    expect(body, 'the letter body did not render').toBeTruthy();
    for (const field of [subject, date]) {
      expect(
        field.compareDocumentPosition(body as Element) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
  });
});

describe('Recipient follows its content until the user chooses', () => {
  const header = (name: string) =>
    screen.getByText(name).closest('button') ??
    screen.getByRole('button', { name: new RegExp(name) });

  const seedRecipient = (
    recipient: Partial<ReturnType<typeof createDefaultCoverLetter>['recipient']>,
  ) => {
    useResumeStore.setState((state) => ({
      resume: {
        ...state.resume,
        coverLetter: {
          ...createDefaultCoverLetter(),
          recipient: { ...createDefaultCoverLetter().recipient, ...recipient },
        },
      },
    }));
  };

  it('collapses an addressee that is only whitespace', () => {
    seedRecipient({ name: '  ', company: '', address: '\n' });
    render(<CoverLetterForm />);
    expect(header('Recipient').getAttribute('aria-expanded')).toBe('false');
  });

  it('shows a filled addressee expanded', () => {
    seedRecipient({ company: 'Globex' });
    render(<CoverLetterForm />);
    expect(header('Recipient').getAttribute('aria-expanded')).toBe('true');
    expect((screen.getByLabelText('Company') as HTMLInputElement).value).toBe('Globex');
  });

  it('keeps a filled addressee the user collapsed collapsed across a remount', async () => {
    const user = userEvent.setup();
    seedRecipient({ company: 'Globex' });
    const { unmount } = render(<CoverLetterForm />);
    await user.click(header('Recipient'));
    expect(header('Recipient').getAttribute('aria-expanded')).toBe('false');

    unmount();
    render(<CoverLetterForm />);
    expect(header('Recipient').getAttribute('aria-expanded')).toBe('false');
  });

  it('keeps an empty addressee the user opened open across a remount', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<CoverLetterForm />);
    await user.click(header('Recipient'));
    expect(header('Recipient').getAttribute('aria-expanded')).toBe('true');

    unmount();
    render(<CoverLetterForm />);
    expect(header('Recipient').getAttribute('aria-expanded')).toBe('true');
  });

  /** Emptiness is the default only; a live edit must not fold the section away under the cursor. */
  it('stays open, with focus in place, when the user clears the last field', async () => {
    const user = userEvent.setup();
    seedRecipient({ company: 'Globex' });
    render(<CoverLetterForm />);
    const company = screen.getByLabelText('Company') as HTMLInputElement;

    await user.type(company, ' Corp');
    await user.clear(company);
    // Text fields commit on blur in the PDF view, so the store empties as focus moves on.
    await user.tab();

    expect(useResumeStore.getState().resume.coverLetter.recipient.company).toBe('');
    expect(header('Recipient').getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(screen.getByLabelText('Address'));
  });

  /** `ResumeData` has no id, so the choice is cleared when another CV is loaded. */
  it('does not carry a choice over to another CV', async () => {
    const user = userEvent.setup();
    seedRecipient({ company: 'Globex' });
    const { unmount } = render(<CoverLetterForm />);
    await user.click(header('Recipient'));
    expect(header('Recipient').getAttribute('aria-expanded')).toBe('false');
    unmount();

    const other = structuredClone(useResumeStore.getState().resume);
    other.coverLetter.recipient = { name: 'Ms Muster', company: 'Initech', address: '' };
    await importResume(useResumeStore.getState().setResume, other, { silent: true });

    render(<CoverLetterForm />);
    expect(header('Recipient').getAttribute('aria-expanded')).toBe('true');
    expect((screen.getByLabelText('Company') as HTMLInputElement).value).toBe('Initech');
  });
});
