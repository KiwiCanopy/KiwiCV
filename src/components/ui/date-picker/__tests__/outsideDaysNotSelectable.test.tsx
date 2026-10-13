// @vitest-environment jsdom
import { DatePicker, type DatePickerProps } from '@/components/ui/DatePicker';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

/**
 * ⚠️ **Neighbouring-month cells are not rendered, and the keyboard must still
 * cross the boundary.**
 *
 * They used to be shown and clickable. Measured: with January 2019 displayed,
 * one click on the faint `31` wrote `2018-12-31` — it moved the month AND the
 * year at once, out of the view the user had navigated to, in a picker whose
 * flow is `Year → Month → Day` and which asked for the month a step earlier.
 * They were also the least visible cells in the grid doing it: 3.03:1 against
 * the popover in dark, against 12.38:1 for a real day.
 *
 * ⚠️ **Disabling them instead is what the second test forbids**, and it was
 * tried first. `react-day-picker`'s `getNextFocus` re-evaluates the `disabled`
 * matcher on each candidate date and recurses past it, so "every day outside the
 * shown month is disabled" makes arrow keys, `Home` and `PageUp`/`PageDown`
 * dead-end at every boundary — 365 candidates, all disabled, no focus move.
 * That is WCAG 2.1.1 (Level A), and it lands on exactly the keyboard users the
 * click fix was for.
 */

/** March 2019: 31 days, and its grid would otherwise trail into Feb and April. */
const openPicker = async (
  user: ReturnType<typeof userEvent.setup>,
  onChange: DatePickerProps['onChange'],
  day = 1,
) => {
  render(<DatePicker date={new Date(2019, 2, day)} onChange={onChange} initialGranularity="day" />);
  await user.click(screen.getAllByRole('button')[0]);
};

/**
 * Scoped to the grid rather than matched on the label: day names are
 * locale-formatted ("March 1st, 2019" here, "1. März 2019" in shipped German),
 * and the trigger carries a year of its own.
 */
const dayCells = () =>
  within(screen.getByRole('grid')).getAllByRole('button') as HTMLButtonElement[];

describe('the day grid', () => {
  it('offers every day of the shown month and no day of any other', async () => {
    const user = userEvent.setup();
    await openPicker(user, vi.fn());

    // By count, not by month name: how many cells the neighbours would
    // contribute depends on where the locale starts its week. March has 31
    // days, so "exactly 31 cells" is "the shown month and nothing else".
    expect(dayCells()).toHaveLength(31);
    expect(dayCells().every((b) => !b.disabled)).toBe(true);
  });

  /**
   * ⚠️ The guard against the fix that was tried first. Hiding the cells keeps
   * this working; disabling them breaks it.
   */
  it('still crosses the month boundary with the keyboard', async () => {
    const user = userEvent.setup();
    await openPicker(user, vi.fn(), 31);

    const last = dayCells().at(-1) as HTMLElement;
    last.focus();
    const before = document.activeElement?.getAttribute('aria-label');

    await user.keyboard('{ArrowRight}');

    const after = document.activeElement?.getAttribute('aria-label');
    expect(after).not.toBe(before);
    // The month advanced with it, so the grid is now April's.
    expect(dayCells()).toHaveLength(30);
  });
});
