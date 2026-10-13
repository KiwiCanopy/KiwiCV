import { type LocalItem } from '@/components/editor/ArrayForm/types';
import {
  checkIsAlreadySorted,
  getChronologicallySortedItems,
  parseDateString,
} from '@/components/editor/ArrayForm/utils';
import { type ResumeData } from '@/types/resume';
import { isValidDate, normalizeDate } from '@/utils/normalizeDate';
import { ONGOING_DATE_WORDS } from '@/utils/ongoingDate';
import { describe, expect, it } from 'vitest';

/**
 * The sort key for a dated entry.
 *
 * ⚠️ **Every shape here is one `isValidDate` accepts.** That is the whole
 * defect: the validator tells the user their date is fine, `normalizeDate`
 * knows what it means, and the sort helper read it as something else — or as
 * nothing at all, which is indistinguishable from an undated entry.
 */
const ACCEPTED_SHAPES = [
  '2019',
  '2019-03',
  '2019-03-01',
  '01.03.2019',
  '15.03.2019',
  '15/03/2019',
  // Month-and-year, which had no key until `normalizeDate` learned the shape.
  '03/2019',
  '03.2019',
  '3-2019',
  // Two-digit year and dash separator, which `Date` once read month-first.
  '05.06.19',
  '05-06-2019',
] as const;

/**
 * A real `work` item, not a partial. ⚠️ vitest strips types, so a partial passed
 * every case here while `npx tsc -b` failed on all three call sites — AGENTS.md
 * §6, and this test is the reason to believe it.
 */
const entry = (startDate: string, endDate = ''): LocalItem<ResumeData['work'][number]> => ({
  _id: startDate,
  name: 'Acme',
  position: 'Engineer',
  url: '',
  summary: '',
  highlights: [],
  startDate,
  endDate,
});

const sortedNames = (items: LocalItem<ResumeData['work'][number]>[]) =>
  getChronologicallySortedItems<'work'>(items, 'startDate', 'endDate').map((item) => item._id);

describe('the array sort key', () => {
  it('reads a European date as day-month, the way normalizeDate does', () => {
    expect(parseDateString('01.03.2019')).toBe(parseDateString('2019-03-01'));
  });

  it('parses a day past the twelfth at all', () => {
    expect(parseDateString('15.03.2019')).toBe(parseDateString('2019-03-15'));
  });

  it('has a key for each accepted shape normalizeDate can express', () => {
    for (const shape of ACCEPTED_SHAPES) {
      expect(isValidDate(shape), `${shape} is accepted by isValidDate`).toBe(true);
      expect(parseDateString(shape), `${shape} has a sort key`).not.toBe(-Infinity);
    }
  });

  /**
   * The invariant this block pins: the two helpers cannot disagree about
   * what one string means. Ordering rather than equality, because the key is a
   * sort key and `normalizeDate` returns an ISO string — what has to match is
   * how each orders the same pair.
   */
  it('orders every pair the way the normalized ISO strings do', () => {
    for (const a of ACCEPTED_SHAPES) {
      for (const b of ACCEPTED_SHAPES) {
        const byKey = Math.sign(parseDateString(a) - parseDateString(b));
        const isoA = normalizeDate(a);
        const isoB = normalizeDate(b);
        const byIso = Math.sign(isoA < isoB ? -1 : isoA > isoB ? 1 : 0);
        expect(byKey, `${a} vs ${b} (${isoA} vs ${isoB})`).toBe(byIso);
      }
    }
  });

  /**
   * ⚠️ **The pair has to invert, or the test cannot see the defect.** This case
   * first used `01.01.2019` against `01.03.2019` — both day `01`, so the `MM/DD`
   * misread mapped them to 1 and 3 January and their relative order survived the
   * bug. It was the one case that passed on the broken code, and the only one
   * claiming to pin the swap. `05.01.2019` read as 1 May and `01.05.2019` as
   * 5 January, which is the swap, upside down.
   */
  it('reads day-month, so a May entry outranks a January one', () => {
    expect(sortedNames([entry('05.01.2019'), entry('01.05.2019')])).toEqual([
      '01.05.2019',
      '05.01.2019',
    ]);
  });

  /** The `>12` day was undated, so it sank below entries it predates. */
  it('does not sink a day-past-the-twelfth entry below an older one', () => {
    expect(sortedNames([entry('01.01.2015'), entry('15.03.2019')])).toEqual([
      '15.03.2019',
      '01.01.2015',
    ]);
  });

  /** `05.06.19` is 5 June, so it outranks 31 May; read month-first it was 6 May. */
  it('reads a two-digit-year date day-month', () => {
    expect(sortedNames([entry('31.05.2019'), entry('05.06.19')])).toEqual([
      '05.06.19',
      '31.05.2019',
    ]);
  });

  /** An impossible day is kept as typed, so it has no key — never March's. */
  it('gives a rolled-over day no key rather than the next month', () => {
    expect(parseDateString('31.02.2019')).toBe(-Infinity);
    expect(parseDateString('13.13.2019')).toBe(-Infinity);
  });

  it('agrees with itself about whether a list is already sorted', () => {
    const items = [entry('15.03.2019'), entry('01.01.2015')];
    expect(checkIsAlreadySorted<'work'>(items, 'startDate', 'endDate')).toBe(true);
    expect(checkIsAlreadySorted<'work'>([...items].reverse(), 'startDate', 'endDate')).toBe(false);
  });

  /**
   * ⚠️ An ongoing end date is what an import writes where the editor writes an
   * empty one. `normalizeDate` preserves the word; the sort key has to mean the
   * same thing by it, or the current job sorts to the bottom of the list.
   */
  it('treats every ongoing end date like an open one', () => {
    // ⚠️ Iterating the shared inventory pins that the sort key reads it rather
    // than keeping a fourth list; it cannot pin the words themselves, since the
    // implementation reads the same constant. `Present` is what binds the
    // lowercasing.
    for (const ongoing of [...ONGOING_DATE_WORDS, 'Present']) {
      expect(parseDateString(ongoing, true), ongoing).toBe(parseDateString('', true));
    }
  });

  /**
   * ⚠️ Deliberate: a question answered rather than inherited.
   * A string nothing can parse says nothing about when the entry happened, so
   * it sorts LAST in a newest-first list rather than claiming a position.
   */
  it('sorts a date nothing can parse last, not first', () => {
    expect(sortedNames([entry('unknown'), entry('2015-01-01')])).toEqual(['2015-01-01', 'unknown']);
  });

  /**
   * ⚠️ Measured, not assumed: `new Date('circa 2019')` is **not** invalid —
   * V8's lenient parser reads it as 1 January 2019. So a string like this has
   * always had a key, and what matters is that the key is the one
   * `normalizeDate` would give it rather than a second opinion.
   */
  it('gives a leniently parsed string the meaning normalizeDate gives it', () => {
    expect(normalizeDate('circa 2019')).toBe('2019-01');
    // ⚠️ Not `toBe(parseDateString('2019-01'))` — post-fix that is a tautology,
    // since the key IS `isoSortKey(normalizeDate(x))`. These two say where the
    // month-only key lands: inside January, ahead of any day in it.
    expect(parseDateString('circa 2019')).toBeGreaterThan(parseDateString('2018-12-31'));
    expect(parseDateString('circa 2019')).toBeLessThan(parseDateString('2019-01-01'));
  });
});
