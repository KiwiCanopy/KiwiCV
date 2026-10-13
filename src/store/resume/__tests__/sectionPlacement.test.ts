import { useResumeStore } from '@/store/resume/useResumeStore';
import { applySectionPlacement } from '@/store/resume/utils';
import { type ResumeData, type VisibilitySection, initialResumeState } from '@/types/resume';
import { ALL_SECTION_KEYS } from '@/utils/layout/constants';
import { isSectionKey } from '@/utils/layoutMetadata';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

/**
 * `LayoutManagedSection` was a hand-restated twelve-member section union
 * that **every** use site cast to, so it constrained nothing in either
 * direction: a section added to `ALL_SECTION_KEYS` and forgotten here produced
 * no error at any of the five `as LayoutManagedSection` sites. It is deleted;
 * `isSectionKey` reads the canonical list, and `applySectionPlacement` is the
 * one place the narrowing happens.
 *
 * ⚠️ **The five call sites had no behavioural coverage at all**, and that is
 * measured, not assumed: with the entire placement write deleted from
 * `applySectionPlacement` the full suite stayed green at 1303 passing. So the
 * refactor above was safe only because it is mechanically identical, and this
 * file is what makes the next one checkable.
 */

const item = (name: string) => ({ name, _vId: `vid-${name}` }) as never;

/** `swiss_grid` puts `work` in main and `skills` in the sidebar. */
const TWO_COLUMN_THEME = 'swiss_grid';

function resume(options: {
  theme?: string;
  filled?: string[];
  main?: string[];
  sidebar?: string[];
  breaks?: { main?: string[]; sidebar?: string[] };
}): ResumeData {
  const data = structuredClone(initialResumeState);

  data.meta.theme.name = options.theme ?? TWO_COLUMN_THEME;
  for (const section of options.filled ?? []) {
    (data as unknown as Record<string, unknown>)[section] = [item(section)];
  }
  data.meta.content.order.twoColumn = {
    main: options.main ?? [],
    sidebar: options.sidebar ?? [],
  };
  data.meta.content.pageBreaks = {
    oneColumn: [],
    twoColumn: { main: options.breaks?.main ?? [], sidebar: options.breaks?.sidebar ?? [] },
  };

  return data;
}

const order = (data: ResumeData) => data.meta.content.order.twoColumn;

describe('isSectionKey — the guard that replaced LayoutManagedSection', () => {
  it('accepts every key in the canonical inventory', () => {
    expect(ALL_SECTION_KEYS.filter((key) => isSectionKey(key))).toEqual([...ALL_SECTION_KEYS]);
  });

  /**
   * The other half. A predicate that returned `true` for everything would pass
   * the case above and silently re-open the direction `LayoutManagedSection`'s
   * casts left open.
   *
   * ⚠️ Two of these are `VisibilitySection` members and three are not — the
   * type is `SectionKey | 'profiles' | 'basics:image'`, so `basics`,
   * `coverLetter` and `meta` can no longer be *typed* into any of the four
   * actions. They stay as runtime cases because `isSectionKey` takes a bare
   * `string` and is fed one at both layout editors.
   */
  it.each(['basics', 'coverLetter', 'meta', 'profiles', 'basics:image'])(
    'rejects %s, which reaches the predicate as a bare string but is not a section',
    (key) => {
      expect(isSectionKey(key)).toBe(false);
    },
  );

  /**
   * `Array.prototype.includes` does not reach the prototype chain, unlike the
   * object index in `isTwoColumnTheme` that needed `Object.hasOwn`. Pin
   * it so a later switch to a `Record`-backed lookup has to notice.
   */
  it.each(['constructor', '__proto__', 'toString', 'valueOf', 'hasOwnProperty'])(
    'rejects the Object.prototype key %s',
    (key) => {
      expect(isSectionKey(key)).toBe(false);
    },
  );
});

