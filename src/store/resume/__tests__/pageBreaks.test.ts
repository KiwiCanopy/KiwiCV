import { getFirstRenderedSection, sanitizePageBreaks } from '@/store/resume/utils';
import { type ResumeData, initialResumeState } from '@/types/resume';
import { describe, expect, it } from 'vitest';

const item = (name: string) => ({ name }) as never;

function resume(options: {
  theme?: string;
  filled?: string[];
  oneColumn?: string[];
  twoColumn?: { main?: string[]; sidebar?: string[] };
  hiddenSections?: string[];
  breaks?: string[];
  twoColumnBreaks?: { main?: string[]; sidebar?: string[] };
}): ResumeData {
  const data = structuredClone(initialResumeState);

  data.meta.theme.name = options.theme ?? 'plain';
  // ⚠️ `filled` takes a bare `string` on purpose: the oracle block below fills a key
  // that is **not** a section, which is the only way to separate "the narrowing
  // dropped it" from "the length check dropped it".
  for (const section of options.filled ?? []) {
    (data as unknown as Record<string, unknown>)[section] = [item(section)];
  }
  data.meta.content.order.oneColumn = options.oneColumn ?? [];
  data.meta.content.order.twoColumn = {
    main: options.twoColumn?.main ?? [],
    sidebar: options.twoColumn?.sidebar ?? [],
  };
  data.meta.content.hiddenSections = options.hiddenSections ?? [];
  data.meta.content.pageBreaks = {
    oneColumn: options.breaks ?? [],
    twoColumn: {
      main: options.twoColumnBreaks?.main ?? [],
      sidebar: options.twoColumnBreaks?.sidebar ?? [],
    },
  };

  return data;
}

describe('getFirstRenderedSection — one column', () => {
  it('is the first stored section that has visible items', () => {
    const data = resume({ filled: ['work', 'skills'], oneColumn: ['skills', 'work'] });

    expect(getFirstRenderedSection(data, 'oneColumn')).toBe('skills');
  });

  it('skips a stored section that is hidden wholesale', () => {
    const data = resume({
      filled: ['work', 'skills'],
      oneColumn: ['skills', 'work'],
      hiddenSections: ['skills'],
    });

    expect(getFirstRenderedSection(data, 'oneColumn')).toBe('work');
  });

  /**
   * The stored order lists only a hidden section, so on its own it renders
   * nothing — but the renderer appends every other section with data, and one
   * of those is what the reader actually sees first. Reporting `null` here let
   * a page break survive on the real first section, which prints a blank
   * leading page.
   */
  it('falls through to an appended section when every stored one is hidden', () => {
    const data = resume({
      filled: ['awards', 'work'],
      oneColumn: ['awards'],
      hiddenSections: ['awards'],
    });

    expect(getFirstRenderedSection(data, 'oneColumn')).toBe('work');
  });
});

describe('sanitizePageBreaks — one column', () => {
  it('drops the break on the first rendered section', () => {
    const data = resume({
      filled: ['work', 'skills'],
      oneColumn: ['work', 'skills'],
      breaks: ['work', 'skills'],
    });

    expect(sanitizePageBreaks(data).oneColumn).toEqual(['skills']);
  });

  it('drops the break on a hidden section', () => {
    const data = resume({
      filled: ['work', 'skills'],
      oneColumn: ['work', 'skills'],
      hiddenSections: ['skills'],
      breaks: ['skills'],
    });

    expect(sanitizePageBreaks(data).oneColumn).toEqual([]);
  });

  /**
   * A break on a section with no data used to sit in the metadata forever. It
   * was inert only for as long as the section stayed empty; refilling the
   * section brought the forgotten break back as an unexplained page break.
   */
  it('drops the break on a section that has no data', () => {
    const data = resume({
      filled: ['work'],
      oneColumn: ['work'],
      breaks: ['education'],
    });

    expect(sanitizePageBreaks(data).oneColumn).toEqual([]);
  });

  it('keeps a break on a section the renderer appended', () => {
    const data = resume({
      filled: ['work', 'skills'],
      oneColumn: ['work'],
      breaks: ['skills'],
    });

    expect(sanitizePageBreaks(data).oneColumn).toEqual(['skills']);
  });
});

