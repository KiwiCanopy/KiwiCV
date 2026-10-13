// @vitest-environment jsdom
import { MemoryRouter } from 'react-router-dom';

import { WorkForm } from '@/components/editor/WorkForm';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { buildSingleItemResume } from '@/test/singleItemResume';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * ⚠️ **The stored calendar date must reach the picker unshifted.**
 *
 * `normalizeDate` is guarded by `dateStringsAreCalendarDates.test.ts`, but that
 * pins the callee. This is the call site: `ArrayFormField` seeds the picker from
 * the stored string, and it used `new Date(normalized)` — the ECMAScript
 * date-only grammar, parsed as **UTC**. West of UTC a stored `2019-03-01`
 * therefore reached the field as 28 February, and `formatToValue` wrote that
 * back from LOCAL components on the next selection.
 *
 * Fixing only `normalizeDate` leaves this shift in place, which is why the two
 * are tested apart.
 *
 * ⚠️ **Vacuous east of UTC**, so the file sets its own zone — see the sibling
 * suite for why that matters here specifically.
 */

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: null, profile: null }) }));

const REAL_TZ = process.env.TZ;
beforeAll(() => {
  process.env.TZ = 'America/New_York';
});
afterAll(() => {
  if (REAL_TZ === undefined) delete process.env.TZ;
  else process.env.TZ = REAL_TZ;
});

beforeEach(() => {
  const resume = buildSingleItemResume('lunar');
  resume.work[0].startDate = '2019-03-01';
  useResumeStore.setState({ resume });
});

/**
 * Opens every collapsed card, nested ones included, and popups only when asked.
 * `fireEvent`, not user-event: its pointer sequence, plus every calendar opened
 * for nothing, timed this out under load.
 */
function expandCards({ popups = false } = {}) {
  for (let pass = 0; pass < 4; pass++) {
    const collapsed = screen
      .queryAllByRole('button', { expanded: false })
      .filter((el) => popups || !el.hasAttribute('aria-haspopup'));
    if (collapsed.length === 0) break;
    for (const el of collapsed) fireEvent.click(el);
  }
}

describe('a stored date reaches the editor unshifted', () => {
  it('the zone actually moved, so this is not vacuous', () => {
    expect(new Date('2019-03-01').getDate()).toBe(28);
  });

  it('shows 1 March for a stored 2019-03-01, not the last day of February', () => {
    render(
      <MemoryRouter>
        <WorkForm />
      </MemoryRouter>,
    );

    // The cards nest, so expand to a fixed point rather than in one pass.
    expandCards();

    // ⚠️ The picker's own trigger, not the card header. The header renders the
    // stored string through its own formatter and is right either way, so
    // matching the first button containing the year passes on the broken code —
    // the first draft of this test did exactly that. The trigger is the button
    // whose entire label is the date.
    const dateTrigger = screen
      .getAllByRole('button')
      .find((b) => /^\w{3,} \d{1,2}, \d{4}$/.test((b.textContent ?? '').trim()));

    expect(dateTrigger, 'no date-picker trigger rendered').toBeTruthy();
    expect(dateTrigger?.textContent?.trim()).toBe('Mar 1, 2019');
  });

  /**
   * ⚠️ **An impossible date must not take the app down.** `parseISO` REJECTS
   * `2019-02-29` where the `Date` constructor rolled it over to 1 March, and
   * `isValidDate` accepts any `\d{4}-\d{2}-\d{2}`, so the sanitizer stores such a
   * string verbatim from an import or a raw-JSON edit. `DatePicker` formats any
   * truthy date, so an unguarded `Invalid Date` throws `RangeError` mid-render —
   * and there is no error boundary anywhere in `src`, so the screen goes blank.
   *
   * Introduced by the `parseISO` switch and caught in review, not by the suite.
   */
  it('survives an impossible stored date instead of throwing mid-render', () => {
    const resume = buildSingleItemResume('lunar');
    resume.work[0].startDate = '2019-02-29'; // 2019 is not a leap year
    useResumeStore.setState({ resume });

    expect(() =>
      render(
        <MemoryRouter>
          <WorkForm />
        </MemoryRouter>,
      ),
    ).not.toThrow();

    // Popups too: the calendar is handed the same unparseable date.
    expandCards({ popups: true });

    // The field renders empty rather than crashing; nothing claims a date.
    expect(screen.queryByText('Feb 29, 2019')).toBeNull();
  });
});