describe('applySectionPlacement', () => {
  it('appends a filled section to its default column', () => {
    const data = resume({ filled: ['work'], main: [], sidebar: [] });

    applySectionPlacement(data, 'work');

    expect(order(data).main).toEqual(['work']);
    expect(order(data).sidebar).toEqual([]);
  });

  it('appends to the sidebar when that is where the theme puts the section', () => {
    const data = resume({ filled: ['skills'] });

    applySectionPlacement(data, 'skills');

    expect(order(data).main).toEqual([]);
    expect(order(data).sidebar).toEqual(['skills']);
  });

  it('drops a section that has lost its data from both columns', () => {
    const data = resume({ filled: [], main: ['work'], sidebar: ['skills'] });

    applySectionPlacement(data, 'work');

    expect(order(data).main).toEqual([]);
    expect(order(data).sidebar).toEqual(['skills']);
  });

  it('leaves a section that is already placed where the user put it', () => {
    const data = resume({ filled: ['work'], main: [], sidebar: ['work'] });

    applySectionPlacement(data, 'work');

    expect(order(data).sidebar).toEqual(['work']);
    expect(order(data).main).toEqual([]);
  });

  it.each(['basics', 'coverLetter', 'meta', 'profiles', 'basics:image'])(
    'leaves the real sections alone when handed %s, a non-section key',
    (key) => {
      const data = resume({ filled: ['work', 'skills'], main: ['work'], sidebar: ['skills'] });

      applySectionPlacement(data, key as VisibilitySection);

      expect(order(data).main).toEqual(['work']);
      expect(order(data).sidebar).toEqual(['skills']);
    },
  );

  /**
   * ⚠️ **The case above cannot see the narrowing, and that is the finding this
   * one exists for.** Its fixture never puts the key under test *into* the
   * order, so filtered and unfiltered are identical by construction — measured
   * by a reviewer, who replaced `isSectionKey` with a predicate returning `true`
   * for everything and watched all seven `applySectionPlacement` cases pass.
   *
   * The property is not "the order is untouched", it is **"the key is scrubbed
   * from the columns"** — which the old code did as a side effect of its
   * wide cast, and which the first draft of `applySectionPlacement` silently
   * retired by skipping the write.
   *
   * The state is reachable: `sanitizeResumeData`'s order whitelist runs from
   * `setResume` only, `onRehydrateStorage` runs `sanitizePageBreaks` alone, no
   * migration touches `meta.content.order`, and `layoutSlice`'s order writers
   * take bare `string`. `getFirstRenderedSection`'s `id === 'profiles'` branch
   * (`store/resume/utils.ts`) exists because these arrays really do hold such a
   * key.
   */
  it.each(['profiles', 'basics', 'basics:image'])(
    'scrubs %s out of the stored columns rather than leaving it there',
    (key) => {
      const data = resume({
        filled: ['work'],
        main: [key, 'work'],
        sidebar: [key],
      });

      applySectionPlacement(data, key as VisibilitySection);

      expect(order(data).main).toEqual(['work']);
      expect(order(data).sidebar).toEqual([]);
    },
  );

  /**
   * The consequence the scrub carries, and the reason it is not cosmetic: a
   * break pinned to the first rendered section of a column is invalid, and
   * `getFirstRenderedSection` reads the order this function just wrote. Leaving
   * `profiles` in front of `work` makes `profiles` first, so `work`'s break
   * survives — the exact state `sanitizePageBreaks` exists to forbid.
   */
  it('drops a page break that only survived because a stale key sat in front of it', () => {
    const data = resume({
      filled: ['work'],
      main: ['profiles', 'work'],
      sidebar: [],
      breaks: { main: ['work'] },
    });

    applySectionPlacement(data, 'profiles');

    expect(order(data).main).toEqual(['work']);
    expect(data.meta.content.pageBreaks?.twoColumn?.main).toEqual([]);
  });

  /**
   * ⚠️ …but the page-break pass must still run for those keys, because hiding a
   * profile can change which section renders first. This is the half the
   * `if (isSectionKey(...))` narrowing could most easily have swallowed, so it
   * gets its own case: a break pinned to the first rendered section of a column
   * is always invalid and `sanitizePageBreaks` removes it.
   */
  it('still re-derives the page breaks when handed a non-section key', () => {
    const data = resume({
      filled: ['work', 'skills'],
      main: ['work'],
      sidebar: ['skills'],
      breaks: { main: ['work'], sidebar: ['skills'] },
    });

    applySectionPlacement(data, 'profiles');

    expect(data.meta.content.pageBreaks?.twoColumn?.main).toEqual([]);
    expect(data.meta.content.pageBreaks?.twoColumn?.sidebar).toEqual([]);
  });

  it('creates the two-column order when the resume has none', () => {
    const data = resume({ filled: ['work'] });
    delete (data.meta.content.order as { twoColumn?: unknown }).twoColumn;

    applySectionPlacement(data, 'work');

    expect(order(data)).toEqual({ main: ['work'], sidebar: [] });
  });
});