/**
 * **The oracle the first draft of this fix was missing, and the reason it called a live
 * defect latent.**
 *
 * `getFirstRenderedSection` is `sanitizePageBreaks`'s only source of
 * `firstOne` / `firstMain` / `firstSide`. A stale key at the head of a stored
 * order used to become "the first rendered section", so the `id !== first` filter
 * stopped stripping the break on the section that genuinely renders first — and
 * `emitSectionsWithBreaks` then emits `#pagebreak()` *before* the first section: a
 * blank leading page, in the PDF, **persisted**, because `sanitizePageBreaks` runs
 * on `onRehydrateStorage`.
 *
 * ⚠️ **A markup-identity measurement cannot see this**, which is exactly how the
 * first write-up went wrong: injecting a stale key into the order alone leaves the
 * Typst byte-identical on all twelve themes, because the damage is in the
 * page-break state rather than in the section dispatch. `layout.test.ts` already
 * carries that warning about this same oracle — *"the measurement rules
 * out the other half"*. Both reviewer passes found it independently.
 *
 * ⚠️ **The bogus key is `filled`, and that is the whole point.** A key with no
 * array is dropped by `sectionExists`'s length check whether or not anything is
 * narrowed, so a fixture built only from invented names passes with every
 * `isSectionKey` reverted to a cast — measured, all four narrowings reverted left
 * the entire suite green. Giving it data makes the narrowing the only thing
 * standing between it and `firstOne`.
 */
describe('a stale key in a stored order cannot become the first rendered section', () => {
  const STALE = 'not_a_section';

  it('one column: a stale key with data does not displace the first section', () => {
    const data = resume({
      filled: ['work', 'skills', STALE],
      oneColumn: [STALE, 'work', 'skills'],
      breaks: ['work'],
    });

    expect(getFirstRenderedSection(data, 'oneColumn')).toBe('work');
    expect(sanitizePageBreaks(data).oneColumn).toEqual([]);
  });

  it('two column: a stale key with data does not displace either column', () => {
    const data = resume({
      theme: 'lunar',
      filled: ['work', 'skills', STALE],
      twoColumn: { main: [STALE, 'work'], sidebar: [STALE, 'skills'] },
      twoColumnBreaks: { main: ['work'], sidebar: ['skills'] },
    });

    expect(getFirstRenderedSection(data, 'main')).toBe('work');
    expect(getFirstRenderedSection(data, 'sidebar')).toBe('skills');

    const sanitized = sanitizePageBreaks(data);
    expect(sanitized.twoColumn?.main).toEqual([]);
    expect(sanitized.twoColumn?.sidebar).toEqual([]);
  });

  /**
   * `'basics'` is the key that once made this reachable — the only stale
   * entry `sectionExists` let through, because both predicates opened with an
   * `=== 'basics'` arm. It has no array, so unlike `STALE` above it is dropped by
   * the length check too; it is kept as the regression pin for that specific arm.
   */
  it('one column: basics does not displace the first section', () => {
    const data = resume({
      filled: ['work'],
      oneColumn: ['basics', 'work'],
      breaks: ['work'],
    });

    expect(getFirstRenderedSection(data, 'oneColumn')).toBe('work');
    expect(sanitizePageBreaks(data).oneColumn).toEqual([]);
  });

  /**
   * `'profiles'` is the two-column case, and it is the one that was **still live**
   * after the first pass: `getFirstRenderedSection` reads
   * `meta.content.order.twoColumn` raw, so narrowing the two-column section getter
   * did nothing for it. `validation.ts`'s order whitelist names `profiles` as the
   * stale key it removes, so this is the realistic instance rather than an invented
   * one — and it has real data behind it (`basics.profiles`), which is why the
   * deleted `id === 'profiles'` arm used to answer "yes, it renders first".
   */
  it('two column: profiles does not displace the main column', () => {
    const data = resume({
      theme: 'lunar',
      filled: ['work'],
      twoColumn: { main: ['profiles', 'work'] },
      twoColumnBreaks: { main: ['work'] },
    });
    data.basics.profiles = [
      { network: 'GitHub', username: 'ada', url: '' },
    ] as unknown as ResumeData['basics']['profiles'];

    expect(getFirstRenderedSection(data, 'main')).toBe('work');
    expect(sanitizePageBreaks(data).twoColumn?.main).toEqual([]);
  });

  /**
   * The control. Without it every assertion above is satisfied by a
   * `sanitizePageBreaks` that returns empty arrays, and by a
   * `getFirstRenderedSection` that always answers with the first *section* key
   * regardless of order.
   */
  it('still keeps a legitimate break on a later section, in both layouts', () => {
    const one = resume({
      filled: ['work', 'skills', STALE],
      oneColumn: [STALE, 'work', 'skills'],
      breaks: ['skills'],
    });
    expect(sanitizePageBreaks(one).oneColumn).toEqual(['skills']);

    const two = resume({
      theme: 'lunar',
      filled: ['work', 'skills', STALE],
      twoColumn: { main: [STALE, 'work', 'skills'] },
      twoColumnBreaks: { main: ['skills'] },
    });
    expect(sanitizePageBreaks(two).twoColumn?.main).toEqual(['skills']);
  });
});
