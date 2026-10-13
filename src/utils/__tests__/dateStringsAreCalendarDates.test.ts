import { isValidDate, normalizeDate } from '@/utils/normalizeDate';
import { sanitizeResumeData } from '@/utils/validation';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/**
 * ⚠️ **A stored date is a calendar date, not an instant.**
 *
 * `YYYY-MM-DD` is the ECMAScript **date-only** form, which the spec parses as
 * **UTC**. `normalizeDate` then re-emitted from LOCAL getters. West of UTC that
 * combination turned `2019-03-01` into `2019-02-28` and `2019` into `2018` — and
 * because the output was fed back in on the next pass, it walked the date back a
 * further day every time. Silent, compounding corruption of stored data.
 *
 * ⚠️ **Every assertion here is vacuous east of UTC**, which is exactly why the
 * bug survived: CI and the owner's machine both run in `Europe/Berlin`, where
 * the broken code returns the right answer. So this file **sets its own zone**
 * rather than trusting the runner's, and `the zone actually moved` fails loudly
 * if that ever stops working — a green suite that proves nothing is the failure
 * mode this bug is a case study in.
 */

const REAL_TZ = process.env.TZ;

beforeAll(() => {
  process.env.TZ = 'America/New_York';
});

afterAll(() => {
  // Restored rather than left set: a leaked zone would make some other suite
  // pass or fail for a reason that has nothing to do with what it asserts.
  if (REAL_TZ === undefined) delete process.env.TZ;
  else process.env.TZ = REAL_TZ;
});

describe('normalizeDate treats a stored date as a calendar date', () => {
  it('the zone actually moved, so the rest is not vacuous', () => {
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe('America/New_York');
    // The trap itself: the raw constructor still reads this as UTC midnight,
    // which is 19:00 the previous day here.
    expect(new Date('2019-03-01').getDate()).toBe(28);
  });

  it.each([
    ['2019-03-01', 'day precision'],
    ['2019-03', 'month precision'],
    ['2019', 'year only — the common precision for education and certificates'],
  ])('leaves %s untouched (%s)', (stored) => {
    expect(normalizeDate(stored)).toBe(stored);
  });

  /** The compounding half: the output must be a fixed point of the function. */
  it('is idempotent, so a value cannot drift across passes', () => {
    let value = '2019-03-01';
    for (let pass = 0; pass < 5; pass++) value = normalizeDate(value);
    expect(value).toBe('2019-03-01');
  });

  /**
   * The permissive parser is still reached for genuinely un-normalized input,
   * and still yields the local calendar date the user typed — the early return
   * must not have swallowed that path.
   */
  it('still parses a typed European date', () => {
    expect(normalizeDate('01.03.2019')).toBe('2019-03-01');
  });
});

/** A month-and-year date with a month from 1 to 12 reaches ISO. */
describe('normalizeDate expresses a month-and-year date', () => {
  it.each([
    ['03/2019', '2019-03'],
    ['03.2019', '2019-03'],
    ['03-2019', '2019-03'],
    ['3.2019', '2019-03'],
    ['3/2019', '2019-03'],
    ['12/2019', '2019-12'],
    [' 1.2020 ', '2020-01'],
  ])('normalizes %s to %s', (typed, iso) => {
    expect(isValidDate(typed)).toBe(true);
    expect(normalizeDate(typed)).toBe(iso);
  });

  it('is a fixed point once normalized', () => {
    expect(normalizeDate(normalizeDate('03/2019'))).toBe('2019-03');
  });

  /** An impossible month is kept as typed, never blanked: rehydration drops what isValidDate rejects. */
  it.each(['00/2019', '13/2019', '13.2019', '99-2019'])('keeps %s as typed', (typed) => {
    expect(isValidDate(typed)).toBe(true);
    expect(normalizeDate(typed)).toBe(typed);
  });
});

/** The rehydrate path keeps what an older build stored; rejecting it here blanked it. */
describe('a stored month-year date with an impossible month', () => {
  it('survives sanitizeResumeData unchanged and unwarned', () => {
    const { sanitized, warnings } = sanitizeResumeData({
      work: [{ name: 'Acme', startDate: '13/2019' }],
    });
    expect(sanitized.work[0].startDate).toBe('13/2019');
    expect(warnings).toEqual([]);
  });
});

/** A day-month-year date is read day-first and checked against the calendar. */
describe('normalizeDate expresses a day-month-year date', () => {
  it.each([
    ['05.06.2019', '2019-06-05'],
    ['05/06/2019', '2019-06-05'],
    ['05-06-2019', '2019-06-05'],
    ['5.6.2019', '2019-06-05'],
    ['05.06.19', '2019-06-05'],
    ['05.06.49', '2049-06-05'],
    ['05.06.50', '1950-06-05'],
    ['31.12.2019', '2019-12-31'],
    ['29.02.2020', '2020-02-29'],
    ['29.02.2000', '2000-02-29'],
  ])('normalizes %s to %s', (typed, iso) => {
    expect(isValidDate(typed)).toBe(true);
    expect(normalizeDate(typed)).toBe(iso);
  });

  it('is a fixed point once normalized', () => {
    expect(normalizeDate(normalizeDate('05.06.19'))).toBe('2019-06-05');
  });

  /** Kept as typed, never rolled over or blanked: rehydration drops what isValidDate rejects. */
  it.each([
    '13.13.2019',
    '00.05.2019',
    '13/13/2019',
    '31.02.2019',
    '29.02.2019',
    '29.02.1900',
    '31.04.2019',
    '05.06.199',
  ])('keeps %s as typed', (typed) => {
    expect(isValidDate(typed)).toBe(true);
    expect(normalizeDate(typed)).toBe(typed);
  });
});

/** The rehydrate path keeps what an older build stored. */
describe('a stored day-month-year date with an impossible day or month', () => {
  it.each(['13.13.2019', '31.02.2019'])(
    '%s survives sanitizeResumeData unchanged and unwarned',
    (stored) => {
      const { sanitized, warnings } = sanitizeResumeData({
        work: [{ name: 'Acme', startDate: stored }],
      });
      expect(sanitized.work[0].startDate).toBe(stored);
      expect(warnings).toEqual([]);
    },
  );
});

/** Day first, except where only the US order is possible. */
describe('normalizeDate reads an unambiguous US date month-first', () => {
  it.each([
    ['12/25/2019', '2019-12-25'],
    ['1/13/2019', '2019-01-13'],
  ])('%s → %s', (typed, iso) => {
    expect(normalizeDate(typed)).toBe(iso);
  });

  it('still reads an ambiguous one day-first', () => {
    expect(normalizeDate('05/06/2019')).toBe('2019-06-05');
  });

  it('keeps one impossible in both orders as typed', () => {
    expect(normalizeDate('13/13/2019')).toBe('13/13/2019');
    expect(normalizeDate('02/31/2019')).toBe('02/31/2019');
  });
});
