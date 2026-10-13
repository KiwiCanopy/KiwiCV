// @vitest-environment jsdom
import { MemoryRouter } from 'react-router-dom';

import { AISuggestButton } from '@/components/ui/AISuggestButton';
import { AccordionItem } from '@/components/ui/Accordion';
import { Section } from '@/components/ui/Section';
import { useResumeStore } from '@/store/resume/useResumeStore';
import {
  expectLive,
  expectRefused,
  improve,
  job,
  openAIModal,
  seedWork,
} from '@/test/improveRefusal';
import { type ResumeData, initialResumeState } from '@/types/resume';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * On an empty section or entry, Improve stays in place but refused: no native
 * `disabled` (it would drop the description), the reason in a tooltip that takes
 * no room in the row, and a press that starts nothing. A pending proposal's
 * refusal is in `improveRefusedWhilePending.test.tsx`.
 */

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: {}, profile: {}, isPremium: true, session: {} }),
}));

beforeEach(() => {
  openAIModal.mockReset();
  seedWork([]);
});

describe('section header Improve', () => {
  const renderSection = () =>
    render(
      <MemoryRouter>
        <Section title="Work" sectionId="work" variant="page">
          <p>body</p>
        </Section>
      </MemoryRouter>,
    );

  it('is present but refused, with its reason, while the section is empty', async () => {
    renderSection();
    await expectRefused(/Add content to this section first/);
  });

  it('is live once the section has an entry', async () => {
    seedWork([job]);
    renderSection();
    await expectLive();
  });

  /** Accepting proposals needs no content, so the pending pill must not be refused. */
  it('still accepts pending proposals on an otherwise empty section', () => {
    useResumeStore.setState((state) => ({
      ai: {
        ...state.ai,
        suggestions: {
          'section:work': { originalValue: [], improvedValue: [job], timestamp: 1 },
        },
      },
    }));
    renderSection();
    const accept = screen.getByRole('button', { name: /Accept all changes/i });
    expect(accept.getAttribute('aria-disabled')).toBeNull();
  });
});

/**
 * `basics` is one object, so emptiness is per field. A photo gives Improve
 * nothing to rewrite and profiles are AI-excluded, so neither makes it live.
 */
describe('basics header Improve', () => {
  const blankBasics = () => structuredClone(initialResumeState.basics);
  const seedBasics = (basics: Partial<ResumeData['basics']>) =>
    useResumeStore.setState((state) => ({
      resume: { ...state.resume, basics: { ...blankBasics(), ...basics } },
    }));
  const renderBasics = () =>
    render(
      <MemoryRouter>
        <Section title="Personal" sectionId="basics" variant="page">
          <p>body</p>
        </Section>
      </MemoryRouter>,
    );

  it('is refused while every field is blank', async () => {
    seedBasics({});
    renderBasics();
    await expectRefused(/Add content to this section first/);
  });

  it('is refused with only a photo', async () => {
    seedBasics({ image: 'data:image/png;base64,AAAA' });
    renderBasics();
    await expectRefused(/Add content to this section first/);
  });

  it('is refused with only a profile', async () => {
    seedBasics({
      profiles: [{ network: 'GitHub', username: 'ada', url: 'https://github.com/ada' }],
    });
    renderBasics();
    await expectRefused(/Add content to this section first/);
  });

  it('is live with only a summary', async () => {
    seedBasics({ summary: 'Engineer who ships.' });
    renderBasics();
    await expectLive();
  });
});

describe('custom section header Improve', () => {
  const renderCustom = (isEmpty: boolean) =>
    render(
      <MemoryRouter>
        <Section
          title="Talks"
          variant="page"
          aiTarget={{ target: 'section:custom:talks', name: 'Talks', isEmpty }}
        >
          <p>body</p>
        </Section>
      </MemoryRouter>,
    );

  it('is refused while empty', async () => {
    renderCustom(true);
    await expectRefused(/Add content to this section first/);
  });

  it('is live with content', async () => {
    renderCustom(false);
    await expectLive();
  });
});

describe('entry Improve', () => {
  const renderEntry = (isEmpty: boolean) =>
    render(
      <MemoryRouter>
        <AccordionItem title="Acme" aiTarget={{ target: 'item:work:v1', isEmpty }}>
          <p>fields</p>
        </AccordionItem>
      </MemoryRouter>,
    );

  it('is refused while every field is blank', async () => {
    renderEntry(true);
    await expectRefused(/Fill in this entry first/);
  });

  it('is live once the entry has content', async () => {
    renderEntry(false);
    await expectLive();
  });
});