/**
 * The three call sites, and every one of them is live. Deleting the placement
 * write broke none of the 1303 tests that existed before this file, so each is
 * asserted here through the public store action rather than through the helper —
 * a slice that stops calling `applySectionPlacement` has to fail something.
 *
 * ⚠️ **There were five, and two were dead.** `updateSection` and
 * `setSectionVisibility` went separately, on identical evidence: two interface
 * declarations, one implementation, one mention in `utils.ts`'s doc block, and no
 * production caller anywhere — `tsc -b` after each deletion errored in this file
 * and nowhere else. The narrowing surfaced the first, as predicted, and
 * a reviewer pass surfaced the second.
 *
 * ⚠️ **The count in this heading is the thing that was wrong before, twice.** It
 * read "the four call sites" while one of the four was unreachable, with the
 * caveat buried three paragraphs down — so the number said one thing and the
 * prose another. Re-derive it from the slices (`grep -c applySectionPlacement`)
 * rather than editing it by one.
 *
 * ⚠️ `toggleSectionVisibility` is **one identifier away** from the deleted action
 * and is live in both layout editors and `useArrayForm`. Deleting by name rather
 * than by reachability once nearly removed real output.
 */
describe('the store actions that sync placement', () => {
  let initialState: ReturnType<typeof useResumeStore.getState>;

  beforeEach(() => {
    initialState = useResumeStore.getState();
    useResumeStore.setState({ resume: resume({ filled: [] }) });
  });

  afterEach(() => {
    useResumeStore.setState(initialState, true);
  });

  const storedOrder = () => useResumeStore.getState().resume.meta.content.order.twoColumn;

  it('initializeSection places the section it seeds', () => {
    useResumeStore.getState().initializeSection('skills');

    expect(storedOrder()?.sidebar).toEqual(['skills']);
  });

  it('toggleItemVisibility syncs placement', () => {
    useResumeStore.setState({ resume: resume({ filled: ['work'] }) });

    useResumeStore.getState().toggleItemVisibility('work', { _vId: 'vid-work' });

    expect(storedOrder()?.main).toEqual(['work']);
  });

  it('toggleSectionVisibility syncs placement', () => {
    useResumeStore.setState({ resume: resume({ filled: ['work'] }) });

    useResumeStore.getState().toggleSectionVisibility('work', [item('work')]);

    expect(storedOrder()?.main).toEqual(['work']);
  });

  /**
   * ⚠️ The positive control, and it checks the channel can reach the state the
   * cases above are about — not merely that something moves. If the fixture's
   * theme stopped being a two-column one, `syncSectionPlacement` would return
   * early and every assertion above would read `[]` forever while still
   * "passing" whatever it happened to compare against.
   */
  it('the fixture is on a two-column theme, which is what makes the cases above reachable', () => {
    expect(useResumeStore.getState().resume.meta.theme.name).toBe(TWO_COLUMN_THEME);

    useResumeStore.setState({ resume: resume({ theme: 'plain', filled: ['work'] }) });
    useResumeStore.getState().toggleSectionVisibility('work', [item('work')]);

    expect(storedOrder()?.main).toEqual([]);
  });
});

