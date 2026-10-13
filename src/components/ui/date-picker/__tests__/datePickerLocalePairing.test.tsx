// @vitest-environment jsdom
import { useDatePicker } from '@/components/ui/date-picker/useDatePicker';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

/**
 * Which of the picker's **two** locales each formatter uses.
 *
 * The picker has two locale codes in scope — `localeCode`, the language the CV
 * is written in, and `uiLocaleCode`, the language the editor is in. It once
 * had one `bcp47`, derived from the *data* code, and handed it to
 * `formatDate` next to whichever code the call site wanted. With a Japanese UI
 * over an English CV the picker disagreed with itself: `2026年` for a year (from
 * `code`) beside English month names (from `bcp47`).
 *
 * ⚠️ **Taking the whole `CVLocaleMetadata` does not close this**, and reading it
 * as if it did is round seventeen's mistake one function over. It makes
 * `code`/`bcp47` unswappable; `dataLocale` and `interactionLocale` are the same
 * *type*, so swapping **them** still type-checks perfectly and is the swap that
 * was actually live here. Only an assertion through the hook can bind it —
 * which is the same shape as `cvLocaleDateFieldProvenance.test.ts`'s last case,
 * where pinning the callee left the call site free.
 *
 * ⚠️ `ja` against `de` deliberately, not `ja` against `en`: the year-only branch
 * special-cases `ja`/`zh`, so a `ja` **data** locale and a `de` interaction
 * locale make the two answers differ in a way that inverts rather than
 * degrades. Two locales that format alike would leave every case below vacuous
 * — the trap where fourteen of fifteen shipped locales are
 * indistinguishable.
 */
describe('the date picker keeps its two locales apart', () => {
  const pickerAt = (
    localeCode: 'ja' | 'de',
    uiLocaleCode: 'ja' | 'de',
    granularity: 'year' | 'month' = 'year',
  ) =>
    renderHook(() =>
      useDatePicker({
        date: new Date(2026, 6, 26),
        initialGranularity: granularity,
        localeCode,
        uiLocaleCode,
      }),
    ).result.current;

  it('formats the displayed value in the CV’s locale', () => {
    expect(pickerAt('ja', 'de').formatDisplayDate(new Date(2026, 6, 26))).toBe('2026年');
    expect(pickerAt('de', 'ja').formatDisplayDate(new Date(2026, 6, 26))).toBe('2026');
  });

  /**
   * The other half, and the one the swap breaks: the in-picker summary follows
   * the **editor's** language, not the CV's. Handing `dataLocale` here — a
   * one-word edit that compiles — inverts both of these.
   */
  it('formats the in-picker summary in the editor’s locale', () => {
    expect(pickerAt('de', 'ja').selectedSummary).toBe('2026年');
    expect(pickerAt('ja', 'de').selectedSummary).toBe('2026');
  });

  /**
   * ⚠️ **The `bcp47` half, and without it this whole file was defeatable — both
   * reviewer passes found that independently.** Every case above runs at
   * `initialGranularity: 'year'`, and the year-only branch of `formatDate` reads
   * `cvLocale.code` and **never touches `bcp47`**. So the guard bound the `code`
   * half of the pairing, which was already correct before the fix, and nothing
   * bound the half that was broken. Reintroducing the shipped defect verbatim —
   * `formatDate(dateString, { ...interactionLocale, bcp47: dataLocale.bcp47 })`
   * — left the entire suite green at 1990/106.
   *
   * At month granularity the mismatch inverts the answer rather than hiding:
   * `selectedSummary` goes from `Juli 2026` to `2026年7月` under a `ja` data
   * locale and a `de` UI, and the other way round. Same lesson as
   * `cvLocaleDateFieldProvenance.test.ts`'s last case, one file over: a guard
   * that watches one field is blind to the other.
   */
  it('reads bcp47 from the same locale it reads code from', () => {
    expect(pickerAt('ja', 'de', 'month').selectedSummary).toBe('Juli 2026');
    expect(pickerAt('de', 'ja', 'month').selectedSummary).toBe('2026年7月');
    expect(pickerAt('ja', 'de', 'month').formatDisplayDate(new Date(2026, 6, 26))).toBe(
      '2026年7月',
    );
    expect(pickerAt('de', 'ja', 'month').formatDisplayDate(new Date(2026, 6, 26))).toBe(
      'Juli 2026',
    );
  });

  /**
   * ⚠️ The control. Every assertion above compares a Japanese answer against a
   * German one, so a build in which `formatDate` had stopped reading `code`
   * altogether would fail them — but one in which the two locale objects were
   * the *same* object would pass whichever one it was, as long as the two tests
   * disagreed about which. This pins that the hook really does hold two.
   */
  it('exposes two locales, not one', () => {
    const picker = pickerAt('ja', 'de');
    expect(picker.dataLocale.code).toBe('ja');
    expect(picker.interactionLocale.code).toBe('de');
    expect(picker.dataLocale.bcp47).not.toBe(picker.interactionLocale.bcp47);
  });

  /**
   * Both codes default to the UI language when the props are absent, so the two
   * objects legitimately coincide there. Without this, "they are always
   * different" would look like the invariant.
   */
  it('collapses to one locale when neither prop is given', () => {
    const picker = renderHook(() => useDatePicker({ date: new Date(2026, 6, 26) })).result.current;
    expect(picker.dataLocale.code).toBe(picker.interactionLocale.code);
  });
});