/** The tooltip itself: WCAG 1.4.13 (dismissable, hoverable, persistent) and placement. */
describe('the refusal tooltip', () => {
  const ui = (reason?: string) => (
    <MemoryRouter>
      <AISuggestButton target="section:work" ariaLabel="Optimize Work" disabledReason={reason} />
    </MemoryRouter>
  );
  const tooltipOf = (button: HTMLElement) =>
    document.getElementById(button.getAttribute('aria-describedby')!)!;
  const isShown = (tooltip: HTMLElement) => !tooltip.className.includes('invisible');

  /** A 1024x700 viewport, a 200x40 tooltip, and a button wherever `place` puts it. */
  const layout = (button: HTMLElement, tooltip: HTMLElement) => {
    vi.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(700);
    vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(1024);
    vi.spyOn(tooltip, 'offsetHeight', 'get').mockReturnValue(40);
    vi.spyOn(tooltip, 'offsetWidth', 'get').mockReturnValue(200);
    const rect = vi.spyOn(button, 'getBoundingClientRect');
    return (top: number, left = 1000) =>
      rect.mockReturnValue({
        top,
        bottom: top + 26,
        left,
        right: left + 30,
        width: 30,
        height: 26,
        x: left,
        y: top,
        toJSON: () => ({}),
      });
  };

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('stays open while the pointer crosses from the button onto it', () => {
    vi.useFakeTimers();
    render(ui('Nothing yet.'));
    const button = improve();
    const tooltip = tooltipOf(button);

    fireEvent.mouseEnter(button);
    fireEvent.mouseLeave(button);
    fireEvent.mouseEnter(tooltip);
    act(() => vi.advanceTimersByTime(500));
    expect(isShown(tooltip)).toBe(true);

    fireEvent.mouseLeave(tooltip);
    act(() => vi.advanceTimersByTime(500));
    expect(isShown(tooltip)).toBe(false);
  });

  /** WCAG 1.4.13: hover and focus are separate reasons to show; losing one keeps the other. */
  it('stays open for keyboard focus when the pointer leaves', () => {
    vi.useFakeTimers();
    render(ui('Nothing yet.'));
    const button = improve();
    fireEvent.focus(button);
    fireEvent.mouseEnter(button);
    fireEvent.mouseLeave(button);
    act(() => vi.advanceTimersByTime(500));
    expect(isShown(tooltipOf(button))).toBe(true);
  });

  it('stays open under the pointer when focus leaves', () => {
    render(ui('Nothing yet.'));
    const button = improve();
    fireEvent.mouseEnter(button);
    fireEvent.focus(button);
    fireEvent.blur(button);
    expect(isShown(tooltipOf(button))).toBe(true);
  });

  it('closes on Escape pressed anywhere, without letting it close an enclosing layer', () => {
    render(ui('Nothing yet.'));
    const button = improve();
    // Radix's dismissable layers listen on the document in the capture phase.
    const enclosing = vi.fn();
    document.addEventListener('keydown', enclosing, true);
    try {
      fireEvent.mouseEnter(button);
      fireEvent.keyDown(document.body, { key: 'Escape' });
      expect(isShown(tooltipOf(button))).toBe(false);
      expect(enclosing).not.toHaveBeenCalled();

      // Nothing showing, so the next Escape is not ours to swallow.
      fireEvent.keyDown(document.body, { key: 'Escape' });
      expect(enclosing).toHaveBeenCalledOnce();
    } finally {
      document.removeEventListener('keydown', enclosing, true);
    }
  });

  it('closes on a tap outside, since a tapped button may never take focus', () => {
    render(ui('Nothing yet.'));
    const button = improve();
    fireEvent.click(button);
    expect(isShown(tooltipOf(button))).toBe(true);

    fireEvent.pointerDown(tooltipOf(button));
    expect(isShown(tooltipOf(button))).toBe(true);
    fireEvent.pointerDown(document.body);
    expect(isShown(tooltipOf(button))).toBe(false);
  });

  it('follows the button on scroll, and hides while the button is out of view', () => {
    vi.useFakeTimers();
    render(ui('Nothing yet.'));
    const button = improve();
    const tooltip = tooltipOf(button);
    const place = layout(button, tooltip);

    place(100);
    fireEvent.focus(button);
    expect(parseFloat(tooltip.style.top)).toBe(100 + 26 + 6);

    place(300);
    fireEvent.scroll(window);
    act(() => vi.advanceTimersByTime(50));
    expect(parseFloat(tooltip.style.top)).toBe(300 + 26 + 6);

    place(-200);
    fireEvent.scroll(window);
    act(() => vi.advanceTimersByTime(50));
    expect(isShown(tooltip)).toBe(false);

    place(200);
    fireEvent.scroll(window);
    act(() => vi.advanceTimersByTime(50));
    expect(isShown(tooltip)).toBe(true);
  });

  it('flips above the button when there is no room below, inside the viewport', () => {
    render(ui('Nothing yet.'));
    const button = improve();
    const tooltip = tooltipOf(button);
    layout(button, tooltip)(670);

    fireEvent.focus(button);
    expect(parseFloat(tooltip.style.top)).toBe(670 - 6 - 40);
    expect(parseFloat(tooltip.style.left)).toBe(1024 - 8 - 200);
  });

  it('dims the glyph, not the button that carries the focus ring', () => {
    render(ui('Nothing yet.'));
    const button = improve();
    // `disabled:opacity-50` is the generating state, not this one.
    expect(button.className).not.toMatch(/(^|\s)(aria-disabled:)?opacity-/);
    expect(button.querySelector('svg')?.getAttribute('class')).toContain('opacity-50');
  });

  it('re-measures on a second tap while already showing', () => {
    render(ui('Nothing yet.'));
    const button = improve();
    const tooltip = tooltipOf(button);
    const place = layout(button, tooltip);

    place(100);
    fireEvent.click(button);
    expect(parseFloat(tooltip.style.top)).toBe(100 + 26 + 6);

    // Touch: tap, scroll the page (no scroll event reaches us here), tap again.
    place(400);
    fireEvent.click(button);
    expect(isShown(tooltip)).toBe(true);
    expect(parseFloat(tooltip.style.top)).toBe(400 + 26 + 6);
  });

  /** Stable callbacks: an unrelated store update must not re-subscribe (and drop a queued re-measure). */
  it('keeps its listeners across unrelated re-renders', () => {
    render(ui('Nothing yet.'));
    fireEvent.mouseEnter(improve());
    const added = vi.spyOn(window, 'addEventListener');
    act(() => useResumeStore.setState((state) => ({ resume: { ...state.resume } })));
    act(() => useResumeStore.setState((state) => ({ resume: { ...state.resume } })));
    expect(added.mock.calls.filter(([type]) => type === 'scroll')).toEqual([]);
  });

  /** A natively disabled button may never fire `blur`, so focus cannot be what clears it. */
  it('forgets its triggers while a run disables the button, without needing a blur', () => {
    render(ui('Nothing yet.'));
    const button = improve();
    fireEvent.focus(button);
    fireEvent.click(button);
    expect(isShown(tooltipOf(button))).toBe(true);

    act(() => useResumeStore.setState((state) => ({ ai: { ...state.ai, isGenerating: true } })));
    expect(isShown(tooltipOf(improve()))).toBe(false);
    act(() => useResumeStore.setState((state) => ({ ai: { ...state.ai, isGenerating: false } })));
    expect(isShown(tooltipOf(improve()))).toBe(false);
  });

  it('forgets a focus trigger when the refusal lapses, without needing a blur', () => {
    const { rerender } = render(ui('Nothing yet.'));
    fireEvent.focus(improve());
    expect(isShown(tooltipOf(improve()))).toBe(true);

    rerender(ui(undefined));
    rerender(ui('Nothing yet.'));
    expect(isShown(tooltipOf(improve()))).toBe(false);
  });

  it('does not reopen by itself after the refusal lapses', () => {
    vi.useFakeTimers();
    const { rerender } = render(ui('Nothing yet.'));
    fireEvent.mouseEnter(improve());
    expect(isShown(tooltipOf(improve()))).toBe(true);

    rerender(ui(undefined));
    fireEvent.blur(improve());
    fireEvent.mouseLeave(improve());
    act(() => vi.advanceTimersByTime(500));
    rerender(ui('Nothing yet.'));
    expect(isShown(tooltipOf(improve()))).toBe(false);
  });
});