/**
 * The narrowing itself, pinned in the type system rather than described.
 *
 * `VisibilitySection` was `keyof ResumeData | 'profiles' | 'basics:image'`, so
 * `basics`, `coverLetter` and `meta` were assignable to all four actions and
 * `applySectionPlacement` needed the runtime `isSectionKey` branch to cover
 * five keys. It is now `SectionKey | 'profiles' | 'basics:image'`: three of the
 * five are gone from the domain, and the two that remain are the ones the
 * branch is actually for.
 *
 * ⚠️ **`isSectionKey` does not go away and that is the point of the positive
 * half below.** `'profiles'` stays in the union and is precisely the key a
 * persisted `twoColumn` order can hold and must be scrubbed of — see the
 * behavioural cases above; skipping that scrub was once a live regression.
 *
 * ⚠️ These directives are a real compile-time check under this tsconfig
 * (`include: ["src"]`, and this file is under `src`): a directive that stops
 * erroring is `TS2578`. Measured, not asserted — reverting `VisibilitySection`
 * to `keyof ResumeData | 'profiles' | 'basics:image'` fails **four** of the
 * seven, not all seven. Re-measured after the seventh was added; the four are
 * unchanged. The other three pin different properties and survive that mutation:
 * `'not_a_section'` is not a `keyof ResumeData` either, and `updateSection` and
 * `setSectionVisibility` are deleted regardless of the union.
 *
 * ⚠️ Widening a *single* action's parameter back does **not** reach these pins.
 * It fails four `TS2345`s inside `visibilitySlice.ts` itself, because the slice
 * hands `section` straight to `getSectionItemHash` and `applySectionPlacement`
 * — also measured. The shared type is what carries the narrowing; these
 * directives are what stop the shared type being widened silently.
 *
 * Run `npx tsc -b`, never `tsc --noEmit` — the root config is `files: []` and
 * the bare command checks nothing.
 *
 * The body never runs; it is referenced below so `noUnusedLocals` is satisfied
 * without mutating the store.
 */
function _visibilityActionDomainIsNarrowed() {
  const store = useResumeStore.getState();
  const items: Array<Record<string, unknown>> = [];

  // Positive control. If these stopped compiling the negatives below would be
  // vacuous — every argument rejected proves nothing about a domain that is
  // empty. `profiles` and `basics:image` are the two non-section keys that
  // deliberately survive the narrowing.
  store.toggleItemVisibility('work', {});
  store.toggleItemVisibility('profiles', {});
  store.toggleItemVisibility('basics:image', {});
  store.toggleSectionVisibility('skills', items);
  store.toggleSectionVisibility('profiles', items);
  // ⚠️ These two moved off `setSectionVisibility` when it was deleted. They are
  // not interchangeable with the lines above: `references` and `basics:image` are
  // the two arguments that were only ever exercised through the deleted action,
  // and dropping them with it would have narrowed the positive control silently.
  store.toggleSectionVisibility('references', items);
  store.toggleSectionVisibility('basics:image', items);
  applySectionPlacement(initialResumeState, 'work');
  applySectionPlacement(initialResumeState, 'profiles');
  applySectionPlacement(initialResumeState, 'basics:image');

  // @ts-expect-error `basics` is a `keyof ResumeData` and not a section.
  store.toggleItemVisibility('basics', {});
  // @ts-expect-error `coverLetter` is a `keyof ResumeData` and not a section.
  store.toggleSectionVisibility('coverLetter', items);
  // @ts-expect-error `meta` is a `keyof ResumeData` and not a section.
  store.toggleSectionVisibility('meta', items);
  // @ts-expect-error `setSectionVisibility` had no production caller and is deleted.
  store.setSectionVisibility('work', items, false);
  // @ts-expect-error `basics` is a `keyof ResumeData` and not a section.
  applySectionPlacement(initialResumeState, 'basics');
  // @ts-expect-error a bare string is not a section key.
  applySectionPlacement(initialResumeState, 'not_a_section');
  // @ts-expect-error `updateSection` had no production caller and is deleted.
  store.updateSection('work', []);
}

describe('the store actions no longer admit a non-section key', () => {
  it('is enforced by @ts-expect-error, which tsc checks in both directions', () => {
    expect(typeof _visibilityActionDomainIsNarrowed).toBe('function');
  });
});
